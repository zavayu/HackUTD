import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';
import githubRoutes from './routes/github';
import projectRoutes from './routes/project.routes';
import issueRoutes from './routes/issue.routes';
import sprintRoutes from './routes/sprint.routes';
import aiRoutes from './routes/ai.routes';

const app: Application = express();
const PORT = process.env['PORT'] || 5000;
const MONGODB_URI = process.env['MONGODB_URI'] || '';
const FRONTEND_URL = (process.env['FRONTEND_URL'] || 'http://localhost:5173').replace(/\/$/, ''); // Remove trailing slash

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ProdigyPM Backend is running' });
});

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;
