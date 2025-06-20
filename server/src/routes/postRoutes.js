import express from 'express'
import { createPost, getHomePosts, getPost, likePost, removeLikePost } from '../controllers/postController.js';
import { attachUserIfPossible, authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/post/create-post', authenticate, createPost);
router.get('/post/get-home-posts', attachUserIfPossible ,getHomePosts);
router.get('/post/get-post/:id', attachUserIfPossible, getPost);
router.patch('/post/:id/like', authenticate, likePost);
router.patch('/post/:id/unlike', authenticate, removeLikePost);

export default router;
