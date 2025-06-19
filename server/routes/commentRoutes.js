import express from 'express'
import { createComment } from '../controllers/commentController.js';
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router();

router.post('/comment/create-comment', authenticate, createComment);

export default router;