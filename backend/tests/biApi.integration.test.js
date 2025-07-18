// integration test for BI API endpoints in /backend/routes/biRoutes.js
// Covers: /api/bi/ai-segment-history, /api/bi/predictions, /api/bi/engagement-metrics, /api/bi/segments, /api/bi/segments/ai, /api/bi/users, /api/bi/campaigns

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const AuditLog = require('../models/AuditLog');

// Helper to create admin user with BI API key and permissions
const bcrypt = require('bcrypt');
const defaultApiKey = 'test-bi-api-key';
async function createBiAdminUser(permissions = ['campaigns:read','export:csv','export:json']) {
  const password = 'testpass';
  const passwordHash = await bcrypt.hash(password, 8);
  return User.create({
    name: 'BI Admin',
    email: 'biadmin@example.com',
    passwordHash,
    role: 'admin',
    apiKey: defaultApiKey,
    apiKeyPermissions: permissions
  });
}

describe('BI API integration', () => {
  let server;
  beforeAll(async () => {
    server = app.listen(0); // random port
  });
  afterAll(async () => {
    await User.deleteMany({ email: 'biadmin@example.com' });
    await Campaign.deleteMany({ tema: 'Test BI Campaign' });
    await AuditLog.deleteMany({ action: /bi_api_/ });
    await server.close();
  });

  describe('/api/bi/campaigns', () => {
    beforeEach(async () => {
      await createBiAdminUser();
      await Campaign.create({ tema: 'Test BI Campaign', text: 'Test', region: 'Praha', age: 30, clickCount: 1, sentCount: 2, createdAt: new Date() });
    });
    afterEach(async () => {
      await User.deleteMany({ email: 'biadmin@example.com' });
      await Campaign.deleteMany({ tema: 'Test BI Campaign' });
      await AuditLog.deleteMany({ action: /bi_api_/ });
    });
    it('returns campaigns as JSON with valid API key and permissions', async () => {
      const res = await request(server)
        .get('/api/bi/campaigns?apiKey=' + defaultApiKey + '&format=json')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('tema', 'Test BI Campaign');
    });
    it('returns campaigns as CSV with valid API key and permissions', async () => {
      const res = await request(server)
        .get('/api/bi/campaigns?apiKey=' + defaultApiKey + '&format=csv')
        .expect(200);
      expect(res.headers['content-type']).toMatch(/csv/);
      expect(res.text).toMatch(/Test BI Campaign/);
    });
    it('denies access with missing API key', async () => {
      await request(server)
        .get('/api/bi/campaigns')
        .expect(401);
    });
    it('denies access with insufficient permissions', async () => {
      await User.updateOne({ apiKey: defaultApiKey }, { apiKeyPermissions: [] });
      await request(server)
        .get('/api/bi/campaigns?apiKey=' + defaultApiKey)
        .expect(403);
    });
    it('denies CSV export without export:csv permission', async () => {
      await User.updateOne({ apiKey: defaultApiKey }, { apiKeyPermissions: ['campaigns:read'] });
      await request(server)
        .get('/api/bi/campaigns?apiKey=' + defaultApiKey + '&format=csv')
        .expect(403);
    });
    it('denies JSON export without export:json permission', async () => {
      await User.updateOne({ apiKey: defaultApiKey }, { apiKeyPermissions: ['campaigns:read'] });
      await request(server)
        .get('/api/bi/campaigns?apiKey=' + defaultApiKey + '&format=json')
        .expect(403);
    });
    it('logs audit entry for campaign export', async () => {
      await request(server)
        .get('/api/bi/campaigns?apiKey=' + defaultApiKey + '&format=json')
        .expect(200);
      const log = await AuditLog.findOne({ action: 'bi_api_campaigns' });
      expect(log).toBeTruthy();
      expect(log.details.endpoint).toBe('/api/bi/campaigns');
    });
  });

  describe('/api/bi/ai-segment-history', () => {
    let adminUser;
    beforeEach(async () => {
      adminUser = await createBiAdminUser(['campaigns:read','export:csv','export:json']);
      await require('../models/AuditLog').create({
        action: 'ai_segment_change',
        performedBy: adminUser._id,
        details: { newSegment: 'VIP' },
        createdAt: new Date()
      });
    });
    afterEach(async () => {
      await require('../models/AuditLog').deleteMany({ action: 'ai_segment_change' });
      await User.deleteMany({ email: 'biadmin@example.com' });
    });
    it('returns AI segment history', async () => {
      const res = await request(server)
        .get('/api/bi/ai-segment-history?apiKey=' + defaultApiKey)
        .expect(200);
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history[0]).toHaveProperty('newSegment', 'VIP');
    });
  });

  describe('/api/bi/predictions', () => {
    beforeEach(async () => {
      await createBiAdminUser(['predictions:read','export:csv','export:json']);
      const user = await User.create({
        name: 'Pred User',
        email: 'preduser@example.com',
        passwordHash: await require('bcrypt').hash('test', 8),
        role: 'client',
        region: 'Praha',
        age: 25
      });
      await require('../models/Prediction').create({
        user: user._id,
        type: 'churn',
        value: 0.5
      });
    });
    afterEach(async () => {
      await require('../models/Prediction').deleteMany({});
      await User.deleteMany({ email: { $in: ['biadmin@example.com','preduser@example.com'] } });
      await require('../models/AuditLog').deleteMany({ action: 'bi_api_predictions' });
    });
    it('returns predictions as JSON', async () => {
      const res = await request(server)
        .get('/api/bi/predictions?apiKey=' + defaultApiKey + '&type=churn&format=json')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('type', 'churn');
    });
    it('returns predictions as CSV', async () => {
      const res = await request(server)
        .get('/api/bi/predictions?apiKey=' + defaultApiKey + '&type=churn&format=csv')
        .expect(200);
      expect(res.headers['content-type']).toMatch(/csv/);
    });
    it('denies access with insufficient permissions', async () => {
      await User.updateOne({ apiKey: defaultApiKey }, { apiKeyPermissions: [] });
      await request(server)
        .get('/api/bi/predictions?apiKey=' + defaultApiKey)
        .expect(403);
    });
    it('logs audit entry for predictions export', async () => {
      await request(server)
        .get('/api/bi/predictions?apiKey=' + defaultApiKey + '&type=churn&format=json')
        .expect(200);
      const log = await require('../models/AuditLog').findOne({ action: 'bi_api_predictions' });
      expect(log).toBeTruthy();
    });
  });

  describe('/api/bi/engagement-metrics', () => {
    beforeEach(async () => {
      await createBiAdminUser(['metrics:read','export:csv','export:json']);
      await require('../models/EngagementMetric').create({
        date: new Date(),
        channel: 'email',
        sent: 10,
        opened: 5,
        clicked: 2,
        conversions: 1,
        segment: 'VIP'
      });
    });
    afterEach(async () => {
      await require('../models/EngagementMetric').deleteMany({});
      await User.deleteMany({ email: 'biadmin@example.com' });
      await require('../models/AuditLog').deleteMany({ action: 'bi_api_engagement_metrics' });
    });
    it('returns engagement metrics as JSON', async () => {
      const res = await request(server)
        .get('/api/bi/engagement-metrics?apiKey=' + defaultApiKey + '&format=json')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('channel', 'email');
    });
    it('returns engagement metrics as CSV', async () => {
      const res = await request(server)
        .get('/api/bi/engagement-metrics?apiKey=' + defaultApiKey + '&format=csv')
        .expect(200);
      expect(res.headers['content-type']).toMatch(/csv/);
    });
    it('denies access with insufficient permissions', async () => {
      await User.updateOne({ apiKey: defaultApiKey }, { apiKeyPermissions: [] });
      await request(server)
        .get('/api/bi/engagement-metrics?apiKey=' + defaultApiKey)
        .expect(403);
    });
    it('logs audit entry for engagement metrics export', async () => {
      await request(server)
        .get('/api/bi/engagement-metrics?apiKey=' + defaultApiKey + '&format=json')
        .expect(200);
      const log = await require('../models/AuditLog').findOne({ action: 'bi_api_engagement_metrics' });
      expect(log).toBeTruthy();
    });
  });

  describe('/api/bi/segments', () => {
    beforeEach(async () => {
      await createBiAdminUser(['segments:read','export:csv','export:json']);
      await require('../models/Segment').create({
        name: 'VIP',
        description: 'VIP zákazníci'
      });
    });
    afterEach(async () => {
      await require('../models/Segment').deleteMany({});
      await User.deleteMany({ email: 'biadmin@example.com' });
      await require('../models/AuditLog').deleteMany({ action: 'bi_api_segments' });
    });
    it('returns segments as JSON', async () => {
      const res = await request(server)
        .get('/api/bi/segments?apiKey=' + defaultApiKey + '&format=json')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('name', 'VIP');
    });
    it('returns segments as CSV', async () => {
      const res = await request(server)
        .get('/api/bi/segments?apiKey=' + defaultApiKey + '&format=csv')
        .expect(200);
      expect(res.headers['content-type']).toMatch(/csv/);
    });
    it('denies access with insufficient permissions', async () => {
      await User.updateOne({ apiKey: defaultApiKey }, { apiKeyPermissions: [] });
      await request(server)
        .get('/api/bi/segments?apiKey=' + defaultApiKey)
        .expect(403);
    });
    it('logs audit entry for segments export', async () => {
      await request(server)
        .get('/api/bi/segments?apiKey=' + defaultApiKey + '&format=json')
        .expect(200);
      const log = await require('../models/AuditLog').findOne({ action: 'bi_api_segments' });
      expect(log).toBeTruthy();
    });
  });

  describe('/api/bi/segments/ai', () => {
    beforeEach(async () => {
      await createBiAdminUser(['segments:read']);
      await User.create({
        name: 'AI Seg User',
        email: 'aiseguser@example.com',
        passwordHash: await require('bcrypt').hash('test', 8),
        role: 'client',
        aiSegment: 'VIP'
      });
    });
    afterEach(async () => {
      await User.deleteMany({ email: { $in: ['biadmin@example.com','aiseguser@example.com'] } });
    });
    it('returns AI segments with counts', async () => {
      const res = await request(server)
        .get('/api/bi/segments/ai?apiKey=' + defaultApiKey)
        .expect(200);
      expect(Array.isArray(res.body.aiSegments)).toBe(true);
      expect(res.body.aiSegments[0]).toHaveProperty('_id');
      expect(res.body.aiSegments[0]).toHaveProperty('count');
    });
  });

  describe('/api/bi/users', () => {
    beforeEach(async () => {
      await createBiAdminUser(['segments:read']);
      await User.create({
        name: 'User Seg',
        email: 'userseg@example.com',
        passwordHash: await require('bcrypt').hash('test', 8),
        role: 'client',
        aiSegment: 'VIP',
        region: 'Praha',
        age: 40
      });
    });
    afterEach(async () => {
      await User.deleteMany({ email: { $in: ['biadmin@example.com','userseg@example.com'] } });
    });
    it('returns users in given AI segment', async () => {
      const res = await request(server)
        .get('/api/bi/users?apiKey=' + defaultApiKey + '&aiSegment=VIP')
        .expect(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users[0]).toHaveProperty('aiSegment', 'VIP');
    });
    it('returns users filtered by region and age', async () => {
      const res = await request(server)
        .get('/api/bi/users?apiKey=' + defaultApiKey + '&aiSegment=VIP&region=Praha&ageMin=30&ageMax=50')
        .expect(200);
      expect(res.body.users[0]).toHaveProperty('region', 'Praha');
      expect(res.body.users[0].age).toBeGreaterThanOrEqual(30);
      expect(res.body.users[0].age).toBeLessThanOrEqual(50);
    });
  });
});
