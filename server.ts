import mongoose from 'mongoose';
import app from './app';

process.on('uncaughtException', err => {
	console.log(`UNCAUGHT EXCEPTION: ${err}`);
	process.exit(1);
});

async function connectToDatabase() {
	try {
		const user = process.env.DB_USER;
		const password = process.env.DB_PASSWORD;
		await mongoose.connect(
			process.env.DB_CONNECT.replace('<user>', user).replace(
				'<password>',
				password
			)
		);
		console.log('Connection to database successfull');
	} catch (err) {
		console.log(`Unable to connect to database: ${err}`);
		server.close(() => process.exit(1));
	}
}

const server = app.listen(process.env.PORT, () => {
	console.log(`Server started on ${process.env.HOST_ROUTE}`);
});

process.on('unhandledRejection', err => {
	console.log(`UNHANDLED REJECTION: ${err}`);
	server.close(() => process.exit(1));
});

connectToDatabase();
