namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production';
		PORT: number;
		DB_CONNECT: string;
		DB_USER: string;
		DB_PASSWORD: string;
		JWT_SECRET: string;
		JWT_EXPIRES: string;
		NODEMAILER_HOST: string;
		NODEMAILER_PORT: number;
		NODEMAILER_USER: string;
		NODEMAILER_PASS: string;
		MAILER_FROM: string;
		BUCKET_NAME: string;
		BUCKET_REGION: string;
		ACCESS_KEY: string;
		ACCESS_KEY_SECRET: string;
		HOST_ROUTE: string;
		API_KEY_SECRET: string;
	}
}
