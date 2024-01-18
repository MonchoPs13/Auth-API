import { NextFunction, Request, Response } from 'express';
import Key from '../models/keyModel';
import asyncHandler from '../utils/asyncHandler';
import crypto from 'node:crypto';
import AppError from '../models/errorModel';

export const generateKey = asyncHandler(async (req: Request, res: Response) => {
	const { username, secret } = req.body;
	if (secret != process.env.API_KEY_SECRET)
		throw new AppError({ type: 'key error' }, 'Invalid secret');

	const plainToken = crypto.randomBytes(32).toString('hex');

	const key = new Key({ username, token: plainToken });
	await key.save();

	res
		.status(202)
		.json({ status: 'success', message: 'Key generated', key: plainToken });
});

export const verifyKey = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const username = req.header('x-api-user');
		const api_key = req.header('x-api-key');

		const key = await Key.findOne({ username });

		if (!key)
			throw new AppError(
				{ type: 'validation', paths: { username: 'Incorrect username' } },
				'No key is associated with provided username'
			);

		const isValidToken = await key.tokenCheck(api_key);
		if (!isValidToken)
			throw new AppError({ type: 'key error' }, 'Invalid API token');

		next();
	}
);

export const deleteKey = asyncHandler(async (req: Request, res: Response) => {
	const { username, secret } = req.body;

	if (secret != process.env.API_KEY_SECRET)
		throw new AppError({ type: 'key error' }, 'Invalid secret');

	const info = await Key.deleteOne({ username });
	if (info.deletedCount == 0)
		throw new AppError(
			{ type: 'key error' },
			"Key with provided username doesn't exist"
		);

	res.status(200).json({ status: 'success', message: 'Key deleted' });
});
