import { pool as db } from '../database.js';
import fs from 'fs';
import path from 'path';

// Clean up expired pending users (older than 10 minutes)
export const cleanupExpiredPendingUsers = async () => {
  try {
    const result = await db.query(
      `DELETE FROM pending_user WHERE verification_expires < NOW()`
    );
    
    if (result.rowCount > 0) {
      console.log(`Cleaned up ${result.rowCount} expired pending users`);
    }
    
    return result.rowCount;
  } catch (err) {
    console.error('Error cleaning up expired pending users:', err);
    return 0;
  }
};

// Clean up expired refresh tokens (older than 30 days)
export const cleanupExpiredRefreshTokens = async () => {
  try {
    const result = await db.query(
      `DELETE FROM refresh_token WHERE expires_at < NOW()`
    );
    
    if (result.rowCount > 0) {
      console.log(`Cleaned up ${result.rowCount} expired refresh tokens`);
    }
    
    return result.rowCount;
  } catch (err) {
    console.error('Error cleaning up expired refresh tokens:', err);
    return 0;
  }
};

// Clean up old log files (older than configured days)
export const cleanupOldLogFiles = async () => {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) {
      return 0;
    }
    
    const files = fs.readdirSync(logsDir);
    const now = Date.now();
    const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS) || 30;
    const cutoffTime = now - (retentionDays * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
      // Remove files older than retention period
      if (stats.mtime.getTime() < cutoffTime) {
        fs.unlinkSync(filePath);
        cleanedCount++;
        console.log(`Removed old log file: ${file} (older than ${retentionDays} days)`);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old log files`);
    }
    
    return cleanedCount;
  } catch (err) {
    console.error('Error cleaning up old log files:', err);
    return 0;
  }
};

// Rotate large log files (over configured size)
export const rotateLargeLogFiles = async () => {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    
    if (!fs.existsSync(logsDir)) {
      return 0;
    }
    
    const files = fs.readdirSync(logsDir);
    const maxSizeMB = parseInt(process.env.LOG_MAX_SIZE_MB) || 10;
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    let rotatedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
              // Rotate files larger than max size
        if (stats.size > maxSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const newFileName = `${file}.${timestamp}`;
          const newFilePath = path.join(logsDir, newFileName);
          
          // Rename the current file
          fs.renameSync(filePath, newFilePath);
          rotatedCount++;
          console.log(`Rotated large log file: ${file} -> ${newFileName} (over ${maxSizeMB}MB)`);
        }
    }
    
    if (rotatedCount > 0) {
      console.log(`Rotated ${rotatedCount} large log files`);
    }
    
    return rotatedCount;
  } catch (err) {
    console.error('Error rotating large log files:', err);
    return 0;
  }
};

// Run all cleanup tasks
export const runCleanupTasks = async () => {
  console.log('Running cleanup tasks...');
  
  const pendingUsersCleaned = await cleanupExpiredPendingUsers();
  const refreshTokensCleaned = await cleanupExpiredRefreshTokens();
  const logFilesCleaned = await cleanupOldLogFiles();
  const logFilesRotated = await rotateLargeLogFiles();
  
  const totalCleaned = pendingUsersCleaned + refreshTokensCleaned + logFilesCleaned;
  const totalRotated = logFilesRotated;
  
  if (totalCleaned > 0 || totalRotated > 0) {
    console.log(`Cleanup complete: ${totalCleaned} items removed, ${totalRotated} files rotated`);
  } else {
    console.log('No cleanup needed');
  }
  
  return { cleaned: totalCleaned, rotated: totalRotated };
};