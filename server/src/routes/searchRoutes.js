import express from 'express';
import { searchAll } from '../controllers/searchController.js';
import { attachUserIfPossible } from '../middleware/authenticate.js';

const router = express.Router();

// Search endpoint - doesn't require authentication
router.get('/', attachUserIfPossible, searchAll);

export default router; 