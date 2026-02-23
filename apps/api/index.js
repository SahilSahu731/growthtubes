import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import creatorRoutes from './routes/creator.routes.js';
import adminRoutes from './routes/admin.routes.js';
import * as Sentry from "@sentry/node";
import "./instrument.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10kb' }));
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/admin', adminRoutes);

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
