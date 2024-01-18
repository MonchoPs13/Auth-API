import { Router } from 'express';
import { protectRoute } from '../controllers/authController';
import {
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	deleteFriend,
} from '../controllers/friendsController';

const router = Router();

router.patch('/remove', protectRoute, deleteFriend);
router.post('/request/send', protectRoute, sendFriendRequest);
router.patch('/request/accept', protectRoute, acceptFriendRequest);
router.patch('/request/reject', protectRoute, rejectFriendRequest);

export default router;
