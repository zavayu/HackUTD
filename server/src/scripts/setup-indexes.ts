#!/usr/bin/env ts-node

/**
 * Database indexes setup script
 * This script can be run independently to set up database indexes
 */

import dotenv from 'dotenv';
import { connectDatabase, setupDatabaseIndexes, disconnectDatabase } from '../config/database';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

async function main() {
  try {
    logger.info('Starting database indexes setup...');
    
    // Connect to database
    await connectDatabase();
    
    // Setup indexes
    await setupDatabaseIndexes();
    
    logger.info('Database indexes setup completed successfully');
    
    // Disconnect
    await disconnectDatabase();
    
    process.exit(0);
  } catch (error) {
    logger.error('Failed to setup database indexes:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

export { main as setupIndexes };