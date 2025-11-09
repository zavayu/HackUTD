import { Router } from 'express';
import authRoutes from './auth.routes';
import githubRoutes from './github';
import projectRoutes from './project.routes';
import issueRoutes from './issue.routes';
import sprintRoutes from './sprint.routes';
import aiRoutes from './ai.routes';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount GitHub routes
router.use('/github', githubRoutes);

// Mount project routes
router.use('/projects', projectRoutes);

// Mount issue routes
router.use('/issues', issueRoutes);

// Mount sprint routes
router.use('/sprints', sprintRoutes);

// Mount AI routes
router.use('/ai', aiRoutes);

export default router;