
const { auth, adminOnly, adminRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

describe('auth middleware', () => {
  let req, res, next;
  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should return 401 if no Authorization header', () => {
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Chybí autorizační token.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is malformed', () => {
    req.headers.authorization = 'Token abc';
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Chybí autorizační token.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.headers.authorization = 'Bearer invalidtoken';
    jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('invalid'); });
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Neplatný nebo expirovaný token.' });
    expect(next).not.toHaveBeenCalled();
    jwt.verify.mockRestore();
  });

  it('should call next and set req.user if token is valid', () => {
    req.headers.authorization = 'Bearer validtoken';
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'user1', role: 'admin' });
    auth(req, res, next);
    expect(req.user).toEqual({ id: 'user1', role: 'admin' });
    expect(next).toHaveBeenCalled();
    jwt.verify.mockRestore();
  });
});

describe('adminOnly middleware', () => {
  let req, res, next;
  beforeEach(() => {
    req = { user: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });
  it('should return 403 if user is not admin', () => {
    req.user.role = 'client';
    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Přístup pouze pro adminy.' });
    expect(next).not.toHaveBeenCalled();
  });
  it('should call next if user is admin', () => {
    req.user.role = 'admin';
    adminOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('adminRole middleware', () => {
  let req, res, next;
  beforeEach(() => {
    req = { user: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });
  it('should return 403 if user does not have required role', () => {
    req.user.role = 'admin';
    const mw = adminRole('superadmin');
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Přístup pouze pro roli: superadmin' });
    expect(next).not.toHaveBeenCalled();
  });
  it('should call next if user has required role', () => {
    req.user.role = 'superadmin';
    const mw = adminRole('superadmin');
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});



describe('auth middleware', () => {
  const secret = 'tajnyklic';
  const userToken = jwt.sign({ id: '1', role: 'client' }, secret);
  const adminToken = jwt.sign({ id: '2', role: 'admin' }, secret);
  const superToken = jwt.sign({ id: '3', role: 'superadmin' }, secret);

  beforeEach(() => {
    app = express();
    app.use(express.json());
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

const express = require('express');
const request = require('supertest');
// jwt, auth, adminOnly, adminRole jsou již importovány výše

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
