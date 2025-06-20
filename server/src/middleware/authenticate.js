import jwt from 'jsonwebtoken';
import { pool as db } from '../database.js';
import { generateAccessToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import { setAccessAuthCookies } from '../utils/cookieUtils.js';

export async function authenticate(req, res, next) {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      if (process.env.NODE_ENV !== 'prod') {
        console.error('Access token verification failed:', err.message);
      }
    }
  }

  if (refreshToken) {
    try {
      const user = await tryRefreshAccessToken(refreshToken, res);
      req.user = user;
      return next();
    } catch {
      return res.status(403).json({ error: 'Invalid Expired Token' });
    }
  }

  return res.status(401).json({ error: 'No valid tokens provided' });
}


async function tryRefreshAccessToken(refreshToken, res) {
  // Verify refresh token payload
  const payload = verifyRefreshToken(refreshToken);

  // Check DB if refresh token is valid
  const result = await db.query(
    `SELECT * FROM refresh_token WHERE token = $1 AND user_id = $2`,
    [refreshToken, payload.id]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid refresh token');
  }

  // Generate new access token
  const newAccessToken = generateAccessToken({ id: payload.id, username: payload.username });

  // Set access token cookie
  setAccessAuthCookies(res , newAccessToken);

  return { id: payload.id, username: payload.username };
}

export function attachUserIfPossible(req, res, next) {
  const accessToken = req.cookies.accessToken;

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore
    }
  }

  next();
}