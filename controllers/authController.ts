import crypto from 'node:crypto';
import { Request, Response, CookieOptions, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/userModel';
import asyncHandler from '../utils/asyncHandler';
import { COOKIE_EXPIRES, userTokenMode } from '../config/config';
import AppError from '../models/errorModel';
import Mailer from '../services/mailer';

interface AppJwtPayload extends JwtPayload {
	id: string;
	iat: number;
}

function signAndSendJWT(userID: string, res: Response) {
	const payload: AppJwtPayload = {
		id: userID,
		iat: Date.now(),
	};

	const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES,
	});

	const cookieOptions: CookieOptions = {
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		expires: new Date(Date.now() + COOKIE_EXPIRES),
	};

	res.cookie('jwt', jwtToken, cookieOptions);
}

export const protectRoute = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { jwt: token } = req.cookies;
		const decodedToken = jwt.verify(
			token,
			process.env.JWT_SECRET
		) as AppJwtPayload;

		const user = await User.findOne({
			_id: decodedToken.id,
			passwordChanged: { $lte: new Date(decodedToken.iat) },
		});

		if (!user)
			throw new AppError(
				{ type: 'JsonWebTokenError' },
				'Invalid token or user associated with token no longer exists'
			);

		res.locals.user = user;
		next();
	}
);

export const signup = asyncHandler(async (req: Request, res: Response) => {
	const sanitizedUser = {
		email: req.body.email,
		name: req.body.name,
		username: req.body.username,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
	};

	const user = new User(sanitizedUser);

	const verificationCode = user.generateToken('verification', userTokenMode);
	await user.save();

	const userMailer = new Mailer(user.email);
	userMailer.sendTokenMail('verification', userTokenMode, verificationCode);

	signAndSendJWT(user.id, res);

	res.status(201).json({ status: 'success', data: { user } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
	const { username, password } = req.body;

	const user = await User.findOne({ username });

	const loginError = new AppError(
		{
			type: 'validation',
			paths: { username: 'Invalid username', password: 'Invalid password' },
		},
		'Invalid username or password'
	);

	if (!user) throw loginError;

	const passwordIsCorrect = await user.passwordCheck(password);

	if (!passwordIsCorrect) throw loginError;

	signAndSendJWT(user.id, res);

	res.status(200).json({ status: 'success', data: { user } });
});

export const requestVerification = asyncHandler(
	async (req: Request, res: Response) => {
		const { email } = req.body;

		const user = await User.findOne({ email, verified: false });

		if (!user)
			throw new AppError(
				{
					type: 'validation',
					paths: { email: 'Invalid email' },
				},
				'Invalid email or account already verified'
			);

		const verificationToken = user.generateToken('verification', userTokenMode);
		await user.save({ validateModifiedOnly: true });

		const userMailer = new Mailer(user.email);
		await userMailer.sendTokenMail(
			'verification',
			userTokenMode,
			verificationToken
		);

		res.status(202).json({ status: 'success', message: 'Email sent' });
	}
);

export const verify = asyncHandler(async (req: Request, res: Response) => {
	const { token } = req.body;
	const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
	const user = await User.findOne({
		verificationToken: hashedToken,
		verificationTokenExpires: { $gt: new Date(Date.now()) },
	});

	if (!user)
		throw new AppError(
			{
				type: 'validation',
				paths: { verificationToken: 'Invalid verification token' },
			},
			'Invalid or expired verification token'
		);

	user.verified = true;
	user.verificationToken = user.verificationTokenExpires = undefined;
	await user.save({ validateModifiedOnly: true });

	res
		.status(200)
		.json({ status: 'success', message: 'User verified', data: { user } });
});

export const requestPasswordReset = asyncHandler(
	async (req: Request, res: Response) => {
		const { email } = req.body;

		const user = await User.findOne({ email });
		if (!user)
			throw new AppError(
				{
					type: 'validation',
					paths: { email: 'Invalid or incorrect email' },
				},
				'Invalid or incorrect email'
			);

		const passwordToken = user.generateToken('passwordReset', userTokenMode);
		await user.save({ validateModifiedOnly: true });

		const userMailer = new Mailer(user.email);
		await userMailer.sendTokenMail(
			'passwordReset',
			userTokenMode,
			passwordToken
		);

		res.status(202).json({ status: 'success', message: 'Email sent' });
	}
);

export const resetPassword = asyncHandler(
	async (req: Request, res: Response) => {
		const { token, password, passwordConfirm } = req.body;
		const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetTokenExpires: { $gt: new Date(Date.now()) },
		});

		if (!user)
			throw new AppError(
				{ type: 'validation', paths: { passwordResetToken: 'Invalid token' } },
				'Invalid or expired token'
			);

		user.password = password;
		user.passwordConfirm = passwordConfirm;
		user.passwordResetToken = user.passwordResetTokenExpires = undefined;
		await user.save({ validateModifiedOnly: true });

		res
			.status(200)
			.json({ status: 'success', message: 'Password updated', data: { user } });
	}
);

export const changePassword = asyncHandler(
	async (req: Request, res: Response) => {
		const { passwordCurrent, password, passwordConfirm } = req.body;
		const { user } = res.locals;

		const passwordIsCorrect = await user.passwordCheck(passwordCurrent);
		if (!passwordIsCorrect)
			throw new AppError(
				{
					type: 'validation',
					paths: { passwordCurrent: 'Incorrect password' },
				},
				'Incorrect password'
			);

		user.password = password;
		user.passwordConfirm = passwordConfirm;
		await user.save({ validateModifyOnly: true });

		res
			.status(200)
			.json({ status: 'success', message: 'Password updated', data: { user } });
	}
);
