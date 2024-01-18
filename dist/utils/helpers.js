"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomImageName = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
function randomImageName(bytes = 32) {
    const randomName = node_crypto_1.default.randomBytes(bytes).toString('hex');
    return randomName;
}
exports.randomImageName = randomImageName;
