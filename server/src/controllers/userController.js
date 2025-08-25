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

export const followUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { username } = req.params;

    if (!username) {
      return next(new HttpError("Username is required", 400));
    }

    // Get the user to follow
    const userResult = await db.query(
      `SELECT id FROM "user" WHERE username ILIKE $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return next(new HttpError("User not found", 404));
    }

    const followingId = userResult.rows[0].id;

    // Prevent self-follow
    if (followerId === followingId) {
      return next(new HttpError("Cannot follow yourself", 400));
    }

    // Check if already following
    const existingFollow = await db.query(
      `SELECT id FROM follow WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    if (existingFollow.rows.length > 0) {
      return next(new HttpError("Already following this user", 400));
    }

    // Create follow relationship
    await db.query(
      `INSERT INTO follow (follower_id, following_id) VALUES ($1, $2)`,
      [followerId, followingId]
    );

    return res.status(201).json({ success: "User followed successfully" });
  } catch (err) {
    console.error("Follow error:", err);
    return next(new HttpError("Internal Server Error", 500));
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { username } = req.params;

    if (!username) {
      return next(new HttpError("Username is required", 400));
    }

    // Get the user to unfollow
    const userResult = await db.query(
      `SELECT id FROM "user" WHERE username ILIKE $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return next(new HttpError("User not found", 404));
    }

    const followingId = userResult.rows[0].id;

    // Remove follow relationship
    const result = await db.query(
      `DELETE FROM follow WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    if (result.rowCount === 0) {
      return next(new HttpError("Not following this user", 400));
    }

    return res.status(200).json({ success: "User unfollowed successfully" });
  } catch (err) {
    console.error("Unfollow error:", err);
    return next(new HttpError("Internal Server Error", 500));
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id || null;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;

    if (!username) {
      return next(new HttpError("Username is required", 400));
    }

    // Get user ID
    const userResult = await db.query(
      `SELECT id FROM "user" WHERE username ILIKE $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return next(new HttpError("User not found", 404));
    }

    const userId = userResult.rows[0].id;

    // Get followers with follow status
    const result = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.avatar_color,
        f.created_at AS followed_at,
        CASE WHEN current_user_follow.id IS NOT NULL THEN true ELSE false END AS is_following_you
      FROM follow f
      JOIN "user" u ON u.id = f.follower_id
      LEFT JOIN follow current_user_follow 
        ON current_user_follow.follower_id = $2 
       AND current_user_follow.following_id = f.follower_id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC
      LIMIT $3 OFFSET $4
    `, [userId, currentUserId, limit, offset]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get followers error:", err);
    return next(new HttpError("Internal Server Error", 500));
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id || null;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;

    if (!username) {
      return next(new HttpError("Username is required", 400));
    }

    // Get user ID
    const userResult = await db.query(
      `SELECT id FROM "user" WHERE username ILIKE $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return next(new HttpError("User not found", 404));
    }

    const userId = userResult.rows[0].id;

    // Get following with follow status
    const result = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.avatar_color,
        f.created_at AS followed_at,
        CASE WHEN current_user_follow.id IS NOT NULL THEN true ELSE false END AS is_following_you
      FROM follow f
      JOIN "user" u ON u.id = f.following_id
      LEFT JOIN follow current_user_follow 
        ON current_user_follow.follower_id = $2 
       AND current_user_follow.following_id = f.following_id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
      LIMIT $3 OFFSET $4
    `, [userId, currentUserId, limit, offset]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get following error:", err);
    return next(new HttpError("Internal Server Error", 500));
  }
};

export const getFollowStats = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id || null;

    if (!username) {
      return next(new HttpError("Username is required", 400));
    }

    // Get user ID
    const userResult = await db.query(
      `SELECT id FROM "user" WHERE username ILIKE $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return next(new HttpError("User not found", 404));
    }

    const userId = userResult.rows[0].id;

    // Get follow counts, status, and user info
    const result = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.avatar_color,
        (SELECT COUNT(*)::int FROM follow WHERE following_id = u.id) AS followers_count,
        (SELECT COUNT(*)::int FROM follow WHERE follower_id = u.id) AS following_count,
        CASE WHEN current_user_follow.id IS NOT NULL THEN true ELSE false END AS is_following,
        CASE WHEN current_user_following.id IS NOT NULL THEN true ELSE false END AS is_followed_by
      FROM "user" u
      LEFT JOIN follow current_user_follow 
        ON current_user_follow.follower_id = $2 
       AND current_user_follow.following_id = u.id
      LEFT JOIN follow current_user_following 
        ON current_user_following.follower_id = u.id 
       AND current_user_following.following_id = $2
      WHERE u.id = $1
    `, [userId, currentUserId]);

    if (result.rows.length === 0) {
      return next(new HttpError("User not found", 404));
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Get follow stats error:", err);
    return next(new HttpError("Internal Server Error", 500));
  }
};