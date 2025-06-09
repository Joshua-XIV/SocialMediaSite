import express from 'express';
import { loginUser, createUser, refreshTokenHandler, logoutUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/auth/login-account', loginUser);
router.post('/auth/create-account', createUser);
router.post('/auth/logout-account', logoutUser)
router.post('/auth/refresh-token', refreshTokenHandler)
// Get Auth State
router.get('/auth/check-auth', authenticate , async(req, res) => {
  res.sendStatus(200);
});



export default router;