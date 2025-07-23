import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../src/utils/tokenUtils.js';
import jwt from 'jsonwebtoken';

describe('tokenUtils', () => {
  const OLD_ENV = process.env;
  const user = { id: 1, username: 'testuser' };

  beforeAll(() => {
    process.env = { ...OLD_ENV };
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_REFRESH_SECRET = 'refreshsecret';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('generateAccessToken returns a valid JWT', () => {
    const token = generateAccessToken(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(user.id);
    expect(decoded.username).toBe(user.username);
  });

  test('generateRefreshToken returns a valid JWT', () => {
    const token = generateRefreshToken(user);
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    expect(decoded.id).toBe(user.id);
    expect(decoded.username).toBe(user.username);
  });

  test('verifyRefreshToken decodes a valid refresh token', () => {
    const token = generateRefreshToken(user);
    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(user.id);
    expect(decoded.username).toBe(user.username);
  });

  test('verifyRefreshToken throws for invalid token', () => {
    expect(() => verifyRefreshToken('invalid.token.here')).toThrow();
  });
}); 