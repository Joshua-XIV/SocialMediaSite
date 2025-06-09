import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import posts from './routes/post.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/error.js';

const port = process.env.PORT || 8001;
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body Parse middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Logger middleware
app.use(logger);

// Routes
app.use('/api', posts);
app.use('/api', authRoutes);
app.use('/api', userRoutes);

//Error Handler
app.use(errorHandler)

app.listen(port, () => console.log(`Server is running on port ${port}`));