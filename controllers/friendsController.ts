import { Request, Response } from 'express';
import User from '../models/userModel';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../models/errorModel';

export const sendFriendRequest = asyncHandler(
	async (req: Request, res: Response) => {
		const { username } = req.body;
		const { user } = res.locals;

		const recipient = await User.findOne({ username });

		if (!recipient || recipient.id === user.id)
			throw new AppError(
				{
					type: 'validation',
					paths: { username: 'Invalid or incorrect username' },
				},
				"Couldn't send friend request"
			);

		if (
			recipient.friendlist.includes(user.id) ||
			recipient.friendRequests.includes(user.id) ||
			user.friendRequests.includes(recipient.id)
		)
			throw new AppError(
				{ type: 'invalid-action' },
				"You're already friends with that user or already sent friend request"
			);

		recipient.friendRequests.push(user.id);
		await recipient.save({ validateModifiedOnly: true });

		res.status(202).json({ status: 'success', message: 'Friend request sent' });
	}
);

export const acceptFriendRequest = asyncHandler(
	async (req: Request, res: Response) => {
		const { username } = req.body;
		const { user } = res.locals;

		const recipient = await User.findOne({ username });

		if (!recipient)
			throw new AppError(
				{
					type: 'validation',
					paths: { username: 'Invalid or incorrect username' },
				},
				"Couldn't accept friend request"
			);

		if (
			user.friendlist.includes(recipient.id) ||
			!user.friendRequests.includes(recipient.id)
		)
			throw new AppError(
				{ type: 'invalid-action' },
				"You're already friends with user or you haven't received a friend request"
			);

		const requestIndex = user.friendRequests.indexOf(recipient.id);
		if (requestIndex == -1) throw new Error('Request index not found');

		user.friendRequests.splice(requestIndex, 1);
		user.friendlist.push(recipient.id);
		recipient.friendlist.push(user.id);

		await user.save({ validateModifiedOnly: true });
		await recipient.save({ validateModifiedOnly: true });

		res.status(200).json({
			status: 'success',
			message: 'Friend request accepted',
			data: { recipient },
		});
	}
);

export const rejectFriendRequest = asyncHandler(
	async (req: Request, res: Response) => {
		const { username } = req.body;
		const { user } = res.locals;

		const recipient = await User.findOne({ username });

		if (!recipient)
			throw new AppError(
				{
					type: 'validation',
					paths: { username: 'Invalid or incorrect username' },
				},
				"Couldn't accept friend request"
			);

		if (!user.friendRequests.includes(recipient.id))
			throw new AppError(
				{ type: 'invalid-action' },
				"You're already friends with user or you haven't received a friend request"
			);

		const requestIndex = user.friendRequests.indexOf(recipient.id);
		if (requestIndex == -1) throw new Error('Request index not found');

		user.friendRequests.splice(requestIndex, 1);

		await user.save({ validateModifiedOnly: true });

		res.status(200).json({
			status: 'success',
			message: 'Friend request rejected',
			data: { recipient },
		});
	}
);

export const deleteFriend = asyncHandler(
	async (req: Request, res: Response) => {
		const { username } = req.body;
		const { user } = res.locals;

		const removedFriend = await User.findOne({ username });

		if (!removedFriend)
			throw new AppError(
				{
					type: 'validation',
					paths: { username: 'Invalid or incorrect username' },
				},
				"Couldn't find user"
			);

		if (!user.friendlist.includes(removedFriend.id))
			throw new AppError(
				{ type: 'invalid-action' },
				"You're not friends with that user"
			);

		const userIndex = removedFriend.friendlist.indexOf(user.id);
		const removedFriendIndex = user.friendlist.indexOf(removedFriend.id);

		if (userIndex === -1 || removedFriendIndex === -1)
			throw new Error("Couldn't find friend indexes");

		user.friendlist.splice(removedFriendIndex, 1);
		removedFriend.friendlist.splice(userIndex, 1);

		await user.save({ validateModifiedOnly: true });
		await removedFriend.save({ validateModifiedOnly: true });

		res.status(200).json({
			status: 'success',
			message: 'Friend removed',
			data: { removedFriend },
		});
	}
);
