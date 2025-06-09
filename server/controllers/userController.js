import { pool as db } from '../database.js';
import HttpError from '../utils/errorUtils.js';

export const userInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT username, display_name FROM "user" WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return next(new(HttpError("User not found", 404)));
    }

    const user = result.rows[0];
    return res.status(200).json({
      username: user.username,
      display_name: user.display_name,
    })
  } catch (err) {
    return next(new(HttpError("Internal Server Error", 500)));
  }
}