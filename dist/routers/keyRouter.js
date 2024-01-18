"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keyController_1 = require("../controllers/keyController");
const router = (0, express_1.Router)();
router.post('/request', keyController_1.generateKey);
router.delete('/delete', keyController_1.deleteKey);
exports.default = router;
