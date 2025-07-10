const request = require('supertest');
const express = require('express');
const healthRoutes = require('../routes/healthRoutes');

describe('Health-check endpoint', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use('/api/health', healthRoutes);
  });

  it('should return status ok and db connected', async () => {
    const res = await request(app).get('/api/health/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(['connected', 'disconnected']).toContain(res.body.db);
    expect(res.body.timestamp).toBeDefined();
  });
});
