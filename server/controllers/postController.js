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
    console.error('DB Error:', err.message);
    next(new HttpError("Something went wrong", 500));
  }
}

export const getHomePosts = async(req, res, next) => {
  const maxLimit = 10;
  const limit = Math.min(req.query.limit ? Number(req.query.limit) : maxLimit, maxLimit);
  const offset = parseInt(req.query.offset) || 0;

  const result = await db.query(
    `SELECT post.id, post.content, post.created_at, "user".username 
    FROM post
    JOIN "user" on "user".id = post.user_id
    WHERE post.is_deleted = false
    ORDER BY post.created_at DESC
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  
  res.status(201).json(result.rows);
}
