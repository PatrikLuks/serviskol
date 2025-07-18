const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const { Reward, LeaderboardEntry } = require('../models/Gamification');
const jwt = require('jsonwebtoken');

describe('Gamification API integration', () => {
  let userToken, userId;
  beforeAll(async () => {
    // Vytvoř testovacího uživatele
    const User = require('../models/User');
    const user = await User.create({
      name: 'Gamifikátor',
      email: 'gamer@serviskol.cz',
      passwordHash: 'heslo123',
      role: 'client'
    });
    userId = user._id;
    userToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '1h' });
    // Vytvoř testovací odměnu
    await Reward.create({ name: 'Test Odměna', description: 'Za test', points: 10 });
  });
  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('GET /api/gamification/rewards - vrátí seznam odměn', async () => {
    const res = await request(app)
      .get('/api/gamification/rewards')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Test Odměna');
  });

  it('POST /api/gamification/claim - nárokování odměny', async () => {
    const reward = await Reward.findOne({ name: 'Test Odměna' });
    const res = await request(app)
      .post('/api/gamification/claim')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rewardId: reward._id });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Odměna přidělena.');
    expect(res.body.entry).toHaveProperty('points', 10);
  });

  it('POST /api/gamification/claim - neexistující odměna', async () => {
    const res = await request(app)
      .post('/api/gamification/claim')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rewardId: new mongoose.Types.ObjectId() });
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/Odměna není dostupná/);
  });

  it('GET /api/gamification/leaderboard - vrátí žebříček', async () => {
    const res = await request(app)
      .get('/api/gamification/leaderboard')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('points');
  });
});
