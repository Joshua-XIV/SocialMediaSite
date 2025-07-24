import app from './app.js';
import logger from './utils/logger.js';
import { runCleanupTasks } from './utils/cleanupUtils.js';

const port = process.env.PORT || 8001;

// Log server startup
logger.info('Server starting up', {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'WARN' : 'INFO')
});

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

runCleanupTasks().then(() => {
  logger.info('Initial cleanup completed successfully');
}).catch(err => {
  logger.error('Initial cleanup failed', { error: err.message }, err);
});

app.listen(port, () => {
  logger.info(`Server is RUNNING on port ${port}`, {
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.IP
  });
});