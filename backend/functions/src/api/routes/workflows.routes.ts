import { Router } from 'express';
import { workflowService } from '../../services/workflowService';

const router = Router();

/**
 * POST /api/v1/workflows/start
 * Yeni workflow başlatır
 */
router.post('/start', async (req, res, next) => {
  try {
    const { designId, type = 'full-pipeline' } = req.body;

    if (!designId) {
      return res.status(400).json({
        success: false,
        message: 'designId gerekli',
      });
    }

    // Workflow oluştur ve başlat
    const workflow = await workflowService.createAndStart(designId, type);

    res.status(201).json({
      success: true,
      data: workflow,
      message: 'Workflow başlatıldı',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/workflows/:id/status
 * Workflow durumunu getirir
 */
router.get('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;

    const workflow = await workflowService.getById(id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow bulunamadı',
      });
    }

    res.json({
      success: true,
      data: {
        id: workflow.id,
        status: workflow.status,
        currentStep: workflow.currentStep,
        steps: workflow.steps,
        startedAt: workflow.startedAt,
        completedAt: workflow.completedAt,
        error: workflow.error,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/workflows/:id
 * Workflow detaylarını getirir
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const workflow = await workflowService.getById(id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow bulunamadı',
      });
    }

    res.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/workflows
 * Tüm workflow'ları listeler
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, designId, limit } = req.query;

    const workflows = await workflowService.list(
      {
        status: status as any,
        designId: designId as string,
      },
      limit ? parseInt(limit as string) : 50
    );

    res.json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/workflows/:id/pause
 * Workflow'u durdurur
 */
router.post('/:id/pause', async (req, res, next) => {
  try {
    const { id } = req.params;

    await workflowService.pause(id);

    res.json({
      success: true,
      message: 'Workflow durduruldu',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/workflows/:id/resume
 * Workflow'u yeniden başlatır
 */
router.post('/:id/resume', async (req, res, next) => {
  try {
    const { id } = req.params;

    await workflowService.resume(id);

    res.json({
      success: true,
      message: 'Workflow yeniden başlatıldı',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/workflows/:id
 * Workflow'u siler
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await workflowService.delete(id);

    res.json({
      success: true,
      message: 'Workflow silindi',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
