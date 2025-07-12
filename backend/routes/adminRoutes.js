const TimeLog = require('../models/TimeLog');
// --- TIME LOGS: evidence odpracovaných hodin ---
// POST /api/admin/time-logs (přidání záznamu)
router.post('/time-logs', adminOnly, async (req, res) => {
  const { date, hours, note, activityType } = req.body;
  if (!date || !hours) return res.status(400).json({ error: 'Chybí datum nebo počet hodin.' });
  const log = await TimeLog.create({
    user: req.user._id,
    date: new Date(date),
    hours,
    note,
    activityType: activityType || 'development',
    createdAt: new Date()
  });
  res.json(log);
});

// GET /api/admin/time-logs (výpis, filtrování, export)
router.get('/time-logs', adminOnly, async (req, res) => {
  const { since, user, activityType, format } = req.query;
  const q = {};
  if (since) q.date = { $gte: new Date(since) };
  if (user) q.user = user;
  if (activityType) q.activityType = activityType;
  const logs = await TimeLog.find(q).populate('user', 'name email').sort({ date: -1 }).lean();
  if (format === 'csv') {
    const { Parser } = require('json2csv');
    const fields = [
      { label: 'Datum', value: row => row.date ? new Date(row.date).toLocaleDateString() : '' },
      { label: 'Hodin', value: 'hours' },
      { label: 'Uživatel', value: row => row.user?.name || '' },
      { label: 'E-mail', value: row => row.user?.email || '' },
      { label: 'Typ aktivity', value: 'activityType' },
      { label: 'Poznámka', value: 'note' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(logs);
    res.header('Content-Type', 'text/csv');
    res.attachment('timelogs.csv');
    return res.send(csv);
  }
  res.json(logs);
});
// --- AI FEEDBACK EXPORT ---
// GET /api/admin/ai-feedback-export?since=YYYY-MM-DD&segment=...&feedback=...&relevance=...&format=csv
router.get('/ai-feedback-export', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { since, segment, feedback, relevance, format } = req.query;
  const q = { aiFeedback: { $exists: true } };
  if (since) q.createdAt = { $gte: new Date(since) };
  if (feedback) q.aiFeedback = feedback;
  if (relevance) q.aiFeedbackRelevance = relevance;
  if (segment) q['segment'] = { $regex: segment, $options: 'i' };
  const AlertLog = require('../models/AlertLog');
  const logs = await AlertLog.find(q).sort({ createdAt: -1 }).lean();
  if (format === 'csv') {
    const { Parser } = require('json2csv');
    const fields = [
      { label: 'Segment', value: row => JSON.stringify(row.segment) },
      { label: 'AI návrh', value: row => row.proposedAction?.message || '' },
      { label: 'AI feedback', value: 'aiFeedback' },
      { label: 'Relevance', value: 'aiFeedbackRelevance' },
      { label: 'Komentář', value: 'aiFeedbackComment' },
      { label: 'Schváleno', value: 'approvalStatus' },
      { label: 'Čas', value: row => row.createdAt ? new Date(row.createdAt).toLocaleString() : '' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(logs);
    res.header('Content-Type', 'text/csv');
    res.attachment('ai-feedback.csv');
    return res.send(csv);
  }
  res.json(logs);
});
const SecurityAlert = require('../models/SecurityAlert');
// --- AUDIT LOG: výpis a export ---
// GET /api/admin/audit-log?since=YYYY-MM-DD&action=...&admin=...&format=csv
router.get('/audit-log', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { since, action, admin, format } = req.query;
  const q = {};
  if (since) q.createdAt = { $gte: new Date(since) };
  if (action) q.action = action;
  if (admin) q.performedBy = admin;
  const logs = await AuditLog.find(q).populate('performedBy', 'name email').populate('targetUser', 'name email').sort({ createdAt: -1 }).lean();
  if (format === 'csv') {
    const { Parser } = require('json2csv');
    const fields = [
      { label: 'Akce', value: 'action' },
      { label: 'Kdo', value: row => row.performedBy?.name || '' },
      { label: 'E-mail', value: row => row.performedBy?.email || '' },
      { label: 'Cílový uživatel', value: row => row.targetUser?.name || '' },
      { label: 'Cílový e-mail', value: row => row.targetUser?.email || '' },
      { label: 'Detaily', value: row => JSON.stringify(row.details) },
      { label: 'Čas', value: row => row.createdAt ? new Date(row.createdAt).toLocaleString() : '' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(logs);
    res.header('Content-Type', 'text/csv');
    res.attachment('audit-log.csv');
    return res.send(csv);
  }
  res.json(logs);
});
// --- SPRÁVA ADMINŮ A ROLÍ ---
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
// GET /api/admin/admins - výpis všech adminů a jejich rolí (pouze superadmin)
router.get('/admins', adminOnly, adminRole('superadmin'), async (req, res) => {
  const admins = await User.find({ role: 'admin' }).select('_id name email adminRole createdAt lastLogin').lean();
  res.json(admins);
});

// PATCH /api/admin/admins/:id/role - změna role admina (pouze superadmin, audit log)
router.patch('/admins/:id/role', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { adminRole } = req.body;
  if (!['superadmin','approver','readonly'].includes(adminRole)) {
    return res.status(400).json({ error: 'Neplatná role.' });
  }
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'admin') return res.status(404).json({ error: 'Admin nenalezen.' });
  const prevRole = user.adminRole;
  user.adminRole = adminRole;
  await user.save();
  // Audit log
  await AuditLog.create({
    action: 'Změna role admina',
    performedBy: req.user._id,
    targetUser: user._id,
    details: { prevRole, newRole: adminRole },
    createdAt: new Date()
  });
  // Security alert
  await SecurityAlert.create({
    type: 'role-change',
    message: `Role admina ${user.name} (${user.email}) změněna z ${prevRole} na ${adminRole} superadminem ${req.user.name} (${req.user.email})`,
    user: user._id,
    performedBy: req.user._id,
    details: { prevRole, newRole: adminRole },
    createdAt: new Date()
  });
  res.json({ result: 'ok', adminId: user._id, prevRole, newRole: adminRole });
});
// GET /api/admin/security-alerts - výpis alertů (pouze admin)
router.get('/security-alerts', adminOnly, async (req, res) => {
  const alerts = await SecurityAlert.find({}).sort({ createdAt: -1 }).limit(100).populate('user', 'name email').populate('performedBy', 'name email').lean();
  res.json(alerts);
});
// GET /api/admin/me - info o přihlášeném adminovi
router.get('/me', adminOnly, async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.user._id).lean();
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  res.json({
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    adminRole: user.adminRole
  });
});
// GET /api/admin/alert-logs/ai-feedback-stats
router.get('/alert-logs/ai-feedback-stats', adminOnly, async (req, res) => {
  const AlertLog = require('../models/AlertLog');
  const { default: dayjs } = require('dayjs');
  const since = req.query.since ? new Date(req.query.since) : dayjs().subtract(90, 'day').toDate();
  const logs = await AlertLog.find({ createdAt: { $gte: since }, proposedAction: { $exists: true } }).lean();
  // Agregace feedbacku
  const feedbackCounts = { excellent: 0, good: 0, neutral: 0, bad: 0, irrelevant: 0 };
  const approvalCounts = { approved: 0, rejected: 0, pending: 0 };
  const bySegment = {};
  logs.forEach(l => {
    feedbackCounts[l.aiFeedback || 'neutral']++;
    approvalCounts[l.approvalStatus || 'pending']++;
    const segKey = l.segment ? Object.entries(l.segment).map(([k,v])=>`${k}:${v}`).join('|') : 'nezadáno';
    if (!bySegment[segKey]) bySegment[segKey] = { total: 0, approved: 0, rejected: 0, feedback: { excellent: 0, good: 0, neutral: 0, bad: 0, irrelevant: 0 } };
    bySegment[segKey].total++;
    if (l.approvalStatus === 'approved') bySegment[segKey].approved++;
    if (l.approvalStatus === 'rejected') bySegment[segKey].rejected++;
    bySegment[segKey].feedback[l.aiFeedback || 'neutral']++;
  });
  res.json({ feedbackCounts, approvalCounts, bySegment });
});
// PATCH /api/admin/alert-logs/:id/ai-feedback
// PATCH /api/admin/alert-logs/:id/ai-feedback (rozšířeno o komentář a relevanceType)
router.patch('/alert-logs/:id/ai-feedback', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const { feedback, comment, relevanceType } = req.body;
  if (!['excellent','good','neutral','bad','irrelevant'].includes(feedback)) {
    return res.status(400).json({ error: 'Neplatná hodnota feedbacku.' });
  }
  if (relevanceType && !['relevant','irrelevant'].includes(relevanceType)) {
    return res.status(400).json({ error: 'Neplatný typ relevance.' });
  }
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log) return res.status(404).json({ error: 'Alert nenalezen.' });
  log.aiFeedback = feedback;
  if (comment) log.aiFeedbackComment = comment;
  if (relevanceType) log.aiFeedbackRelevance = relevanceType;
  log.audit = log.audit || [];
  log.audit.push({ event: 'ai-feedback', value: feedback, comment, relevanceType, at: new Date(), by: userId });
  await log.save();
  res.json({ result: 'ok', aiFeedback: log.aiFeedback, comment: log.aiFeedbackComment, relevanceType: log.aiFeedbackRelevance });
});
// GET /api/admin/alert-logs/report
router.get('/alert-logs/report', adminOnly, async (req, res) => {
  const AlertLog = require('../models/AlertLog');
  const { default: dayjs } = require('dayjs');
  const DAYS = 7;
  const ESCALATE_AFTER_DAYS = 7;
  const since = dayjs().subtract(DAYS, 'day').toDate();
  const escalateSince = dayjs().subtract(ESCALATE_AFTER_DAYS, 'day').toDate();
  const [newProposals, approved, rejected, followupSuccess, pending, escalated] = await Promise.all([
    AlertLog.countDocuments({ createdAt: { $gte: since }, approvalStatus: 'pending' }),
    AlertLog.countDocuments({ approvalStatus: 'approved', approvalAt: { $gte: since } }),
    AlertLog.countDocuments({ approvalStatus: 'rejected', approvalAt: { $gte: since } }),
    AlertLog.countDocuments({ actionType: 'followup', actionResult: 'success', actionExecutedAt: { $gte: since } }),
    AlertLog.find({ approvalStatus: 'pending' }).sort({ createdAt: -1 }),
    AlertLog.find({ approvalStatus: 'pending', createdAt: { $lte: escalateSince } }).sort({ createdAt: -1 })
  ]);
  res.json({
    stats: {
      newProposals,
      approved,
      rejected,
      followupSuccess,
      pendingCount: pending.length
    },
    pending,
    escalated
  });
});
// PATCH /api/admin/alert-logs/:id
router.patch('/alert-logs/:id', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || !log.proposedAction || log.approvalStatus !== 'pending') {
    return res.status(404).json({ error: 'Navržená akce nenalezena nebo již byla zpracována.' });
  }
  if (req.body.proposedAction) {
    log.proposedAction = req.body.proposedAction;
    log.audit = log.audit || [];
    log.audit.push({ event: 'proposed-action-edited', at: new Date(), by: userId });
    await log.save();
    return res.json({ result: 'updated', proposedAction: log.proposedAction });
  }
  res.status(400).json({ error: 'Chybí data pro úpravu.' });
});
const adminRole = require('../middleware/adminRole');
// PATCH /api/admin/alert-logs/:id/approve-action
router.patch('/alert-logs/:id/approve-action', adminOnly, adminRole('approver'), async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || !log.proposedAction || log.approvalStatus !== 'pending') {
    return res.status(404).json({ error: 'Navržená akce nenalezena nebo již byla zpracována.' });
  }
  log.approvalStatus = 'approved';
  log.approvalBy = userId;
  log.approvalAt = new Date();
  log.audit = log.audit || [];
  log.audit.push({ event: 'action-approved', at: new Date(), by: userId });
  await log.save();
  res.json({ result: 'approved' });
});

