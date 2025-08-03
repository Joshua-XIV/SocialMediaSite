import {pool as db} from '../database.js'
import HttpError from '../utils/errorUtils.js'

const MAX_COMMENT_LENGTH = 255;
const MAX_COMMENTS_LIMIT = 10;

export const createComment = async(req, res, next) => {
  if (!req.body) {
    return next(new HttpError("Request body is missing", 400));
  }

  const userID = req.user.id;
  const { postID, content, parentID } = req.body;

  if (content.length > MAX_COMMENT_LENGTH) {
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
  const userID = req.user?.id || null;
  const commentID = parseInt(req.params.id);

  try {
    const result = await db.query(
      `SELECT 
        c.id,
        c.content,
        c.created_at,
        c.parent_id,
        "user".username,
        "user".display_name,
        "user".avatar_color,
        COUNT(cl_all.user_id) AS total_likes,
        CASE WHEN cl_user.user_id IS NOT NULL THEN true ELSE false END AS liked,
        (
          SELECT COUNT(*) 
          FROM comment AS replies 
          WHERE replies.parent_id = c.id AND replies.is_deleted = false
        ) AS total_replies
      FROM comment c
      JOIN "user" ON "user".id = c.user_id
      LEFT JOIN comment_like cl_all ON cl_all.comment_id = c.id
      LEFT JOIN comment_like cl_user ON cl_user.comment_id = c.id AND cl_user.user_id = $2
      WHERE c.id = $1 AND c.is_deleted = false
      GROUP BY c.id, "user".username, "user".display_name, "user".avatar_color, cl_user.user_id`,
      [commentID, userID]
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
  const userID = req.user?.id || null;

  const postID = req.query.postID ? parseInt(req.query.postID) : null;
  const parentID = req.query.parentID ? parseInt(req.query.parentID) : null;
  const maxLimit = MAX_COMMENTS_LIMIT;
  const limit = Math.min(parseInt(req.query.limit), maxLimit);
  const offset = parseInt(req.query.offset) || 0;

  console.log("Calling getComments with:", { postID, parentID, limit, offset });

  if (!postID && !parentID) {
    return next(new HttpError("Must provide either postID or parentID", 400));
  }

  try {
    let query;
    let params;

    if (parentID) {
      // Fetch replies to a specific comment
      query = `
        SELECT c.id, c.content, c.created_at, c.parent_id,
          u.username, u.display_name, u.avatar_color,
          COUNT(cl_all.user_id) AS total_likes,
          CASE WHEN cl_user.user_id IS NOT NULL THEN true ELSE false END AS liked,
          (
            SELECT COUNT(*) 
            FROM comment AS replies 
            WHERE replies.parent_id = c.id AND replies.is_deleted = false
          ) AS total_replies               
        FROM comment c
        JOIN "user" u ON u.id = c.user_id
        LEFT JOIN comment_like cl_all ON cl_all.comment_id = c.id
        LEFT JOIN comment_like cl_user ON cl_user.comment_id = c.id AND cl_user.user_id = $2
        WHERE c.parent_id = $1 AND c.is_deleted = false
        GROUP BY c.id, u.username, u.display_name, u.avatar_color, cl_user.user_id
        ORDER BY c.created_at ASC
        LIMIT $3 OFFSET $4
      `;
      params = [parentID, userID, limit, offset];
    } else {
      // Fetch top-level comments on a post
      query = `
        SELECT c.id, c.content, c.created_at, c.parent_id,
          u.username, u.display_name, u.avatar_color,
          COUNT(cl_all.user_id) AS total_likes,
          CASE WHEN cl_user.user_id IS NOT NULL THEN true ELSE false END AS liked,
          (
            SELECT COUNT(*) 
            FROM comment AS replies 
            WHERE replies.parent_id = c.id AND replies.is_deleted = false
          ) AS total_replies   
        FROM comment c
        JOIN "user" u ON u.id = c.user_id
        LEFT JOIN comment_like cl_all ON cl_all.comment_id = c.id
        LEFT JOIN comment_like cl_user ON cl_user.comment_id = c.id AND cl_user.user_id = $2
        WHERE c.post_id = $1 AND c.parent_id IS NULL AND c.is_deleted = false
        GROUP BY c.id, u.username, u.display_name, u.avatar_color, cl_user.user_id
        ORDER BY c.created_at ASC
        LIMIT $3 OFFSET $4
      `;
      params = [postID, userID, limit, offset];
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
  const commentID = req.params.id;
  const userID = req.user?.id || null;
  
  try {
    const result = await db.query(`
      WITH RECURSIVE comment_chain AS (
        SELECT 
          c.id,
          c.content,
          c.created_at,
          c.parent_id,
          c.post_id,
          c.user_id,
          u.username,
          u.display_name,
          u.avatar_color
        FROM comment c
        JOIN "user" u ON u.id = c.user_id
        WHERE c.id = $1 AND c.is_deleted = false

        UNION ALL

        SELECT 
          c.id,
          c.content,
          c.created_at,
          c.parent_id,
          c.post_id,
          c.user_id,
          u.username,
          u.display_name,
          u.avatar_color
        FROM comment c
        JOIN "user" u ON u.id = c.user_id
        JOIN comment_chain cc ON cc.parent_id = c.id
        WHERE c.is_deleted = false
      )
      SELECT 
        cc.id,
        cc.content,
        cc.created_at,
        cc.parent_id,
        cc.post_id,
        cc.username,
        cc.display_name,
        cc.avatar_color,
        COUNT(cl_all.user_id) AS total_likes,
        CASE WHEN cl_user.user_id IS NOT NULL THEN true ELSE false END AS liked,
        (
          SELECT COUNT(*) 
          FROM comment AS replies 
          WHERE replies.parent_id = cc.id AND replies.is_deleted = false
        ) AS total_replies
      FROM comment_chain cc
      LEFT JOIN comment_like cl_all ON cl_all.comment_id = cc.id
      LEFT JOIN comment_like cl_user ON cl_user.comment_id = cc.id AND cl_user.user_id = $2
      GROUP BY 
        cc.id,
        cc.content,
        cc.created_at,
        cc.parent_id,
        cc.post_id,
        cc.username,
        cc.display_name,
        cc.avatar_color,
        cl_user.user_id
      ORDER BY cc.created_at ASC;
    `, [commentID, userID]);

    const thread = result.rows;
    const root = thread.find(c => c.post_id !== null);

    return res.status(200).json({
      post_id: root?.post_id || null,
      thread 
    })
  } catch (err) {
    console.error("DB Error: ", err.message);
    console.error("Stack:", err.stack);
    return next(new HttpError("Failed to fetch comment thread", 500));
  }
}

export const getUserReplies = async (req, res, next) => {
  const username = req.params.username;
  const userID = req.user?.id || null;
  const limit = Math.min(parseInt(req.query.limit) || MAX_COMMENTS_LIMIT, MAX_COMMENTS_LIMIT);
  const offset = parseInt(req.query.offset) || 0;

  try {
    const result = await db.query(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.parent_id,
        c.post_id,
        u.username,
        u.display_name,
        u.avatar_color,
        COUNT(cl_all.user_id) AS total_likes,
        CASE WHEN cl_user.user_id IS NOT NULL THEN true ELSE false END AS liked,
        (
          SELECT COUNT(*) 
          FROM comment AS replies 
          WHERE replies.parent_id = c.id AND replies.is_deleted = false
        ) AS total_replies,
        p.content AS post_content,
        p.created_at AS post_created_at,
        parent_comment.content AS parent_comment_content,
        parent_user.username AS parent_username,
        parent_user.display_name AS parent_display_name
      FROM comment c
      JOIN "user" u ON u.id = c.user_id
      LEFT JOIN comment_like cl_all ON cl_all.comment_id = c.id
      LEFT JOIN comment_like cl_user ON cl_user.comment_id = c.id AND cl_user.user_id = $2
      LEFT JOIN post p ON p.id = c.post_id
      LEFT JOIN comment parent_comment ON parent_comment.id = c.parent_id
      LEFT JOIN "user" parent_user ON parent_user.id = parent_comment.user_id
      WHERE u.username = $1 AND c.is_deleted = false
      GROUP BY c.id, u.username, u.display_name, u.avatar_color, cl_user.user_id, p.content, p.created_at, parent_comment.content, parent_user.username, parent_user.display_name
      ORDER BY c.created_at DESC
      LIMIT $3 OFFSET $4
    `, [username, userID, limit, offset]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    return next(new HttpError("Failed to fetch user replies", 500));
  }
};