// GET /api/bi/ai-segment-history - historie změn AI segmentu
router.get('/ai-segment-history', requireApiKey, async (req, res) => {
  try {
    const { from, to, userId } = req.query;
    const q = { action: 'ai_segment_change' };
    if (userId) q.performedBy = userId;
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }
    const logs = await require('../models/AuditLog').find(q).sort({ createdAt: -1 }).lean();
    res.json({ history: logs.map(l => ({
      time: l.createdAt,
      userId: l.performedBy,
      newSegment: l.details?.newSegment
    })) });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při načítání historie změn segmentu' });
  }
});
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const axios = require('axios');
// /api/bi/predictions?type=churn|followup|segment&format=csv|json&apiKey=...
router.get('/predictions', requireApiKey, async (req, res) => {
  const { type, format, realtime, segment, region, ageMin, ageMax, channel } = req.query;
  if (!req.hasBiPermission('predictions:read')) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro čtení predikcí.' });
  }
  if (format === 'csv' && !req.hasBiPermission('export:csv')) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro export CSV.' });
  }
  if (format === 'json' && !req.hasBiPermission('export:json') && format) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro export JSON.' });
  }
  // Realtime AI predikce (OpenAI API demo, pouze pro churn/followup)
  if (realtime && (type === 'churn' || type === 'followup')) {
    try {
      // Sestavení filtru podle segmentu, regionu, věku, kanálu
      const userFilter = { role: 'client' };
      if (region) userFilter.region = region;
      if (ageMin || ageMax) userFilter.age = {};
      if (ageMin) userFilter.age.$gte = Number(ageMin);
      if (ageMax) userFilter.age.$lte = Number(ageMax);
      // Segment: předpokládáme, že segment je uložen v user.segment nebo user.segments
      if (segment) userFilter.$or = [
        { segment },
        { segments: segment }
      ];
      // Kanál: pouze pokud má engagement v daném kanálu
      if (channel) userFilter[`channelEngagement.${channel}`] = { $gt: 0 };
      const users = await User.find(userFilter).limit(10).lean();
      const results = [];
      for (const u of users) {
        let prompt = '';
        if (type === 'churn') {
          prompt = `Uživatel: ${u.email}, engagement: ${u.engagementScore}, poslední login: ${u.lastLogin}, region: ${u.region}. Odhadni pravděpodobnost odchodu (0-1) a stručně zdůvodni.`;
        } else if (type === 'followup') {
          prompt = `Uživatel: ${u.email}, engagement: ${u.engagementScore}, poslední login: ${u.lastLogin}, region: ${u.region}. Navrhni personalizovaný follow-up pro zvýšení retence.`;
        }
        // OpenAI API volání (demo, nutno nastavit OPENAI_API_KEY v env)
        const openaiKey = process.env.OPENAI_API_KEY;
        let aiResp = { value: null };
        if (openaiKey) {
          const ai = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100
          }, {
            headers: { 'Authorization': `Bearer ${openaiKey}` }
          });
          aiResp.value = ai.data.choices[0].message.content;
        } else {
          aiResp.value = type === 'churn' ? Math.random().toFixed(2) : 'Zaslat připomínku s nabídkou slevy na servis.';
        }
        results.push({ user: { email: u.email, name: u.name }, type, value: aiResp.value, createdAt: new Date() });
      }
      await AuditLog.create({
        action: 'bi_api_predictions',
        performedBy: req.biUser._id,
        details: { endpoint: '/api/bi/predictions', type, format, realtime: true, segment, region, ageMin, ageMax, channel, permissions: req.biUser.apiKeyPermissions }
      });
      return res.json(results);
    } catch (e) {
      return res.status(500).json({ error: 'Chyba AI predikce: ' + e.message });
    }
  }
  // Audit logování použití BI klíče
  try {
    await AuditLog.create({
      action: 'bi_api_predictions',
      performedBy: req.biUser._id,
      details: {
        endpoint: '/api/bi/predictions',
        type,
        format,
        permissions: req.biUser.apiKeyPermissions
      }
    });
  } catch (e) { /* ignore logging error */ }
  let query = {};
  if (type) query.type = type;
  if (region) query['user.region'] = region;
  if (segment) query['user.segment'] = segment;
  if (ageMin || ageMax) query['user.age'] = {};
  if (ageMin) query['user.age'].$gte = Number(ageMin);
  if (ageMax) query['user.age'].$lte = Number(ageMax);
  if (channel) query['user.channelEngagement.' + channel] = { $gt: 0 };
  const preds = await Prediction.find(query).populate('user', 'email name region age segment channelEngagement').lean();
  if (format === 'csv') {
    const fields = ['_id','type','user.email','user.name','value','createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(preds);
    res.header('Content-Type', 'text/csv');
    res.attachment('predictions.csv');
    return res.send(csv);
  }
  res.json(preds);
});
const EngagementMetric = require('../models/EngagementMetric');
// /api/bi/engagement-metrics?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|json&apiKey=...
router.get('/engagement-metrics', requireApiKey, async (req, res) => {
  const { from, to, format } = req.query;
  if (!req.hasBiPermission('metrics:read')) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro čtení metrik.' });
  }
  if (format === 'csv' && !req.hasBiPermission('export:csv')) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro export CSV.' });
  }
  if (format === 'json' && !req.hasBiPermission('export:json') && format) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro export JSON.' });
  }
  // Audit logování použití BI klíče
  try {
    await AuditLog.create({
      action: 'bi_api_engagement_metrics',
      performedBy: req.biUser._id,
      details: {
        endpoint: '/api/bi/engagement-metrics',
        format,
        from,
        to,
        permissions: req.biUser.apiKeyPermissions
      }
    });
  } catch (e) { /* ignore logging error */ }
  let query = {};
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }
  const metrics = await EngagementMetric.find(query).lean();
  if (format === 'csv') {
    const fields = ['date','channel','sent','opened','clicked','conversions','segment','createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(metrics);
    res.header('Content-Type', 'text/csv');
    res.attachment('engagement-metrics.csv');
    return res.send(csv);
  }
  res.json(metrics);
});
const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
// /api/bi/segments?format=csv|json&apiKey=...
router.get('/segments', requireApiKey, async (req, res) => {
  const { format } = req.query;
  if (!req.hasBiPermission('segments:read')) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro čtení segmentů.' });
  }
  if (format === 'csv' && !req.hasBiPermission('export:csv')) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro export CSV.' });
  }
  if (format === 'json' && !req.hasBiPermission('export:json') && format) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro export JSON.' });
  }
  // Audit logování použití BI klíče
  try {
    await AuditLog.create({
      action: 'bi_api_segments',
      performedBy: req.biUser._id,
      details: {
        endpoint: '/api/bi/segments',
        format,
        permissions: req.biUser.apiKeyPermissions
      }
    });
  } catch (e) { /* ignore logging error */ }
  const segments = await Segment.find().lean();
  if (format === 'csv') {
    const fields = ['_id','name','description','createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(segments);
    res.header('Content-Type', 'text/csv');
    res.attachment('segments.csv');
    return res.send(csv);
  }
  res.json(segments);
});
const User = require('../models/User');
const { Parser } = require('json2csv');
const AuditLog = require('../models/AuditLog');

