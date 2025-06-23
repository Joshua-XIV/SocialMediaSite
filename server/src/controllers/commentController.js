import {pool as db} from '../database.js'
import HttpError from '../utils/errorUtils.js'

export const createComment = async(req, res, next) => {
  if (!req.body) {
    return next(new HttpError("Request body is missing", 400));
  }

  const userID = req.user.id;
  const { postID, content, parentID } = req.body;

  if (content.length > 255) {
    return next(new HttpError("Comment Too Long", 400));
  }
  
  if (!postID && !parentID) {
    return next(new HttpError("Missing Post and Parent ID", 400));
  }

  try {
    let comment;
    if (parentID) {
      comment = await db.query(`
        INSERT INTO comment (user_id, content, parent_id)
        VALUES ($1, $2, $3) RETURNING *`,
        [userID, content, parentID]
      );
    } else {
      comment = await db.query(`
        INSERT INTO comment (user_id, content, post_id)
        VALUES ($1, $2, $3) RETURNING *`,
        [userID, content, postID]
      );
    }
    res.status(201).json(comment.rows[0]);
  } catch (err) {
    console.error('DB Error: ', err.message);
    next(new HttpError("Something went wrong", 500));
  }
}

export const getComment = async (req, res, next) => {
  const userId = req.user?.id || null;
  const commentId = parseInt(req.params.id);

  try {
    const result = await db.query(
      `SELECT 
        c.id,
        c.content,
        c.created_at,
        c.parent_id,
        "user".username,
        "user".display_name,
        COUNT(cl_all.user_id) AS total_likes,
        CASE WHEN cl_user.user_id IS NOT NULL THEN true ELSE false END AS liked
      FROM comment c
      JOIN "user" ON "user".id = c.user_id
      LEFT JOIN comment_like cl_all ON cl_all.comment_id = c.id
      LEFT JOIN comment_like cl_user ON cl_user.comment_id = c.id AND cl_user.user_id = $2
      WHERE c.id = $1 AND c.is_deleted = false
      GROUP BY c.id, "user".username, "user".display_name, cl_user.user_id`,
      [commentId, userId]
    );

    if (result.rows.length === 0) {
      return next(new HttpError("Comment Not Found", 404));
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return next(new HttpError("Failed to fetch comment", 500));
  }
};

export const getComments = async (req, res, next) => {
  const userId = req.user?.id || null;

  const postId = req.query.postId ? parseInt(req.query.postId) : null;
  const parentId = req.query.parentId ? parseInt(req.query.parentId) : null;
  const maxLimit = 10;
  const limit = Math.min(parseInt(req.query.limit), maxLimit);
  const offset = parseInt(req.query.offset) || 0;

  if (!postId && !parentId) {
    return next(new HttpError("Must provide either postId or parentId", 400));
  }

  try {
    let query;
    let params;

    if (parentId) {
      // Fetch replies to a specific comment
      query = `
        SELECT c.id, c.content, c.created_at, c.parent_id,
               u.username, u.display_name,
               COUNT(cl_all.user_id) AS total_likes,
               CASE WHEN cl_user.user_id IS NOT NULL THEN true ELSE false END AS liked
        FROM comment c
        JOIN "user" u ON u.id = c.user_id
        LEFT JOIN comment_like cl_all ON cl_all.comment_id = c.id
        LEFT JOIN comment_like cl_user ON cl_user.comment_id = c.id AND cl_user.user_id = $2
        WHERE c.parent_id = $1 AND c.is_deleted = false
        GROUP BY c.id, u.username, u.display_name, cl_user.user_id
        ORDER BY c.created_at ASC
        LIMIT $3 OFFSET $4
      `;
      params = [parentId, userId, limit, offset];
    } else {
      // Fetch top-level comments on a post
      query = `
        SELECT c.id, c.content, c.created_at, c.parent_id,
               u.username, u.display_name,
               COUNT(cl_all.user_id) AS total_likes,
               CASE WHEN cl_user.user_id IS NOT NULL THEN true ELSE false END AS liked
        FROM comment c
        JOIN "user" u ON u.id = c.user_id
        LEFT JOIN comment_like cl_all ON cl_all.comment_id = c.id
        LEFT JOIN comment_like cl_user ON cl_user.comment_id = c.id AND cl_user.user_id = $2
        WHERE c.post_id = $1 AND c.parent_id IS NULL AND c.is_deleted = false
        GROUP BY c.id, u.username, u.display_name, cl_user.user_id
        ORDER BY c.created_at ASC
        LIMIT $3 OFFSET $4
      `;
      params = [postId, userId, limit, offset];
    }

    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    return next(new HttpError("Failed to fetch comments", 500));
  }
};

export const likeComment = async(req, res, next) => {
  const userID = req.user.id;
  const commentID = req.params.id;

  try {
    await db.query(
      `INSERT INTO comment_like (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [commentID, userID]
    );
    return res.status(200).json({ success: "liked comment" });
  } catch {
    next(new HttpError("Something went wrong", 500));
  }
};

export const removeLikeComment = async(req, res, next) => {
  const userID = req.user.id;
  const commentID = req.params.id;

  try {
    await db.query(
      `DELETE FROM comment_like WHERE comment_id = $1 AND user_id = $2`,
      [commentID, userID]
    );
    return res.status(200).json({ success: "removed like rom comment" });
  } catch {
    next(new HttpError("Something went wrong", 500));
  }
};

export const getCommentThread = async (req, res, next) => {
  const commentId = req.params.id;
  
  try {
    const result = await db.query(`
      WITH RECURSIVE comment_chain AS (
        SELECT comment.*, "user".username, "user".display_name
        FROM comment
        JOIN "user" ON "user".id = comment.user_id
        WHERE comment.id = $1

        UNION ALL

        SELECT comment.*, "user".username, "user".display_name
        FROM comment
        JOIN "user" ON "user".id = comment.user_id
        INNER JOIN comment_chain ORDER BY created_at ASC;
      )`, [commentId]);

      return res.status(200).json(result.rows);
  } catch (err) {
    console.error("DB Error: ", err.message);
    return next(new HttpError("Failed to fetch comment thread", 500));
  }
}