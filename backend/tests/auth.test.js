const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { auth, adminOnly, adminRole } = require('../middleware/auth');

describe('auth middleware', () => {
  let app;
  const secret = 'tajnyklic';
  const userToken = jwt.sign({ id: '1', role: 'client' }, secret);
  const adminToken = jwt.sign({ id: '2', role: 'admin' }, secret);
  const superToken = jwt.sign({ id: '3', role: 'superadmin' }, secret);

  beforeEach(() => {
    app = express();
    app.get('/user', auth, (req, res) => res.json({ user: req.user }));
    app.get('/admin', auth, adminOnly, (req, res) => res.json({ admin: true }));
    app.get('/super', auth, adminRole('superadmin'), (req, res) => res.json({ super: true }));
  });

  it('should reject missing token', async () => {
    const res = await request(app).get('/user');
    expect(res.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app).get('/user').set('Authorization', 'Bearer badtoken');
    expect(res.status).toBe(401);
  });

  it('should allow valid user token', async () => {
    const res = await request(app).get('/user').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('client');
  });

  it('should allow adminOnly for admin', async () => {
    const res = await request(app).get('/admin').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.admin).toBe(true);
  });

  it('should reject adminOnly for non-admin', async () => {
    const res = await request(app).get('/admin').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('should allow adminRole("superadmin") for superadmin', async () => {
    const res = await request(app).get('/super').set('Authorization', `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(res.body.super).toBe(true);
  });

  it('should reject adminRole("superadmin") for admin', async () => {
    const res = await request(app).get('/super').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });
});
