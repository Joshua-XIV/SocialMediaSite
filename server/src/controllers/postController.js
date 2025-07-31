import {pool as db} from '../database.js';
import HttpError from '../utils/errorUtils.js';
import logger from '../utils/logger.js';

const MAX_POST_LENGTH = 255;
const MAX_POSTS_LIMIT = 10;

export const createPost = async(req, res, next) => {
  const startTime = Date.now();
  
  if (!req.body) {
    logger.warn('Post creation attempt with missing body', {
      userId: req.user?.id,
      ip: req.ip
    });
    return next(new HttpError('Request body is missing', 400));
  }

  const userID = req.user.id;
  const content = req.body.content;

  if (content.length > MAX_POST_LENGTH) {
    logger.warn('Post creation attempt with content too long', {
      userId: userID,
      contentLength: content.length,
      maxLength: MAX_POST_LENGTH,
      ip: req.ip
    });
    return(next(new HttpError('Post Too Long', 400)))
  }

  try {
    const post = await db.query("INSERT INTO post (user_id, content) VALUES ($1, $2) RETURNING *", 
    [userID, content]);

    const newPost = post.rows[0];
    
    logger.info('Post created successfully', {
      postId: newPost.id,
      userId: userID,
      contentLength: content.length,
      ip: req.ip,
      duration: Date.now() - startTime
    });
    
    res.status(201).json(newPost);
  } catch (err) {
    logger.error('Post creation failed', {
      userId: userID,
      contentLength: content.length,
      ip: req.ip,
      duration: Date.now() - startTime
    }, err);
    next(new HttpError("Something went wrong", 500));
  }
}

