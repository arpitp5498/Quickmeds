const request = require('supertest');
const User = require('../src/models/User');
const { app } = require('../src/index');

describe('Authentication API Endpoint Tests', () => {
  it('should validate missing registration fields with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Incomplete User'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should validate invalid email formats with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'Password@123',
        phone: '9876543210'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing login password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
