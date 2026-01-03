import { Router, Request, Response, NextFunction } from 'express';
import { boxService } from '../../services/boxService.js';

const router = Router();

// GET /api/v1/boxes - List all box templates
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as string;

    let boxes;
    if (type) {
      boxes = await boxService.getByType(type);
    } else {
      boxes = await boxService.list();
    }

    res.json({
      success: true,
      data: {
        items: boxes,
        total: boxes.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/boxes/:id - Get box template by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const box = await boxService.getById(id);

    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${id} not found`
        }
      });
    }

    res.json({
      success: true,
      data: box
    });
  } catch (error) {
    next(error);
  }
});

export default router;
