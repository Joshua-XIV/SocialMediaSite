import logger from '../utils/logger.js';

const loggerMiddleware = (req, res, next) => {
  logger.logRequest(req, res, next);
};

export default loggerMiddleware;