// PATCH /api/admin/alert-logs/:id/reject-action
router.patch('/alert-logs/:id/reject-action', adminOnly, adminRole('approver'), async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || !log.proposedAction || log.approvalStatus !== 'pending') {
    return res.status(404).json({ error: 'Navržená akce nenalezena nebo již byla zpracována.' });
  }
  log.approvalStatus = 'rejected';
  log.approvalBy = userId;
  log.approvalAt = new Date();
  log.audit = log.audit || [];
  log.audit.push({ event: 'action-rejected', at: new Date(), by: userId });
  await log.save();
  res.json({ result: 'rejected' });
});
const segmentFollowup = require('./segmentFollowup');
const aiFollowup = require('./aiFollowup');
const abFollowupResults = require('./abFollowupResults');
const abFollowupWinner = require('./abFollowupWinner');
router.use(segmentFollowup);
router.use(aiFollowup);
router.use(abFollowupResults);
router.use(abFollowupWinner);
// GET /api/admin/segment-engagement-trends
router.get('/segment-engagement-trends', adminOnly, async (req, res) => {
  const User = require('../models/User');
  const days = 90;
  const now = new Date();
  const { role, region, ageGroup, channel } = req.query;
  const users = await User.find({
    ...(role ? { role } : {}),
    ...(region ? { region } : {}),
    ...(ageGroup && ageGroup !== 'nezadáno' ? { age: { $gte: Number(ageGroup.split('-')[0]), $lte: Number(ageGroup.split('-')[1]) } } : {})
  });
  // Připravit pole dnů
  const daysArr = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  // Map: date -> count
  const trendMap = {};
  users.forEach(u => {
    (u.campaignClicks || []).forEach(cl => {
      if (cl.clickedAt && cl.channel === channel) {
        const date = new Date(cl.clickedAt).toISOString().slice(0, 10);
        trendMap[date] = (trendMap[date] || 0) + 1;
      }
    });
  });
  const trend = daysArr.map(date => ({ date, count: trendMap[date] || 0 }));
  res.json({ trend });
});
// POST /api/admin/alert-logs/:id/generate-followup-message
router.post('/alert-logs/:id/generate-followup-message', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const { generateFollowupMessage } = require('../utils/openai');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || log.type !== 'low-ctr-segment') return res.status(404).json({ error: 'Alert typu low-ctr-segment nenalezen.' });
  try {
    const segment = log.segment || {};
    const ctr = typeof log.value === 'number' ? log.value : 0.1;
    const days = log.period && log.period.endsWith('d') ? parseInt(log.period) : 14;
    let message;
    try {
      message = await generateFollowupMessage({ segment, ctr, days });
    } catch (e) {
      // fallback šablona
      message = `Dobrý den, rádi bychom vás znovu oslovili. Pokud jste naši poslední zprávu přehlédli, zkuste ji prosím otevřít – čeká na vás důležitá informace!`;
    }
    // Audit do logu
    log.audit = log.audit || [];
    log.audit.push({ event: 'ai-followup-message-generated', at: new Date(), by: userId });
    await log.save();
    res.json({ message });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování follow-up zprávy.' });
  }
});
// PATCH /api/admin/alert-logs/:id/cancel-followup
router.patch('/alert-logs/:id/cancel-followup', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || log.actionType !== 'followup' || log.actionResult !== 'scheduled') {
    return res.status(404).json({ error: 'Naplánovaný follow-up nenalezen nebo již byl odeslán.' });
  }
  log.actionResult = 'cancelled';
  await log.save();
  res.json({ result: 'cancelled' });
});
// POST /api/admin/alert-logs/:id/execute-followup
router.post('/alert-logs/:id/execute-followup', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const User = require('../models/User');
  const Campaign = require('../models/Campaign');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || log.actionType !== 'followup') return res.status(404).json({ error: 'Alert nebo follow-up akce nenalezena.' });
  let result = 'not-executed';
  let affected = 0;
  try {
    const seg = req.body.segment || log.segment || {};
    const message = req.body.message || log.followupMessage || 'Děkujeme za zpětnou vazbu, rádi bychom vás znovu oslovili.';
    const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    // Uložit segment, zprávu a plánovaný čas do AlertLogu
    log.segment = seg;
    log.followupMessage = message;
    log.scheduledAt = scheduledAt;
    // Pokud je scheduledAt v budoucnosti, pouze uložit a neprovádět hned
    if (scheduledAt && scheduledAt > new Date()) {
      log.actionResult = 'scheduled';
      log.actionAffected = 0;
      log.actionExecutedAt = null;
      await log.save();
      return res.json({ result: 'scheduled', affected: 0 });
    }
    // Jinak provést ihned
    const query = {};
    if (seg.role) query.role = seg.role;
    if (seg.region) query.region = seg.region;
    if (seg.ageGroup) {
      const [ageMin, ageMax] = seg.ageGroup.split('-').map(Number);
      query.age = { $gte: ageMin, $lte: ageMax };
    }
    const users = await User.find(query);
    const campaign = new Campaign({
      tema: `Follow-up: ${log.message}`,
      segment: seg,
      variants: [{ label: 'A', text: message, channel: log.channel, sentCount: 0, clickCount: 0 }],
      type: 'auto',
      launchedBy: 'alert-followup',
      scheduledAt: new Date()
    });
    await campaign.save();
    affected = users.length;
    result = 'success';
    log.actionResult = result;
    log.actionAffected = affected;
    log.actionExecutedAt = new Date();
    log.campaignId = campaign._id;
    await log.save();
  } catch (e) {
    result = 'error';
  }
  res.json({ result, affected });
});
// POST /api/admin/alert-logs/:id/execute-action
router.post('/alert-logs/:id/execute-action', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const User = require('../models/User');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || !log.action) return res.status(404).json({ error: 'Alert nebo akce nenalezena.' });
  let result = 'not-executed';
  let affected = 0;
  try {
    // Změna preferovaného kanálu pouze pro uživatele v segmentu (možno upravit segment v requestu)
    if (log.type === 'ctr' && log.channel && log.channel !== 'all') {
      const seg = req.body.segment || log.segment || {};
      const query = { preferredChannel: { $ne: log.channel } };
      if (seg.role) query.role = seg.role;
      if (seg.region) query.region = seg.region;
      if (seg.ageGroup) {
        const [ageMin, ageMax] = seg.ageGroup.split('-').map(Number);
        query.age = { $gte: ageMin, $lte: ageMax };
      }
      const users = await User.find(query);
      for (const u of users) {
        u.preferredChannel = log.channel;
        await u.save();
        affected++;
      }
      // Uložit použitý segment do logu
      log.segment = seg;
      result = 'success';
    } else {
      result = 'not-implemented';
    }
  } catch (e) {
    result = 'error';
  }
  log.actionResult = result;
  log.actionAffected = affected;
  log.actionExecutedAt = new Date();
  await log.save();
  res.json({ result, affected });
});
// GET /api/admin/alert-logs/unread
router.get('/alert-logs/unread', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const logs = await AlertLog.find({ admin: userId, read: false }).sort({ createdAt: -1 });
  res.json(logs);
});

