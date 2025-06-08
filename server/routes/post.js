import express from 'express'
import {pool as db} from '../database.js'
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Test of getting posts
router.get('/posts', authenticate , async(req, res) => {
  res.json({ message: `Authenticated as ${req.user.username}`});
});

export default router;
