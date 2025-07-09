const request = require('supertest');
const app = require('../server');

describe('User API', () => {
  it('should return 400 for missing registration fields', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ email: 'test@test.cz' });
    expect(res.statusCode).toBe(400);
  });
});
