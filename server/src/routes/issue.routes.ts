import { Router, Request, Response } from 'express';
import { Issue } from '../models/Issue';
import { Project } from '../models/Project';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all issues for a project
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

    const issues = await Issue.find({ projectId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      issues,
    });
  } catch (error: any) {
    console.error('Get issues error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: error.message,
    });
  }
});

// Get a single issue
router.get('/:issueId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: issue.projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      success: true,
      issue,
    });
  } catch (error: any) {
    console.error('Get issue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch issue',
      error: error.message,
    });
  }
});

// Create a new issue
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      projectId,
      title,
      description,
      type,
      status,
      priority,
      assignee,
      estimatedHours,
      acceptanceCriteria,
    } = req.body;

    if (!projectId || !title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, title, and type are required',
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

    const issue = new Issue({
      projectId,
      title,
      description: description || '',
      type,
      status: status || 'backlog',
      priority: priority || 'medium',
      assignee,
      estimatedHours,
      acceptanceCriteria: acceptanceCriteria || [],
    });

    await issue.save();

    return res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      issue,
    });
  } catch (error: any) {
    console.error('Create issue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create issue',
      error: error.message,
    });
  }
});

// Update an issue
router.put('/:issueId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { issueId } = req.params;
    const updates = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: issue.projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title',
      'description',
      'type',
      'status',
      'priority',
      'assignee',
      'estimatedHours',
      'acceptanceCriteria',
      'priorityScore',
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        (issue as any)[field] = updates[field];
      }
    });

    await issue.save();

    return res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      issue,
    });
  } catch (error: any) {
    console.error('Update issue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update issue',
      error: error.message,
    });
  }
});

// Delete an issue
router.delete('/:issueId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: issue.projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await issue.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete issue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete issue',
      error: error.message,
    });
  }
});

export default router;
