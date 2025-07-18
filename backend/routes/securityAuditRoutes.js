const express = require('express');
const router = express.Router();
const { getModel } = require('../db');
const User = getModel('User');
const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');

// GET /api/admin/security-audit - bezpečnostní audit a doporučení
router.get('/security-audit', async (req, res) => {
  // Základní pravidla/detekce
  const users = await User.find({}).lean();
  const audit = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
  const alerts = await SecurityAlert.find({}).sort({ createdAt: -1 }).limit(100).lean();

  const recommendations = [];

  // 1. Neaktivní admini
  const now = Date.now();
  users.filter(u => u.role === 'admin' && (!u.lastLogin || now - new Date(u.lastLogin).getTime() > 1000*60*60*24*30))
    .forEach(u => recommendations.push({
      type: 'inactive-admin',
      message: `Admin ${u.name} (${u.email}) nebyl aktivní více než 30 dní. Zvažte odebrání práv.`
    }));

  // 2. Admin bez 2FA
  users.filter(u => u.role === 'admin' && !u.twoFactorEnabled)
    .forEach(u => recommendations.push({
      type: 'admin-no-2fa',
      message: `Admin ${u.name} (${u.email}) nemá zapnuté dvoufázové ověření.`
    }));

  // 3. Podezřelé změny rolí (více než 3 změny za 24h)
  const roleChanges = audit.filter(a => a.action && a.action.includes('role'));
  const changesByUser = {};
  roleChanges.forEach(a => {
    const id = a.targetUser?.toString() || 'unknown';
    if (!changesByUser[id]) changesByUser[id] = [];
    changesByUser[id].push(a);
  });
  Object.entries(changesByUser).forEach(([id, arr]) => {
    const recent = arr.filter(a => Date.now() - new Date(a.createdAt).getTime() < 1000*60*60*24);
    if (recent.length > 3) {
      recommendations.push({
        type: 'suspicious-role-changes',
        message: `Uživateli ID ${id} bylo změněno oprávnění více než 3x za posledních 24h.`
      });
    }
  });

  // 4. Slabá hesla (pouze pokud je hash příliš krátký)
  users.filter(u => u.passwordHash && u.passwordHash.length < 40)
    .forEach(u => recommendations.push({
      type: 'weak-password',
      message: `Uživatel ${u.name} (${u.email}) má podezřele krátký hash hesla.`
    }));

  // 5. Další alerty z SecurityAlert
  alerts.forEach(a => {
    if (a.type === 'role-change') {
      recommendations.push({
        type: 'recent-role-change',
        message: a.message
      });
    }
  });

  res.json(recommendations);
});

module.exports = router;
