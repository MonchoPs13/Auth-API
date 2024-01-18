"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    constructor(obj, message) {
        super(message);
        this.operational = true;
        this.statusCode = 400;
        let body = {};
        if (obj.type === 'authorization' || obj.type === 'JsonWebTokenError') {
            this.statusCode = 401;
        }
        else if (obj.type === 'validation') {
            for (const property in obj.paths) {
                const entry = obj.paths[property];
                const message = typeof entry === 'string' ? entry : entry.message;
                body[property] = message;
            }
        }
        else if (obj.type === 'mailer') {
            this.statusCode = 500;
        }
        this.errorObj = {
            status: this.statusCode >= 400 && this.statusCode < 500 ? 'fail' : 'error',
            message,
            body,
        };
    }
}
exports.default = AppError;
