"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidRoute = void 0;
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = require("jsonwebtoken");
const errorModel_1 = __importDefault(require("../models/errorModel"));
function invalidRoute(req, res) {
    res.status(404).json({ status: 'fail', message: 'Resource not implemented' });
}
exports.invalidRoute = invalidRoute;
function nonOperationalErrorHandler(err, res) {
    console.log(err);
    res.status(500).json({
        status: 'error',
        message: 'An error ocurred, please try again later',
        error: process.env.NODE_ENV === 'development' ? err : undefined,
    });
}
function globalErrorHandler(err, req, res, next) {
    let error = err;
    if (err instanceof mongoose_1.Error.ValidationError) {
        error = new errorModel_1.default({ type: 'validation', paths: err.errors }, 'Invalid fields');
    }
    else if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        error = new errorModel_1.default({ type: 'JsonWebTokenError' }, 'Invalid or expired token');
    }
    else if (err.message.includes('duplicate key')) {
        error = new errorModel_1.default({ type: 'validation', paths: err.keyValue }, 'Duplicate fields');
    }
    if (!error.operational)
        return nonOperationalErrorHandler(err, res);
    res.status(error.statusCode).json(Object.assign(Object.assign({}, error.errorObj), { details: process.env.NODE_ENV === 'development' ? err : undefined }));
}
exports.default = globalErrorHandler;
