// Integrační testy pro analyticsRoutes.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

let server;
const adminEmail = 'analyticsadmin@example.com';
const adminPassword = 'testpass';

async function createAdmin() {
  return User.create({
    name: 'Analytics Admin',
    email: adminEmail,
    passwordHash: await require('bcrypt').hash(adminPassword, 8),
    role: 'admin'
  });

  describe('/api/analytics/export', () => {
    let admin, token;
    beforeEach(async () => {
      admin = await createAdmin();
      token = require('jsonwebtoken').sign({ _id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '1h' });
    });
    afterEach(async () => {
      await User.deleteMany({ email: adminEmail });
    });
    it('should return CSV for admin', async () => {
      const res = await request(server)
        .get('/api/analytics/export')
        .set('Authorization', 'Bearer ' + token)
        .expect(200);
      expect(res.headers['content-type']).toMatch(/csv/);
    });
    it('should deny access for unauthenticated', async () => {
      await request(server)
        .get('/api/analytics/export')
        .expect(401);
    });
  });

  describe('/api/analytics/export-pdf', () => {
    let admin, token;
    beforeEach(async () => {
      admin = await createAdmin();
      token = require('jsonwebtoken').sign({ _id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '1h' });
    });
    afterEach(async () => {
      await User.deleteMany({ email: adminEmail });
    });
    it('should return PDF for admin', async () => {
      const res = await request(server)
        .get('/api/analytics/export-pdf')
        .set('Authorization', 'Bearer ' + token)
        .expect(200);
      expect(res.headers['content-type']).toMatch(/pdf/);
    });
    it('should deny access for unauthenticated', async () => {
      await request(server)
        .get('/api/analytics/export-pdf')
        .expect(401);
    });
  });

  describe('/api/analytics/filtered', () => {
    let admin, token;
    beforeEach(async () => {
      admin = await createAdmin();
      token = require('jsonwebtoken').sign({ _id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '1h' });
    });
    afterEach(async () => {
      await User.deleteMany({ email: adminEmail });
    });
    it('should return filtered stats for admin', async () => {
      const res = await request(server)
        .get('/api/analytics/filtered')
        .set('Authorization', 'Bearer ' + token)
        .expect(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('byStatus');
      expect(res.body).toHaveProperty('byMechanic');
    });
    it('should deny access for unauthenticated', async () => {
      await request(server)
        .get('/api/analytics/filtered')
        .expect(401);
    });
  });

  describe('/api/analytics/user-metrics', () => {
    let admin, token;
    beforeEach(async () => {
      admin = await createAdmin();
      token = require('jsonwebtoken').sign({ _id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '1h' });
    });
    afterEach(async () => {
      await User.deleteMany({ email: adminEmail });
    });
    it('should return user metrics for admin', async () => {
      const res = await request(server)
        .get('/api/analytics/user-metrics')
        .set('Authorization', 'Bearer ' + token)
        .expect(200);
      expect(res.body).toHaveProperty('activity');
      expect(res.body).toHaveProperty('retention');
      expect(res.body).toHaveProperty('conversions');
      expect(res.body).toHaveProperty('topActions');
    });
    it('should deny access for unauthenticated', async () => {
      await request(server)
        .get('/api/analytics/user-metrics')
        .expect(401);
    });
  });
}

describe('Analytics API integration', () => {
  beforeAll(async () => {
    server = app.listen(0);
  });
  afterAll(async () => {
    await User.deleteMany({ email: adminEmail });
    await mongoose.disconnect();
    await server.close();
  });

  describe('/api/analytics/', () => {
    let admin;
    beforeEach(async () => {
      admin = await createAdmin();
    });
    afterEach(async () => {
      await User.deleteMany({ email: adminEmail });
    });
    it('should deny access for unauthenticated user', async () => {
      await request(server)
        .get('/api/analytics/')
        .expect(401);
    });
    it('should allow access for authenticated admin', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ _id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '1h' });
      const res = await request(server)
        .get('/api/analytics/')
        .set('Authorization', 'Bearer ' + token)
        .expect(200);
      expect(res.body).toHaveProperty('userCount');
      expect(res.body).toHaveProperty('bikeCount');
      expect(res.body).toHaveProperty('serviceCount');
      expect(res.body).toHaveProperty('messageCount');
    });
    it('should deny access for user with wrong role', async () => {
      const user = await User.create({
        name: 'Not Admin',
        email: 'notadmin@example.com',
        passwordHash: await require('bcrypt').hash('test', 8),
        role: 'client'
      });
      const jwt = require('jsonwebtoken');
      const userToken = jwt.sign({ _id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '1h' });
      await request(server)
        .get('/api/analytics/')
        .set('Authorization', 'Bearer ' + userToken)
        .expect(403);
      await User.deleteOne({ email: 'notadmin@example.com' });
    });
  });
});
