import { Router, Request, Response } from 'express';
import { getDb } from '../../config/firestore.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Test Firestore connection
    const db = getDb();
    await db.collection('_health').limit(1).get();

    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          firestore: 'connected',
          api: 'running'
        },
        version: '1.0.0'
      }
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Health check failed',
        details: error.message
      }
    });
  }
});

export default router;
