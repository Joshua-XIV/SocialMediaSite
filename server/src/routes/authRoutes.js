import express from 'express'
import { loginUser, createUser, refreshTokenHandler, logoutUser, verifyCode, resendVerificationCode } from '../controllers/authController.js'
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

// Verify code limiter - 10 attempts per 10 minutes
const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10,
  keyGenerator: (req) => req.body.email || req.ip, // Rate limit by email or IP
  handler: (req, res) => {
    res.status(429).json({ error: "Too many verification attempts. Please try again later." });
  }
});

// Resend code limiter - 2 attempts per 60 minutes
const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 2,
  keyGenerator: (req) => req.body.email || req.ip, // Rate limit by email or IP
  handler: (req, res) => {
    res.status(429).json({ error: "Too many resend attempts. Please try again later." });
  }
});

const router = express.Router()

router.post('/login', authLimiter, loginUser)
router.post('/register', createUser)
router.post('/logout', logoutUser)
router.post('/refresh', refreshTokenHandler)
router.post('/verify', verifyLimiter, verifyCode)
router.post('/resend-code', resendLimiter, resendVerificationCode)
// Get Auth State
router.get('/check', authenticate , async(req, res) => {
  res.sendStatus(200)
});



export default router;