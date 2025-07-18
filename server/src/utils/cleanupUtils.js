import { pool as db } from '../database.js';

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

// Run all cleanup tasks
export const runCleanupTasks = async () => {
  console.log('Running database cleanup tasks...');
  
  const pendingUsersCleaned = await cleanupExpiredPendingUsers();
  const refreshTokensCleaned = await cleanupExpiredRefreshTokens();
  
  const totalCleaned = pendingUsersCleaned + refreshTokensCleaned;
  
  if (totalCleaned > 0) {
    console.log(`Cleanup complete: ${totalCleaned} items removed`);
  } else {
    console.log('No cleanup needed');
  }
  
  return totalCleaned;
};