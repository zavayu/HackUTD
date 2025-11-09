import { Router, Request, Response } from 'express';
import { geminiService } from '../services/gemini.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { Project } from '../models/Project';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Generate a single story
router.post('/generate-story', async (req: Request, res: Response) => {
  try {
    const { prompt, projectId } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required',
      });
    }

    // Get project context if provided
    let context = '';
    if (projectId) {
      const userId = (req as any).userId;
      const project = await Project.findOne({ _id: projectId, userId });
      if (project) {
        context = `Project: ${project.name}\nDescription: ${project.description || 'No description'}`;
      }
    }

    const story = await geminiService.generateStory(prompt, context);

    return res.status(200).json({
      success: true,
      story,
    });
  } catch (error: any) {
    console.error('Generate story error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate story',
      error: error.message,
    });
  }
});

// Generate multiple stories
router.post('/generate-stories', async (req: Request, res: Response) => {
  try {
    const { prompt, count = 3, projectId } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required',
      });
    }

    // Get project context if provided
    let context = '';
    if (projectId) {
      const userId = (req as any).userId;
      const project = await Project.findOne({ _id: projectId, userId });
      if (project) {
        context = `Project: ${project.name}\nDescription: ${project.description || 'No description'}`;
      }
    }

    const stories = await geminiService.generateMultipleStories(prompt, count, context);

    return res.status(200).json({
      success: true,
      stories,
    });
  } catch (error: any) {
    console.error('Generate stories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate stories',
      error: error.message,
    });
  }
});

// Enhance an existing story
router.post('/enhance-story', async (req: Request, res: Response) => {
  try {
    const { story } = req.body;

    if (!story) {
      return res.status(400).json({
        success: false,
        message: 'Story data is required',
      });
    }

    const enhancedStory = await geminiService.enhanceStory(story);

    return res.status(200).json({
      success: true,
      story: enhancedStory,
    });
  } catch (error: any) {
    console.error('Enhance story error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to enhance story',
      error: error.message,
    });
  }
});

export default router;
