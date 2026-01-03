import { Router, Request, Response, NextFunction } from 'express';
import { designService } from '../../services/designService.js';
import { CreateDesignInput } from '../../models/Design.js';

const router = Router();

// POST /api/v1/designs - Create new design
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: CreateDesignInput = req.body;

    if (!input.boxId && !input.customDimensions) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Either boxId or customDimensions is required'
        }
      });
    }

    const design = await designService.create(input);

    res.status(201).json({
      success: true,
      data: design,
      message: 'Design created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/designs/:id - Get design by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const design = await designService.getById(id);

    if (!design) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Design with ID ${id} not found`
        }
      });
    }

    res.json({
      success: true,
      data: design
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/designs - List designs
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const designs = await designService.list(limit, offset);

    res.json({
      success: true,
      data: {
        items: designs,
        total: designs.length,
        limit,
        offset
      }
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/designs/:id - Update design
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const design = await designService.update(id, updates);

    if (!design) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Design with ID ${id} not found`
        }
      });
    }

    res.json({
      success: true,
      data: design,
      message: 'Design updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/designs/:id - Delete design
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await designService.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Design with ID ${id} not found`
        }
      });
    }

    res.json({
      success: true,
      message: 'Design deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
