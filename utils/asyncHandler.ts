import { Request, Response, NextFunction, RequestHandler } from 'express';

function asyncHandler(fn: Function): RequestHandler {
	return function (req: Request, res: Response, next: NextFunction) {
		fn(req, res, next).catch(next);
	};
}

export default asyncHandler;