// GET /api/bi/segments/ai - seznam AI segmentů a počty uživatelů
router.get('/segments/ai', requireApiKey, async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: '$aiSegment', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    const data = await User.aggregate(pipeline);
    res.json({ aiSegments: data });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při načítání AI segmentů' });
  }
});

// GET /api/bi/users?aiSegment=VIP - uživatelé v daném AI segmentu
router.get('/users', requireApiKey, async (req, res) => {
  try {
    const { aiSegment, region, ageMin, ageMax } = req.query;
    const q = {};
    if (aiSegment) q.aiSegment = aiSegment;
    if (region) q.region = region;
    if (ageMin) q.age = { ...q.age, $gte: Number(ageMin) };
    if (ageMax) q.age = { ...q.age, $lte: Number(ageMax) };
    const users = await User.find(q).select('-passwordHash -apiKey').lean();
    res.json({ users });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při načítání uživatelů' });
  }
});

// Middleware pro BI API klíč s granularitou oprávnění
function hasPermission(user, perm) {
  return Array.isArray(user.apiKeyPermissions) && user.apiKeyPermissions.includes(perm);
}
async function requireApiKey(req, res, next) {
  const apiKey = req.query.apiKey || req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API klíč je vyžadován.' });
  const user = await User.findOne({ apiKey });
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Neplatný nebo nedostatečný API klíč.' });
  req.biUser = user;
  req.hasBiPermission = (perm) => hasPermission(user, perm);
  next();
}

// /api/bi/campaigns?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|json&apiKey=...
router.get('/campaigns', requireApiKey, async (req, res) => {
  // Kontrola granularitních oprávnění
  const { from, to, format } = req.query;
  if (!req.hasBiPermission('campaigns:read')) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro čtení kampaní.' });
  }
  if (format === 'csv' && !req.hasBiPermission('export:csv')) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro export CSV.' });
  }
  if (format === 'json' && !req.hasBiPermission('export:json') && format) {
    return res.status(403).json({ error: 'API klíč nemá oprávnění pro export JSON.' });
  }
  // Audit logování použití BI klíče
  try {
    await AuditLog.create({
      action: 'bi_api_campaigns',
      performedBy: req.biUser._id,
      details: {
        endpoint: '/api/bi/campaigns',
        format,
        from,
        to,
        permissions: req.biUser.apiKeyPermissions
      }
    });
  } catch (e) { /* ignore logging error */ }
  let query = {};
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  const campaigns = await Campaign.find(query).lean();
  if (format === 'csv') {
    const fields = ['_id','tema','text','region','age','clickCount','sentCount','createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(campaigns);
    res.header('Content-Type', 'text/csv');
    res.attachment('campaigns.csv');
    return res.send(csv);
  }
  res.json(campaigns);
});

module.exports = router;
