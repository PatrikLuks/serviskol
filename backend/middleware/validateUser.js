// Middleware pro validaci registrace a přihlášení uživatele
const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('name').notEmpty().withMessage('Jméno je povinné'),
  body('email').isEmail().withMessage('Neplatný email'),
  body('password').isLength({ min: 6 }).withMessage('Heslo musí mít alespoň 6 znaků'),
  body('role').isIn(['client', 'mechanic']).withMessage('Role musí být client nebo mechanic'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateLogin = [
  body('email').isEmail().withMessage('Neplatný email'),
  body('password').notEmpty().withMessage('Heslo je povinné'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateRegister, validateLogin };
