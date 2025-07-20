import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// Endpoint to receive client-side logs
router.post('/', (req, res) => {
  const { level, message, data, error, timestamp, url, userAgent } = req.body;
  
  // Log the client-side log with additional context
  logger.log(level, `Client: ${message}`, {
    clientData: data,
    clientError: error,
    clientTimestamp: timestamp,
    clientUrl: url,
    userAgent: userAgent,
    ip: req.ip
  });
  
  res.status(200).json({ success: true });
});

export default router; 