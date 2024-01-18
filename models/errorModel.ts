type AppErrorObj =
	| { type: 'validation'; paths: { [key: string]: Error | string } }
	| { type: 'authorization' }
	| { type: 'JsonWebTokenError' }
	| { type: 'mailer' }
	| { type: 'invalid-action' }
	| { type: 'key error' };

class AppError extends Error {
	operational = true;
	statusCode = 400;
	errorObj: {
		status: string;
		message: string;
		body?: object;
	};

	constructor(obj: AppErrorObj, message: string) {
		super(message);

		let body: { [key: string]: string } = {};

		if (obj.type === 'authorization' || obj.type === 'JsonWebTokenError') {
			this.statusCode = 401;
		} else if (obj.type === 'validation') {
			for (const property in obj.paths) {
				const entry = obj.paths[property];
				const message = typeof entry === 'string' ? entry : entry.message;
				body[property] = message;
			}
		} else if (obj.type === 'mailer') {
			this.statusCode = 500;
		}

		this.errorObj = {
			status:
				this.statusCode >= 400 && this.statusCode < 500 ? 'fail' : 'error',
			message,
			body,
		};
	}
}

export default AppError;
