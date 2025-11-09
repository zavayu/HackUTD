import mongoose from 'mongoose';
import { logger } from '../utils/logger';

interface DatabaseConfig {
  uri: string;
  dbName: string;
  options: mongoose.ConnectOptions;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

class DatabaseConnection {
  private config: DatabaseConfig;
  private retryConfig: RetryConfig;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;

  constructor() {
    this.config = {
      uri: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/prodigypm',
      dbName: process.env['MONGODB_DB_NAME'] || 'prodigypm',
      options: {
        // Connection pooling configuration
        maxPoolSize: 10, // Maximum number of connections in the pool
        minPoolSize: 2,  // Minimum number of connections in the pool
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        serverSelectionTimeoutMS: 5000, // How long to try selecting a server
        socketTimeoutMS: 45000, // How long a send or receive on a socket can take
        bufferCommands: false, // Disable mongoose buffering
        heartbeatFrequencyMS: 10000, // Frequency of heartbeat checks
        // Additional options for reliability
        retryWrites: true,
        retryReads: true,
      }
    };

    this.retryConfig = {
      maxRetries: 5,
      baseDelay: 1000, // Start with 1 second
      maxDelay: 30000  // Cap at 30 seconds
    };

    this.setupEventListeners();
  }

  /**
   * Connect to MongoDB with retry logic and exponential backoff
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    this.connectionAttempts = 0;
    await this.connectWithRetry();
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.info('Database already disconnected');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isConnected: boolean;
    readyState: number;
    host?: string;
    name?: string;
  } {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  }

  /**
   * Setup database indexes for all collections
   */
  async setupIndexes(): Promise<void> {
    try {
      logger.info('Setting up database indexes...');

      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }

      // User collection indexes
      await db.collection('users').createIndex(
        { email: 1 }, 
        { unique: true, background: true }
      );

      // Project collection indexes
      await db.collection('projects').createIndex(
        { userId: 1 }, 
        { background: true }
      );
      await db.collection('projects').createIndex(
        { userId: 1, status: 1 }, 
        { background: true }
      );

      // Issue collection indexes
      await db.collection('issues').createIndex(
        { projectId: 1 }, 
        { background: true }
      );
      await db.collection('issues').createIndex(
        { sprintId: 1 }, 
        { background: true, sparse: true }
      );
      await db.collection('issues').createIndex(
        { projectId: 1, status: 1 }, 
        { background: true }
      );
      await db.collection('issues').createIndex(
        { projectId: 1, priority: 1 }, 
        { background: true }
      );

      // Sprint collection indexes
      await db.collection('sprints').createIndex(
        { projectId: 1 }, 
        { background: true }
      );
      await db.collection('sprints').createIndex(
        { projectId: 1, status: 1 }, 
        { background: true }
      );

      // GitHubRepo collection indexes
      await db.collection('githubrepos').createIndex(
        { userId: 1 }, 
        { background: true }
      );
      await db.collection('githubrepos').createIndex(
        { userId: 1, isActive: 1 }, 
        { background: true }
      );
      await db.collection('githubrepos').createIndex(
        { fullName: 1 }, 
        { unique: true, background: true }
      );

      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error setting up database indexes:', error);
      throw error;
    }
  }

  /**
   * Connect with retry logic and exponential backoff
   */
  private async connectWithRetry(): Promise<void> {
    while (this.connectionAttempts < this.retryConfig.maxRetries) {
      try {
        this.connectionAttempts++;
        
        logger.info(`Attempting to connect to database (attempt ${this.connectionAttempts}/${this.retryConfig.maxRetries})`);
        
        await mongoose.connect(this.config.uri, this.config.options);
        
        this.isConnected = true;
        logger.info(`Database connected successfully to ${this.config.dbName}`);
        
        // Setup indexes after successful connection
        await this.setupIndexes();
        
        return;
      } catch (error) {
        logger.error(`Database connection attempt ${this.connectionAttempts} failed:`, error);
        
        if (this.connectionAttempts >= this.retryConfig.maxRetries) {
          logger.error('Max connection attempts reached. Giving up.');
          throw new Error(`Failed to connect to database after ${this.retryConfig.maxRetries} attempts: ${error}`);
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, this.connectionAttempts - 1),
          this.retryConfig.maxDelay
        );
        
        logger.info(`Retrying connection in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }

  /**
   * Setup event listeners for connection monitoring
   */
  private setupEventListeners(): void {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      logger.warn('Mongoose disconnected from MongoDB');
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      logger.info('Mongoose reconnected to MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT. Closing database connection...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM. Closing database connection...');
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Utility function to sleep for a given number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const databaseConnection = new DatabaseConnection();

// Export the instance and utility functions
export { databaseConnection };

/**
 * Initialize database connection
 */
export const connectDatabase = async (): Promise<void> => {
  await databaseConnection.connect();
};

/**
 * Close database connection
 */
export const disconnectDatabase = async (): Promise<void> => {
  await databaseConnection.disconnect();
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = () => {
  return databaseConnection.getConnectionStatus();
};

/**
 * Setup database indexes
 */
export const setupDatabaseIndexes = async (): Promise<void> => {
  await databaseConnection.setupIndexes();
};