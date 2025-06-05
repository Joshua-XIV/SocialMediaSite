import express from 'express';
import posts from './routes/post.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/error.js';

const port = process.env.PORT || 8001;
const app = express();

// Body Parse middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Logger middleware
app.use(logger);

// Routes
app.use('/api', posts);

//Error Handler
app.use(errorHandler)

app.listen(port, () => console.log(`Server is running on port ${port}`));