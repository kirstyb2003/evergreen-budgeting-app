const request = require('supertest');
const app = require('../index');

describe('API Routes', () => {
  it('should return API status on GET /api/status', async () => {
    const res = await request(app).get('/api/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ info: 'Node.js, Express, and Postgres API' });
  });

  it('should return server message on GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Evergreen Budgeting Server up and running...');
  });
});
