import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GitHubRepo } from '../models/GitHubRepo';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env['MONGODB_URI'] || '';

async function migrateGitHubRepos() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all repos without projectId
    const reposWithoutProjectId = await GitHubRepo.find({ 
      projectId: { $exists: false } 
    });

    console.log(`Found ${reposWithoutProjectId.length} repositories without projectId`);

    if (reposWithoutProjectId.length === 0) {
      console.log('No migration needed!');
      process.exit(0);
    }

    console.log('\nOptions:');
    console.log('1. Delete all old repositories (users will need to reconnect)');
    console.log('2. Mark all old repositories as inactive');
    console.log('\nRecommended: Option 1 (clean start)\n');

    // For now, let's just delete them
    const result = await GitHubRepo.deleteMany({ 
      projectId: { $exists: false } 
    });

    console.log(`✅ Deleted ${result.deletedCount} old repositories`);
    console.log('Users will need to reconnect their repositories to projects.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateGitHubRepos();