// PATCH /api/admin/alert-logs/:id/read
router.patch('/alert-logs/:id/read', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const log = await AlertLog.findOneAndUpdate({ _id: req.params.id, admin: userId }, { read: true }, { new: true });
  if (!log) return res.status(404).json({ error: 'Alert nenalezen.' });
  res.json(log);
});
const AlertLog = require('../models/AlertLog');
// GET /api/admin/alert-logs
router.get('/alert-logs', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const query = { admin: userId };
  if (req.query.approvalStatus) query.approvalStatus = req.query.approvalStatus;
// PATCH /api/admin/alert-logs/:id/override-approval
router.patch('/alert-logs/:id/override-approval', adminOnly, adminRole('superadmin'), async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const { newStatus } = req.body;
  if (!['approved','rejected'].includes(newStatus)) {
    return res.status(400).json({ error: 'Neplatný stav.' });
  }
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || log.approvalStatus !== 'auto') return res.status(404).json({ error: 'Auto-schválený návrh nenalezen.' });
  log.approvalStatus = newStatus;
  log.approvalBy = userId;
  log.approvalAt = new Date();
  log.audit = log.audit || [];
  log.audit.push({ event: 'admin-override-auto-approval', newStatus, at: new Date(), by: userId });
  await log.save();
  res.json({ result: 'overridden', approvalStatus: log.approvalStatus });
});
  const logs = await AlertLog.find(query).sort({ createdAt: -1 }).limit(100);
  res.json(logs);
});

