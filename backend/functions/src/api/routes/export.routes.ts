import { Router, Request, Response, NextFunction } from 'express';
import { Timestamp } from 'firebase-admin/firestore';
import { designService } from '../../services/designService.js';
import { boxService } from '../../services/boxService.js';
import { SVGGenerator } from '../../services/svgGenerator.js';
import { pdfExportService } from '../../services/pdfExportService.js';

const router = Router();

/**
 * GET /api/v1/export/:designId/svg
 * Export design die-line as SVG
 */
router.get('/:designId/svg', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { designId } = req.params;
    const { download } = req.query;

    // Get design
    const design = await designService.getById(designId);
    if (!design) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Design with ID ${designId} not found`
        }
      });
    }

    // Check if design has technical drawing with SVG content
    if (design.technicalDrawing?.svgContent) {
      const svgContent = design.technicalDrawing.svgContent;

      if (download === 'true') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Content-Disposition', `attachment; filename="sade-chocolate-${designId}.svg"`);
        return res.send(svgContent);
      }

      return res.json({
        success: true,
        data: {
          svg: svgContent,
          dimensions: design.technicalDrawing.dieLineData?.dimensions,
          bleed: design.technicalDrawing.bleedArea,
        }
      });
    }

    // If no pre-generated SVG, generate on-the-fly
    const box = await boxService.getById(design.boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${design.boxId} not found`
        }
      });
    }

    const generator = new SVGGenerator();
    const result = generator.generateDieLine(box);

    if (download === 'true') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="sade-chocolate-${designId}.svg"`);
      return res.send(result.svg);
    }

    res.json({
      success: true,
      data: {
        svg: result.svg,
        dimensions: result.flatDimensions,
        bleed: 3,
        generated: true,
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/export/:designId/svg/preview
 * Generate SVG preview without saving
 */
router.get('/:designId/svg/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { designId } = req.params;

    // Get design
    const design = await designService.getById(designId);
    if (!design) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Design with ID ${designId} not found`
        }
      });
    }

    // Get box template
    const box = await boxService.getById(design.boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${design.boxId} not found`
        }
      });
    }

    // Generate SVG
    const generator = new SVGGenerator();
    const result = generator.generateDieLine(box);

    res.json({
      success: true,
      data: {
        svg: result.svg,
        dieLineData: result.dieLineData,
        foldLines: result.foldLines,
        flatDimensions: result.flatDimensions,
        boxInfo: {
          id: box.id,
          name: box.name,
          dimensions: box.dimensions,
          type: box.type,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/export/:designId/svg/generate
 * Generate and save SVG to design
 */
router.post('/:designId/svg/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { designId } = req.params;

    // Get design
    const design = await designService.getById(designId);
    if (!design) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Design with ID ${designId} not found`
        }
      });
    }

    // Get box template
    const box = await boxService.getById(design.boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${design.boxId} not found`
        }
      });
    }

    // Generate SVG
    const generator = new SVGGenerator();
    const technicalDrawing = await generator.generateTechnicalDrawing(box);

    // Update design with technical drawing
    const updatedDesign = await designService.update(designId, {
      technicalDrawing: {
        svgUrl: '', // Would be Firebase Storage URL in production
        svgContent: technicalDrawing.svgContent,
        dieLineData: technicalDrawing.dieLineData!,
        foldLines: technicalDrawing.foldLines!,
        bleedArea: technicalDrawing.bleedArea!,
        completedAt: Timestamp.now(),
      }
    });

    if (!updatedDesign) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update design with technical drawing'
        }
      });
    }

    res.json({
      success: true,
      data: {
        designId,
        technicalDrawing: updatedDesign.technicalDrawing,
        message: 'SVG generated and saved successfully'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/export/box/:boxId/preview
 * Preview SVG for a box template (without creating design)
 */
router.get('/box/:boxId/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boxId } = req.params;

    // Get box template
    const box = await boxService.getById(boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${boxId} not found`
        }
      });
    }

    // Generate SVG
    const generator = new SVGGenerator();
    const result = generator.generateDieLine(box);

    res.json({
      success: true,
      data: {
        svg: result.svg,
        dieLineData: result.dieLineData,
        foldLines: result.foldLines,
        flatDimensions: result.flatDimensions,
        boxInfo: {
          id: box.id,
          name: box.name,
          dimensions: box.dimensions,
          type: box.type,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/export/:designId/dieline-only
 * Export ONLY die-line (cut/fold lines) without artwork
 * For print house / die-cutting department
 *
 * Query params:
 * - download=true : Download as file
 */
router.get('/:designId/dieline-only', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { designId } = req.params;
    const { download } = req.query;

    // Get design
    const design = await designService.getById(designId);
    if (!design) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Design with ID ${designId} not found`
        }
      });
    }

    // Get box template
    const box = await boxService.getById(design.boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${design.boxId} not found`
        }
      });
    }

    // Generate die-line-only SVG
    const generator = new SVGGenerator();
    const dieLineSvg = generator.generateDieLineOnly(box);

    if (download === 'true') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="sade-chocolate-${designId}-dieline-only.svg"`);
      return res.send(dieLineSvg);
    }

    res.json({
      success: true,
      data: {
        svg: dieLineSvg,
        boxInfo: {
          id: box.id,
          name: box.name,
          dimensions: box.dimensions,
          type: box.type,
        },
        notes: 'This SVG contains ONLY cut and fold lines. No artwork or colors included. For die-cutting department use.'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/export/box/:boxId/dieline-only
 * Export die-line-only for a box template (without creating design)
 * For die-maker to create cutting tools
 */
router.get('/box/:boxId/dieline-only', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boxId } = req.params;
    const { download } = req.query;

    // Get box template
    const box = await boxService.getById(boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${boxId} not found`
        }
      });
    }

    // Generate die-line-only SVG
    const generator = new SVGGenerator();
    const dieLineSvg = generator.generateDieLineOnly(box);

    if (download === 'true') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="box-${boxId}-dieline-only.svg"`);
      return res.send(dieLineSvg);
    }

    res.json({
      success: true,
      data: {
        svg: dieLineSvg,
        boxInfo: {
          id: box.id,
          name: box.name,
          dimensions: box.dimensions,
          type: box.type,
        },
        notes: 'Die-line only export. Use this for die-cutting tool creation.'
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// TWO-PIECE BOX ENDPOINTS (Base + Lid)
// ============================================

/**
 * GET /api/v1/export/:designId/tray-lid
 * Export two-piece box (base + lid) SVGs
 *
 * Query params:
 * - part=base : Only base SVG
 * - part=lid : Only lid SVG
 * - part=both (default) : Both SVGs
 */
router.get('/:designId/tray-lid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { designId } = req.params;
    const { part = 'both', download } = req.query;

    // Get design
    const design = await designService.getById(designId);
    if (!design) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Design with ID ${designId} not found`
        }
      });
    }

    // Get box template
    const box = await boxService.getById(design.boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${design.boxId} not found`
        }
      });
    }

    const generator = new SVGGenerator({
      visualDesign: design.visualDesign as any,
    });

    // Generate two-piece box set
    const trayLidSet = generator.generateTrayLidSet(box);

    if (part === 'base') {
      if (download === 'true') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Content-Disposition', `attachment; filename="sade-chocolate-${designId}-base.svg"`);
        return res.send(trayLidSet.base.svg);
      }
      return res.json({
        success: true,
        data: {
          svg: trayLidSet.base.svg,
          dimensions: trayLidSet.base.flatDimensions,
          part: 'base',
        }
      });
    }

    if (part === 'lid') {
      if (download === 'true') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Content-Disposition', `attachment; filename="sade-chocolate-${designId}-lid.svg"`);
        return res.send(trayLidSet.lid.svg);
      }
      return res.json({
        success: true,
        data: {
          svg: trayLidSet.lid.svg,
          dimensions: trayLidSet.lid.flatDimensions,
          part: 'lid',
        }
      });
    }

    // Both parts
    res.json({
      success: true,
      data: {
        base: {
          svg: trayLidSet.base.svg,
          dimensions: trayLidSet.base.flatDimensions,
          dieLineData: trayLidSet.base.dieLineData,
        },
        lid: {
          svg: trayLidSet.lid.svg,
          dimensions: trayLidSet.lid.flatDimensions,
          dieLineData: trayLidSet.lid.dieLineData,
        },
        totalFlatArea: trayLidSet.combined.totalFlatArea,
        boxInfo: {
          id: box.id,
          name: box.name,
          dimensions: box.dimensions,
          type: 'tray-lid',
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/export/box/:boxId/tray-lid
 * Export two-piece box for a box template (without design)
 */
router.get('/box/:boxId/tray-lid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boxId } = req.params;
    const { part = 'both' } = req.query;

    // Get box template
    const box = await boxService.getById(boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${boxId} not found`
        }
      });
    }

    const generator = new SVGGenerator();
    const trayLidSet = generator.generateTrayLidSet(box);

    if (part === 'base') {
      return res.json({
        success: true,
        data: {
          svg: trayLidSet.base.svg,
          dimensions: trayLidSet.base.flatDimensions,
          part: 'base',
        }
      });
    }

    if (part === 'lid') {
      return res.json({
        success: true,
        data: {
          svg: trayLidSet.lid.svg,
          dimensions: trayLidSet.lid.flatDimensions,
          part: 'lid',
        }
      });
    }

    // Both parts
    res.json({
      success: true,
      data: {
        base: {
          svg: trayLidSet.base.svg,
          dimensions: trayLidSet.base.flatDimensions,
        },
        lid: {
          svg: trayLidSet.lid.svg,
          dimensions: trayLidSet.lid.flatDimensions,
        },
        totalFlatArea: trayLidSet.combined.totalFlatArea,
        boxInfo: {
          id: box.id,
          name: box.name,
          dimensions: box.dimensions,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PDF EXPORT ENDPOINTS
// ============================================

/**
 * GET /api/v1/export/:designId/pdf
 * Export design as print-ready PDF
 *
 * Query params:
 * - download=true : Download as file
 * - includeBleed=true : Include bleed area in output
 */
router.get('/:designId/pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { designId } = req.params;
    const { download, includeBleed } = req.query;

    // Get design
    const design = await designService.getById(designId);
    if (!design) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Design with ID ${designId} not found`
        }
      });
    }

    // Get box template
    const box = await boxService.getById(design.boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${design.boxId} not found`
        }
      });
    }

    // Generate SVG first
    const generator = new SVGGenerator({
      visualDesign: design.visualDesign as any,
    });
    const svgResult = generator.generateDieLine(box);

    // Convert SVG to PDF
    const pdfResult = await pdfExportService.svgToPdf(svgResult.svg, {
      width: svgResult.flatDimensions.width,
      height: svgResult.flatDimensions.height,
      bleed: 3,
      includeBleed: includeBleed === 'true',
      title: `Sade Chocolate - ${box.name}`,
    });

    if (download === 'true') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
      return res.send(pdfResult.pdf);
    }

    // Return as base64 for preview
    res.json({
      success: true,
      data: {
        pdf: pdfResult.pdf.toString('base64'),
        filename: pdfResult.filename,
        pageSize: pdfResult.pageSize,
        metadata: pdfResult.metadata,
        boxInfo: {
          id: box.id,
          name: box.name,
          dimensions: box.dimensions,
          type: box.type,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/export/:designId/pdf/production-package
 * Export complete production package (Print PDF + Die-line PDF)
 *
 * Returns a JSON with both PDFs as base64
 */
router.get('/:designId/pdf/production-package', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { designId } = req.params;

    // Get design
    const design = await designService.getById(designId);
    if (!design) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Design with ID ${designId} not found`
        }
      });
    }

    // Get box template
    const box = await boxService.getById(design.boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${design.boxId} not found`
        }
      });
    }

    // Generate both SVGs
    const generator = new SVGGenerator({
      visualDesign: design.visualDesign as any,
    });
    const fullSvgResult = generator.generateDieLine(box);
    const dieLineSvg = generator.generateDieLineOnly(box);

    // Export production package
    const { printPdf, dieLinePdf } = await pdfExportService.exportProductionPackage(
      fullSvgResult.svg,
      dieLineSvg,
      {
        width: fullSvgResult.flatDimensions.width,
        height: fullSvgResult.flatDimensions.height,
        bleed: 3,
        includeBleed: true,
        title: box.name,
      }
    );

    res.json({
      success: true,
      data: {
        printPdf: {
          pdf: printPdf.pdf.toString('base64'),
          filename: printPdf.filename,
          pageSize: printPdf.pageSize,
          metadata: printPdf.metadata,
        },
        dieLinePdf: {
          pdf: dieLinePdf.pdf.toString('base64'),
          filename: dieLinePdf.filename,
          pageSize: dieLinePdf.pageSize,
          metadata: dieLinePdf.metadata,
        },
        boxInfo: {
          id: box.id,
          name: box.name,
          dimensions: box.dimensions,
          type: box.type,
        },
        notes: {
          printPdf: 'Full artwork with print marks, bleed, and safety zones',
          dieLinePdf: 'Cut and fold lines only for die-cutting department',
          colorProfile: 'FOGRA39 (ISO Coated v2)',
          pdfxNote: 'Convert to PDF/X-1a using Adobe Acrobat or Ghostscript for full compliance',
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/export/box/:boxId/pdf
 * Export box template as PDF (without creating design)
 */
router.get('/box/:boxId/pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boxId } = req.params;
    const { download } = req.query;

    // Get box template
    const box = await boxService.getById(boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Box template with ID ${boxId} not found`
        }
      });
    }

    // Generate SVG
    const generator = new SVGGenerator();
    const svgResult = generator.generateDieLine(box);

    // Convert to PDF
    const pdfResult = await pdfExportService.svgToPdf(svgResult.svg, {
      width: svgResult.flatDimensions.width,
      height: svgResult.flatDimensions.height,
      bleed: 3,
      includeBleed: true,
      title: `Box Template - ${box.name}`,
    });

    if (download === 'true') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
      return res.send(pdfResult.pdf);
    }

    res.json({
      success: true,
      data: {
        pdf: pdfResult.pdf.toString('base64'),
        filename: pdfResult.filename,
        pageSize: pdfResult.pageSize,
        metadata: pdfResult.metadata,
        boxInfo: {
          id: box.id,
          name: box.name,
          dimensions: box.dimensions,
          type: box.type,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
