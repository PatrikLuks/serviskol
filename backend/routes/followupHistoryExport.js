const express = require('express');
const router = express.Router();
const { getModel } = require('../db');
const Notification = getModel('Notification');
const User = getModel('User');
const { Parser } = require('json2csv');

// GET /api/bi/followup-history?segment=...&from=...&to=...&format=csv|json
router.get('/followup-history', async (req, res) => {
  try {
    const { segment, from, to, format } = req.query;
    const q = { type: 'followup' };
    if (segment) q.segment = segment;
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }
    const notifs = await Notification.find(q).lean();
    // Doplnit info o uživateli a výsledku
    const userIds = notifs.map(n => n.user);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
    const data = notifs.map(n => ({
      ...n,
      userEmail: userMap[n.user?.toString()]?.email,
      userSegment: userMap[n.user?.toString()]?.aiSegment
    }));
    if (format === 'csv') {
      const fields = ['_id','userEmail','variant','message','createdAt','userSegment'];
      const parser = new Parser({ fields });
      const csv = parser.parse(data);
      res.header('Content-Type', 'text/csv');
      res.attachment('followup-history.csv');
      return res.send(csv);
    }
    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při exportu historie follow-upů' });
  }
});

module.exports = router;
