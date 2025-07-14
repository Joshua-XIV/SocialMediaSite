import express from 'express'
import { loginUser, createUser, refreshTokenHandler, logoutUser } from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { rateLimit } from 'express-rate-limit'

// Auth limiter
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 5,
  handler: (req, res) => {
    res.status(429).json({ message: "Too many attempts, try again later." });
  }
});

const router = express.Router()

router.post('/login', authLimiter, loginUser)
router.post('/register', createUser)
router.post('/logout', logoutUser)
router.post('/refresh', refreshTokenHandler)
// Get Auth State
router.get('/check', authenticate , async(req, res) => {
  res.sendStatus(200)
});



export default router;