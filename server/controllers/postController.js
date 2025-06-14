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
