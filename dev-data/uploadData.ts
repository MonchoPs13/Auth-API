import path from 'node:path';
import fs from 'node:fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
import User from '../models/userModel';

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const DB = process.env.DB_CONNECT.replace('<user>', user).replace(
	'<password>',
	password
);

mongoose
	.connect(DB)
	.then(() => console.log('Connection to database successfull'));

async function uploadData() {
	try {
		const users = JSON.parse(
			fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
		);
		await User.create(users);
		console.log('Data uploaded successfully');
	} catch (err) {
		console.log(err);
	} finally {
		process.exit();
	}
}

async function deleteData() {
	try {
		await User.deleteMany();
		console.log('Data deleted successfully');
	} catch (err) {
		console.log(err);
	} finally {
		process.exit();
	}
}

if (process.argv[2] === '--upload') uploadData();
else if (process.argv[2] === '--delete') deleteData();
