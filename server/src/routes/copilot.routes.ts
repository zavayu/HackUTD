import { Router, Response, NextFunction } from 'express';
import { verifyToken } from '../middleware/auth';
import { geminiService } from '../services/gemini.service';
import { IssueService } from '../services/IssueService';
import { SprintService } from '../services/SprintService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { logger } from '../utils/logger';

const router = Router({ mergeParams: true });
const issueService = new IssueService();
const sprintService = new SprintService();
const projectRepository = new ProjectRepository();

/**
 * Chat with AI Copilot
 * POST /api/projects/:projectId/copilot/chat
 */
router.post('/:projectId/copilot/chat', verifyToken, async (req: any, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params['projectId']!;
    const userId = req.user.userId;
    const { message, conversationHistory } = req.body;

    logger.info('AI Copilot chat', { projectId, userId, message });

    // Get project context
    const project = await projectRepository.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get project data for context
    let issues: any[] = [];
    let sprints: any[] = [];
    
    try {
      [issues, sprints] = await Promise.all([
        issueService.listIssues(projectId, userId),
        sprintService.listSprints(projectId, userId)
      ]);
    } catch (error) {
      logger.warn('Could not fetch full project context', { error });
    }

    // Build context for AI
    const activeSprint = sprints.find((s: any) => s.status === 'active');
    const context = {
      projectName: project.name,
      projectDescription: project.description || '',
      totalIssues: issues.length,
      completedIssues: issues.filter((i: any) => i.status === 'done').length,
      inProgressIssues: issues.filter((i: any) => i.status === 'in_progress').length,
      backlogIssues: issues.filter((i: any) => i.status === 'backlog').length,
      activeSprint: activeSprint ? {
        name: activeSprint.name,
        goal: activeSprint.goal,
        issueCount: issues.filter((i: any) => i.sprintId === activeSprint._id).length
      } : null,
      totalSprints: sprints.length,
      recentIssues: issues.slice(0, 5).map((i: any) => ({
        title: i.title,
        type: i.type,
        status: i.status,
        priority: i.priority
      }))
    };

    // Build conversation context
    const conversationContext = conversationHistory 
      ? conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')
      : '';

    // Create prompt for Gemini
    const prompt = `You are an AI Project Management Copilot helping with project "${context.projectName}".

Project Context:
- Total Issues: ${context.totalIssues}
- Completed: ${context.completedIssues}
- In Progress: ${context.inProgressIssues}
- Backlog: ${context.backlogIssues}
- Active Sprint: ${context.activeSprint ? context.activeSprint.name : 'None'}
- Total Sprints: ${context.totalSprints}

${conversationContext ? `Previous conversation:\n${conversationContext}\n` : ''}

User message: ${message}

Provide a helpful, actionable response. If the user asks for actions (like creating stories, prioritizing, or sprint planning), provide specific recommendations. Keep responses concise and practical.`;

    // Get AI response
    const aiResponse = await geminiService.chat(prompt);

    return res.json({
      success: true,
      data: {
        message: aiResponse,
        context,
        suggestions: []
      }
    });

  } catch (error) {
    logger.error('AI Copilot chat error', {
      projectId: req.params['projectId'],
      error: error instanceof Error ? error.message : error
    });
    return next(error);
  }
});

/**
 * Get quick action suggestions
 * GET /api/projects/:projectId/copilot/suggestions
 */
router.get('/:projectId/copilot/suggestions', verifyToken, async (req: any, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params['projectId']!;
    const userId = req.user.userId;

    logger.info('Getting AI suggestions', { projectId, userId });

    // Get project data
    let issues: any[] = [];
    let sprints: any[] = [];
    
    try {
      [issues, sprints] = await Promise.all([
        issueService.listIssues(projectId, userId),
        sprintService.listSprints(projectId, userId)
      ]);
    } catch (error) {
      logger.warn('Could not fetch project data for suggestions', { error });
    }

    // Generate contextual suggestions
    const suggestions = [];

    // Sprint-related suggestions
    const activeSprint = sprints.find((s: any) => s.status === 'active');
    if (activeSprint) {
      const sprintIssues = issues.filter((i: any) => i.sprintId === activeSprint._id);
      const completedInSprint = sprintIssues.filter((i: any) => i.status === 'done').length;
      suggestions.push({
        type: 'sprint',
        title: 'Sprint Progress',
        description: `${completedInSprint}/${sprintIssues.length} issues completed in ${activeSprint.name}`,
        action: 'Summarize sprint progress'
      });
    } else {
      suggestions.push({
        type: 'sprint',
        title: 'No Active Sprint',
        description: 'Consider starting a new sprint',
        action: 'Plan next sprint'
      });
    }

    // Backlog suggestions
    const backlogIssues = issues.filter((i: any) => i.status === 'backlog');
    if (backlogIssues.length > 10) {
      suggestions.push({
        type: 'backlog',
        title: 'Large Backlog',
        description: `${backlogIssues.length} items in backlog`,
        action: 'Help prioritize backlog'
      });
    }

    // High priority suggestions
    const highPriorityIssues = issues.filter((i: any) => i.priority === 'high' && i.status !== 'done');
    if (highPriorityIssues.length > 0) {
      suggestions.push({
        type: 'priority',
        title: 'High Priority Items',
        description: `${highPriorityIssues.length} high priority issues need attention`,
        action: 'Review high priority items'
      });
    }

    return res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    logger.error('Failed to get suggestions', {
      projectId: req.params['projectId'],
      error: error instanceof Error ? error.message : error
    });
    return next(error);
  }
});

export default router;
