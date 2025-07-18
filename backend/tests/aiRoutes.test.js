process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const AIMessage = require('../models/AIMessage');

// Mock OpenAI API
jest.mock('openai', () => {
  return function () {
    return {
      createChatCompletion: jest.fn().mockResolvedValue({
        data: {
          choices: [
            { message: { content: 'Mockovaná odpověď AI.' } }
          ]
        }
      })
    };
  };
});

// Pomocná funkce pro získání JWT tokenu (případně upravte podle svého auth systému)

const jwt = require('jsonwebtoken');
const getToken = async () => {
  // Vytvoř platný JWT token pro testovacího uživatele s rolí 'admin'
  const payload = {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    email: 'test@serviskol.cz',
    name: 'Testovací Admin',
    role: 'admin'
  };
  const secret = process.env.JWT_SECRET || 'tajnyklic';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
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
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/ai/history - vrátí historii', async () => {
    const res = await request(app)
      .get('/api/ai/history')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/ai/rate - uloží hodnocení', async () => {
    // Nejprve vytvoříme zprávu s userId odpovídajícím JWT tokenu (ObjectId)
    const msg = await AIMessage.create({ userId: '507f1f77bcf86cd799439011', message: 'test', reply: 'test' });
    const res = await request(app)
      .post('/api/ai/rate')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: msg._id, rating: 5, feedback: 'Výborné!' });
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
