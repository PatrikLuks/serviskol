// Vygeneruje platný admin JWT token pro testy
const jwt = require('jsonwebtoken');
const payload = { id: '507f1f77bcf86cd799439012', name: 'Admin Uživatel', email: 'admin@serviskol.cz', role: 'admin' };
const secret = process.env.JWT_SECRET || 'supertajnyserviskol';
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log(token);
