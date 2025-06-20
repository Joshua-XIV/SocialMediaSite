import { pool as db } from '../database.js';
import { clearAuthCookies, setAuthCookies } from '../utils/cookieUtils.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import HttpError from '../utils/errorUtils.js'
import bcrypt from 'bcrypt';

const saltRounds = 10;

export const createUser = async(req, res, next) => {
  if (!req.body) {
    return next(new HttpError('Request body is missing', 400));
  }

  // Check Fields for creating account
  const {username, display_name, email, password} = req.body;
  const missingField = [];
  if (!username) missingField.push("Username");
  if (username.length > 20) return next(new HttpError("Username can't be longer than 20 characters", 400));
  if (!display_name) missingField.push("Display Name");
  if (display_name.length > 40) return next(new HttpError("Display Name can't be longer than 40 characters", 400));
  if (!email) missingField.push("Email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return next(new HttpError("Invalid Email Format", 400));
  }
  if (!password) missingField.push("Password");
  if (password.length > 64) return next(new HttpError("Password can't be longer than 64 characters", 400));

  if (missingField.length > 0) {
    return next(new HttpError(`Missing required fields: ${missingField.join(", ")}`, 400));
  }

  // Insert user into db
  try {
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUserAccount = await db.query(`INSERT INTO "user" (username, display_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *`,
      [username.toLowerCase(), display_name, email, password_hash]
    );

    const newUser = newUserAccount.rows[0];

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      display_name: newUser.display_name
    });
  }
  catch (err) {
    console.log("Error: ", err);
    if (err.code === '23505') {
      if (err.detail && err.detail.includes("username")) {
        return next(new HttpError("Username Taken", 409));
      }
      if (err.detail && err.detail.includes("email")) {
        return next(new HttpError("Email Taken", 409));
      }
    }
    next(new HttpError("Something went wrong", 500));
  }
};

export const loginUser = async (req, res, next) => {
  const { emailOrUsername, password } = req.body;

  if (!req.body) return res.status(400).json({error : "Request body is missing"})

  if (!emailOrUsername || !password) {
    return next(new HttpError("Missing Fields(s)", 403));
  }

  // Check credentials from db
  try {
    const userResult = await db.query(
      `SELECT * FROM "user" WHERE username = $1 OR email = $1 LIMIT 1`,
      [emailOrUsername.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return next(new HttpError("Invalid Credentials", 401))
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return next(new HttpError("Invalid Credentials", 401))
    }

    const userPayload = {id: user.id, username: user.username};
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);
    await db.query(
      `INSERT INTO refresh_token (token, user_id, expires_at) VALUES ($1, $2, NOW() + interval '30 days')`,
      [refreshToken, user.id]
    )

    // Set cookies for tokens
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: "Logged In",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    return next(new HttpError("Internal Server Error", 500));
  }
};

export const refreshTokenHandler = async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return next(new HttpError("No Token Provided", 401));

  // Check for refresh token to give access token 
  try {
    const payload = verifyRefreshToken(token);

    const result =  await db.query(
      `SELECT * FROM refresh_token WHERE token = $1 AND user_id = $2`,
      [token, payload.id]
    );

    if (result.rows.length === 0) return next(new HttpError("Invalid Token", 403));

    const newAccessToken = generateAccessToken({ id: payload.id, username: payload.username});
    setAuthCookies(res, newAccessToken);
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return next(new HttpError("Invalid or Expired Token", 403));
  }
}

export const logoutUser = async (req, res) => {
  // Clear all tokens from cookies
  const token = req.cookies.refreshToken;
  await db.query(`DELETE FROM refresh_token WHERE token = $1`, [token]);
  clearAuthCookies(res);
  res.sendStatus(204);
}