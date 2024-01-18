"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const express_1 = __importStar(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: node_path_1.default.resolve(__dirname, './config.env') });
const config_1 = require("./config/config");
const keyController_1 = require("./controllers/keyController");
const errorController_1 = __importStar(require("./controllers/errorController"));
const authRouter_1 = __importDefault(require("./routers/authRouter"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const friendsRouter_1 = __importDefault(require("./routers/friendsRouter"));
const keyRouter_1 = __importDefault(require("./routers/keyRouter"));
const app = (0, express_1.default)();
app.disable('x-powered-by');
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 1000 * 60 * 60,
    message: 'Too many requests, try again later',
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use('/api', limiter);
app.use((0, compression_1.default)());
app.use((0, xss_clean_1.default)());
app.use((0, hpp_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, express_1.json)());
app.use(`${config_1.API_ROUTE}/auth`, keyController_1.verifyKey, authRouter_1.default);
app.use(`${config_1.API_ROUTE}/user`, keyController_1.verifyKey, userRouter_1.default);
app.use(`${config_1.API_ROUTE}/friends`, keyController_1.verifyKey, friendsRouter_1.default);
app.use(`${config_1.API_ROUTE}/key`, keyRouter_1.default);
app.use(errorController_1.default);
app.use(errorController_1.invalidRoute);
exports.default = app;
