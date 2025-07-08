import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getJobs, createJob } from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getJobs);
router.post('/', authenticate, createJob);

export default router;