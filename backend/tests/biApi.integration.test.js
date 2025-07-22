// integration test for BI API endpoints in /backend/routes/biRoutes.js

jest.setTimeout(20000); // prodloužení timeoutu pro pomalé DB operace
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
let testApiKey;
async function createBiAdminUser(permissions = ['campaigns:read','export:csv','export:json']) {
  const password = 'testpass';
  const passwordHash = await bcrypt.hash(password, 8);
  await User.deleteMany({ email: 'biadmin@example.com' });
  return User.create({
    name: 'BI Admin',
    email: 'biadmin@example.com',
    passwordHash,
    role: 'admin',
    apiKey: testApiKey,
    apiKeyPermissions: permissions
  });
}

describe('BI API integration', () => {
  let server;
  beforeAll(async () => {
    server = app.listen(0); // random port
  });
  beforeEach(() => {
    // Unikátní apiKey pro každý test
    testApiKey = 'test-bi-api-key-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  });
  afterAll(async () => {
    await User.deleteMany({ email: 'biadmin@example.com' });
    await Campaign.deleteMany({ tema: 'Test BI Campaign' });
    await AuditLog.deleteMany({ action: /bi_api_/ });
    await server.close();
  });

  describe('/api/bi/campaigns', () => {
    beforeEach(async () => {
      console.log('DEBUG [beforeEach] /api/bi/campaigns: start deleteMany');
      await User.deleteMany({ apiKey: testApiKey });
      console.log('DEBUG [beforeEach] /api/bi/campaigns: after deleteMany');
      // Všechna potřebná práva pro BI API
      await createBiAdminUser([
        'campaigns:read',
        'predictions:read',
        'metrics:read',
        'segments:read',
        'users:read',
        'export:csv',
        'export:json'
      ]);
      // Ověř, že uživatel existuje v DB
      let fresh = null, tries = 0;
      do {
        fresh = await User.findOne({ apiKey: testApiKey });
        if (!fresh) await new Promise(r => setTimeout(r, 50));
        tries++;
      } while (!fresh && tries < 10);
      console.log('DEBUG apiKeyPermissions:', fresh ? fresh.apiKeyPermissions : null);
      await Campaign.create({ tema: 'Test BI Campaign', text: 'Test', region: 'Praha', age: 30, clickCount: 1, sentCount: 2, createdAt: new Date() });
      console.log('DEBUG [beforeEach] /api/bi/campaigns: after Campaign.create');
    });
    afterEach(async () => {
      await User.deleteMany({ email: 'biadmin@example.com' });
      await Campaign.deleteMany({ tema: 'Test BI Campaign' });
      await AuditLog.deleteMany({ action: /bi_api_/ });
    });
    it('returns campaigns as JSON with valid API key and permissions', async () => {
      const res = await request(server)
        .get('/api/bi/campaigns?apiKey=' + testApiKey + '&format=json')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('tema', 'Test BI Campaign');
    });
    it('returns campaigns as CSV with valid API key and permissions', async () => {
      const res = await request(server)
        .get('/api/bi/campaigns?apiKey=' + testApiKey + '&format=csv')
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
      await User.updateOne({ apiKey: testApiKey }, { apiKeyPermissions: [] });
      await request(server)
        .get('/api/bi/campaigns?apiKey=' + testApiKey)
        .expect(403);
    });
    it('denies CSV export without export:csv permission', async () => {
      await User.updateOne({ apiKey: testApiKey }, { apiKeyPermissions: ['campaigns:read'] });
      await request(server)
        .get('/api/bi/campaigns?apiKey=' + testApiKey + '&format=csv')
        .expect(403);
    });
    it('denies JSON export without export:json permission', async () => {
      await User.updateOne({ apiKey: testApiKey }, { apiKeyPermissions: ['campaigns:read'] });
      await request(server)
        .get('/api/bi/campaigns?apiKey=' + testApiKey + '&format=json')
        .expect(403);
    });
    it('logs audit entry for campaign export', async () => {
      // Kontrola uživatele a práv
      const user = await User.findOne({ apiKey: testApiKey });
      console.log('DEBUG [campaign export] user:', user ? user.toObject() : null);
      // Kontrola kampaní
      const campaigns = await Campaign.find({ tema: 'Test BI Campaign' });
      console.log('DEBUG [campaign export] campaigns:', campaigns.map(c => c.toObject()));
      // Kontrola práv
      console.log('DEBUG [campaign export] apiKeyPermissions:', user ? user.apiKeyPermissions : null);
      const res = await request(server)
        .get('/api/bi/campaigns?apiKey=' + testApiKey + '&format=json');
      console.log('DEBUG [campaign export] response status:', res.status, 'body:', res.body);
      expect(res.status).toBe(200);
      const log = await AuditLog.findOne({ action: 'bi_api_campaigns' });
      expect(log).toBeTruthy();
      expect(log.details.endpoint).toBe('/api/bi/campaigns');
    });
  });

  describe('/api/bi/ai-segment-history', () => {
    let adminUser;
    beforeEach(async () => {
      console.log('DEBUG [beforeEach] /api/bi/ai-segment-history: start deleteMany');
      await User.deleteMany({ apiKey: testApiKey });
      console.log('DEBUG [beforeEach] /api/bi/ai-segment-history: after deleteMany');
      adminUser = await createBiAdminUser([
        'campaigns:read',
        'predictions:read',
        'metrics:read',
        'segments:read',
        'users:read',
        'export:csv',
        'export:json'
      ]);
      // Ověř, že uživatel existuje v DB
      let fresh = null, tries = 0;
      do {
        fresh = await User.findOne({ apiKey: testApiKey });
        if (!fresh) await new Promise(r => setTimeout(r, 50));
        tries++;
      } while (!fresh && tries < 10);
      console.log('DEBUG apiKeyPermissions:', fresh ? fresh.apiKeyPermissions : null);
      await require('../models/AuditLog').create({
        action: 'ai_segment_change',
        performedBy: adminUser._id,
        details: { newSegment: 'VIP' },
        createdAt: new Date()
      });
      console.log('DEBUG [beforeEach] /api/bi/ai-segment-history: after AuditLog.create');
    });
    afterEach(async () => {
      await require('../models/AuditLog').deleteMany({ action: 'ai_segment_change' });
      await User.deleteMany({ email: 'biadmin@example.com' });
    });
    it('returns AI segment history', async () => {
      const res = await request(server)
        .get('/api/bi/ai-segment-history?apiKey=' + testApiKey)
        .expect(200);
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history[0]).toHaveProperty('newSegment', 'VIP');
    });
  });

  describe('/api/bi/predictions', () => {
    beforeEach(async () => {
      console.log('DEBUG [beforeEach] /api/bi/predictions: start deleteMany');
      await User.deleteMany({ apiKey: testApiKey });
      await User.deleteMany({ email: 'preduser@example.com' });
      console.log('DEBUG [beforeEach] /api/bi/predictions: after deleteMany');
      await createBiAdminUser([
        'campaigns:read',
        'predictions:read',
        'metrics:read',
        'segments:read',
        'users:read',
        'export:csv',
        'export:json'
      ]);
      // Ověř, že uživatel existuje v DB
      let fresh = null, tries = 0;
      do {
        fresh = await User.findOne({ apiKey: testApiKey });
        if (!fresh) await new Promise(r => setTimeout(r, 50));
        tries++;
      } while (!fresh && tries < 10);
      console.log('DEBUG apiKeyPermissions:', fresh ? fresh.apiKeyPermissions : null);
      console.log('DEBUG [beforeEach] /api/bi/predictions: after createBiAdminUser');
      const user = await User.create({
        name: 'Pred User',
        email: 'preduser@example.com',
        passwordHash: await require('bcrypt').hash('test', 8),
        role: 'client',
        region: 'Praha',
        age: 25
      });
      console.log('DEBUG [beforeEach] /api/bi/predictions: after User.create');
      await require('../models/Prediction').create({
        user: user._id,
        type: 'churn',
        value: 0.5
      });
      console.log('DEBUG [beforeEach] /api/bi/predictions: after Prediction.create');
    });

    it('returns predictions as CSV', async () => {
      const res = await request(server)
        .get('/api/bi/predictions?apiKey=' + testApiKey + '&type=churn&format=csv')
        .expect(200);
      expect(res.headers['content-type']).toMatch(/csv/);
    });
    it('denies access with insufficient permissions', async () => {
      await User.updateOne({ apiKey: testApiKey }, { apiKeyPermissions: [] });
      await request(server)
        .get('/api/bi/predictions?apiKey=' + testApiKey)
        .expect(403);
    });
    it('logs audit entry for predictions export', async () => {
      // Kontrola uživatele a práv
      const user = await User.findOne({ apiKey: testApiKey });
      console.log('DEBUG [predictions export] user:', user ? user.toObject() : null);
      // Kontrola predikcí
      const preds = await require('../models/Prediction').find({});
      console.log('DEBUG [predictions export] predictions:', preds.map(p => p.toObject()));
      // Kontrola práv
      console.log('DEBUG [predictions export] apiKeyPermissions:', user ? user.apiKeyPermissions : null);
      const res = await request(server)
        .get('/api/bi/predictions?apiKey=' + testApiKey + '&type=churn&format=json');
      console.log('DEBUG [predictions export] response status:', res.status, 'body:', res.body);
      expect(res.status).toBe(200);
      const log = await require('../models/AuditLog').findOne({ action: 'bi_api_predictions' });
      expect(log).toBeTruthy();
    });
  });

  describe('/api/bi/engagement-metrics', () => {
    beforeEach(async () => {
      console.log('DEBUG [beforeEach] /api/bi/engagement-metrics: start deleteMany');
      await User.deleteMany({ apiKey: testApiKey });
      console.log('DEBUG [beforeEach] /api/bi/engagement-metrics: after deleteMany');
      // Přidej všechna potřebná práva
      await createBiAdminUser([
        'campaigns:read',
        'predictions:read',
        'metrics:read',
        'segments:read',
        'users:read',
        'export:csv',
        'export:json'
      ]);
      // Ověř, že uživatel existuje v DB
      let fresh = null, tries = 0;
      do {
        fresh = await User.findOne({ apiKey: testApiKey });
        if (!fresh) await new Promise(r => setTimeout(r, 50));
        tries++;
      } while (!fresh && tries < 10);
      console.log('DEBUG apiKeyPermissions:', fresh ? fresh.apiKeyPermissions : null);
      console.log('DEBUG [beforeEach] /api/bi/engagement-metrics: after createBiAdminUser');
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
        .get('/api/bi/engagement-metrics?apiKey=' + testApiKey + '&format=json')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('channel', 'email');
    });
    it('returns engagement metrics as CSV', async () => {
      const res = await request(server)
        .get('/api/bi/engagement-metrics?apiKey=' + testApiKey + '&format=csv')
        .expect(200);
      expect(res.headers['content-type']).toMatch(/csv/);
    });
    it('denies access with insufficient permissions', async () => {
      await User.updateOne({ apiKey: testApiKey }, { apiKeyPermissions: [] });
      await request(server)
        .get('/api/bi/engagement-metrics?apiKey=' + testApiKey)
        .expect(403);
    });
    it('logs audit entry for engagement metrics export', async () => {
      await request(server)
        .get('/api/bi/engagement-metrics?apiKey=' + testApiKey + '&format=json')
        .expect(200);
      const log = await require('../models/AuditLog').findOne({ action: 'bi_api_engagement_metrics' });
      expect(log).toBeTruthy();
    });
  });

  describe('/api/bi/segments', () => {
    beforeEach(async () => {
      await User.deleteMany({ apiKey: testApiKey });
      await createBiAdminUser([
        'campaigns:read',
        'predictions:read',
        'metrics:read',
        'segments:read',
        'users:read',
        'export:csv',
        'export:json'
      ]);
      // Ověř, že uživatel existuje v DB
      let fresh = null, tries = 0;
      do {
        fresh = await User.findOne({ apiKey: testApiKey });
        if (!fresh) await new Promise(r => setTimeout(r, 50));
        tries++;
      } while (!fresh && tries < 10);
      await require('../models/Segment').deleteMany({ name: 'VIP' });
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
        .get('/api/bi/segments?apiKey=' + testApiKey + '&format=json')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('name', 'VIP');
    });
    it('returns segments as CSV', async () => {
      const res = await request(server)
        .get('/api/bi/segments?apiKey=' + testApiKey + '&format=csv')
        .expect(200);
      expect(res.headers['content-type']).toMatch(/csv/);
    });
    it('denies access with insufficient permissions', async () => {
      await User.updateOne({ apiKey: testApiKey }, { apiKeyPermissions: [] });
      await request(server)
        .get('/api/bi/segments?apiKey=' + testApiKey)
        .expect(403);
    });
    it('logs audit entry for segments export', async () => {
      await request(server)
        .get('/api/bi/segments?apiKey=' + testApiKey + '&format=json')
        .expect(200);
      const log = await require('../models/AuditLog').findOne({ action: 'bi_api_segments' });
      expect(log).toBeTruthy();
    });
  });

  describe('/api/bi/segments/ai', () => {
    beforeEach(async () => {
      await User.deleteMany({ apiKey: testApiKey });
      // Přidej všechna potřebná práva pro segmenty
      await createBiAdminUser([
        'campaigns:read',
        'predictions:read',
        'metrics:read',
        'segments:read',
        'users:read',
        'export:csv',
        'export:json'
      ]);
      // Ověř, že uživatel existuje v DB
      let fresh = null, tries = 0;
      do {
        fresh = await User.findOne({ apiKey: testApiKey });
        if (!fresh) await new Promise(r => setTimeout(r, 50));
        tries++;
      } while (!fresh && tries < 10);
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
        .get('/api/bi/segments/ai?apiKey=' + testApiKey)
        .expect(200);
      expect(Array.isArray(res.body.aiSegments)).toBe(true);
      expect(res.body.aiSegments[0]).toHaveProperty('_id');
      expect(res.body.aiSegments[0]).toHaveProperty('count');
    });
  });

  describe('/api/bi/users', () => {
    beforeEach(async () => {
      await User.deleteMany({ apiKey: testApiKey });
      // Přidej všechna potřebná práva pro users endpoint
      await createBiAdminUser([
        'campaigns:read',
        'predictions:read',
        'metrics:read',
        'segments:read',
        'users:read',
        'export:csv',
        'export:json'
      ]);
      // Ověř, že uživatel existuje v DB
      let fresh = null, tries = 0;
      do {
        fresh = await User.findOne({ apiKey: testApiKey });
        if (!fresh) await new Promise(r => setTimeout(r, 50));
        tries++;
      } while (!fresh && tries < 10);
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
        .get('/api/bi/users?apiKey=' + testApiKey + '&aiSegment=VIP')
        .expect(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users[0]).toHaveProperty('aiSegment', 'VIP');
    });
    it('returns users filtered by region and age', async () => {
      // Kontrola uživatele a práv
      const user = await User.findOne({ apiKey: testApiKey });
      console.log('DEBUG [users filter] user:', user ? user.toObject() : null);
      // Kontrola uživatelů v DB
      const users = await User.find({ region: 'Praha', age: { $gte: 30, $lte: 50 }, aiSegment: 'VIP' });
      console.log('DEBUG [users filter] users in DB:', users.map(u => u.toObject()));
      const res = await request(server)
        .get('/api/bi/users?apiKey=' + testApiKey + '&aiSegment=VIP&region=Praha&ageMin=30&ageMax=50');
      console.log('DEBUG [users filter] response status:', res.status, 'body:', res.body);
      expect(res.status).toBe(200);
      expect(res.body.users[0]).toHaveProperty('region', 'Praha');
      expect(res.body.users[0].age).toBeGreaterThanOrEqual(30);
      expect(res.body.users[0].age).toBeLessThanOrEqual(50);
    });
  });
});
