import express from 'express';
import posts from './routes/post.js';

const port = process.env.PORT || 8001;
const app = express();

// Body Parse middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/api', posts);
app.listen(port, () => console.log(`Server is running on port ${port}`));