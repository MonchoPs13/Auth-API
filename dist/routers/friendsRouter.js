"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const friendsController_1 = require("../controllers/friendsController");
const router = (0, express_1.Router)();
router.patch('/remove', authController_1.protectRoute, friendsController_1.deleteFriend);
router.post('/request/send', authController_1.protectRoute, friendsController_1.sendFriendRequest);
router.patch('/request/accept', authController_1.protectRoute, friendsController_1.acceptFriendRequest);
router.patch('/request/reject', authController_1.protectRoute, friendsController_1.rejectFriendRequest);
exports.default = router;