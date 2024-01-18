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
exports.deleteFriend = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errorModel_1 = __importDefault(require("../models/errorModel"));
exports.sendFriendRequest = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    const { user } = res.locals;
    const recipient = yield userModel_1.default.findOne({ username });
    if (!recipient || recipient.id === user.id)
        throw new errorModel_1.default({
            type: 'validation',
            paths: { username: 'Invalid or incorrect username' },
        }, "Couldn't send friend request");
    if (recipient.friendlist.includes(user.id) ||
        recipient.friendRequests.includes(user.id) ||
        user.friendRequests.includes(recipient.id))
        throw new errorModel_1.default({ type: 'invalid-action' }, "You're already friends with that user or already sent friend request");
    recipient.friendRequests.push(user.id);
    yield recipient.save({ validateModifiedOnly: true });
    res.status(202).json({ status: 'success', message: 'Friend request sent' });
}));
exports.acceptFriendRequest = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    const { user } = res.locals;
    const recipient = yield userModel_1.default.findOne({ username });
    if (!recipient)
        throw new errorModel_1.default({
            type: 'validation',
            paths: { username: 'Invalid or incorrect username' },
        }, "Couldn't accept friend request");
    if (user.friendlist.includes(recipient.id) ||
        !user.friendRequests.includes(recipient.id))
        throw new errorModel_1.default({ type: 'invalid-action' }, "You're already friends with user or you haven't received a friend request");
    const requestIndex = user.friendRequests.indexOf(recipient.id);
    if (requestIndex == -1)
        throw new Error('Request index not found');
    user.friendRequests.splice(requestIndex, 1);
    user.friendlist.push(recipient.id);
    recipient.friendlist.push(user.id);
    yield user.save({ validateModifiedOnly: true });
    yield recipient.save({ validateModifiedOnly: true });
    res.status(200).json({
        status: 'success',
        message: 'Friend request accepted',
        data: { recipient },
    });
}));
exports.rejectFriendRequest = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    const { user } = res.locals;
    const recipient = yield userModel_1.default.findOne({ username });
    if (!recipient)
        throw new errorModel_1.default({
            type: 'validation',
            paths: { username: 'Invalid or incorrect username' },
        }, "Couldn't accept friend request");
    if (!user.friendRequests.includes(recipient.id))
        throw new errorModel_1.default({ type: 'invalid-action' }, "You're already friends with user or you haven't received a friend request");
    const requestIndex = user.friendRequests.indexOf(recipient.id);
    if (requestIndex == -1)
        throw new Error('Request index not found');
    user.friendRequests.splice(requestIndex, 1);
    yield user.save({ validateModifiedOnly: true });
    res.status(200).json({
        status: 'success',
        message: 'Friend request rejected',
        data: { recipient },
    });
}));
exports.deleteFriend = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    const { user } = res.locals;
    const removedFriend = yield userModel_1.default.findOne({ username });
    if (!removedFriend)
        throw new errorModel_1.default({
            type: 'validation',
            paths: { username: 'Invalid or incorrect username' },
        }, "Couldn't find user");
    if (!user.friendlist.includes(removedFriend.id))
        throw new errorModel_1.default({ type: 'invalid-action' }, "You're not friends with that user");
    const userIndex = removedFriend.friendlist.indexOf(user.id);
    const removedFriendIndex = user.friendlist.indexOf(removedFriend.id);
    if (userIndex === -1 || removedFriendIndex === -1)
        throw new Error("Couldn't find friend indexes");
    user.friendlist.splice(removedFriendIndex, 1);
    removedFriend.friendlist.splice(userIndex, 1);
    yield user.save({ validateModifiedOnly: true });
    yield removedFriend.save({ validateModifiedOnly: true });
    res.status(200).json({
        status: 'success',
        message: 'Friend removed',
        data: { removedFriend },
    });
}));
