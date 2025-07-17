import express from 'express'
import { rateLimit } from 'express-rate-limit';
import { createPost, getHomePosts, getPost, likePost, removeLikePost } from '../controllers/postController.js';
import { attachUserIfPossible, authenticate } from '../middleware/authenticate.js';

const router = express.Router();

const postLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 5,
  handler: (req, res) => {
    res.status(429).json({ message: "Posting too many posts, Slow Down!" });
  }
});

router.post('/', authenticate, postLimiter, createPost);
router.get('/', attachUserIfPossible ,getHomePosts);
router.get('/:id', attachUserIfPossible, getPost);
router.patch('/:id/like', authenticate, likePost);
router.patch('/:id/unlike', authenticate, removeLikePost);

export default router;
