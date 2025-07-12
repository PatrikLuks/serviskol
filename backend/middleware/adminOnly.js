// Middleware pro ochranu admin endpointů
module.exports = function adminOnly(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    return next();
  }
  return res.status(403).json({ error: 'Přístup pouze pro administrátory.' });
};
