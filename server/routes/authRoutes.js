import express from 'express';
import { loginUser, createUser, refreshTokenHandler, logoutUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/user/login-account', loginUser);
router.post('/user/create-account', createUser);
router.post('/user/logout-account', logoutUser)
router.post('/user/refresh-token', refreshTokenHandler)

export default router;