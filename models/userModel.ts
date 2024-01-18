import crypto from 'node:crypto';
import { Model, Schema, model, HydratedDocument, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import {
	usernameMaxLength,
	usernameMinLength,
	userTokenExpiration,
	nameMaxLength,
	type userTokenModeOptions,
	type userTokenTypeOptions,
} from '../config/config';

interface IUser {
	email: string;
	name: string;
	username: string;
	password: string;
	passwordConfirm?: string;
	passwordResetToken?: string;
	passwordResetTokenExpires?: Date;
	passwordChanged?: Date;
	verified: boolean;
	verificationToken?: string;
	verificationTokenExpires?: Date;

	friendlist: Types.ObjectId[];
	friendRequests: Types.ObjectId[];

	profilePicture?: string;
}

interface IUserMethods {
	passwordCheck(plainPwd: string): Promise<boolean>;
	generateToken(type: userTokenTypeOptions, mode: userTokenModeOptions): string;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
	email: {
		type: String,
		unique: true,
		required: [true, 'Please provide an email'],
		validate: {
			validator: function (this: IUser, email: string) {
				return new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$').test(email);
			},
			message: 'Invalid format of provided email',
		},
	},
	name: {
		type: String,
		required: [true, 'Please provide a name'],
		maxlength: [
			nameMaxLength,
			`Username can't exceed ${nameMaxLength} characters`,
		],
	},
	username: {
		type: String,
		unique: true,
		required: [true, 'Please provide a username'],
		minlength: [
			usernameMinLength,
			`Username must be at least ${usernameMinLength} characters`,
		],
		maxlength: [
			usernameMaxLength,
			`Username can't exceed ${usernameMaxLength} characters`,
		],
	},
	password: {
		type: String,
		required: [true, 'Please provide a password'],
		validate: {
			validator: function (this: IUser, password: string) {
				return this.password === this.passwordConfirm;
			},
			message: "Password and confirmation values don't match",
		},
	},
	passwordConfirm: {
		type: String,
	},
	passwordResetToken: {
		type: String,
	},
	passwordResetTokenExpires: {
		type: Date,
	},
	passwordChanged: {
		type: Date,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	verificationToken: {
		type: String,
	},
	verificationTokenExpires: {
		type: Date,
	},
	friendlist: {
		type: [Schema.Types.ObjectId],
		default: [],
	},
	friendRequests: {
		type: [Schema.Types.ObjectId],
		default: [],
	},
	profilePicture: String,
});

userSchema.pre('save', async function (this: HydratedDocument<IUser>) {
	if (!this.isModified('password')) return;
	this.password = await bcrypt.hash(this.password, 10);
	this.passwordConfirm = undefined;
	this.passwordChanged = new Date(Date.now() - 1000);
});

userSchema.methods.passwordCheck = async function (
	this: IUser,
	plainPwd: string
) {
	if (!plainPwd) return false;
	return await bcrypt.compare(plainPwd, this.password);
};

userSchema.methods.generateToken = function (
	this: IUser,
	type: userTokenTypeOptions,
	mode: userTokenModeOptions
) {
	const dataSize = mode === 'link' ? 32 : 6;
	const data = crypto.randomBytes(dataSize / 2).toString('hex');
	const hashedData = crypto.createHash('sha256').update(data).digest('hex');

	this[`${type}Token`] = hashedData;
	this[`${type}TokenExpires`] = new Date(Date.now() + userTokenExpiration);

	return data;
};

const User = model<IUser, UserModel>('User', userSchema);

export default User;
