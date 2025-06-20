import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { userInfo } from '../controllers/userController.js';
 
const router = express.Router();

router.get('/user/user-info', authenticate, userInfo);

export default router;