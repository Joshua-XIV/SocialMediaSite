import express from 'express'
import { createComment, getComments } from '../controllers/commentController.js';
import { attachUserIfPossible, authenticate } from '../middleware/authenticate.js'

const router = express.Router();

router.post('/comment/create-comment', authenticate, createComment);
router.get('/comment/get-comments', attachUserIfPossible, getComments);

export default router;
