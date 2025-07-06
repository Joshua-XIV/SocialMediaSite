import express from 'express';
import { loginUser, createUser, refreshTokenHandler, logoutUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', createUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshTokenHandler);
// Get Auth State
router.get('/check', authenticate , async(req, res) => {
  res.sendStatus(200);
});



export default router;