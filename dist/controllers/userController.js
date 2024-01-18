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
exports.editUser = exports.searchUser = exports.deleteProfilePicture = exports.getProfilePicture = exports.uploadProfilePicture = exports.uploadSingle = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const userModel_1 = __importDefault(require("../models/userModel"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const config_1 = require("../config/config");
const errorModel_1 = __importDefault(require("../models/errorModel"));
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.ACCESS_KEY_SECRET,
    },
    region: process.env.BUCKET_REGION,
});
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
exports.uploadSingle = upload.single('image');
exports.uploadProfilePicture = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        throw new errorModel_1.default({ type: 'validation', paths: { file: 'Invalid file' } }, 'Invalid or missing file');
    const buffer = yield (0, sharp_1.default)(req.file.buffer)
        .resize({
        height: config_1.profilePictureSize,
        width: config_1.profilePictureSize,
    })
        .toBuffer();
    const imageName = node_crypto_1.default.randomBytes(32).toString('hex');
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: imageName,
        Body: buffer,
        ContentType: req.file.mimetype,
    };
    const command = new client_s3_1.PutObjectCommand(params);
    yield s3.send(command);
    const { user } = res.locals;
    user.profilePicture = imageName;
    yield user.save({ validateModifiedOnly: true });
    res
        .status(200)
        .json({ status: 'success', message: 'Profile picture updated' });
}));
exports.getProfilePicture = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.query;
    const user = yield userModel_1.default.findOne({ username });
    if (!username || !user)
        throw new errorModel_1.default({ type: 'validation', paths: { username: 'Invalid username' } }, 'Invalid or incorrect username');
    const picture = user.profilePicture
        ? user.profilePicture
        : 'defaultProfilePicture';
    const getObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: picture,
    };
    const command = new client_s3_1.GetObjectCommand(getObjectParams);
    const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
    res.status(200).json({ status: 'success', data: { url } });
}));
exports.deleteProfilePicture = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = res.locals;
    if (!user.profilePicture)
        throw new errorModel_1.default({ type: 'invalid-action' }, "You don't have a profile picture");
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: user.profilePicture,
    };
    const command = new client_s3_1.DeleteObjectCommand(params);
    yield s3.send(command);
    user.profilePicture = undefined;
    yield user.save({ validateModifiedOnly: true });
    res
        .status(200)
        .json({ status: 'success', message: 'Profile picture deleted' });
}));
exports.searchUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username: query } = req.query;
    const { user } = res.locals;
    if (!query)
        throw new errorModel_1.default({ type: 'validation', paths: { query: 'Invalid query' } }, "Couldn't find users");
    const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const queryRegex = new RegExp(`^${escapedQuery}`, 'i');
    const users = yield userModel_1.default.find({
        username: { $regex: queryRegex, $ne: user.username },
    })
        .limit(5)
        .select('username -_id');
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: users,
    });
}));
exports.editUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = res.locals;
    config_1.userEditableFields.forEach(field => {
        const newValue = req.body[field];
        if (newValue)
            user[field] = newValue;
    });
    yield user.save({ validateModifiedOnly: true });
    res
        .status(200)
        .json({ status: 'success', message: 'User updated', data: { user } });
}));
