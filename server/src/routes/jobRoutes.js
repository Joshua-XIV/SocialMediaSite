import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getJobs } from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getJobs);

export default router;