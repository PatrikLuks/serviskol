
const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const mongoose = require('mongoose');
const User = require('../models/User');

// Mock alertAdmins (vedlejší efekt) pro všechny testy
jest.mock('../utils/notificationUtils', () => ({
  ...jest.requireActual('../utils/notificationUtils'),
  alertAdmins: jest.fn().mockResolvedValue(undefined)
}));
// Mock auditLog pouze jako funkci v objektu (zachovat strukturu exportu)
jest.mock('../middleware/auditLog', () => ({
  auditLog: jest.fn(),
  checkExportAlerts: jest.fn()
}));

describe('User API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  it('should return 400 for missing registration fields', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ email: 'test@test.cz' });
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 for unauthorized access to /api/users/me', async () => {
    const res = await request(app)
      .get('/api/users/me');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Test User', email: 'testuser@example.com', password: 'Test1234', role: 'client' });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.msg).toMatch(/Registrace/);
  });

  it('should not allow duplicate email registration', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ name: 'Test User', email: 'dupe@example.com', password: 'Test1234', role: 'client' });
    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Test User', email: 'dupe@example.com', password: 'Test1234', role: 'client' });
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/existuje/);
  });

  it('should login successfully and access /me with token', async () => {
    // Nejprve registrace
    await request(app)
      .post('/api/users/register')
      .send({ name: 'Login User', email: 'loginuser@example.com', password: 'Test1234', role: 'client' });
    // Login
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'loginuser@example.com', password: 'Test1234' });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    // Přístup na /me
    const meRes = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.email).toBe('loginuser@example.com');
  });

  it('should not login with wrong password', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ name: 'WrongPass', email: 'wrongpass@example.com', password: 'Test1234', role: 'client' });
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'wrongpass@example.com', password: 'WrongPassword' });
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/Nesprávný email nebo heslo/);
  });

  describe('User role change', () => {
    const jwt = require('jsonwebtoken');
    let adminToken, userId;
    beforeEach(async () => {
      // Vyčistit kolekci uživatelů před testy role
      await require('../models/User').deleteMany({});
      // Registrace běžného uživatele
      const userRes = await request(app)
        .post('/api/users/register')
        .send({ name: 'RoleUser', email: 'roleuser@example.com', password: 'User1234', role: 'client' });
      expect([200, 201]).toContain(userRes.statusCode);
      // Získání userId
      const userLogin = await request(app)
        .post('/api/users/login')
        .send({ email: 'roleuser@example.com', password: 'User1234' });
      userId = userLogin.body.user.id;
      // Vytvoření platného admin tokenu
      const adminPayload = {
        _id: 'adminid',
        email: 'admin@serviskol.cz',
        name: 'Testovací Admin',
        role: 'admin'
      };
      const secret = process.env.JWT_SECRET || 'tajnyklic';
      adminToken = jwt.sign(adminPayload, secret, { expiresIn: '1h' });
    });

    it('should change user role successfully', async () => {
      const res = await request(app)
        .post('/api/users/change-role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId, newRole: 'mechanic' });
      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toMatch(/Role změněna/);
    });

    it('should not change role to invalid value', async () => {
      const res = await request(app)
        .post('/api/users/change-role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId, newRole: 'invalidrole' });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toMatch(/Neplatná role/);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/users/change-role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: '000000000000000000000000', newRole: 'mechanic' });
      expect(res.statusCode).toBe(404);
      expect(res.body.msg).toMatch(/Uživatel nenalezen/);
    });

    it('should not allow role change without token', async () => {
      const res = await request(app)
        .post('/api/users/change-role')
        .send({ userId, newRole: 'mechanic' });
      expect([401, 403]).toContain(res.statusCode);
    });

    it('should not allow role change without admin rights', async () => {
      // Registrace běžného uživatele
      await request(app)
        .post('/api/users/register')
        .send({ name: 'User', email: 'user1@example.com', password: 'User1234', role: 'client' });
      // Login běžného uživatele
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email: 'user1@example.com', password: 'User1234' });
      const token = loginRes.body.token;
      // Pokus o změnu role bez admin práv
      const res = await request(app)
        .post('/api/users/change-role')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: '000000000000000000000000', newRole: 'admin' });
      expect(res.statusCode).toBe(403);
      expect(res.body.msg).toMatch(/Pouze admin/);
    });
  });

  describe('Onboarding endpoint', () => {
    let token;
    beforeAll(async () => {
      await request(app)
        .post('/api/users/register')
        .send({ name: 'Onboard', email: 'onboard@example.com', password: 'Onboard1234', role: 'client' });
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email: 'onboard@example.com', password: 'Onboard1234' });
      token = loginRes.body.token;
    }, 20000);

    it('should assign points for onboarding', async () => {
      const res = await request(app)
        .post('/api/users/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send();
      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toMatch(/onboarding/);
    }, 10000);

    it('should not assign points without token', async () => {
      const res = await request(app)
        .post('/api/users/onboarding/complete')
        .send();
      expect([401, 403]).toContain(res.statusCode);
    }, 10000);

    it('should return 401 for onboarding without token', async () => {
      const res = await request(app)
        .post('/api/users/onboarding/complete')
        .send();
      expect([401, 403]).toContain(res.statusCode);
    }, 10000);
  });

  describe('2FA flow', () => {
    let token, secret, email = '2fauser@example.com', password = 'Test2fa123';
    beforeEach(async () => {
      await require('../models/User').deleteMany({ email });
      await request(app)
        .post('/api/users/register')
        .send({ name: '2FA User', email, password, role: 'client' });
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email, password });
      token = loginRes.body.token;
      secret = undefined;
    }, 15000);

    it('should setup and activate 2FA', async () => {
      // Setup 2FA
      const setupRes = await request(app)
        .post('/api/2fa/setup')
        .set('Authorization', `Bearer ${token}`)
        .send();
      expect(setupRes.statusCode).toBe(200);
      expect(setupRes.body.secret).toBeDefined();
      secret = setupRes.body.secret;
      // Verify 2FA
      const code = speakeasy.totp({ secret, encoding: 'base32' });
      const verifyRes = await request(app)
        .post('/api/2fa/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: code });
      expect(verifyRes.statusCode).toBe(200);
      expect(verifyRes.body.success).toBe(true);
    });

    it('should fail 2FA verification with wrong code', async () => {
      // Nejprve setup 2FA
      const setupRes = await request(app)
        .post('/api/2fa/setup')
        .set('Authorization', `Bearer ${token}`)
        .send();
      expect(setupRes.statusCode).toBe(200);
      expect(setupRes.body.secret).toBeDefined();
      secret = setupRes.body.secret;
      // Ověření špatného kódu
      const wrongCode = '123456';
      const res = await request(app)
        .post('/api/2fa/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: wrongCode });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toMatch(/Neplatný kód/);
    });

    it('should require 2FA on login and allow login via /2fa/verify-login', async () => {
      // Nejprve setup 2FA
      const setupRes = await request(app)
        .post('/api/2fa/setup')
        .set('Authorization', `Bearer ${token}`)
        .send();
      expect(setupRes.statusCode).toBe(200);
      expect(setupRes.body.secret).toBeDefined();
      secret = setupRes.body.secret;
      // Aktivace 2FA
      const code = speakeasy.totp({ secret, encoding: 'base32' });
      const verifyRes = await request(app)
        .post('/api/2fa/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: code });
      expect(verifyRes.statusCode).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      // Login, očekáváme twoFactorRequired
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email, password });
      expect(loginRes.statusCode).toBe(401);
      expect(loginRes.body.twoFactorRequired).toBe(true);
      // Ověření přes /2fa/verify-login
      const verifyLoginRes = await request(app)
        .post('/api/users/2fa/verify-login')
        .send({ email, password, token: code });
      expect(verifyLoginRes.statusCode).toBe(200);
      expect(verifyLoginRes.body.token).toBeDefined();
    });

    it('should disable 2FA', async () => {
      // Nejprve setup 2FA
      const setupRes = await request(app)
        .post('/api/2fa/setup')
        .set('Authorization', `Bearer ${token}`)
        .send();
      expect(setupRes.statusCode).toBe(200);
      expect(setupRes.body.secret).toBeDefined();
      secret = setupRes.body.secret;
      // Aktivace 2FA
      const code = speakeasy.totp({ secret, encoding: 'base32' });
      const verifyRes = await request(app)
        .post('/api/2fa/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: code });
      expect(verifyRes.statusCode).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      // Login přes 2FA
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email, password });
      expect(loginRes.statusCode).toBe(401);
      expect(loginRes.body.twoFactorRequired).toBe(true);
      const verifyLoginRes = await request(app)
        .post('/api/users/2fa/verify-login')
        .send({ email, password, token: code });
      const userToken = verifyLoginRes.body.token;
      // Deaktivace 2FA
      const disableRes = await request(app)
        .post('/api/2fa/disable')
        .set('Authorization', `Bearer ${userToken}`)
        .send();
      expect(disableRes.statusCode).toBe(200);
      expect(disableRes.body.success).toBe(true);
    });

    it('should return 400 for registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'BadEmail', email: 'notanemail', password: 'Test1234', role: 'client' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'noexist@example.com', password: 'Test1234' });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toMatch(/Nesprávný email nebo heslo/);
    });

    it('should not allow 2FA verify if not enabled', async () => {
      // Registrace a login uživatele bez 2FA
      await request(app)
        .post('/api/users/register')
        .send({ name: 'No2FA', email: 'no2fa@example.com', password: 'Test1234', role: 'client' });
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email: 'no2fa@example.com', password: 'Test1234' });
      const token = loginRes.body.token;
      // Pokus o ověření 2FA bez aktivace
      const res = await request(app)
        .post('/api/2fa/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: '123456' });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toMatch(/2FA není inicializováno/);
    });
  });
});
