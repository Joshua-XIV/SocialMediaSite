import express from 'express'
import { createComment, getComment, getComments, getCommentThread, likeComment, removeLikeComment } from '../controllers/commentController.js';
import { attachUserIfPossible, authenticate } from '../middleware/authenticate.js'

const router = express.Router();

router.get('/', attachUserIfPossible, getComments);
router.get('/:id', attachUserIfPossible, getComment);
router.get('/:id/thread', attachUserIfPossible, getCommentThread);
router.post('/', authenticate, createComment);
router.patch('/:id/like', authenticate, likeComment);
router.patch('/:id/unlike', authenticate, removeLikeComment);

export default router;
