import { Request, Response } from 'express';
import crypto from 'node:crypto';
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import sharp from 'sharp';
import User from '../models/userModel';
import asyncHandler from '../utils/asyncHandler';
import { profilePictureSize, userEditableFields } from '../config/config';
import AppError from '../models/errorModel';

const s3 = new S3Client({
	credentials: {
		accessKeyId: process.env.ACCESS_KEY,
		secretAccessKey: process.env.ACCESS_KEY_SECRET,
	},
	region: process.env.BUCKET_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadSingle = upload.single('image');

export const uploadProfilePicture = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.file)
			throw new AppError(
				{ type: 'validation', paths: { file: 'Invalid file' } },
				'Invalid or missing file'
			);

		const buffer = await sharp(req.file.buffer)
			.resize({
				height: profilePictureSize,
				width: profilePictureSize,
			})
			.toBuffer();

		const imageName = crypto.randomBytes(32).toString('hex');
		const params = {
			Bucket: process.env.BUCKET_NAME,
			Key: imageName,
			Body: buffer,
			ContentType: req.file.mimetype,
		};

		const command = new PutObjectCommand(params);

		await s3.send(command);

		const { user } = res.locals;
		user.profilePicture = imageName;
		await user.save({ validateModifiedOnly: true });

		res
			.status(200)
			.json({ status: 'success', message: 'Profile picture updated' });
	}
);

export const getProfilePicture = asyncHandler(
	async (req: Request, res: Response) => {
		const { username } = req.query;
		const user = await User.findOne({ username });

		if (!username || !user)
			throw new AppError(
				{ type: 'validation', paths: { username: 'Invalid username' } },
				'Invalid or incorrect username'
			);

		const picture = user.profilePicture
			? user.profilePicture
			: 'defaultProfilePicture';
		const getObjectParams = {
			Bucket: process.env.BUCKET_NAME,
			Key: picture,
		};

		const command = new GetObjectCommand(getObjectParams);
		const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

		res.status(200).json({ status: 'success', data: { url } });
	}
);

export const deleteProfilePicture = asyncHandler(
	async (req: Request, res: Response) => {
		const { user } = res.locals;

		if (!user.profilePicture)
			throw new AppError(
				{ type: 'invalid-action' },
				"You don't have a profile picture"
			);

		const params = {
			Bucket: process.env.BUCKET_NAME,
			Key: user.profilePicture,
		};

		const command = new DeleteObjectCommand(params);
		await s3.send(command);

		user.profilePicture = undefined;
		await user.save({ validateModifiedOnly: true });

		res
			.status(200)
			.json({ status: 'success', message: 'Profile picture deleted' });
	}
);

export const searchUser = asyncHandler(async (req: Request, res: Response) => {
	const { username: query } = req.query;
	const { user } = res.locals;

	if (!query)
		throw new AppError(
			{ type: 'validation', paths: { query: 'Invalid query' } },
			"Couldn't find users"
		);

	const escapedQuery = (query as String).replace(
		/[-[\]{}()*+?.,\\^$|#\s]/g,
		'\\$&'
	);
	const queryRegex = new RegExp(`^${escapedQuery}`, 'i');

	const users = await User.find({
		username: { $regex: queryRegex, $ne: user.username },
	})
		.limit(5)
		.select('username -_id');

	res.status(200).json({
		status: 'success',
		results: users.length,
		data: users,
	});
});

export const editUser = asyncHandler(async (req: Request, res: Response) => {
	const { user } = res.locals;

	userEditableFields.forEach(field => {
		const newValue = req.body[field];
		if (newValue) user[field] = newValue;
	});

	await user.save({ validateModifiedOnly: true });

	res
		.status(200)
		.json({ status: 'success', message: 'User updated', data: { user } });
});
