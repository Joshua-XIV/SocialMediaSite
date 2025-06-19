import {pool as db} from '../database.js';
import HttpError from '../utils/errorUtils.js';

export const createPost = async(req, res, next) => {
  if (!req.body) {
    return next(new HttpError('Request body is missing', 400));
  }

  const userID = req.user.id;
  const content = req.body.content;

  if (content.length > 255) {
    return(next(new HttpError('Post Too Long', 400)))
  }

  try {
    const post = await db.query("INSERT INTO post (user_id, content) VALUES ($1, $2) RETURNING *", 
    [userID, content]);

    const newPost = post.rows[0];
    res.status(201).json(newPost);
  } catch (err) {
    console.error('DB Error: ', err.message);
    next(new HttpError("Something went wrong", 500));
  }
}

export const getHomePosts = async(req, res, next) => {
  const maxLimit = 10;
  const limit = Math.min(req.query.limit ? Number(req.query.limit) : maxLimit, maxLimit);
  const offset = parseInt(req.query.offset) || 0;
  const userId = req.user?.id || null;

  try {
     const result = await db.query(
      `SELECT 
        post.id, 
        post.content, 
        post.created_at, 
        "user".username, 
        "user".display_name,
        COUNT(pl_all.user_id) AS total_likes,
        CASE WHEN pl_user.user_id IS NOT NULL THEN true ELSE false END AS liked
      FROM post
      JOIN "user" ON "user".id = post.user_id
      LEFT JOIN post_like pl_all ON pl_all.post_id = post.id
      LEFT JOIN post_like pl_user ON pl_user.post_id = post.id AND pl_user.user_id = $3
      WHERE post.is_deleted = false
      GROUP BY post.id, "user".username, "user".display_name, pl_user.user_id
      ORDER BY post.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset, userId]
    );
    return res.status(200).json(result.rows);
  } catch {
    next(new HttpError("Something went wrong", 500));
  }
}

export const getPost = async (req, res, next) => {
  const userId = req.user?.id || null;
  const postId = parseInt(req.params.id);

  try {
    const result = await db.query(
      `SELECT
        post.id,
        post.content,
        post.created_at,
        "user".username,
        "user".display_name,
        COALESCE((
          SELECT COUNT(*)
          FROM post_like pl_all
          WHERE pl_all.post_id = post.id
        ), 0) AS total_likes,
        EXISTS (
          SELECT 1
          FROM post_like pl_user
          WHERE pl_user.post_id = post.id AND pl_user.user_id = $2
        ) AS liked
      FROM post
      JOIN "user" ON "user".id = post.user_id
      WHERE post.id = $1 AND post.is_deleted = false`,
      [postId, userId]
    );

    if (result.rows.length === 0) {
      return next(new HttpError("Post Not Found", 404));
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return next(new HttpError("Failed to fetch post", 500));
  }
};

export const likePost = async(req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.id;

  try {
    await db.query(
      `INSERT INTO post_like (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [postId, userId]
    );
    return res.status(200).json({ success: "liked post" });
  } catch {
    next(new HttpError("Something went wrong", 500));
  }
};

export const removeLikePost = async(req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.id;

  try {
    await db.query(
      `DELETE FROM post_like WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );
    return res.status(200).json({ success: "removed like from post" });
  } catch {
    next(new HttpError("Something went wrong", 500));
  }
};
