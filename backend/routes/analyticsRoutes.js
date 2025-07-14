const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Bike = require('../models/Bike');
const ServiceRequest = require('../models/ServiceRequest');
const Message = require('../models/Message');
const { subMonths, startOfMonth, endOfMonth, format } = require('date-fns');
const PDFDocument = require('pdfkit');

// Pomocná funkce pro trendy za posledních 6 měsíců
async function getMonthlyTrends(Model, dateField = 'createdAt') {
  const now = new Date();
  const trends = [];
  for (let i = 5; i >= 0; i--) {
    const from = startOfMonth(subMonths(now, i));
    const to = endOfMonth(subMonths(now, i));
    const count = await Model.countDocuments({ [dateField]: { $gte: from, $lte: to } });
    trends.push({
      month: format(from, 'yyyy-MM'),
      count
    });
  }
  return trends;
}

// GET /api/analytics - základní statistiky (pouze pro admina/technika)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'mechanic') {
      return res.status(403).json({ msg: 'Pouze pro správce/technik.' });
    }
    const userCount = await User.countDocuments();
    const bikeCount = await Bike.countDocuments();
    const serviceCount = await ServiceRequest.countDocuments();
    const messageCount = await Message.countDocuments();
    const activeUsers = await ServiceRequest.distinct('userId');
    // Trendy
    const userTrends = await getMonthlyTrends(User, 'createdAt');
    const bikeTrends = await getMonthlyTrends(Bike, 'createdAt');
    const serviceTrends = await getMonthlyTrends(ServiceRequest, 'createdAt');
    res.json({
      userCount,
      bikeCount,
      serviceCount,
      messageCount,
      activeUsers: activeUsers.length,
      userTrends,
      bikeTrends,
      serviceTrends
    });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Export statistik do CSV
router.get('/export', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'mechanic') {
      return res.status(403).json({ msg: 'Pouze pro správce/technik.' });
    }
    const userTrends = await getMonthlyTrends(User, 'createdAt');
    const bikeTrends = await getMonthlyTrends(Bike, 'createdAt');
    const serviceTrends = await getMonthlyTrends(ServiceRequest, 'createdAt');
    let csv = 'Měsíc,Uživatelé,Kola,Servisy\n';
    for (let i = 0; i < userTrends.length; i++) {
      csv += `${userTrends[i].month},${userTrends[i].count},${bikeTrends[i].count},${serviceTrends[i].count}\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=statistiky.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Export statistik do PDF
router.get('/export-pdf', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'mechanic') {
      return res.status(403).json({ msg: 'Pouze pro admina/technika.' });
    }
    const { from, to, type, mechanic } = req.query;
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (type) filter.type = type;
    if (mechanic) filter.mechanicId = mechanic;
    const services = await ServiceRequest.find(filter).populate('bikeId userId mechanicId');
    // PDF generování
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="servisni-historie.pdf"');
    doc.pipe(res);
    doc.fontSize(18).text('Servisní historie ServisKol', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Počet záznamů: ${services.length}`);
    doc.moveDown();
    services.forEach((s, i) => {
      doc.fontSize(12).text(`${i + 1}. Kolo: ${s.bikeId?.brand || ''} ${s.bikeId?.model || ''}`);
      doc.text(`   Klient: ${s.userId?.name || ''} | Technik: ${s.mechanicId?.name || ''}`);
      doc.text(`   Typ: ${s.type} | Stav: ${s.status} | Vytvořeno: ${s.createdAt.toLocaleString()}`);
      doc.text(`   Popis: ${s.description}`);
      doc.moveDown();
    });
    doc.end();
  } catch (err) {
    res.status(500).json({ msg: 'Chyba generování PDF.' });
  }
});

// GET /api/analytics/filtered?from=2025-01-01&to=2025-07-09&type=Complex&mechanic=123
router.get('/filtered', auth, async (req, res) => {
  try {
    const { from, to, type, mechanic } = req.query;
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (type) filter.type = type;
    if (mechanic) filter.mechanicId = mechanic;
    const services = await ServiceRequest.find(filter);
    // Výpočet statistik
    const total = services.length;
    const byStatus = services.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});
    const byMechanic = {};
    services.forEach(s => {
      if (s.mechanicId) {
        byMechanic[s.mechanicId] = (byMechanic[s.mechanicId] || 0) + 1;
      }
    });
    res.json({ total, byStatus, byMechanic });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// GET /api/analytics/user-metrics
router.get('/user-metrics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'mechanic') {
      return res.status(403).json({ msg: 'Pouze pro admina/technika.' });
    }
    // Načti audit logy
    const fs = require('fs');
    const path = require('path');
    const logPath = '/tmp/audit.log';
    if (!fs.existsSync(logPath)) return res.json({ activity: [], retention: [], conversions: 0, topActions: [] });
    const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
    const logs = lines.map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
    // Aktivita za posledních 30 dní
    const now = new Date();
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now); d.setDate(now.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();
    const activity = days.map(day => logs.filter(l => l.timestamp.startsWith(day)).length);
    // Retence (počet unikátních uživatelů za týden)
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const d = new Date(now); d.setDate(now.getDate() - i * 7);
      return d.toISOString().slice(0, 10);
    }).reverse();
    const retention = weeks.map(week => {
      const weekLogs = logs.filter(l => l.timestamp >= week);
      const users = new Set(weekLogs.map(l => l.userId));
      return users.size;
    });
    // Konverze (počet registrací)
    const conversions = logs.filter(l => l.action === 'Registrace').length;
    // Nejčastější akce
    const actionCounts = {};
    logs.forEach(l => { actionCounts[l.action] = (actionCounts[l.action] || 0) + 1; });
    const topActions = Object.entries(actionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    res.json({ activity, retention, conversions, topActions });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

module.exports = router;
