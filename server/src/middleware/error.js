import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  // Log the error with context
  logger.error('Request error occurred', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id || 'anonymous',
    statusCode: err.status || 500,
    errorMessage: err.message,
    stack: err.stack
  }, err);

  // Only in dev
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
};

export default errorHandler;