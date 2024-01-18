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
const nodemailer_1 = __importDefault(require("nodemailer"));
const errorModel_1 = __importDefault(require("../models/errorModel"));
const config_1 = require("../config/config");
class Mailer {
    constructor(recipient) {
        this.recipient = recipient;
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: process.env.NODEMAILER_PORT,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
            },
        });
    }
    sendTokenMail(type, mode, token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let subject;
                if (type === 'passwordReset')
                    subject = 'Password reset';
                else
                    subject = 'Email verification';
                let text = `A ${type === 'passwordReset' ? 'password reset' : 'verification'} email has been requested.\n`;
                if (mode === 'link') {
                    const action = type === 'passwordReset' ? 'password-reset' : 'verify';
                    text += `Please follow the following link to complete the procedure: ${process.env.HOST_ROUTE}${config_1.API_ROUTE}/auth/${action}/${token}\n`;
                }
                else {
                    text += `Your token is ${token}\n`;
                }
                text += `If you didn't request any action please ignore this email.`;
                yield this.sendMail(subject, text);
            }
            catch (err) {
                throw err;
            }
        });
    }
    sendMail(subject, text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const message = {
                    from: process.env.MAILER_FROM,
                    to: this.recipient,
                    subject,
                    text,
                };
                yield this.transporter.sendMail(message);
            }
            catch (err) {
                throw new errorModel_1.default({ type: 'mailer' }, "Couldn't send email, please try again later.");
            }
        });
    }
}
exports.default = Mailer;
