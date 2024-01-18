"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteKey = exports.verifyKey = exports.generateKey = void 0;
const keyModel_1 = __importDefault(require("../models/keyModel"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const errorModel_1 = __importDefault(require("../models/errorModel"));
exports.generateKey = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, secret } = req.body;
    if (secret != process.env.API_KEY_SECRET)
        throw new errorModel_1.default({ type: 'key error' }, 'Invalid secret');
    const plainToken = node_crypto_1.default.randomBytes(32).toString('hex');
    const key = new keyModel_1.default({ username, token: plainToken });
    yield key.save();
    res
        .status(202)
        .json({ status: 'success', message: 'Key generated', key: plainToken });
}));
exports.verifyKey = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.header('x-api-user');
    const api_key = req.header('x-api-key');
    const key = yield keyModel_1.default.findOne({ username });
    if (!key)
        throw new errorModel_1.default({ type: 'validation', paths: { username: 'Incorrect username' } }, 'No key is associated with provided username');
    const isValidToken = yield key.tokenCheck(api_key);
    if (!isValidToken)
        throw new errorModel_1.default({ type: 'key error' }, 'Invalid API token');
    next();
}));
exports.deleteKey = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, secret } = req.body;
    if (secret != process.env.API_KEY_SECRET)
        throw new errorModel_1.default({ type: 'key error' }, 'Invalid secret');
    const info = yield keyModel_1.default.deleteOne({ username });
    if (info.deletedCount == 0)
        throw new errorModel_1.default({ type: 'key error' }, "Key with provided username doesn't exist");
    res.status(200).json({ status: 'success', message: 'Key deleted' });
}));
