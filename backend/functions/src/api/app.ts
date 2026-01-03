import express from 'express';
import { corsMiddleware } from './middlewares/cors.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Import routes
import healthRoutes from './routes/health.routes.js';
import designsRoutes from './routes/designs.routes.js';
import boxesRoutes from './routes/boxes.routes.js';
import workflowsRoutes from './routes/workflows.routes.js';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes (Cloud Function zaten /api path'inde, tekrar /api eklemeye gerek yok)
app.use('/health', healthRoutes);
app.use('/v1/designs', designsRoutes);
app.use('/v1/boxes', boxesRoutes);
app.use('/v1/workflows', workflowsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
