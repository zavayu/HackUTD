import { Router, Response, NextFunction } from 'express';
import { verifyToken } from '../middleware/auth';
import { geminiService } from '../services/gemini.service';
import { IssueService } from '../services/IssueService';
import { SprintService } from '../services/SprintService';
import { logger } from '../utils/logger';

const router = Router();
const issueService = new IssueService();
const sprintService = new SprintService();

/**
 * Get AI-powered insights for a project
 * GET /api/projects/:projectId/insights
 */
router.get('/:projectId/insights', verifyToken, async (req: any, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params['projectId']!;
    const userId = req.user.userId;

    logger.info('Generating AI insights', { projectId, userId });

    // Fetch project data with error handling
    let issues: any[] = [];
    let sprints: any[] = [];
    
    try {
      [issues, sprints] = await Promise.all([
        issueService.listIssues(projectId, userId),
        sprintService.listSprints(projectId, userId)
      ]);
    } catch (permissionError) {
      logger.warn('Permission error fetching project data, returning empty insights', { 
        projectId, 
        userId,
        error: permissionError instanceof Error ? permissionError.message : permissionError 
      });
      // Return empty insights if user doesn't have permission
      return res.json({
        success: true,
        data: {
          kpis: {
            totalIssues: 0,
            completedIssues: 0,
            inProgressIssues: 0,
            completionRate: 0,
            avgCycleTime: 0,
            activeSprints: 0
          },
          sprintVelocity: [],
          teamPerformance: [],
          aiInsights: [{
            title: 'No Data Available',
            description: 'Add issues and sprints to this project to see insights.',
            type: 'info'
          }]
        }
      });
    }

    // Calculate sprint velocity
    const sprintVelocity = sprints.map((sprint: any) => {
      const sprintId = String(sprint._id);
      
      const sprintIssues = issues.filter((issue: any) => {
        if (!issue.sprintId) return false;
        // Handle both populated sprint object and ObjectId
        const issueSprintId = issue.sprintId._id 
          ? String(issue.sprintId._id)  // Populated sprint object
          : String(issue.sprintId);      // Plain ObjectId
        return issueSprintId === sprintId;
      });
      const completed = sprintIssues.filter((i: any) => i.status === 'done').length;
      const planned = sprintIssues.length;
      
      return {
        sprint: sprint.name,
        completed,
        planned
      };
    }).slice(-6); // Last 6 sprints

    // Calculate team performance
    const teamPerformance = issues.reduce((acc: any, issue: any) => {
      if (issue.assignee) {
        if (!acc[issue.assignee]) {
          acc[issue.assignee] = { member: issue.assignee, completed: 0, inProgress: 0 };
        }
        if (issue.status === 'done') {
          acc[issue.assignee].completed++;
        } else if (issue.status === 'in_progress') {
          acc[issue.assignee].inProgress++;
        }
      }
      return acc;
    }, {});

    // Calculate KPIs
    const totalIssues = issues.length;
    const completedIssues = issues.filter((i: any) => i.status === 'done').length;
    const inProgressIssues = issues.filter((i: any) => i.status === 'in_progress').length;
    const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    // Calculate average cycle time (days from in_progress to done)
    const completedWithDates = issues.filter((i: any) => 
      i.status === 'done' && i.updatedAt && i.createdAt
    );
    const avgCycleTime = completedWithDates.length > 0
      ? Math.round(
          completedWithDates.reduce((sum: number, issue: any) => {
            const days = Math.ceil(
              (new Date(issue.updatedAt).getTime() - new Date(issue.createdAt).getTime()) / 
              (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0) / completedWithDates.length
        )
      : 0;

    // Generate AI insights using Gemini
    const context = {
      totalIssues,
      completedIssues,
      inProgressIssues,
      completionRate,
      avgCycleTime,
      sprintCount: sprints.length,
      teamSize: Object.keys(teamPerformance).length
    };

    const aiInsightsPrompt = `Based on this project data, provide 3-4 key insights and recommendations:
    - Total Issues: ${totalIssues}
    - Completed: ${completedIssues}
    - In Progress: ${inProgressIssues}
    - Completion Rate: ${completionRate}%
    - Average Cycle Time: ${avgCycleTime} days
    - Active Sprints: ${sprints.filter((s: any) => s.status === 'active').length}
    - Team Size: ${context.teamSize}
    
    Format as JSON array of objects with: { title: string, description: string, type: 'success' | 'warning' | 'info' }`;

    let aiInsights = [];
    try {
      const aiResponse = await geminiService.generateStory(aiInsightsPrompt, JSON.stringify(context));
      // Parse AI response
      const jsonMatch = aiResponse.title.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiInsights = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.warn('Failed to generate AI insights', { error });
      // Fallback insights
      aiInsights = [
        {
          title: 'Good Progress',
          description: `Your team has completed ${completedIssues} issues with a ${completionRate}% completion rate.`,
          type: 'success'
        }
      ];
    }

    return res.json({
      success: true,
      data: {
        kpis: {
          totalIssues,
          completedIssues,
          inProgressIssues,
          completionRate,
          avgCycleTime,
          activeSprints: sprints.filter((s: any) => s.status === 'active').length
        },
        sprintVelocity,
        teamPerformance: Object.values(teamPerformance),
        aiInsights
      }
    });

  } catch (error) {
    logger.error('Failed to generate insights', {
      projectId: req.params['projectId'],
      error: error instanceof Error ? error.message : error
    });
    return next(error);
  }
});

export default router;
