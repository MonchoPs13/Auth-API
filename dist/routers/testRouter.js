"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const testController_1 = require("../controllers/testController");
const router = (0, express_1.Router)();
router.use('/protected', authController_1.protectRoute, testController_1.testProtected);
exports.default = router;
