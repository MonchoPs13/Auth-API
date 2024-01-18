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
const node_crypto_1 = __importDefault(require("node:crypto"));
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../config/config");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide an email'],
        validate: {
            validator: function (email) {
                return new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$').test(email);
            },
            message: 'Invalid format of provided email',
        },
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [
            config_1.nameMaxLength,
            `Username can't exceed ${config_1.nameMaxLength} characters`,
        ],
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'Please provide a username'],
        minlength: [
            config_1.usernameMinLength,
            `Username must be at least ${config_1.usernameMinLength} characters`,
        ],
        maxlength: [
            config_1.usernameMaxLength,
            `Username can't exceed ${config_1.usernameMaxLength} characters`,
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        validate: {
            validator: function (password) {
                return this.password === this.passwordConfirm;
            },
            message: "Password and confirmation values don't match",
        },
    },
    passwordConfirm: {
        type: String,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetTokenExpires: {
        type: Date,
    },
    passwordChanged: {
        type: Date,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
    verificationTokenExpires: {
        type: Date,
    },
    friendlist: {
        type: [mongoose_1.Schema.Types.ObjectId],
        default: [],
    },
    friendRequests: {
        type: [mongoose_1.Schema.Types.ObjectId],
        default: [],
    },
    profilePicture: String,
});
userSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return;
        this.password = yield bcrypt_1.default.hash(this.password, 10);
        this.passwordConfirm = undefined;
        this.passwordChanged = new Date(Date.now() - 1000);
    });
});
userSchema.methods.passwordCheck = function (plainPwd) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!plainPwd)
            return false;
        return yield bcrypt_1.default.compare(plainPwd, this.password);
    });
};
userSchema.methods.generateToken = function (type, mode) {
    const dataSize = mode === 'link' ? 32 : 6;
    const data = node_crypto_1.default.randomBytes(dataSize / 2).toString('hex');
    const hashedData = node_crypto_1.default.createHash('sha256').update(data).digest('hex');
    this[`${type}Token`] = hashedData;
    this[`${type}TokenExpires`] = new Date(Date.now() + config_1.userTokenExpiration);
    return data;
};
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
