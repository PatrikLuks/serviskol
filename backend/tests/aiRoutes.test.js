const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const AIMessage = require('../models/AIMessage');

// Pomocná funkce pro získání JWT tokenu (případně upravte podle svého auth systému)
const getToken = async () => {
  // TODO: Implementujte získání platného JWT tokenu pro testovacího uživatele
  return process.env.TEST_JWT_TOKEN || '';
};

describe('AI Routes', () => {
  let token;

  beforeAll(async () => {
    token = await getToken();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('POST /api/ai/chat - odpoví na dotaz', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Jaké je dnes počasí?' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('reply');
    expect(res.body).toHaveProperty('message');
  });

  it('GET /api/ai/history - vrátí historii', async () => {
    const res = await request(app)
      .get('/api/ai/history')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/ai/rate - uloží hodnocení', async () => {
    // Nejprve vytvoříme zprávu
    const msg = await AIMessage.create({ userId: 'test', message: 'test', reply: 'test' });
    const res = await request(app)
      .post('/api/ai/rate')
      .set('Authorization', `Bearer ${token}`)
      .send({ messageId: msg._id, rating: 5, feedback: 'Výborné!' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    // Úklid
    await AIMessage.findByIdAndDelete(msg._id);
  });

  it('chrání endpointy bez JWT', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'test' });
    expect(res.statusCode).toBe(401);
  });
});
