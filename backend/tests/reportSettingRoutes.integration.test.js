// Integrační testy pro reportSettingRoutes.js
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const ReportSetting = require('../models/ReportSetting');

let server;
const superadminEmail = 'superadmin@example.com';
const superadminPassword = 'testpass';
const jwtSecret = process.env.JWT_SECRET || 'tajnyklic';

async function createSuperadmin() {
  return User.create({
    name: 'Super Admin',
    email: superadminEmail,
    passwordHash: await require('bcrypt').hash(superadminPassword, 8),
    role: 'admin',
    adminRole: 'superadmin'
  });
}

describe('ReportSetting API integration', () => {
  beforeAll(async () => {
    server = app.listen(0);
  });
  afterAll(async () => {
    await User.deleteMany({ email: superadminEmail });
    await ReportSetting.deleteMany({});
    await mongoose.disconnect();
    await server.close();
  });

  describe('/api/admin/report-settings', () => {
    let superadmin, token;
    beforeEach(async () => {
      superadmin = await createSuperadmin();
      token = jwt.sign({ _id: superadmin._id, email: superadmin.email, role: superadmin.role, adminRole: superadmin.adminRole }, jwtSecret, { expiresIn: '1h' });
      // Debug výpis
      // eslint-disable-next-line no-console
      console.log('DEBUG superadmin:', { _id: superadmin._id, email: superadmin.email, role: superadmin.role, adminRole: superadmin.adminRole });
      // eslint-disable-next-line no-console
      console.log('DEBUG JWT:', jwt.decode(token));
    });
    afterEach(async () => {
      await User.deleteMany({ email: superadminEmail });
      await ReportSetting.deleteMany({});
    });
    it('should deny access for unauthenticated user', async () => {
      await request(server)
        .get('/api/admin/report-settings')
        .expect(401);
    });
    it('should allow GET for superadmin', async () => {
      const res = await request(server)
        .get('/api/admin/report-settings')
        .set('Authorization', 'Bearer ' + token)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    it('should allow POST for superadmin', async () => {
      const res = await request(server)
        .post('/api/admin/report-settings')
        .set('Authorization', 'Bearer ' + token)
        .send({ emails: ['a@b.cz'], frequency: 'weekly', enabled: true })
        .expect(201);
      expect(res.body).toHaveProperty('emails');
      expect(res.body).toHaveProperty('frequency', 'weekly');
    });
    it('should allow PATCH for superadmin', async () => {
      const setting = await ReportSetting.create({ emails: ['a@b.cz'], frequency: 'weekly', enabled: true, createdBy: superadmin._id });
      const res = await request(server)
        .patch('/api/admin/report-settings/' + setting._id)
        .set('Authorization', 'Bearer ' + token)
        .send({ enabled: false })
        .expect(200);
      expect(res.body).toHaveProperty('enabled', false);
    });
    it('should allow DELETE for superadmin', async () => {
      const setting = await ReportSetting.create({ emails: ['a@b.cz'], frequency: 'weekly', enabled: true, createdBy: superadmin._id });
      await request(server)
        .delete('/api/admin/report-settings/' + setting._id)
        .set('Authorization', 'Bearer ' + token)
        .expect(200);
      const found = await ReportSetting.findById(setting._id);
      expect(found).toBeNull();
    });
  });
});
