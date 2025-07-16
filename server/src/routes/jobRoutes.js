import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getJobs, createJob } from '../controllers/jobController.js';

const router = express.Router();

const postLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 5,
  handler: (req, res) => {
    res.status(429).json({ message: "Creating Too many job Postings, Try Again later!" });
  }
});

router.get('/', getJobs);
router.post('/', authenticate, postLimiter, createJob);

export default router;