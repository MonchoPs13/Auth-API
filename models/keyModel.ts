import { Model, model, Schema, HydratedDocument } from 'mongoose';
import bcrypt from 'bcrypt';

interface IKey {
	username: string;
	token: string;
}

interface IKeyMethods {
	tokenCheck(plainToken?: string): Promise<Boolean>;
}

type KeyModel = Model<IKey, {}, IKeyMethods>;

const keySchema = new Schema<IKey, KeyModel, IKeyMethods>({
	username: {
		type: String,
		required: [true, 'Please provide a valid username'],
		unique: true,
	},
	token: {
		type: String,
		required: [true, 'Please provide a valid API key'],
		unique: true,
	},
});

keySchema.pre('save', async function (this: HydratedDocument<IKey>) {
	if (!this.isModified('token')) return;
	this.token = await bcrypt.hash(this.token, 10);
});

keySchema.methods.tokenCheck = async function (
	this: IKey,
	plainToken: string = ''
) {
	return await bcrypt.compare(plainToken, this.token);
};

const Key = model<IKey, KeyModel>('Key', keySchema);

export default Key;
