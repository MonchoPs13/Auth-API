"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTokenMode = exports.userTokenExpiration = exports.usernameMaxLength = exports.usernameMinLength = exports.COOKIE_EXPIRES = exports.API_ROUTE = exports.HOST_ROUTE = void 0;
exports.HOST_ROUTE = 'http://localhost:3000';
exports.API_ROUTE = '/api/v1';
exports.COOKIE_EXPIRES = 1000 * 60 * (60 * 24) * 1; // (Seconds) * (Hours) * (Days)
/* USER MODEL */
exports.usernameMinLength = 5;
exports.usernameMaxLength = 10;
exports.userTokenExpiration = 1000 * 60 * 10;
exports.userTokenMode = 'short';
