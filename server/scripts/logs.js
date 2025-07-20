#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

// Get the command and arguments
const args = process.argv.slice(2);
const subCommand = args[0];
const remainingArgs = args.slice(1);

// Map space-separated commands to logManager commands
const commandMap = {
  'recent': 'recent',
  'errors': 'errors', 
  'warnings': 'warnings',
  'stats': 'stats',
  'search': 'search',
  'clear': 'clear'
};

if (!subCommand) {
  console.log('Usage: npm run logs <command> [args...]');
  console.log('Commands:');
  console.log('  recent [limit]     - Show recent logs (default: 50)');
  console.log('  errors [limit]     - Show errors (default: 20)');
  console.log('  warnings [limit]   - Show warnings (default: 20)');
  console.log('  stats              - Show statistics');
  console.log('  search <term> [limit] - Search logs');
  console.log('  clear              - Clear all logs');
  console.log('');
  console.log('Examples:');
  console.log('  npm run logs errors 100');
  console.log('  npm run logs search "user logged in" 50');
  console.log('  npm run logs recent 200');
  process.exit(1);
}

const logManagerCommand = commandMap[subCommand];
if (!logManagerCommand) {
  console.log(`Unknown command: ${subCommand}`);
  process.exit(1);
}

// Build the arguments for logManager
const logManagerArgs = [logManagerCommand, ...remainingArgs];

// Run the logManager script
const logManagerPath = path.join(process.cwd(), 'scripts', 'logManager.js');
const child = spawn('node', [logManagerPath, ...logManagerArgs], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code);
}); 