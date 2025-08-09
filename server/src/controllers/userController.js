import { pool as db } from '../database.js';
import HttpError from '../utils/errorUtils.js';

export const userInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT username, display_name, avatar_color FROM "user" WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return next(new(HttpError("User not found", 404)));
    }

    const user = result.rows[0];
    return res.status(200).json({
      id: userId,
      username: user.username,
      display_name: user.display_name,
      avatar_color: user.avatar_color,
    })
  } catch (err) {
    return next(new(HttpError("Internal Server Error", 500)));
  }
}

export const updateAvatarColor = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { avatar_color } = req.body;

    // Validate color format (hex color)
    if (!avatar_color || !/^#[0-9A-F]{6}$/i.test(avatar_color)) {
      return next(new HttpError("Invalid color format. Use hex format like #3B82F6", 400));
    }

    const result = await db.query(
      `UPDATE "user" SET avatar_color = $1 WHERE id = $2 RETURNING username, display_name, avatar_color`,
      [avatar_color, userId]
    );

    if (result.rows.length === 0) {
      return next(new HttpError("User not found", 404));
    }

    const user = result.rows[0];
    return res.status(200).json({
      username: user.username,
      display_name: user.display_name,
      avatar_color: user.avatar_color,
    });
  } catch (err) {
    return next(new HttpError("Internal Server Error", 500));
  }
};

export const getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    if (!username) {
      return next(new HttpError("Username is required", 400));
    }

    const result = await db.query(
      `SELECT username, display_name, avatar_color, created_at FROM "user" WHERE username = $1`,
      [username.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return next(new HttpError("User not found", 404));
    }

    const user = result.rows[0];
    return res.status(200).json({
      username: user.username,
      display_name: user.display_name,
      avatar_color: user.avatar_color,
      created_at: user.created_at,
    });
  } catch (err) {
    return next(new HttpError("Internal Server Error", 500));
  }
};