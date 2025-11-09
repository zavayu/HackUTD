import { Router } from 'express';
import authRoutes from './auth';
import githubRoutes from './github';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount GitHub routes
router.use('/github', githubRoutes);

export default router;