// GET /api/admin/alert-logs/export-csv
// Rozšířený export alertů s podporou filtrování a detailními poli
router.get('/alert-logs/export-csv', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const {
    channel,
    type,
    actionType,
    actionResult,
    since,
    until,
    segmentRole,
    segmentRegion,
    segmentAgeGroup
  } = req.query;
  const query = { admin: userId };
  if (channel) query.channel = channel;
  if (type) query.type = type;
  if (actionType) query.actionType = actionType;
  if (actionResult) query.actionResult = actionResult;
  if (since || until) {
    query.createdAt = {};
    if (since) query.createdAt.$gte = new Date(since);
    if (until) query.createdAt.$lte = new Date(until);
  }
  if (segmentRole || segmentRegion || segmentAgeGroup) {
    query["segment"] = query["segment"] || {};
    if (segmentRole) query["segment.role"] = segmentRole;
    if (segmentRegion) query["segment.region"] = segmentRegion;
    if (segmentAgeGroup) query["segment.ageGroup"] = segmentAgeGroup;
  }
  const logs = await AlertLog.find(query).sort({ createdAt: -1 });
  const rows = logs.map(l => ({
    type: l.type,
    channel: l.channel,
    threshold: l.threshold,
    value: l.value,
    period: l.period,
    message: l.message,
    createdAt: l.createdAt,
    action: l.action,
    actionType: l.actionType,
    actionResult: l.actionResult,
    actionAffected: l.actionAffected,
    actionExecutedAt: l.actionExecutedAt,
    followupMessage: l.followupMessage,
    scheduledAt: l.scheduledAt,
    campaignId: l.campaignId,
    segment: l.segment ? JSON.stringify(l.segment) : '',
    audit: l.audit ? JSON.stringify(l.audit) : ''
  }));
  const { Parser } = require('json2csv');
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('alert-logs.csv');
  return res.send(csv);
});
const AlertSetting = require('../models/AlertSetting');
// GET /api/admin/alert-settings
router.get('/alert-settings', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const settings = await AlertSetting.find({ admin: userId });
  res.json(settings);
});

// POST /api/admin/alert-settings
router.post('/alert-settings', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const { type, channel, threshold } = req.body;
  const setting = new AlertSetting({ admin: userId, type, channel, threshold });
  await setting.save();
  res.status(201).json(setting);
});

// PATCH /api/admin/alert-settings/:id
router.patch('/alert-settings/:id', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const { threshold } = req.body;
  const setting = await AlertSetting.findOneAndUpdate({ _id: req.params.id, admin: userId }, { threshold }, { new: true });
  if (!setting) return res.status(404).json({ error: 'Alert nenalezen.' });
  res.json(setting);
});

