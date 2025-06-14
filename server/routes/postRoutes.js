import express from 'express'
import { createPost } from '../controllers/postController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/post/create-post', authenticate, createPost);

export default router;
