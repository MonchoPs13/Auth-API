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
exports.changePassword = exports.resetPassword = exports.requestPasswordReset = exports.verify = exports.requestVerification = exports.login = exports.signup = exports.protectRoute = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const config_1 = require("../config/config");
const errorModel_1 = __importDefault(require("../models/errorModel"));
const mailer_1 = __importDefault(require("../services/mailer"));
function signAndSendJWT(userID, res) {
    const payload = {
        id: userID,
        iat: Date.now(),
    };
    const jwtToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });
    const cookieOptions = {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        expires: new Date(Date.now() + config_1.COOKIE_EXPIRES),
    };
    res.cookie('jwt', jwtToken, cookieOptions);
}
exports.protectRoute = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { jwt: token } = req.cookies;
    const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const user = yield userModel_1.default.findOne({
        _id: decodedToken.id,
        passwordChanged: { $lte: new Date(decodedToken.iat) },
    });
    if (!user)
        throw new errorModel_1.default({ type: 'JsonWebTokenError' }, 'Invalid token or user associated with token no longer exists');
    res.locals.user = user;
    next();
}));
exports.signup = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sanitizedUser = {
        email: req.body.email,
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    };
    const user = new userModel_1.default(sanitizedUser);
    const verificationCode = user.generateToken('verification', config_1.userTokenMode);
    yield user.save();
    const userMailer = new mailer_1.default(user.email);
    userMailer.sendTokenMail('verification', config_1.userTokenMode, verificationCode);
    signAndSendJWT(user.id, res);
    res.status(201).json({ status: 'success', data: { user } });
}));
exports.login = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield userModel_1.default.findOne({ username });
    const loginError = new errorModel_1.default({
        type: 'validation',
        paths: { username: 'Invalid username', password: 'Invalid password' },
    }, 'Invalid username or password');
    if (!user)
        throw loginError;
    const passwordIsCorrect = yield user.passwordCheck(password);
    if (!passwordIsCorrect)
        throw loginError;
    signAndSendJWT(user.id, res);
    res.status(200).json({ status: 'success', data: { user } });
}));
exports.requestVerification = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield userModel_1.default.findOne({ email, verified: false });
    if (!user)
        throw new errorModel_1.default({
            type: 'validation',
            paths: { email: 'Invalid email' },
        }, 'Invalid email or account already verified');
    const verificationToken = user.generateToken('verification', config_1.userTokenMode);
    yield user.save({ validateModifiedOnly: true });
    const userMailer = new mailer_1.default(user.email);
    yield userMailer.sendTokenMail('verification', config_1.userTokenMode, verificationToken);
    res.status(202).json({ status: 'success', message: 'Email sent' });
}));
exports.verify = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    const hashedToken = node_crypto_1.default.createHash('sha256').update(token).digest('hex');
    const user = yield userModel_1.default.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: new Date(Date.now()) },
    });
    if (!user)
        throw new errorModel_1.default({
            type: 'validation',
            paths: { verificationToken: 'Invalid verification token' },
        }, 'Invalid or expired verification token');
    user.verified = true;
    user.verificationToken = user.verificationTokenExpires = undefined;
    yield user.save({ validateModifiedOnly: true });
    res
        .status(200)
        .json({ status: 'success', message: 'User verified', data: { user } });
}));
exports.requestPasswordReset = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield userModel_1.default.findOne({ email });
    if (!user)
        throw new errorModel_1.default({
            type: 'validation',
            paths: { email: 'Invalid or incorrect email' },
        }, 'Invalid or incorrect email');
    const passwordToken = user.generateToken('passwordReset', config_1.userTokenMode);
    yield user.save({ validateModifiedOnly: true });
    const userMailer = new mailer_1.default(user.email);
    yield userMailer.sendTokenMail('passwordReset', config_1.userTokenMode, passwordToken);
    res.status(202).json({ status: 'success', message: 'Email sent' });
}));
exports.resetPassword = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password, passwordConfirm } = req.body;
    const hashedToken = node_crypto_1.default.createHash('sha256').update(token).digest('hex');
    const user = yield userModel_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpires: { $gt: new Date(Date.now()) },
    });
    if (!user)
        throw new errorModel_1.default({ type: 'validation', paths: { passwordResetToken: 'Invalid token' } }, 'Invalid or expired token');
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = user.passwordResetTokenExpires = undefined;
    yield user.save({ validateModifiedOnly: true });
    res
        .status(200)
        .json({ status: 'success', message: 'Password updated', data: { user } });
}));
exports.changePassword = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { passwordCurrent, password, passwordConfirm } = req.body;
    const { user } = res.locals;
    const passwordIsCorrect = yield user.passwordCheck(passwordCurrent);
    if (!passwordIsCorrect)
        throw new errorModel_1.default({
            type: 'validation',
            paths: { passwordCurrent: 'Incorrect password' },
        }, 'Incorrect password');
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    yield user.save({ validateModifyOnly: true });
    res
        .status(200)
        .json({ status: 'success', message: 'Password updated', data: { user } });
}));
