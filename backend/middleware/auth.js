// Middleware pro ověření JWT tokenu
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Chybí autorizační token.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tajnyklic');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Neplatný nebo expirovaný token.' });
  }
}


// Middleware: povolí pouze admin uživatele
function adminOnly(req, res, next) {
  if (!req.user || !req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Přístup pouze pro adminy.' });
  }
  next();
}

// Middleware: povolí pouze uživatele s určitou rolí (např. 'superadmin')
function adminRole(role) {
  return function (req, res, next) {
    if (!req.user || !req.user.role || req.user.role !== role) {
      return res.status(403).json({ msg: `Přístup pouze pro roli: ${role}` });
    }
    next();
  };
}

module.exports = {
  auth,
  adminOnly,
  adminRole
};
