import express from 'express';
import { loginUser, createUser, refreshTokenHandler, logoutUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/user/login-account', loginUser);
router.post('/user/create-account', createUser);
router.post('/user/logout-account', logoutUser)
router.post('/user/refresh-token', refreshTokenHandler)
// Get Auth State
router.get('/user/check-auth', authenticate , async(req, res) => {
  res.sendStatus(200);
});

export default router;