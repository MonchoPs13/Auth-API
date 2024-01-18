import { Router } from 'express';
import {
	signup,
	login,
	protectRoute,
	requestVerification,
	verify,
	requestPasswordReset,
	resetPassword,
	changePassword,
} from '../controllers/authController';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify', requestVerification);
router.post('/password/reset', requestPasswordReset);

router.patch('/verify', verify);
router.patch('/password/reset', resetPassword);
router.patch('/password/change', protectRoute, changePassword);

export default router;
