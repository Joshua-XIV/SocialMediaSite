# Logging System

Simple server-side logging with automatic cleanup.

## Features

- **JSON structured logs** with timestamps
- **Multiple log levels**: ERROR, WARN, INFO, DEBUG
- **Automatic cleanup** - removes logs older than 30 days
- **File rotation** - renames files over 10MB
- **Production filtering** - reduces verbose logging in production

## Configuration

```bash
# Log level
LOG_LEVEL=INFO

# Log retention (days)
LOG_RETENTION_DAYS=30

# Max file size before rotation (MB)
LOG_MAX_SIZE_MB=10
```

## Log Files

Stored in `logs/` directory:

- `error.log` - Errors
- `warn.log` - Warnings
- `info.log` - Info messages
- `debug.log` - Debug messages

## What Gets Logged

### Production (Clean)

- User login/logout
- User registration
- Failed authentication attempts
- Server startup
- Errors and warnings

### Development (Verbose)

- All HTTP requests
- Post likes/unlikes
- Token refreshes
- Detailed debugging info

## Usage

```javascript
import logger from "../utils/logger.js";

logger.info("User logged in", { userId: 123, username: "john" });
logger.error("Database failed", { error: err.message }, err);
```

## Log Analysis

```bash
# Show recent logs (default: 50)
npm run logs recent

# Show specific number of recent logs
npm run logs recent 100

# Show only errors (default: 20)
npm run logs errors

# Show specific number of errors
npm run logs errors 100

# Show only warnings (default: 20)
npm run logs warnings

# Show specific number of warnings
npm run logs warnings 30

# Show statistics
npm run logs stats

# Search logs by term (default: 50 results)
npm run logs search "user logged in"

# Search with specific number of results
npm run logs search "failed" 100

# Clear all logs
npm run logs clear
```
