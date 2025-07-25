import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { userInfo, updateAvatarColor } from '../controllers/userController.js';
 
const router = express.Router();

router.get('/me', authenticate, userInfo);
router.patch('/avatar-color', authenticate, updateAvatarColor);

export default router;