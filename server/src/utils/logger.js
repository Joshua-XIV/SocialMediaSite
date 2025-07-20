import fs from 'fs';
import path from 'path';

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Get current log level from environment or default based on NODE_ENV
const getDefaultLogLevel = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'INFO'; // Include INFO for security events in production
  }
  return 'INFO'; // Full logging in development
};

const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase() || getDefaultLogLevel()];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper function to get timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Helper function to format log message
const formatLogMessage = (level, message, data = null, error = null) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
    ...(error && { 
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    })
  };
  
  return JSON.stringify(logEntry);
};

// Helper function to write to log file
const writeToFile = (level, message, data = null, error = null) => {
  const logEntry = formatLogMessage(level, message, data, error);
  const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
  
  fs.appendFileSync(logFile, logEntry + '\n');
};

// Helper function to get colored console output
const getColoredOutput = (level, message) => {
  const colorMap = {
    ERROR: colors.red,
    WARN: colors.yellow,
    INFO: colors.green,
    DEBUG: colors.blue,
    TRACE: colors.magenta
  };
  
  const color = colorMap[level] || colors.white;
  return `${color}[${level}]${colors.reset} ${colors.cyan}${getTimestamp()}${colors.reset} ${message}`;
};

// Main logger class
class Logger {
  constructor() {
    this.requestId = 0;
  }

  // Generate unique request ID
  generateRequestId() {
    return ++this.requestId;
  }

  // Log method with level checking
  log(level, message, data = null, error = null) {
    if (LOG_LEVELS[level] <= CURRENT_LOG_LEVEL) {
      const coloredMessage = getColoredOutput(level, message);
      console.log(coloredMessage);
      
      if (data) {
        console.log(colors.cyan + 'Data:' + colors.reset, data);
      }
      
      if (error) {
        console.error(colors.red + 'Error:' + colors.reset, error);
      }
      
      // Write to file
      writeToFile(level, message, data, error);
    }
  }

  // Convenience methods for different log levels
  error(message, data = null, error = null) {
    this.log('ERROR', message, data, error);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }

  trace(message, data = null) {
    this.log('TRACE', message, data);
  }

  // HTTP request logging
  logRequest(req, res, next) {
    const requestId = this.generateRequestId();
    req.requestId = requestId;
    
    const startTime = Date.now();
    
    // Only log requests in development
    if (process.env.NODE_ENV !== 'production') {
      // Log request
      this.info(`Request started`, {
        requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous'
      });
    }

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - startTime;
      
      // Only log requests in development
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`Request completed`, {
          requestId,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          contentLength: res.get('Content-Length') || 0
        });
      }
      
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  }

  // Database query logging
  logQuery(sql, params, duration) {
    this.debug(`Database query executed`, {
      sql: sql.substring(0, 200) + (sql.length > 200 ? '...' : ''),
      params: params?.slice(0, 3), // Log first 3 params for security
      duration: `${duration}ms`
    });
  }

  // User activity logging
  logUserActivity(userId, action, details = null) {
    this.info(`User activity`, {
      userId,
      action,
      details,
      timestamp: getTimestamp()
    });
  }

  // Error logging with context
  logError(error, context = null) {
    this.error(`Application error`, context, error);
  }

  // Performance logging
  logPerformance(operation, duration, details = null) {
    this.info(`Performance metric`, {
      operation,
      duration: `${duration}ms`,
      details
    });
  }
}

// Create singleton instance
const logger = new Logger();

export default logger; 