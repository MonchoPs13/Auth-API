import nodemailer, { Transporter } from 'nodemailer';
import AppError from '../models/errorModel';
import {
	API_ROUTE,
	type userTokenModeOptions,
	type userTokenTypeOptions,
} from '../config/config';

class Mailer {
	transporter: Transporter;

	constructor(private recipient: string) {
		this.transporter = nodemailer.createTransport({
			host: process.env.NODEMAILER_HOST,
			port: process.env.NODEMAILER_PORT,
			auth: {
				user: process.env.NODEMAILER_USER,
				pass: process.env.NODEMAILER_PASS,
			},
		});
	}

	async sendTokenMail(
		type: userTokenTypeOptions,
		mode: userTokenModeOptions,
		token: string
	) {
		try {
			let subject: string;
			if (type === 'passwordReset') subject = 'Password reset';
			else subject = 'Email verification';

			let text = `A ${
				type === 'passwordReset' ? 'password reset' : 'verification'
			} email has been requested.\n`;

			if (mode === 'link') {
				const action = type === 'passwordReset' ? 'password-reset' : 'verify';
				text += `Please follow the following link to complete the procedure: ${process.env.HOST_ROUTE}${API_ROUTE}/auth/${action}/${token}\n`;
			} else {
				text += `Your token is ${token}\n`;
			}

			text += `If you didn't request any action please ignore this email.`;

			await this.sendMail(subject, text);
		} catch (err) {
			throw err;
		}
	}

	async sendMail(subject: string, text: string) {
		try {
			const message = {
				from: process.env.MAILER_FROM,
				to: this.recipient,
				subject,
				text,
			};

			await this.transporter.sendMail(message);
		} catch (err) {
			throw new AppError(
				{ type: 'mailer' },
				"Couldn't send email, please try again later."
			);
		}
	}
}

export default Mailer;
