import { Router } from 'express';
import { protectRoute } from '../controllers/authController';
import {
	searchUser,
	uploadSingle,
	uploadProfilePicture,
	getProfilePicture,
	deleteProfilePicture,
	editUser,
} from '../controllers/userController';

const router = Router();

router.get('/', protectRoute, searchUser);
router.patch('/edit', protectRoute, editUser);

router.post(
	'/profile/picture',
	protectRoute,
	uploadSingle,
	uploadProfilePicture
);

router.get('/profile/picture', protectRoute, getProfilePicture);
router.delete('/profile/picture', protectRoute, deleteProfilePicture);

export default router;
