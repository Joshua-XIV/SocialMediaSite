import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import logRoutes from './routes/logRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import loggerMiddleware from './middleware/logger.js';
import errorHandler from './middleware/error.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.IP,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(loggerMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/messages', messageRoutes);

app.use(errorHandler);

export default app; 