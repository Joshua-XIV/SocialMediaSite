import express from 'express'
import { rateLimit } from 'express-rate-limit';
import { createComment, getComment, getComments, getCommentThread, likeComment, removeLikeComment, getUserReplies } from '../controllers/commentController.js';
import { attachUserIfPossible, authenticate } from '../middleware/authenticate.js'

const router = express.Router();

const postLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 5,
  handler: (req, res) => {
    res.status(429).json({ message: "Posting too many comments, Slow Down!" });
  }
});

router.get('/', attachUserIfPossible, getComments);
router.get('/user/:username', attachUserIfPossible, getUserReplies);
router.get('/:id', attachUserIfPossible, getComment);
router.get('/:id/thread', attachUserIfPossible, getCommentThread);
router.post('/', authenticate, postLimiter, createComment);
router.patch('/:id/like', authenticate, likeComment);
router.patch('/:id/unlike', authenticate, removeLikeComment);

export default router;
