import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';
import { JsonWebTokenError } from 'jsonwebtoken';
import AppError from '../models/errorModel';

export function invalidRoute(req: Request, res: Response) {
	res.status(404).json({ status: 'fail', message: 'Resource not implemented' });
}

function nonOperationalErrorHandler(err: any, res: Response) {
	console.log(err);
	res.status(500).json({
		status: 'error',
		message: 'An error ocurred, please try again later',
		error: process.env.NODE_ENV === 'development' ? err : undefined,
	});
}

function globalErrorHandler(
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) {
	let error = err;
	if (err instanceof Error.ValidationError) {
		error = new AppError(
			{ type: 'validation', paths: err.errors },
			'Invalid fields'
		);
	} else if (err instanceof JsonWebTokenError) {
		error = new AppError(
			{ type: 'JsonWebTokenError' },
			'Invalid or expired token'
		);
	} else if (err.message.includes('duplicate key')) {
		error = new AppError(
			{ type: 'validation', paths: err.keyValue },
			'Duplicate fields'
		);
	}

	if (!error.operational) return nonOperationalErrorHandler(err, res);

	res.status(error.statusCode).json({
		...error.errorObj,
		details: process.env.NODE_ENV === 'development' ? err : undefined,
	});
}

export default globalErrorHandler;
