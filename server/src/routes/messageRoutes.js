import express from 'express'
import { rateLimit } from 'express-rate-limit';
import { getConversations, getMessages, sendMessage, deleteMessage, searchUsers } from '../controllers/messageController.js';
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router();

const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 10, // 10 messages per minute
  handler: (req, res) => {
    res.status(429).json({ message: "Sending too many messages, Slow Down!" });
  }
});

router.get('/conversations', authenticate, getConversations);
router.get('/search/users', authenticate, searchUsers);
router.get('/:userId', authenticate, getMessages);
router.post('/', authenticate, messageLimiter, sendMessage);
router.delete('/:messageId', authenticate, deleteMessage);

export default router; 