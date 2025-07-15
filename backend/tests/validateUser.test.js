const express = require('express');
const request = require('supertest');
const { validateRegister, validateLogin } = require('../middleware/validateUser');

describe('validateUser middleware', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/register', validateRegister, (req, res) => res.json({ ok: true }));
    app.post('/login', validateLogin, (req, res) => res.json({ ok: true }));
  });

  it('should reject invalid registration', async () => {
    const res = await request(app).post('/register').send({ name: '', email: 'bad', password: '123', role: 'guest' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should accept valid registration', async () => {
    const res = await request(app).post('/register').send({ name: 'Test', email: 'test@email.cz', password: '123456', role: 'client' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('should reject invalid login', async () => {
    const res = await request(app).post('/login').send({ email: 'bad', password: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should accept valid login', async () => {
    const res = await request(app).post('/login').send({ email: 'test@email.cz', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
