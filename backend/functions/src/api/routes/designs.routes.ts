import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { Timestamp } from 'firebase-admin/firestore';
import { designService } from '../../services/designService.js';
import { storageService } from '../../services/storageService.js';
import { CreateDesignInput } from '../../models/Design.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only specific file types
    const allowedTypes = ['image/svg+xml', 'application/pdf', 'image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only SVG, PDF, PNG, and JPEG are allowed.'));
    }
  },
});

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

// POST /api/v1/designs/:id/upload - Upload custom design file
router.post('/:id/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    // Check if design exists
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

    // Upload file to Firebase Storage
    const { fileUrl, filePath } = await storageService.uploadFile(
      file.buffer,
      file.originalname,
      `designs/${id}`
    );

    // Determine file type from mimetype
    const fileTypeMap: Record<string, 'svg' | 'pdf' | 'png' | 'jpg' | 'jpeg'> = {
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
      'image/png': 'png',
      'image/jpeg': 'jpeg',
    };
    const fileType = fileTypeMap[file.mimetype] || 'png';

    // Update design with customDesign info
    const updatedDesign = await designService.update(id, {
      customDesign: {
        fileName: file.originalname,
        fileUrl,
        fileType,
        fileSize: file.size,
        uploadedAt: Timestamp.now(),
      }
    });

    res.json({
      success: true,
      data: {
        design: updatedDesign,
        upload: {
          fileName: file.originalname,
          fileUrl,
          fileType,
          fileSize: file.size,
        }
      },
      message: 'Custom design uploaded successfully'
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
