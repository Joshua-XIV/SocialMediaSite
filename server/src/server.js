import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import postRoutes from './routes/postRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import logger from './middleware/logger.js'
import errorHandler from './middleware/error.js'
import dotenv from 'dotenv'
dotenv.config();

const port = process.env.PORT || 8001
const app = express()

app.use(cors({
  origin: process.env.IP,
  credentials: true
}));

// Body Parse middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

// Logger middleware
app.use(logger)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/jobs', jobRoutes)

//Error Handler
app.use(errorHandler)

app.listen(port, () => console.log(`Server is RUNNING ${port}`))