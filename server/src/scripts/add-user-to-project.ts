/**
 * Script to add a user to a project
 */

import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

async function addUserToProject() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/prodigy-pm';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // User to add
    const userEmail = 'vegayuz@gmail.com';
    const projectId = '69104cfdc46b7db1475e1a9a'; // Prodigy PM

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`❌ User ${userEmail} not found`);
      process.exit(1);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      console.log(`❌ Project not found`);
      process.exit(1);
    }

    // Check if already a member
    const userId = user._id as any;
    const alreadyMember = project.members?.some(
      (member: any) => member.userId.toString() === userId.toString()
    );

    if (alreadyMember) {
      console.log(`✓ ${userEmail} is already a member of "${project.name}"`);
    } else {
      // Add user as member
      if (!project.members) {
        project.members = [];
      }

      project.members.push({
        userId: userId,
        email: user.email,
        name: user.name || user.email,
        role: 'member',
        addedAt: new Date()
      } as any);

      await project.save();
      console.log(`✅ Added ${userEmail} as member to "${project.name}"`);
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

// Run the script
addUserToProject();
