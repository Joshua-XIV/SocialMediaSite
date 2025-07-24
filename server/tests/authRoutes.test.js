import { jest } from '@jest/globals';

// Mock nodemailer
jest.unstable_mockModule('nodemailer', () => {
  const mockTransport = {
    sendMail: jest.fn().mockResolvedValue({}),
  };
  return {
    createTransport: () => mockTransport,
    default: { createTransport: () => mockTransport },
  };
});

import request from 'supertest';
import bcrypt from 'bcrypt';

let app, dbModule, emailUtils;

beforeAll(async () => {
  dbModule = await import('../src/database.js');
  emailUtils = await import('../src/utils/emailUtils.js');
  app = (await import('../src/app.js')).default;
});

// Mock the db pool's query method
describe('/api/auth/login endpoint', () => {
  let dbQuerySpy;

  beforeAll(() => {
    dbQuerySpy = jest.spyOn(dbModule.pool, 'query');
  });

  afterEach(() => {
    dbQuerySpy.mockReset();
  });

  afterAll(() => {
    dbQuerySpy.mockRestore();
  });

  it('should return 403 if fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 for invalid credentials', async () => {
    // Simulate user not found
    dbQuerySpy.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ emailOrUsername: 'notfound', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 200 and send verification code for valid credentials', async () => {
    // 1. Mock DB to return a user
    const fakeUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword'
    };
    dbQuerySpy.mockResolvedValueOnce({ rows: [fakeUser] }); // for user lookup
    dbQuerySpy.mockResolvedValueOnce({}); // for updating verification code

    // 2. Mock bcrypt to always return true for password match
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ emailOrUsername: 'testuser', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requiresVerification', true);
    expect(res.body).toHaveProperty('email', 'test@example.com');

    // Clean up mocks
    bcrypt.compare.mockRestore();
  });
}); 