// DELETE /api/admin/alert-settings/:id
router.delete('/alert-settings/:id', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const setting = await AlertSetting.findOneAndDelete({ _id: req.params.id, admin: userId });
  if (!setting) return res.status(404).json({ error: 'Alert nenalezen.' });
  res.json({ success: true });
});
// GET /api/admin/channel-sends-timeseries
router.get('/channel-sends-timeseries', adminOnly, async (req, res) => {
  const Campaign = require('../models/Campaign');
  const days = 90;
  const now = new Date();
  // Připravit pole dnů
  const daysArr = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  // Inicializace výstupu
  const sends = {};
  ['in-app', 'email', 'push', 'sms'].forEach(channel => {
    sends[channel] = daysArr.map(date => ({ date, count: 0 }));
  });
  // Projít všechny kampaně a naplnit timeseries podle sentCount a scheduledAt
  const CampaignModel = require('../models/Campaign');
  const campaigns = await CampaignModel.find({});
  campaigns.forEach(c => {
    (c.variants || []).forEach(v => {
      const ch = v.channel;
      const sent = v.sentCount || 0;
      const date = v.scheduledAt ? new Date(v.scheduledAt).toISOString().slice(0, 10) : null;
      if (ch && sent && date && sends[ch]) {
        const idx = daysArr.indexOf(date);
        if (idx !== -1) sends[ch][idx].count += sent;
      }
    });
  });
  res.json({ days: daysArr, sends });
});
// GET /api/admin/decision-tree-channel/export-csv
router.get('/decision-tree-channel/export-csv', adminOnly, async (req, res) => {
  const User = require('../models/User');
  const { Parser } = require('json2csv');
  const users = await User.find({});
  const rows = users.map(u => {
    const pred = User.decisionTreeChannel(u);
    return {
      name: u.name || '',
      email: u.email || '',
      role: u.role || '',
      region: u.region || '',
      age: u.age || '',
      currentChannel: u.preferredChannel || '',
      predictedChannel: pred.channel,
      explanation: pred.explanation
    };
  });
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('decision-tree-channel-predictions.csv');
  return res.send(csv);
});
// GET /api/admin/user/:id/decision-tree-channel
router.get('/user/:id/decision-tree-channel', adminOnly, async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  const result = User.decisionTreeChannel(user);
  res.json(result);
});
// GET /api/admin/segment-engagement-trends/export-csv
router.get('/segment-engagement-trends/export-csv', adminOnly, async (req, res) => {
  const User = require('../models/User');
  const { Parser } = require('json2csv');
  const days = 90;
  const now = new Date();
  const users = await User.find({});
  // Připravit pole dnů
  const daysArr = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  // Segmentace: role, region, věková skupina (10letá okna)
  function getSegment(u) {
    return {
      role: u.role || 'nezadáno',
      region: u.region || 'nezadáno',
      ageGroup: u.age ? `${10 * Math.floor(u.age/10)}-${10 * Math.floor(u.age/10) + 9}` : 'nezadáno'
    };
  }
  // Map: segmentKey -> { date -> {kanál: count} }
  const segMap = {};
  users.forEach(u => {
    const seg = getSegment(u);
    const segKey = `${seg.role}|${seg.region}|${seg.ageGroup}`;
    if (!segMap[segKey]) segMap[segKey] = {};
    (u.campaignClicks || []).forEach(cl => {
      if (cl.clickedAt && cl.channel) {
        const date = new Date(cl.clickedAt).toISOString().slice(0, 10);
        if (!segMap[segKey][date]) segMap[segKey][date] = {};
        segMap[segKey][date][cl.channel] = (segMap[segKey][date][cl.channel] || 0) + 1;
      }
    });
  });
  // Připravit řádky pro CSV
  const rows = [];
  Object.entries(segMap).forEach(([segKey, dateMap]) => {
    const [role, region, ageGroup] = segKey.split('|');
    daysArr.forEach(date => {
      const dayData = dateMap[date] || {};
      ['in-app','email','push','sms'].forEach(channel => {
        rows.push({
          date, role, region, ageGroup, channel, count: dayData[channel] || 0
        });
      });
    });
  });
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('segment-engagement-trends.csv');
  return res.send(csv);
});
// PATCH /api/admin/users/bulk-preferred-channel
router.patch('/users/bulk-preferred-channel', adminOnly, async (req, res) => {
  const User = require('../models/User');
  const { segment, preferredChannel } = req.body;
  if (!segment || !preferredChannel) return res.status(400).json({ error: 'Chybí segment nebo kanál.' });
  if (!['in-app','email','push','sms'].includes(preferredChannel)) return res.status(400).json({ error: 'Neplatný kanál.' });
  // Sestavit query podle segmentu
  const query = {};
  if (segment.role) query.role = segment.role;
  if (segment.region) query.region = segment.region;
  if (segment.ageGroup && segment.ageGroup !== 'nezadáno') {
    const [min, max] = segment.ageGroup.split('-').map(Number);
    query.age = { $gte: min, $lte: max };
  }
  const users = await User.find(query);
  let updatedCount = 0;
  for (const user of users) {
    if (user.preferredChannel !== preferredChannel) {
      const oldChannel = user.preferredChannel;
      user.preferredChannel = preferredChannel;
      await user.save();
      // Audit log
      const { auditLog } = require('../middleware/auditLog');
      auditLog('Hromadná změna preferovaného kanálu', req.user, {
        userId: user._id,
        userEmail: user.email,
        oldChannel,
        newChannel: preferredChannel,
        changedAt: new Date().toISOString(),
        segment
      });
      updatedCount++;
    }
  }
  res.json({ updatedCount });
});
// GET /api/admin/channel-engagement-drop-recommendations
router.get('/channel-engagement-drop-recommendations', adminOnly, async (req, res) => {
  const User = require('../models/User');
  const now = new Date();
  const days = 60; // 30 dní + 30 dní
  const users = await User.find({});
  // Pro každý segment (role, region, věk) spočítat engagement v kanálech za posledních 30 dní a předchozích 30 dní
  const getPeriod = (offset) => {
    const since = new Date(now.getTime() - (offset + 30) * 24 * 60 * 60 * 1000);
    const until = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    return { since, until };
  };
  const periods = [getPeriod(0), getPeriod(30)]; // [posledních 30 dní, předchozích 30 dní]
  // Segmentace: role, region, věková skupina (10letá okna)
  function getSegment(u) {
    return {
      role: u.role || 'nezadáno',
      region: u.region || 'nezadáno',
      ageGroup: u.age ? `${10 * Math.floor(u.age/10)}-${10 * Math.floor(u.age/10) + 9}` : 'nezadáno'
    };
  }
  // Map: segmentKey -> [ {kanál: count}, {kanál: count} ]
  const segMap = {};
  users.forEach(u => {
    const seg = getSegment(u);
    const segKey = `${seg.role}|${seg.region}|${seg.ageGroup}`;
    if (!segMap[segKey]) segMap[segKey] = [ {}, {} ];
    (u.campaignClicks || []).forEach(cl => {
      if (cl.clickedAt && cl.channel) {
        const d = new Date(cl.clickedAt);
        periods.forEach((p, idx) => {
          if (d >= p.since && d < p.until) {
            segMap[segKey][idx][cl.channel] = (segMap[segKey][idx][cl.channel] || 0) + 1;
          }
        });
      }
    });
  });

  // Připravit agregaci pro všechny segmenty a kanály (pro heatmapu)
  const allSegments = [];
  Object.entries(segMap).forEach(([segKey, [recent, prev]]) => {
    const [role, region, ageGroup] = segKey.split('|');
    ['in-app','email','push','sms'].forEach(channel => {
      allSegments.push({
        segment: { role, region, ageGroup },
        channel,
        prev30: prev[channel] || 0,
        last30: recent[channel] || 0
      });
    });
  });

  // Najít segmenty s největším poklesem v některém kanálu (původní logika)
  const recommendations = [];
  Object.entries(segMap).forEach(([segKey, [recent, prev]]) => {
    Object.keys(recent).forEach(channel => {
      const r = recent[channel] || 0;
      const p = prev[channel] || 0;
      if (p > 10 && r < p * 0.7) {
        const drop = p > 0 ? ((p - r) / p) : 0;
        const [role, region, ageGroup] = segKey.split('|');
        recommendations.push({
          segment: { role, region, ageGroup },
          channel,
          prev30: p,
          last30: r,
          drop: +(drop*100).toFixed(1)
        });
      }
    });
  });
  // Seřadit podle největšího poklesu
  recommendations.sort((a, b) => b.drop - a.drop);
  res.json({ allSegments, recommendations });
});
// GET /api/admin/channel-change-log/export-csv
router.get('/channel-change-log/export-csv', adminOnly, (req, res) => {
  const fs = require('fs');
  const { Parser } = require('json2csv');
  const logPath = '/tmp/audit.log';
  if (!fs.existsSync(logPath)) return res.status(404).send('Log nenalezen.');
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  const changes = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(l => l.action === 'Změna preferovaného kanálu');
  const rows = changes.map(c => ({
    userId: c.details.userId,
    userEmail: c.details.userEmail,
    oldChannel: c.details.oldChannel,
    newChannel: c.details.newChannel,
    changedBy: c.user ? (c.user.email || c.user._id || '') : '',
    changedAt: c.details.changedAt
  }));
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('channel-change-log.csv');
  return res.send(csv);
});
// GET /api/admin/channel-engagement-timeseries
router.get('/channel-engagement-timeseries', adminOnly, async (req, res) => {
  const User = require('../models/User');
  const days = 90;
  const now = new Date();
  const users = await User.find({});
  // Připravit pole dnů
  const daysArr = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  // Inicializace výstupu
  const timeseries = {};
  ['in-app', 'email', 'push', 'sms'].forEach(channel => {
    timeseries[channel] = daysArr.map(date => ({ date, count: 0 }));
  });
  // Projít všechny kliky a naplnit timeseries
  users.forEach(u => {
    (u.campaignClicks || []).forEach(cl => {
      if (cl.clickedAt && cl.channel) {
        const date = new Date(cl.clickedAt).toISOString().slice(0, 10);
        const ch = cl.channel;
        if (timeseries[ch]) {
          const idx = daysArr.indexOf(date);
          if (idx !== -1) timeseries[ch][idx].count++;
        }
      }
    });
  });
  res.json({ days: daysArr, timeseries });
});
// GET /api/admin/user/:id/predict-channel
router.get('/user/:id/predict-channel', adminOnly, async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  const bestChannel = User.predictBestChannel(user);
  res.json({ bestChannel });
});
// PATCH /api/admin/user/:id/preferred-channel
router.patch('/user/:id/preferred-channel', adminOnly, async (req, res) => {
  const User = require('../models/User');
  const { preferredChannel } = req.body;
  if (!['in-app', 'email', 'push', 'sms'].includes(preferredChannel)) {
    return res.status(400).json({ error: 'Neplatný kanál.' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  const oldChannel = user.preferredChannel;
  user.preferredChannel = preferredChannel;
  await user.save();
  // Audit log změny kanálu
  const { auditLog } = require('../middleware/auditLog');
  auditLog('Změna preferovaného kanálu', req.user, {
    userId: user._id,
    userEmail: user.email,
    oldChannel,
    newChannel: preferredChannel,
    changedAt: new Date().toISOString()
  });
  res.json({ success: true, preferredChannel });
});

// GET /api/admin/channel-engagement-report
router.get('/channel-engagement-report', adminOnly, async (req, res) => {
  const User = require('../models/User');
  // Agregace engagementu podle kanálu
  const users = await User.find({});
  const report = { inApp: 0, email: 0, push: 0, sms: 0 };
  users.forEach(u => {
    if (u.channelEngagement) {
      Object.keys(report).forEach(k => {
        report[k] += u.channelEngagement[k] || 0;
      });
    }
  });
  res.json({ report });
});
// GET /api/admin/campaigns-user-recommendation
router.get('/campaigns-user-recommendation', adminOnly, async (req, res) => {
  const User = require('../models/User');
  // Volitelně: segmentace podle role, regionu, věku
  const query = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.region) query.region = req.query.region;
  if (req.query.ageMin) query.age = { ...query.age, $gte: Number(req.query.ageMin) };
  if (req.query.ageMax) query.age = { ...query.age, $lte: Number(req.query.ageMax) };
  // Predikce engagementu: kombinace engagementScore a historie prokliků
  const users = await User.find(query).lean();
  // Vypočítat predikovaný engagement (vážený průměr engagementScore a počtu prokliků za posledních 90 dní)
  const now = new Date();
  const scored = users.map(u => {
    const recentClicks = (u.campaignClicks || []).filter(cl => cl.clickedAt && (now - new Date(cl.clickedAt)) < 90*24*60*60*1000).length;
    const score = (u.engagementScore || 0) * 0.7 + recentClicks * 0.3;
    return { ...u, predictedEngagement: score };
  });
  // Seřadit sestupně podle predikce a vrátit top 10 % (max 100)
  scored.sort((a, b) => b.predictedEngagement - a.predictedEngagement);
  const top = scored.slice(0, Math.max(5, Math.floor(scored.length * 0.1), 100));
  res.json({
    recommendedUsers: top.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      region: u.region,
      age: u.age,
      engagementScore: u.engagementScore,
      predictedEngagement: u.predictedEngagement
    }))
  });
});
// GET /api/admin/campaigns-recommendation
router.get('/campaigns-recommendation', adminOnly, async (req, res) => {
  const Campaign = require('../models/Campaign');
  // Získat posledních 50 kampaní
  const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).limit(50).lean();
  // Najít nejúspěšnější segment (region, role, věk...)
  const segmentStats = {};
  for (const c of campaigns) {
    const seg = c.segment || {};
    const key = [seg.role || '', seg.region || '', seg.ageMin || '', seg.ageMax || ''].join('|');
    if (!segmentStats[key]) segmentStats[key] = { sent: 0, clicks: 0, count: 0, example: seg };
    segmentStats[key].sent += c.variants.reduce((sum, v) => sum + (v.sentCount || 0), 0);
    segmentStats[key].clicks += c.variants.reduce((sum, v) => sum + (v.clickCount || 0), 0);
    segmentStats[key].count++;
  }
  // Najít segment s nejvyšším CTR
  let bestSegment = null, bestCTR = -1;
  Object.values(segmentStats).forEach(s => {
    const ctr = s.sent > 0 ? s.clicks / s.sent : 0;
    if (ctr > bestCTR && s.sent > 20) { // pouze segmenty s dostatečným počtem oslovených
      bestCTR = ctr;
      bestSegment = s.example;
    }
  });
  // Najít nejúspěšnější text/FAQ (nejvyšší průměrný CTR varianty)
  let bestContent = null, bestContentCTR = -1;
  for (const c of campaigns) {
    for (const v of c.variants) {
      const ctr = v.sentCount > 0 ? (v.clickCount || 0) / v.sentCount : 0;
      if (ctr > bestContentCTR && v.text && v.text.length > 10) {
        bestContentCTR = ctr;
        bestContent = { text: v.text, faq: v.faq, ctr };
      }
    }
  }
  res.json({
    recommendedSegment: bestSegment,
    recommendedContent: bestContent
  });
});
// GET /api/admin/campaigns-report
router.get('/campaigns-report', adminOnly, async (req, res) => {
  const Campaign = require('../models/Campaign');
  const User = require('../models/User');
  // Filtrování podle období, segmentu, typu
  const query = {};
  if (req.query.since) query.createdAt = { $gte: new Date(req.query.since) };
  if (req.query.type) query.type = req.query.type;
  if (req.query.tema) query.tema = req.query.tema;
  const campaigns = await Campaign.find(query).lean();
  // Agregace dat
  let totalSent = 0, totalClicks = 0, totalFollowUps = 0;
  const segmentStats = {};
  for (const c of campaigns) {
    const sent = c.variants.reduce((sum, v) => sum + (v.sentCount || 0), 0);
    const clicks = c.variants.reduce((sum, v) => sum + (v.clickCount || 0), 0);
    totalSent += sent;
    totalClicks += clicks;
    if (c.followUpSent) totalFollowUps++;
    // Rozpad podle segmentu (např. region)
    const segKey = c.segment && c.segment.region ? c.segment.region : 'ostatní';
    if (!segmentStats[segKey]) segmentStats[segKey] = { sent: 0, clicks: 0, campaigns: 0 };
    segmentStats[segKey].sent += sent;
    segmentStats[segKey].clicks += clicks;
    segmentStats[segKey].campaigns++;
  }
  // Vývoj v čase (po dnech)
  const byDay = {};
  for (const c of campaigns) {
    const day = c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : 'neznámé';
    if (!byDay[day]) byDay[day] = { sent: 0, clicks: 0, followUps: 0 };
    byDay[day].sent += c.variants.reduce((sum, v) => sum + (v.sentCount || 0), 0);
    byDay[day].clicks += c.variants.reduce((sum, v) => sum + (v.clickCount || 0), 0);
    if (c.followUpSent) byDay[day].followUps++;
  }
  // Úspěšnost follow-upů (kolik uživatelů kliklo až po follow-upu)
  let followUpClicks = 0;
  const followUpCampaigns = campaigns.filter(c => c.followUpSent);
  for (const c of followUpCampaigns) {
    // Najít uživatele v segmentu, kteří klikli až po follow-upu
    const buildSegmentQuery = require('../utils/segmentQueryBuilder');
    const userQuery = buildSegmentQuery(c.segment || {});
    const users = await User.find(userQuery);
    for (const user of users) {
      const click = (user.campaignClicks || []).find(cl => cl.campaign === c.tema && cl.clickedAt && c.createdAt && cl.clickedAt > c.createdAt);
      if (click) followUpClicks++;
    }
  }
  res.json({
    totalSent,
    totalClicks,
    totalFollowUps,
    segmentStats,
    byDay,
    followUpClicks
  });
});
// GET /api/admin/campaigns-ab/export-csv
router.get('/campaigns-ab/export-csv', adminOnly, async (req, res) => {
  const Campaign = require('../models/Campaign');
  const { Parser } = require('json2csv');
  const query = {};
  if (req.query.tema) query.tema = req.query.tema;
  if (req.query.type) query.type = req.query.type;
  if (req.query.since) query.createdAt = { $gte: new Date(req.query.since) };
  if (req.query.role) query['segment.role'] = req.query.role;
  const campaigns = await Campaign.find(query).lean();
  // Připravit data pro CSV: každý řádek = jedna varianta
  const rows = campaigns.flatMap(c =>
    c.variants.map(v => ({
      tema: c.tema,
      segment: Object.entries(c.segment).map(([k, v]) => `${k}: ${v}`).join(', '),
      type: c.type,
      launchedBy: c.launchedBy,
      createdAt: c.createdAt,
      variant: v.label,
      text: v.text,
      faq: v.faq,
      sentCount: v.sentCount,
      clickCount: v.clickCount
    }))
  );
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('ab_campaigns.csv');
  return res.send(csv);
});
// GET /api/admin/campaigns-ab
router.get('/campaigns-ab', adminOnly, async (req, res) => {
  const Campaign = require('../models/Campaign');
  // Filtrování podle query (tema, od kdy, typ, segment)
  const query = {};
  if (req.query.tema) query.tema = req.query.tema;
  if (req.query.type) query.type = req.query.type;
  if (req.query.since) query.createdAt = { $gte: new Date(req.query.since) };
  // Segment filtr (např. role)
  if (req.query.role) query['segment.role'] = req.query.role;
  const campaigns = await Campaign.find(query).lean();
  // Výstup: pole kampaní s variantami a statistikami
  res.json(campaigns.map(c => ({
    _id: c._id,
    tema: c.tema,
    createdAt: c.createdAt,
    segment: c.segment,
    type: c.type,
    launchedBy: c.launchedBy,
    variants: c.variants.map(v => ({
      label: v.label,
      text: v.text,
      faq: v.faq,
      sentCount: v.sentCount,
      clickCount: v.clickCount
    }))
  })));
});
// POST /api/admin/campaigns/launch-ab
router.post('/campaigns/launch-ab', adminOnly, async (req, res) => {
  // Očekává: { tema, segment, variants: [{label, text, faq}], type, scheduledAt, autoSelectWinner }
  const { tema, segment, variants, type, scheduledAt, autoSelectWinner } = req.body;
  if (!tema || !variants || !Array.isArray(variants) || variants.length < 1) {
    return res.status(400).json({ error: 'Chybí téma nebo varianty.' });
  }
  const User = require('../models/User');
  const Campaign = require('../models/Campaign');
  const { createNotification } = require('../utils/notificationUtils');
  const { auditLog } = require('../middleware/auditLog');
  // Pokud je scheduledAt v budoucnosti, pouze uložit kampaň se stavem 'scheduled'
  let status = 'sent';
  let scheduledDate = null;
  if (scheduledAt) {
    scheduledDate = new Date(scheduledAt);
    if (scheduledDate > new Date()) status = 'scheduled';
  }
  let users = [];
  if (status === 'sent') {
    // Výběr cílové skupiny podle segmentu (pokročilá segmentace)
    const buildSegmentQuery = require('../utils/segmentQueryBuilder');
    const userQuery = buildSegmentQuery(segment || {});
    users = await User.find(userQuery);
    // AI výběr kanálu pro každého uživatele
    function selectBestChannel(user) {
      if (user.preferredChannel && user.channelEngagement && user.channelEngagement[user.preferredChannel.replace('-', '')] > 0) {
        return user.preferredChannel;
      }
      if (user.channelEngagement) {
        const entries = Object.entries(user.channelEngagement);
        const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]);
        if (best[1] > 0) return best[0] === 'inApp' ? 'in-app' : best[0];
      }
      return user.preferredChannel || 'in-app';
    }
    // Rozdělení uživatelů na varianty (rovnoměrně)
    const userGroups = Array.from({ length: variants.length }, () => []);
    users.forEach((user, idx) => {
      userGroups[idx % variants.length].push(user);
    });
    // Odeslání notifikací a naplnění sentCount
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const group = userGroups[i];
      for (const user of group) {
        const channel = selectBestChannel(user);
        await createNotification({
          user: user._id,
          type: 'info',
          message: variant.text + (variant.faq ? `\nVíce: ${variant.faq}` : ''),
          channel
        });
        // Zaznamenat engagement (zvýšit sentCount pro kanál)
        if (user.channelEngagement) {
          const key = channel === 'in-app' ? 'inApp' : channel;
          user.channelEngagement[key] = (user.channelEngagement[key] || 0) + 1;
          await user.save();
        }
      }
      variants[i].sentCount = group.length;
    }
  }
  // Uložení kampaně do MongoDB
  const campaign = new Campaign({
    tema,
    segment: segment || {},
    variants,
    launchedBy: req.user ? req.user.email : 'admin',
    type: type || 'manual',
    scheduledAt: scheduledDate,
    status,
    autoSelectWinner: !!autoSelectWinner
  });
  await campaign.save();
  // Audit log
  auditLog('Ruční kampaň (A/B)', req.user, {
    tema,
    segment,
    variants: variants.map(v => ({ label: v.label, sentCount: v.sentCount, faq: v.faq })),
    userCount: users.length,
    status,
    scheduledAt: scheduledDate,
    autoSelectWinner: !!autoSelectWinner,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, userCount: users.length, campaignId: campaign._id, status });
});
const express = require('express');
const router = express.Router();
const adminOnly = require('../middleware/adminOnly');
const fs = require('fs');
const { Parser } = require('json2csv');

