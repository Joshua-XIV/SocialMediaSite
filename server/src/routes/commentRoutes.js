import express from 'express'
import { createComment, getComment, getComments, getCommentThread, likeComment, removeLikeComment } from '../controllers/commentController.js';
import { attachUserIfPossible, authenticate } from '../middleware/authenticate.js'

const router = express.Router();

router.get('/get-comments', attachUserIfPossible, getComments);
router.get('/:id', attachUserIfPossible, getComment);
router.get('/:id/comment-thread', attachUserIfPossible, getCommentThread);
router.post('/create-comment', authenticate, createComment);
router.patch('/:id/like', authenticate, likeComment);
router.post('/:id/unlike', authenticate, removeLikeComment);

export default router;
