const express = require('express');
const router = express.Router();
const { auditLog } = require('../middleware/auditLog');
const { captureEvent } = require('../utils/posthog');
const { auth } = require('../middleware/auth');

// POST /api/support/ticket
router.post('/ticket', auth, async (req, res) => {
  const { message, aiMessageId } = req.body;
  if (!message) return res.status(400).json({ error: 'Chybí zpráva.' });
  const user = req.user;
  auditLog('Podpora - nový ticket', user, { message, aiMessageId });
  captureEvent(user._id?.toString() || user.id, 'support_ticket_created', { message, aiMessageId });
  res.json({ success: true, msg: 'Váš požadavek byl přijat. Ozveme se vám co nejdříve.' });
  // TODO: Integrace s ticketovacím systémem nebo e-mail notifikace
});

// POST /api/support/close-ticket
const sendEmail = require('../utils/sendEmail');
router.post('/close-ticket', auth, async (req, res) => {
  const { ticketId, satisfaction, comment } = req.body;
  if (!ticketId) {
    return res.status(400).json({ error: 'Chybí ticketId.' });
  }
  const user = req.user;
  auditLog('Podpora - ticket uzavřen', user, { ticketId, satisfaction, comment });
  const { captureEvent } = require('../utils/posthog');
  captureEvent(user._id?.toString() || user.id, 'support_ticket_closed', { ticketId, satisfaction, comment });
  // Pokud není zadáno hodnocení, pošleme follow-up e-mail
  if (typeof satisfaction !== 'number' && user.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: 'Vyřešení vašeho požadavku na podporu',
        text: `Dobrý den,\n\nVáš požadavek na podporu (ticket ${ticketId}) byl uzavřen.\n\nBudeme rádi, když nám dáte vědět, jak jste byli spokojeni s řešením. Odpovězte prosím na tento e-mail nebo ohodnoťte v aplikaci.\n\nDěkujeme, tým ServisKol.`
      });
    } catch (e) {
      // Log error, ale neblokuje odpověď
      console.error('Chyba při odesílání follow-up e-mailu:', e);
    }
  }
  res.json({ success: true });
});

module.exports = router;
