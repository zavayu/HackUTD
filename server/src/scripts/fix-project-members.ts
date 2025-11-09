/**
 * Migration script to add project owners to the members array
 * Run this once to fix existing projects
 */

import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

async function fixProjectMembers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/prodigy-pm';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all projects
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects to check`);

    let fixed = 0;
    let skipped = 0;

    for (const project of projects) {
      // Check if owner is already in members
      const ownerInMembers = project.members?.some(
        (member: any) => member.userId.toString() === project.userId.toString()
      );

      if (ownerInMembers) {
        console.log(`✓ Project "${project.name}" already has owner in members`);
        skipped++;
        continue;
      }

      // Get user info
      const user = await User.findById(project.userId);
      if (!user) {
        console.log(`⚠ User not found for project "${project.name}"`);
        continue;
      }

      // Add owner to members
      if (!project.members) {
        project.members = [];
      }

      project.members.push({
        userId: user._id,
        email: user.email,
        name: user.name || user.email,
        role: 'owner',
        addedAt: new Date()
      } as any);

      await project.save();
      console.log(`✅ Fixed project "${project.name}" - added owner to members`);
      fixed++;
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Fixed: ${fixed} projects`);
    console.log(`Skipped: ${skipped} projects (already correct)`);
    console.log(`Total: ${projects.length} projects`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
fixProjectMembers();
