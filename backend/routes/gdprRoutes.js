const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Bike = require('../models/Bike');
const ServiceRequest = require('../models/ServiceRequest');
const Message = require('../models/Message');
const auditLog = require('../middleware/auditLog');
const sendEmail = require('../utils/sendEmail');

// GET /api/gdpr/export - export osobních dat
router.get('/export', auth, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  const bikes = await Bike.find({ ownerId: req.user.id }).lean();
  const services = await ServiceRequest.find({ userId: req.user.id }).lean();
  const messages = await Message.find({ fromUserId: req.user.id }).lean();
  const data = { user, bikes, services, messages };
  auditLog('GDPR export dat', req.user);
  res.json(data);
});

// POST /api/gdpr/delete - žádost o výmaz účtu
router.post('/delete', auth, async (req, res) => {
  auditLog('GDPR žádost o výmaz', req.user);
  // Notifikace adminům
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await sendEmail({
      to: admin.email,
      subject: 'GDPR žádost o výmaz účtu',
      text: `Uživatel ${req.user.email} požádal o výmaz účtu.`
    });
  }
  res.json({ msg: 'Žádost o výmaz byla zaznamenána. Správce vás bude kontaktovat.' });
});

module.exports = router;
