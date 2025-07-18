const request = require('supertest');
const app = require('../server');

describe('Security middleware (helmet, cors, rateLimit)', () => {
  let server;
  beforeAll(() => {
    server = app.listen(0);
  });
  afterAll(async () => {
    await server.close();
  });

  it('should set security headers via helmet', async () => {
    const res = await request(server).get('/');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBeDefined();
    expect(res.headers['x-xss-protection']).toBeDefined();
  });

  it('should allow CORS by default', async () => {
    const res = await request(server).options('/');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should rate limit excessive requests', async () => {
    // Simulate 101 requests to trigger rate limit (limit is 100 per 15min)
    let lastRes;
    for (let i = 0; i < 101; i++) {
      lastRes = await request(server).get('/');
    }
    expect(lastRes.status).toBe(429);
    // Odpověď může být prázdná nebo různě strukturovaná, hlavní je status 429
    if (lastRes.body && (lastRes.body.message || lastRes.body.msg)) {
      expect(lastRes.body.message || lastRes.body.msg).toMatch(/Příliš mnoho požadavků|Too many requests/);
    }
  });
});
