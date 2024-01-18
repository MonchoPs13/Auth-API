"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/signup', authController_1.signup);
router.post('/login', authController_1.login);
router.post('/verify', authController_1.requestVerification);
router.post('/password/reset', authController_1.requestPasswordReset);
router.patch('/verify', authController_1.verify);
router.patch('/password/reset', authController_1.resetPassword);
router.patch('/password/change', authController_1.protectRoute, authController_1.changePassword);
exports.default = router;