export const getHomePosts = async(req, res, next) => {
  const startTime = Date.now();
  const maxLimit = MAX_POSTS_LIMIT;
  const limit = Math.min(req.query.limit ? Number(req.query.limit) : maxLimit, maxLimit);
  const offset = parseInt(req.query.offset) || 0;
  const userID = req.user?.id || null;

  try {
     const result = await db.query(
      `SELECT 
        post.id, 
        post.content, 
        post.created_at, 
        "user".username, 
        "user".display_name,
        "user".avatar_color,
        COUNT(pl_all.user_id) AS total_likes,
        CASE WHEN pl_user.user_id IS NOT NULL THEN true ELSE false END AS liked,
        (
          SELECT COUNT(*)
          FROM comment AS replies
          WHERE replies.post_id = post.id AND replies.is_deleted = false
        ) AS total_replies
      FROM post
      JOIN "user" ON "user".id = post.user_id
      LEFT JOIN post_like pl_all ON pl_all.post_id = post.id
      LEFT JOIN post_like pl_user ON pl_user.post_id = post.id AND pl_user.user_id = $3
      WHERE post.is_deleted = false
      GROUP BY post.id, "user".username, "user".display_name, "user".avatar_color, pl_user.user_id
      ORDER BY post.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset, userID]
    );
    
    // Only log in development
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Home posts retrieved successfully', {
        userId: userID,
        limit: limit,
        offset: offset,
        postsCount: result.rows.length,
        ip: req.ip,
        duration: Date.now() - startTime
      });
    }
    
    return res.status(200).json(result.rows);
  } catch (err) {
    logger.error('Failed to retrieve home posts', {
      userId: userID,
      limit: limit,
      offset: offset,
      ip: req.ip,
      duration: Date.now() - startTime
    }, err);
    next(new HttpError("Something went wrong", 500));
  }
}

export const getPost = async (req, res, next) => {
  const startTime = Date.now();
  const userID = req.user?.id || null;
  const postID = parseInt(req.params.id);

  try {
    const result = await db.query(
      `SELECT
        post.id,
        post.content,
        post.created_at,
        "user".username,
        "user".display_name,
        "user".avatar_color,
        COALESCE((
          SELECT COUNT(*)
          FROM post_like pl_all
          WHERE pl_all.post_id = post.id
        ), 0) AS total_likes,
        EXISTS (
          SELECT 1
          FROM post_like pl_user
          WHERE pl_user.post_id = post.id AND pl_user.user_id = $2
        ) AS liked,
        (
          SELECT COUNT(*)
          FROM comment AS replies
          WHERE replies.post_id = post.id AND replies.is_deleted = false
        ) AS total_replies
      FROM post
      JOIN "user" ON "user".id = post.user_id
      WHERE post.id = $1 AND post.is_deleted = false`,
      [postID, userID]
    );

    if (result.rows.length === 0) {
      logger.warn('Post not found', {
        postId: postID,
        userId: userID,
        ip: req.ip
      });
      return next(new HttpError("Post Not Found", 404));
    }

    // Only log in development
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Post retrieved successfully', {
        postId: postID,
        userId: userID,
        ip: req.ip,
        duration: Date.now() - startTime
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    logger.error('Failed to retrieve post', {
      postId: postID,
      userId: userID,
      ip: req.ip,
      duration: Date.now() - startTime
    }, err);
    return next(new HttpError("Failed to fetch post", 500));
  }
};

export const getUserPosts = async(req, res, next) => {
  const startTime = Date.now();
  const { username } = req.params;
  const maxLimit = MAX_POSTS_LIMIT;
  const limit = Math.min(req.query.limit ? Number(req.query.limit) : maxLimit, maxLimit);
  const offset = parseInt(req.query.offset) || 0;
  const userID = req.user?.id || null;

  if (!username) {
    return next(new HttpError('Username is required', 400));
  }

  try {
    const result = await db.query(
      `SELECT 
        post.id, 
        post.content, 
        post.created_at, 
        "user".username, 
        "user".display_name,
        "user".avatar_color,
        COUNT(pl_all.user_id) AS total_likes,
        CASE WHEN pl_user.user_id IS NOT NULL THEN true ELSE false END AS liked,
        (
          SELECT COUNT(*)
          FROM comment AS replies
          WHERE replies.post_id = post.id AND replies.is_deleted = false
        ) AS total_replies
      FROM post
      JOIN "user" ON "user".id = post.user_id
      LEFT JOIN post_like pl_all ON pl_all.post_id = post.id
      LEFT JOIN post_like pl_user ON pl_user.post_id = post.id AND pl_user.user_id = $4
      WHERE post.is_deleted = false AND "user".username = $3
      GROUP BY post.id, "user".username, "user".display_name, "user".avatar_color, pl_user.user_id
      ORDER BY post.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset, username.toLowerCase(), userID]
    );
    
    logger.info('User posts retrieved successfully', {
      username: username,
      userId: userID,
      limit: limit,
      offset: offset,
      postsCount: result.rows.length,
      ip: req.ip,
      duration: Date.now() - startTime
    });
    
    res.status(200).json(result.rows);
  } catch (err) {
    logger.error('User posts retrieval failed', {
      username: username,
      userId: userID,
      limit: limit,
      offset: offset,
      ip: req.ip,
      duration: Date.now() - startTime
    }, err);
    next(new HttpError("Something went wrong", 500));
  }
};

export const likePost = async(req, res, next) => {
  const startTime = Date.now();
  const userID = req.user.id;
  const postID = req.params.id;

  try {
    await db.query(
      `INSERT INTO post_like (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [postID, userID]
    );
    
    // Only log in development
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Post liked successfully', {
        postId: postID,
        userId: userID,
        ip: req.ip,
        duration: Date.now() - startTime
      });
    }
    
    return res.status(200).json({ success: "liked post" });
  } catch (err) {
    logger.error('Failed to like post', {
      postId: postID,
      userId: userID,
      ip: req.ip,
      duration: Date.now() - startTime
    }, err);
    next(new HttpError("Something went wrong", 500));
  }
};

export const removeLikePost = async(req, res, next) => {
  const startTime = Date.now();
  const userID = req.user.id;
  const postID = req.params.id;

  try {
    await db.query(
      `DELETE FROM post_like WHERE post_id = $1 AND user_id = $2`,
      [postID, userID]
    );
    
    logger.info('Post like removed successfully', {
      postId: postID,
      userId: userID,
      ip: req.ip,
      duration: Date.now() - startTime
    });
    
    return res.status(200).json({ success: "removed like from post" });
  } catch (err) {
    logger.error('Failed to remove post like', {
      postId: postID,
      userId: userID,
      ip: req.ip,
      duration: Date.now() - startTime
    }, err);
    next(new HttpError("Something went wrong", 500));
  }
};
