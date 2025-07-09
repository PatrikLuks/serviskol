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

module.exports = auth;
