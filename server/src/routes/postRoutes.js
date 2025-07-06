import express from 'express'
import { createPost, getHomePosts, getPost, likePost, removeLikePost } from '../controllers/postController.js';
import { attachUserIfPossible, authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/', authenticate, createPost);
router.get('/', attachUserIfPossible ,getHomePosts);
router.get('/:id', attachUserIfPossible, getPost);
router.patch('/:id/like', authenticate, likePost);
router.patch('/:id/unlike', authenticate, removeLikePost);

export default router;
