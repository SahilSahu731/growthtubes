import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import * as Sentry from "@sentry/node";
import "./instrument.js";

import profileRouter from './routes/profile.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Routes
app.use('/api/profiles', profileRouter);

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
})

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

app.use(globalLimiter);

Sentry.setupExpressErrorHandler(app);

// error handler
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
