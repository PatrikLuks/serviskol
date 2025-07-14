const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { auditLog, checkExportAlerts } = require('../middleware/auditLog');
const Bike = require('../models/Bike');
const ServiceRequest = require('../models/ServiceRequest');

// GET /api/export/service-history - export servisní historie uživatele jako CSV
router.get('/service-history', auth, async (req, res) => {
  try {
    const bikes = await Bike.find({ ownerId: req.user.id }).populate('serviceHistory');
    let csv = 'Kolo,Typ servisu,Popis,Stav,Datum\n';
    bikes.forEach(bike => {
      (bike.serviceHistory || []).forEach(s => {
        csv += `${bike.brand} ${bike.model},${s.type},${s.description || ''},${s.status},${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}\n`;
      });
    });
    auditLog('Export dat', req.user);
    await checkExportAlerts(req.user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=servisni-historie.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

module.exports = router;
