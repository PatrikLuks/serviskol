// Vygeneruje platný JWT token pro testy
const jwt = require('jsonwebtoken');
const payload = { id: '507f1f77bcf86cd799439011', name: 'Testovací Uživatel', email: 'test@serviskol.cz', role: 'user' };
const secret = process.env.JWT_SECRET || 'supertajnyserviskol';
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log(token);
