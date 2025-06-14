import express from 'express'
import { createPost, getHomePosts } from '../controllers/postController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/post/create-post', authenticate, createPost);
router.get('/post/get-home-posts', getHomePosts);

export default router;
