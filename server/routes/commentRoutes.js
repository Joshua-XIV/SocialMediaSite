import express from 'express'
import { createComment, getComment, getComments, likeComment, removeLikeComment } from '../controllers/commentController.js';
import { attachUserIfPossible, authenticate } from '../middleware/authenticate.js'

const router = express.Router();

router.post('/comment/create-comment', authenticate, createComment);
router.get('/comment/get-comments', attachUserIfPossible, getComments);
router.get('/comment/:id', attachUserIfPossible, getComment);
router.patch('/comment/:id/like', authenticate, likeComment);
router.post('/comment/:id/unlike', authenticate, removeLikeComment);

export default router;
