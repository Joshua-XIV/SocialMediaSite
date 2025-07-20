// Client-side logging utility
interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
  TRACE: 4;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Get current log level from environment or localStorage
const getCurrentLogLevel = (): number => {
  const savedLevel = localStorage.getItem('logLevel');
  if (savedLevel && LOG_LEVELS[savedLevel as keyof LogLevel] !== undefined) {
    return LOG_LEVELS[savedLevel as keyof LogLevel];
  }
  return LOG_LEVELS.INFO; // Default to INFO
};

// Helper function to get timestamp
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Generate session ID for tracking user sessions
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Helper function to format log message
const formatLogMessage = (level: string, message: string, data?: any, error?: Error): string => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    sessionId: getSessionId(),
    url: window.location.href,
    userAgent: navigator.userAgent,
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

// Helper function to send logs to server
const sendToServer = async (level: string, message: string, data?: any, error?: Error): Promise<void> => {
  try {
    const formattedMessage = formatLogMessage(level, message, data, error);
    const logData = JSON.parse(formattedMessage);

    await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(logData)
    });
  } catch (err) {
    // Silently fail to avoid infinite loops
    console.warn('Failed to send log to server:', err);
  }
};

// Main logger class
class ClientLogger {
  private requestId: number = 0;

  // Generate unique request ID
  generateRequestId(): number {
    return ++this.requestId;
  }

  // Log method with level checking
  private log(level: string, message: string, data?: any, error?: Error): void {
    const currentLevel = getCurrentLogLevel();
    const logLevel = LOG_LEVELS[level as keyof LogLevel];
    
    if (logLevel <= currentLevel) {
      const formattedMessage = formatLogMessage(level, message, data, error);
      const logEntry = JSON.parse(formattedMessage);
      
      // Console output with colors
      const colors = {
        ERROR: '\x1b[31m',
        WARN: '\x1b[33m',
        INFO: '\x1b[32m',
        DEBUG: '\x1b[34m',
        TRACE: '\x1b[35m',
        reset: '\x1b[0m'
      };
      
      const color = colors[level as keyof typeof colors] || colors.reset;
      console.log(`${color}[${level}]${colors.reset} ${message}`);
      
      if (data) {
        console.log('Data:', data);
      }
      
      if (error) {
        console.error('Error:', error);
      }
      
      // Store in localStorage for debugging
      this.storeLogEntry(logEntry);
      
      // Send to server if it's an error or warning
      if (level === 'ERROR' || level === 'WARN') {
        sendToServer(level, message, data, error);
      }
    }
  }

  // Store log entry in localStorage (limited to last 100 entries)
  private storeLogEntry(logEntry: any): void {
    try {
      const logs = JSON.parse(localStorage.getItem('clientLogs') || '[]');
      
      logs.push(logEntry);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('clientLogs', JSON.stringify(logs));
    } catch (err) {
      // Silently fail to avoid breaking the app
      console.warn('Failed to store log:', err);
    }
  }

  // Convenience methods for different log levels
  error(message: string, data?: any, error?: Error): void {
    this.log('ERROR', message, data, error);
  }

  warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  trace(message: string, data?: any): void {
    this.log('TRACE', message, data);
  }

  // User activity logging
  logUserActivity(action: string, details?: any): void {
    this.info('User activity', {
      action,
      details,
      timestamp: getTimestamp()
    });
  }

  // API call logging
  logApiCall(method: string, url: string, duration: number, status?: number, error?: Error): void {
    const data = {
      method,
      url,
      duration: `${duration}ms`,
      status
    };

    if (error) {
      this.error('API call failed', data, error);
    } else {
      this.debug('API call completed', data);
    }
  }

  // Performance logging
  logPerformance(operation: string, duration: number, details?: any): void {
    this.info('Performance metric', {
      operation,
      duration: `${duration}ms`,
      details
    });
  }

  // Navigation logging
  logNavigation(from: string, to: string): void {
    this.info('Navigation', {
      from,
      to,
      timestamp: getTimestamp()
    });
  }

  // Error boundary logging
  logErrorBoundary(error: Error, errorInfo: any): void {
    this.error('React error boundary caught error', {
      errorInfo,
      componentStack: errorInfo.componentStack
    }, error);
  }

  // Get stored logs (for debugging)
  getStoredLogs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('clientLogs') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored logs
  clearStoredLogs(): void {
    localStorage.removeItem('clientLogs');
  }

  // Set log level
  setLogLevel(level: keyof LogLevel): void {
    localStorage.setItem('logLevel', level);
  }

  // Get current log level
  getLogLevel(): keyof LogLevel {
    const savedLevel = localStorage.getItem('logLevel');
    if (savedLevel && LOG_LEVELS[savedLevel as keyof LogLevel] !== undefined) {
      return savedLevel as keyof LogLevel;
    }
    return 'INFO';
  }

  // Get current session ID
  getSessionId(): string {
    return getSessionId();
  }
}

// Create singleton instance
const logger = new ClientLogger();

export default logger; 