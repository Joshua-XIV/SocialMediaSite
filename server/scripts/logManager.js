#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

// Function to read and parse log files
const readLogFile = (filename) => {
  const filePath = path.join(logsDir, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(log => log !== null);
};

// Function to analyze logs
const analyzeLogs = () => {
  const logFiles = ['error.log', 'warn.log', 'info.log', 'debug.log'];
  const allLogs = [];
  
  logFiles.forEach(filename => {
    const logs = readLogFile(filename);
    allLogs.push(...logs);
  });
  
  // Sort by timestamp
  allLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  return allLogs;
};

// Function to get log statistics
const getLogStats = (logs) => {
  const stats = {
    total: logs.length,
    byLevel: {},
    byHour: {},
    errors: [],
    warnings: []
  };
  
  logs.forEach(log => {
    // Count by level
    stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    
    // Count by hour
    const hour = new Date(log.timestamp).getHours();
    stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
    
    // Collect errors and warnings
    if (log.level === 'ERROR') {
      stats.errors.push(log);
    } else if (log.level === 'WARN') {
      stats.warnings.push(log);
    }
  });
  
  return stats;
};

// Function to display logs in a readable format
const displayLogs = (logs, limit = 50, searchTerm = null) => {
  let filteredLogs = logs;
  
  // Filter by search term if provided
  if (searchTerm) {
    filteredLogs = logs.filter(log => 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  
  const title = searchTerm ? `Logs containing "${searchTerm}"` : 'Recent Logs';
  console.log(`\n=== ${title} ===\n`);
  
  if (filteredLogs.length === 0) {
    console.log('No logs found.');
    return;
  }
  
  filteredLogs.slice(-limit).forEach(log => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    const level = log.level.padEnd(5);
    const message = log.message;
    
    console.log(`[${timestamp}] ${level} ${message}`);
    
    if (log.data) {
      console.log(`  Data: ${JSON.stringify(log.data)}`);
    }
    
    if (log.error) {
      console.log(`  Error: ${log.error.message}`);
    }
    
    console.log('');
  });
};

// Function to display statistics
const displayStats = (stats) => {
  console.log('\n=== Log Statistics ===\n');
  
  console.log(`Total logs: ${stats.total}`);
  console.log('\nBy level:');
  Object.entries(stats.byLevel).forEach(([level, count]) => {
    console.log(`  ${level}: ${count}`);
  });
  
  console.log('\nBy hour:');
  Object.entries(stats.byHour)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([hour, count]) => {
      console.log(`  ${hour}:00 - ${count} logs`);
    });
  
  if (stats.errors.length > 0) {
    console.log(`\nRecent Errors (${stats.errors.length}):`);
    stats.errors.slice(-5).forEach(error => {
      console.log(`  ${new Date(error.timestamp).toLocaleString()} - ${error.message}`);
    });
  }
  
  if (stats.warnings.length > 0) {
    console.log(`\nRecent Warnings (${stats.warnings.length}):`);
    stats.warnings.slice(-5).forEach(warning => {
      console.log(`  ${new Date(warning.timestamp).toLocaleString()} - ${warning.message}`);
    });
  }
};

// Main function
const main = () => {
  const command = process.argv[2];
  
  if (!fs.existsSync(logsDir)) {
    console.log('No logs directory found.');
    return;
  }
  
  const logs = analyzeLogs();
  const stats = getLogStats(logs);
  
  switch (command) {
    case 'stats':
      displayStats(stats);
      break;
      
    case 'recent':
      const recentLimit = parseInt(process.argv[3]) || 50;
      displayLogs(logs, recentLimit);
      break;
      
    case 'errors':
      const errorLogs = logs.filter(log => log.level === 'ERROR');
      displayLogs(errorLogs, parseInt(process.argv[3]) || 20);
      break;
      
    case 'warnings':
      const warningLogs = logs.filter(log => log.level === 'WARN');
      displayLogs(warningLogs, parseInt(process.argv[3]) || 20);
      break;
      
    case 'search':
      const searchTerm = process.argv[3];
      if (!searchTerm) {
        console.log('Usage: npm run logs search <term>');
        console.log('Example: npm run logs search "user logged in"');
        break;
      }
      const searchLimit = parseInt(process.argv[4]) || 50;
      displayLogs(logs, searchLimit, searchTerm);
      break;
      
    case 'clear':
      const logFiles = ['error.log', 'warn.log', 'info.log', 'debug.log'];
      logFiles.forEach(filename => {
        const filePath = path.join(logsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, '');
          console.log(`Cleared ${filename}`);
        }
      });
      console.log('All log files cleared.');
      break;
      
    default:
      console.log('Usage: node logManager.js <command> [options]');
      console.log('Commands:');
      console.log('  stats     - Show log statistics');
      console.log('  recent    - Show recent logs (default: 50)');
      console.log('  errors    - Show recent errors (default: 20)');
      console.log('  warnings  - Show recent warnings (default: 20)');
      console.log('  search    - Search logs by term');
      console.log('  clear     - Clear all log files');
      console.log('');
      console.log('Examples:');
      console.log('  npm run logs search "user logged in"');
      console.log('  npm run logs search "failed"');
      console.log('  npm run logs search "john"');
      break;
  }
};

main(); 