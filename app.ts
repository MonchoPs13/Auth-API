import path from 'node:path';
import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, './config.env') });
import { API_ROUTE } from './config/config';
import { verifyKey } from './controllers/keyController';
import globalErrorHandler, {
	invalidRoute,
} from './controllers/errorController';
import authRouter from './routers/authRouter';
import userRouter from './routers/userRouter';
import friendsRouter from './routers/friendsRouter';
import keyRouter from './routers/keyRouter';

const app = express();
app.disable('x-powered-by');

const limiter = rateLimit({
	windowMs: 1000 * 60 * 60,
	message: 'Too many requests, try again later',
	limit: 100,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
});

app.use('/api', limiter);
app.use(compression());
app.use(xss());
app.use(hpp());
app.use(mongoSanitize());
app.use(helmet());
app.use(cookieParser());
app.use(json());

app.use(`${API_ROUTE}/auth`, verifyKey, authRouter);
app.use(`${API_ROUTE}/user`, verifyKey, userRouter);
app.use(`${API_ROUTE}/friends`, verifyKey, friendsRouter);
app.use(`${API_ROUTE}/key`, keyRouter);
app.use(globalErrorHandler);
app.use(invalidRoute);

export default app;
