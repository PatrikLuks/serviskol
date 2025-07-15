
const express = require('express');
const OpenAI = require('openai');
const { auth, adminOnly, adminRole } = require('../middleware/auth');
const AIMessage = require('../models/AIMessage');
const { auditLog } = require('../middleware/auditLog');
const promClient = require('prom-client');

const rateLimit = require('express-rate-limit');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// Prometheus metriky
const aiChatRequests = new promClient.Counter({ name: 'ai_chat_requests_total', help: 'Počet AI chat požadavků' });
const aiChatErrors = new promClient.Counter({ name: 'ai_chat_errors_total', help: 'Počet chyb AI chatu' });
const aiChatDuration = new promClient.Histogram({ name: 'ai_chat_duration_seconds', help: 'Doba zpracování AI chatu', buckets: [0.5, 1, 2, 5, 10] });

// POST /api/ai/chat
router.post('/chat', auth, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Chybí dotaz.' });
  aiChatRequests.inc();
  const end = aiChatDuration.startTimer();
  try {
    // Personalizace promptu
    // 1. Základní informace o uživateli
    const userName = req.user.name || req.user.email || 'uživatel';
    // 2. Poslední 3 dotazy uživatele
    const lastMessages = await AIMessage.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(3);
    const historyPrompt = lastMessages.length > 0
      ? '\nPoslední dotazy uživatele:\n' + lastMessages.map(m => `- ${m.message}`).join('\n')
      : '';
    // 3. Časté dotazy (můžete rozšířit podle reportů)
    const faqPrompt = '\nPokud se dotaz týká servisu kol, údržby, rezervace nebo častých problémů, odpověz jasně a prakticky.';
    // 4. Sestavení promptu
    const systemPrompt = `Jsi AI asistent pro cyklistický servis ServisKol. Oslovuj uživatele jménem (${userName}). Odpovídej česky, srozumitelně a prakticky.${faqPrompt}${historyPrompt}`;
    // FAQ doporučení
    const faqs = require('../utils/faq');
    let faqSuggestion = null;
    for (const faq of faqs) {
      if (faq.keywords.some(k => message.toLowerCase().includes(k))) {
        faqSuggestion = faq;
        break;
      }
    }
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });
    let reply = completion.data.choices[0].message.content;
    if (faqSuggestion) {
      reply += `\n\nDoporučený článek: ${faqSuggestion.question} – ${faqSuggestion.link}`;
    }
    const aiMsg = await AIMessage.create({
      userId: req.user.id,
      message,
      reply
    });
    auditLog('AI chat dotaz', req.user, { message, reply, aiMessageId: aiMsg._id, faq: faqSuggestion?.link });
    res.json({ reply, id: aiMsg._id });
  } catch (err) {
    aiChatErrors.inc();
    auditLog('AI chat chyba', req.user, { message, error: err.message });
    res.status(500).json({ error: 'Chyba AI asistenta.' });
  } finally {
    end();
  }
});

// GET /api/ai/history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await AIMessage.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(20);
    auditLog('AI chat historie', req.user, { count: history.length });
    res.json(history);
  } catch (err) {
    aiChatErrors.inc();
    auditLog('AI historie chyba', req.user, { error: err.message });
    res.status(500).json({ error: 'Chyba při načítání historie.' });
  }
});

// POST /api/ai/rate
router.post('/rate', auth, async (req, res) => {
  const { id, rating, feedback } = req.body;
  if (!id || typeof rating !== 'number') return res.status(400).json({ error: 'Chybí id nebo rating.' });
  try {
    const msg = await AIMessage.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { rating, feedback },
      { new: true }
    );
    if (!msg) return res.status(404).json({ error: 'Zpráva nenalezena.' });
    auditLog('AI chat hodnocení', req.user, { aiMessageId: id, rating, feedback });
    res.json({ success: true });
  } catch (err) {
    aiChatErrors.inc();
    auditLog('AI hodnocení chyba', req.user, { aiMessageId: id, error: err.message });
    res.status(500).json({ error: 'Chyba při ukládání hodnocení.' });
  }
});

const { Parser } = require('json2csv');

// ADMIN: report všech hodnocení a zpětné vazby (JSON nebo CSV)
router.get('/feedback-report', auth, adminOnly, async (req, res) => {
  try {
    const feedbacks = await AIMessage.find({ rating: { $ne: null } }, { userId: 1, message: 1, reply: 1, rating: 1, feedback: 1, timestamp: 1 })
      .sort({ timestamp: -1 })
      .limit(100);
    if (req.query.format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(feedbacks.map(f => f.toObject()));
      res.header('Content-Type', 'text/csv');
      res.attachment('ai_feedback_report.csv');
      return res.send(csv);
    }
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Chyba při načítání reportu.' });
  }
});

module.exports = router;
