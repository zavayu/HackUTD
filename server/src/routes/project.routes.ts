import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { Issue } from '../models/Issue';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all projects for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const projects = await Project.find({ userId, status: 'active' })
      .sort({ createdAt: -1 });

    // Get story counts for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const storyCount = await Issue.countDocuments({ projectId: project._id });
        
        return {
          _id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          members: project.members || [],
          stats: {
            stories: storyCount,
            sprints: 0,
            members: (project.members?.length || 0) + 1, // +1 for owner
          },
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      projects: projectsWithStats,
    });
  } catch (error: any) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message,
    });
  }
});

// Get a single project by ID
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;

    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const storyCount = await Issue.countDocuments({ projectId: project._id });

    return res.status(200).json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
        members: project.members || [],
        stats: {
          stories: storyCount,
          sprints: 0,
          members: (project.members?.length || 0) + 1,
        },
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message,
    });
  }
});

// Create a new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required',
      });
    }

    const project = new Project({
      userId,
      name,
      description: description || '',
      status: 'active',
    });

    await project.save();

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
        stats: {
          stories: 0,
          sprints: 0,
          members: 1,
        },
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message,
    });
  }
});

// Update a project
router.put('/:projectId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();

    const storyCount = await Issue.countDocuments({ projectId: project._id });

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
        stats: {
          stories: storyCount,
          sprints: 0,
          members: 1,
        },
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message,
    });
  }
});

// Delete a project
router.delete('/:projectId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;

    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await project.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message,
    });
  }
});

// Get project members
router.get('/:projectId/members', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;

    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      success: true,
      members: project.members || [],
    });
  } catch (error: any) {
    console.error('Get members error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message,
    });
  }
});

// Add member to project
router.post('/:projectId/members', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if member already exists
    const existingMember = project.members?.find(m => m.email === email);
    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: 'Member already exists in project',
      });
    }

    // Look up user by email
    const User = mongoose.model('User');
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found',
      });
    }

    const newMember = {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: role || 'member',
      addedAt: new Date(),
    };

    if (!project.members) {
      project.members = [];
    }
    project.members.push(newMember);
    await project.save();

    return res.status(201).json({
      success: true,
      message: 'Member added successfully',
      member: newMember,
    });
  } catch (error: any) {
    console.error('Add member error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add member',
      error: error.message,
    });
  }
});

// Remove member from project
router.delete('/:projectId/members/:memberEmail', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId, memberEmail } = req.params;

    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!project.members) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const memberIndex = project.members.findIndex(m => m.email === memberEmail);
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    project.members.splice(memberIndex, 1);
    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error: any) {
    console.error('Remove member error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove member',
      error: error.message,
    });
  }
});

export default router;
