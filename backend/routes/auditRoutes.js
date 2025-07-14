const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

// POST /api/audit/export - logování exportu dat
router.post('/export', auth, (req, res) => {
  auditLog('Export dat', req.user, { ip: req.ip });
  res.json({ success: true });
});

module.exports = router;
