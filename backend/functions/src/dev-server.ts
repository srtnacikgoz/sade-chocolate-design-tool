/**
 * Standalone Development Server
 * Firebase emulator yerine basit Express server
 * Java gerektirmeden çalışır
 */

import express from 'express';
import cors from 'cors';
import { corsMiddleware } from './api/middlewares/cors.js';
import { errorHandler, notFoundHandler } from './api/middlewares/errorHandler.js';

// Import routes
import healthRoutes from './api/routes/health.routes.js';
import designsRoutes from './api/routes/designs.routes.js';
import boxesRoutes from './api/routes/boxes.routes.js';
import workflowsRoutes from './api/routes/workflows.routes.js';
import exportRoutes from './api/routes/export.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes - API prefix for compatibility
app.use('/api/health', healthRoutes);
app.use('/api/v1/designs', designsRoutes);
app.use('/api/v1/boxes', boxesRoutes);
app.use('/api/v1/workflows', workflowsRoutes);
app.use('/api/v1/export', exportRoutes);

// Also support routes without /api prefix
app.use('/health', healthRoutes);
app.use('/v1/designs', designsRoutes);
app.use('/v1/boxes', boxesRoutes);
app.use('/v1/workflows', workflowsRoutes);
app.use('/v1/export', exportRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║    Sade Chocolate Design Tool - Dev Server                ║
╠═══════════════════════════════════════════════════════════╣
║  🚀 Server running on http://localhost:${PORT}              ║
║  📚 API Docs: http://localhost:${PORT}/health               ║
║                                                           ║
║  Available endpoints:                                     ║
║    GET  /api/health          - Health check               ║
║    GET  /api/v1/boxes        - List box templates         ║
║    POST /api/v1/designs      - Create design              ║
║    GET  /api/v1/designs/:id  - Get design                 ║
║    POST /api/v1/designs/:id/upload - Upload custom design ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
