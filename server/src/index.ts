// Main server entry point
// This file will be implemented in later tasks

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('ProdigyPM Backend - Project structure initialized');
console.log('Environment:', process.env['NODE_ENV'] || 'development');
console.log('Port:', process.env['PORT'] || 5000);

export {};