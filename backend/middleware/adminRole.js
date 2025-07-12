// Middleware pro granularitu práv adminů
module.exports = function(requiredRole) {
  return function(req, res, next) {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Přístup zamítnut.' });
    const userRole = req.user.adminRole || 'approver';
    if (requiredRole === 'superadmin' && userRole !== 'superadmin') {
      return res.status(403).json({ error: 'Pouze superadmin může provést tuto akci.' });
    }
    if (requiredRole === 'approver' && !['superadmin','approver'].includes(userRole)) {
      return res.status(403).json({ error: 'Pouze schvalovatel nebo superadmin může provést tuto akci.' });
    }
    next();
  };
};
