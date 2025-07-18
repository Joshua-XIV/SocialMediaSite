import { pool as db } from '../database.js';
import { clearAuthCookies, setAuthCookies } from '../utils/cookieUtils.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import HttpError from '../utils/errorUtils.js'
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from '../utils/emailUtils.js';

const saltRounds = 10;

// Avatar colors array
// Blue, Red, Green. Orange, Purple
const AVATAR_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

// Function to get random avatar color
const getRandomAvatarColor = () => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

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

  try {
    // Check username in user and pending_user
    const usernameTaken = await db.query(
      `SELECT 1 FROM "user" WHERE username = $1 UNION ALL SELECT 1 FROM pending_user WHERE username = $1 LIMIT 1`,
      [username.toLowerCase()]
    );
    if (usernameTaken.rows.length > 0) {
      return next(new HttpError("Username Taken", 409));
    }

    // Check email in user and pending_user
    const emailTaken = await db.query(
      `SELECT 1 FROM "user" WHERE email = $1 UNION ALL SELECT 1 FROM pending_user WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (emailTaken.rows.length > 0) {
      return next(new HttpError("Email Taken", 409));
    }

    const password_hash = await bcrypt.hash(password, saltRounds);
    const avatar_color = getRandomAvatarColor();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const pendingUser = await db.query(
      `INSERT INTO pending_user (username, display_name, email, password_hash, avatar_color, verification_code, verification_expires) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [username.toLowerCase(), display_name, email, password_hash, avatar_color, verificationCode, expiresAt]
    );

    await sendVerificationEmail(email, verificationCode, 'signup');

    res.status(201).json({
      message: "Verification code sent to your email",
      username,
      display_name,
      email,
      avatar_color
    });
  } catch (err) {
    console.log("Error: ", err);
    next(new HttpError("Something went wrong", 500));
  }
};

export const loginUser = async (req, res, next) => {
  const { emailOrUsername, password } = req.body;

  if (!req.body) return res.status(400).json({error : "Request body is missing"})

  if (!emailOrUsername || !password) {
    return next(new HttpError("Missing Fields(s)", 403));
  }

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

    // Always require verification code for login
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await db.query(
      `UPDATE "user" SET verification_code = $1, verification_expires = $2 WHERE id = $3`,
      [verificationCode, expiresAt, user.id]
    );
    await sendVerificationEmail(user.email, verificationCode, 'login');
    return res.status(200).json({
      message: "Verification code sent to your email. Please verify to complete login.",
      requiresVerification: true,
      email: user.email
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

export const verifyCode = async (req, res, next) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return next(new HttpError("Missing email or code", 400));
  }

  try {
    // First, check pending_user for signup verification
    let result = await db.query(
      `SELECT * FROM pending_user WHERE email = $1 AND verification_code = $2 AND verification_expires > NOW()`,
      [email, code]
    );
    if (result.rows.length > 0) {
      const pending = result.rows[0];
      // Insert into user table
      const userInsert = await db.query(
        `INSERT INTO "user" (username, display_name, email, password_hash, avatar_color, email_verified) VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *`,
        [pending.username, pending.display_name, pending.email, pending.password_hash, pending.avatar_color]
      );
      // Delete from pending_user
      await db.query(`DELETE FROM pending_user WHERE id = $1`, [pending.id]);
      // Issue tokens
      const user = userInsert.rows[0];
      const userPayload = { id: user.id, username: user.username };
      const accessToken = generateAccessToken(userPayload);
      const refreshToken = generateRefreshToken(userPayload);
      await db.query(
        `INSERT INTO refresh_token (token, user_id, expires_at) VALUES ($1, $2, NOW() + interval '30 days')`,
        [refreshToken, user.id]
      );
      setAuthCookies(res, accessToken, refreshToken);
      return res.json({
        success: "Email verified and logged in",
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          avatar_color: user.avatar_color
        }
      });
    }
    // If not found in pending_user, check user table for login verification
    result = await db.query(
      `SELECT * FROM "user" WHERE email = $1 AND verification_code = $2 AND verification_expires > NOW()`,
      [email, code]
    );
    if (result.rows.length === 0) {
      return next(new HttpError("Invalid or expired code", 400));
    }
    const user = result.rows[0];
    // Clear the code after successful verification
    await db.query(
      `UPDATE "user" SET verification_code = NULL, verification_expires = NULL WHERE id = $1`,
      [user.id]
    );
    // Issue tokens
    const userPayload = { id: user.id, username: user.username };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);
    await db.query(
      `INSERT INTO refresh_token (token, user_id, expires_at) VALUES ($1, $2, NOW() + interval '30 days')`,
      [refreshToken, user.id]
    );
    setAuthCookies(res, accessToken, refreshToken);
    res.json({
      success: "Email verified and logged in",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_color: user.avatar_color
      }
    });
  } catch (err) {
    next(new HttpError("Something went wrong during verification", 500));
  }
};

export const resendVerificationCode = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new HttpError("Missing email", 400));

  try {
    // First check pending_user for signup verification
    let result = await db.query(
      `SELECT * FROM pending_user WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length > 0) {
      // User is in pending_user (signup verification)
      const pending = result.rows[0];
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      await db.query(
        `UPDATE pending_user SET verification_code = $1, verification_expires = $2 WHERE id = $3`,
        [verificationCode, expiresAt, pending.id]
      );
      await sendVerificationEmail(email, verificationCode, 'signup');
      return res.json({ message: "Verification code resent" });
    }

    // Check user table for login verification
    result = await db.query(
      `SELECT * FROM "user" WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return next(new HttpError("User not found", 404));
    }
    
    const user = result.rows[0];
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await db.query(
      `UPDATE "user" SET verification_code = $1, verification_expires = $2 WHERE id = $3`,
      [verificationCode, expiresAt, user.id]
    );
    await sendVerificationEmail(email, verificationCode, 'login');
    res.json({ message: "Verification code resent" });
  } catch (err) {
    next(new HttpError("Failed to resend verification code", 500));
  }
};