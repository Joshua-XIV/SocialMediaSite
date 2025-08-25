import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { userInfo, updateAvatarColor, getUserByUsername, followUser, unfollowUser, getFollowers, getFollowStats } from '../controllers/userController.js';
 
const router = express.Router();

router.get('/me', authenticate, userInfo);
router.patch('/avatar-color', authenticate, updateAvatarColor);
router.get('/:username', getUserByUsername);
router.post('/:username/follow', authenticate, followUser);
router.delete('/:username/follow', authenticate, unfollowUser);
router.get('/:username/followers', authenticate, getFollowers);
router.get('/:username/following', authenticate, getFollowing);
router.get('/:username/follow/stats', authenticate, getFollowStats);

export default router;