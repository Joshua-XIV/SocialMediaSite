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

  try {
    let comment;
    if (parentID) {
      comment = await db.query(`
        INSERT INTO comment (user_id, content, post_id, parent_id)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [userID, content, postID, parentID]
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