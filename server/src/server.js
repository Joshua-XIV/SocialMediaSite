import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import postRoutes from './routes/postRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import searchRoutes from './routes/searchRoutes.js'
import logRoutes from './routes/logRoutes.js'
import loggerMiddleware from './middleware/logger.js'
import errorHandler from './middleware/error.js'
import { runCleanupTasks } from './utils/cleanupUtils.js'
import logger from './utils/logger.js'
import dotenv from 'dotenv'
dotenv.config();

const port = process.env.PORT || 8001
const app = express()

// Log server startup
logger.info('Server starting up', {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'WARN' : 'INFO')
});

app.use(cors({
  origin: process.env.IP,
  credentials: true
}));

// Body Parse middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

// Logger middleware
app.use(loggerMiddleware)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/logs', logRoutes)

// Cleanup tasks
setInterval(async () => {
  try {
    logger.info('Running scheduled cleanup tasks');
    await runCleanupTasks();
    logger.info('Cleanup tasks completed successfully');
  } catch (err) {
    logger.error('Cleanup task failed', { error: err.message }, err);
  }
}, 15 * 60 * 1000); // 15 minutes

// Also run cleanup on startup
runCleanupTasks().then(() => {
  logger.info('Initial cleanup completed successfully');
}).catch(err => {
  logger.error('Initial cleanup failed', { error: err.message }, err);
});

//Error Handler
app.use(errorHandler)

app.listen(port, () => {
  logger.info(`Server is RUNNING on port ${port}`, {
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.IP
  });
});