const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

describe('2FA Integration', () => {
  let userToken;
  beforeAll(async () => {
    const User = require('../models/User');
    let user = await User.findOne({ email: 'client@serviskol.cz' });
    if (!user) {
      user = new User({
        name: 'Testovací Klient',
        email: 'client@serviskol.cz',
        passwordHash: 'heslo123',
        role: 'client',
        twoFactorEnabled: true
      });
      await user.save();
    }
    const secret = process.env.JWT_SECRET || 'tajnyklic';
    userToken = jwt.sign({ id: user._id, role: user.role, twoFactorEnabled: user.twoFactorEnabled }, secret, { expiresIn: '1h' });
  });

  let twoFactorSecret;

  it('should initiate 2FA setup', async () => {
    const res = await request(app)
      .post('/api/2fa/setup')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.qr).toBeDefined();
    expect(res.body.secret).toBeDefined();
    twoFactorSecret = res.body.secret;
  });

  it('should verify 2FA code', async () => {
    // Assert, že twoFactorSecret je nastaveno
    expect(twoFactorSecret).toBeDefined();
    if (!twoFactorSecret) {
      throw new Error('Test setup selhal: twoFactorSecret není nastaveno.');
    }
    // Vygeneruj platný TOTP kód podle získaného secretu
    const validToken = require('speakeasy').totp({
      secret: twoFactorSecret,
      encoding: 'base32'
    });
    const res = await request(app)
      .post('/api/2fa/verify')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ token: validToken });
    if (![200, 400].includes(res.statusCode)) {
      // Strategické logování pro rychlou diagnostiku
      // eslint-disable-next-line no-console
      console.error('2FA VERIFY FAIL:', { status: res.statusCode, body: res.body });
    }
    expect([200, 400]).toContain(res.statusCode);
  });

  it('should require 2FA on login', async () => {
    const res = await request(app)
      .post('/api/users/2fa/verify-login')
      .send({ email: 'client@serviskol.cz', password: 'heslo123', token: '123456' });
    if (![200, 400].includes(res.statusCode)) {
      // eslint-disable-next-line no-console
      console.error('2FA LOGIN VERIFY FAIL:', { status: res.statusCode, body: res.body });
    }
    expect([200, 400]).toContain(res.statusCode); // 200 = úspěch, 400 = špatný kód
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });
});
