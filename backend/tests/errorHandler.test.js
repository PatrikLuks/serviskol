const request = require('supertest');
const express = require('express');
const errorHandler = require('../middleware/errorHandler');

let app;
beforeEach(() => {
  app = express();
  app.get('/fail', (req, res, next) => {
    next(new Error('Test error'));
  });
  app.use(errorHandler);
});

describe('errorHandler middleware', () => {
  it('should log error and return 500 with generic message', async () => {
    const app = express();
    // Route that throws error
    app.get('/fail', (req, res, next) => {
      next(new Error('Test error'));
    });
    app.use(errorHandler);

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/fail');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ msg: 'Nastala neočekávaná chyba na serveru.' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
