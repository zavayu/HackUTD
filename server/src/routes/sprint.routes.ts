import { Router, Request, Response } from 'express';
import { Sprint } from '../models/Sprint';
import { Project } from '../models/Project';
import { Issue } from '../models/Issue';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all sprints for a project
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;

    // Verify project belongs to user
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const sprints = await Sprint.find({ projectId }).sort({ startDate: -1 });

    // Get issue counts for each sprint
    const sprintsWithStats = await Promise.all(
      sprints.map(async (sprint) => {
        const totalIssues = await Issue.countDocuments({ sprintId: sprint._id });
        const completedIssues = await Issue.countDocuments({ 
          sprintId: sprint._id, 
          status: 'done' 
        });

        return {
          ...sprint.toJSON(),
          stats: {
            totalIssues,
            completedIssues,
            completionRate: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      sprints: sprintsWithStats,
    });
  } catch (error: any) {
    console.error('Get sprints error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sprints',
      error: error.message,
    });
  }
});

// Get active sprint for a project
router.get('/project/:projectId/active', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId } = req.params;

    // Verify project belongs to user
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const activeSprint = await Sprint.findOne({ projectId, status: 'active' });

    if (!activeSprint) {
      return res.status(404).json({
        success: false,
        message: 'No active sprint found',
      });
    }

    const totalIssues = await Issue.countDocuments({ sprintId: activeSprint._id });
    const completedIssues = await Issue.countDocuments({ 
      sprintId: activeSprint._id, 
      status: 'done' 
    });

    return res.status(200).json({
      success: true,
      sprint: {
        ...activeSprint.toJSON(),
        stats: {
          totalIssues,
          completedIssues,
          completionRate: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Get active sprint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch active sprint',
      error: error.message,
    });
  }
});

// Create a new sprint
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { projectId, name, goal, startDate, endDate } = req.body;

    if (!projectId || !name || !goal || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, name, goal, start date, and end date are required',
      });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const sprint = new Sprint({
      projectId,
      name,
      goal,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'planned',
    });

    await sprint.save();

    return res.status(201).json({
      success: true,
      message: 'Sprint created successfully',
      sprint: {
        ...sprint.toJSON(),
        stats: {
          totalIssues: 0,
          completedIssues: 0,
          completionRate: 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Create sprint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create sprint',
      error: error.message,
    });
  }
});

// Start a sprint (set to active)
router.post('/:sprintId/start', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: sprint.projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if there's already an active sprint
    const existingActiveSprint = await Sprint.findOne({ 
      projectId: sprint.projectId, 
      status: 'active' 
    });

    if (existingActiveSprint) {
      return res.status(409).json({
        success: false,
        message: 'There is already an active sprint. Complete it before starting a new one.',
      });
    }

    sprint.status = 'active';
    await sprint.save();

    return res.status(200).json({
      success: true,
      message: 'Sprint started successfully',
      sprint: sprint.toJSON(),
    });
  } catch (error: any) {
    console.error('Start sprint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start sprint',
      error: error.message,
    });
  }
});

// Complete a sprint
router.post('/:sprintId/complete', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: sprint.projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    sprint.status = 'completed';
    await sprint.save();

    // Move incomplete issues back to backlog
    await Issue.updateMany(
      { sprintId: sprint._id, status: { $ne: 'done' } },
      { $unset: { sprintId: '' }, status: 'backlog' }
    );

    return res.status(200).json({
      success: true,
      message: 'Sprint completed successfully',
      sprint: sprint.toJSON(),
    });
  } catch (error: any) {
    console.error('Complete sprint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete sprint',
      error: error.message,
    });
  }
});

// Add issues to sprint
router.post('/:sprintId/issues', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { sprintId } = req.params;
    const { issueIds } = req.body;

    if (!issueIds || !Array.isArray(issueIds)) {
      return res.status(400).json({
        success: false,
        message: 'Issue IDs array is required',
      });
    }

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: sprint.projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Add issues to sprint
    await Issue.updateMany(
      { _id: { $in: issueIds }, projectId: sprint.projectId },
      { sprintId: sprint._id, status: 'todo' }
    );

    return res.status(200).json({
      success: true,
      message: 'Issues added to sprint successfully',
    });
  } catch (error: any) {
    console.error('Add issues to sprint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add issues to sprint',
      error: error.message,
    });
  }
});

// Remove issue from sprint (back to backlog)
router.delete('/:sprintId/issues/:issueId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { sprintId, issueId } = req.params;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: sprint.projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Remove issue from sprint
    await Issue.updateOne(
      { _id: issueId, sprintId: sprint._id },
      { $unset: { sprintId: '' }, status: 'backlog' }
    );

    return res.status(200).json({
      success: true,
      message: 'Issue removed from sprint',
    });
  } catch (error: any) {
    console.error('Remove issue from sprint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove issue from sprint',
      error: error.message,
    });
  }
});

export default router;
