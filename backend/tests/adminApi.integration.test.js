const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

describe('Admin API integration', () => {
  let adminToken;
  beforeAll(async () => {
    const User = require('../models/User');
    await User.deleteMany({ email: 'admin@serviskol.cz' });
    const admin = new User({
      name: 'Testovací Admin',
      email: 'admin@serviskol.cz',
      passwordHash: 'heslo123',
      role: 'admin',
      permissions: [
        'governance:changeimpact',
        'governance:weakness',
        'governance:sentiment',
        'governance:adoption'
      ]
    });
    await admin.save();
    const secret = process.env.JWT_SECRET || 'tajnyklic';
    const payload = { id: admin._id, _id: admin._id, role: admin.role, permissions: admin.permissions };
    // Debug: log payload a permissions
    // eslint-disable-next-line no-console
    console.log('DEBUG admin JWT payload:', payload);
    adminToken = jwt.sign(payload, secret, { expiresIn: '1h' });
  });

  it('should generate change impact report', async () => {
    const res = await request(app)
      .post('/api/admin/change-impact-simulation')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/AI Change Impact Simulation Report/);
  });

  it('should generate process weakness report', async () => {
    const res = await request(app)
      .post('/api/admin/predict-process-weaknesses')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/AI Process Weakness Prediction Report/);
  });

  it('should generate sentiment feedback report', async () => {
    const res = await request(app)
      .post('/api/admin/sentiment-feedback-analysis')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/AI Sentiment Feedback Analysis Report/);
  });

  it('should generate innovation adoption report', async () => {
    const res = await request(app)
      .post('/api/admin/innovation-adoption-trends')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/AI Innovation Adoption Trends Report/);
  });

  it('should return 403 for missing permission', async () => {
    const noPermToken = jwt.sign({ id: 'adminid', role: 'admin', permissions: [] }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '1h' });
    const res = await request(app)
      .post('/api/admin/change-impact-simulation')
      .set('Authorization', `Bearer ${noPermToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/Nedostatečná oprávnění/);
  });
});
