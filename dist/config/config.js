"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilePictureSize = exports.userEditableFields = exports.userTokenMode = exports.userTokenExpiration = exports.usernameMaxLength = exports.usernameMinLength = exports.nameMaxLength = exports.COOKIE_EXPIRES = exports.API_ROUTE = void 0;
/* SERVER */
exports.API_ROUTE = '/api/v1';
exports.COOKIE_EXPIRES = 1000 * 60 * (60 * 24) * 1; // (Seconds) * (Hours) * (Days)
/* USER */
exports.nameMaxLength = 50;
exports.usernameMinLength = 5;
exports.usernameMaxLength = 10;
exports.userTokenExpiration = 1000 * 60 * 10;
exports.userTokenMode = 'short';
exports.userEditableFields = ['name', 'username'];
/* IMAGES */
exports.profilePictureSize = 500;
