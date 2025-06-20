import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '30m'});
}

export const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});
}

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}