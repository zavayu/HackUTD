/**
 * Script to check which user owns which projects
 */

import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

async function checkUserProjects() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/prodigy-pm';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users:\n`);

    for (const user of users) {
      console.log(`👤 User: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      
      // Find projects owned by this user
      const ownedProjects = await Project.find({ userId: user._id });
      console.log(`   Owns ${ownedProjects.length} projects:`);
      for (const project of ownedProjects) {
        console.log(`      - ${project.name} (ID: ${project._id})`);
        console.log(`        Members: ${project.members?.length || 0}`);
        if (project.members && project.members.length > 0) {
          for (const member of project.members) {
            const memberUser = await User.findById(member.userId);
            console.log(`          • ${memberUser?.email || 'Unknown'} (${member.role})`);
          }
        }
      }
      console.log('');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

// Run the check
checkUserProjects();