// GET /api/admin/campaigns
router.get('/campaigns', adminOnly, (req, res) => {
  const logPath = '/tmp/audit.log';
  if (!fs.existsSync(logPath)) return res.json([]);
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  let campaigns = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(l => l.action === 'Automatizovaná kampaň' || l.action === 'Ruční kampaň');
  // Filtrování podle query
  if (req.query.since) {
    campaigns = campaigns.filter(c => c.details.timestamp >= req.query.since);
  }
  if (req.query.tema) {
    campaigns = campaigns.filter(c => c.details.tema === req.query.tema);
  }
  if (req.query.faq) {
    campaigns = campaigns.filter(c => c.details.faq === req.query.faq);
  }
  // Statistika prokliků na FAQ/odkaz
  const clicks = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(l => l.action === 'Kampaň - kliknutí');
  const campaignsWithClicks = campaigns.map(c => {
    const faq = c.details.faq;
    const tema = c.details.tema;
    const clickCount = clicks.filter(cl => {
      // Porovnání podle FAQ a/nebo tématu
      return (faq && cl.details.faq === faq) && (tema ? cl.details.campaign === tema : true);
    }).length;
    return { ...c.details, clickCount };
  });
  // Export do CSV
  if (req.query.format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(campaignsWithClicks);
    res.header('Content-Type', 'text/csv');
    res.attachment('campaigns.csv');
    return res.send(csv);
  }
  res.json(campaignsWithClicks);
});

module.exports = router;
