import express from 'express';
import { loginUser, createUser, refreshTokenHandler, logoutUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/login-account', loginUser);
router.post('/create-account', createUser);
router.post('/logout-account', logoutUser);
router.post('/refresh-token', refreshTokenHandler);
// Get Auth State
router.get('/check-auth', authenticate , async(req, res) => {
  res.sendStatus(200);
});



export default router;