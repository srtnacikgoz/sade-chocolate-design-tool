import Handlebars from 'handlebars';
import { BoxTemplate, DieLineData, FoldLine, TechnicalDrawing, VisualDesign } from '../types/design.types.js';
import { hexToCmyk, formatCmykString, generateCmykComment, calculateInkCoverage } from '../utils/colorConversion.js';

/**
 * SVG Generator Service
 * Generates die-line SVG drawings for chocolate box packaging
 */

// SVG Layer colors and styles
const SVG_STYLES = {
  cutLine: {
    stroke: '#000000',
    strokeWidth: 0.5,
    fill: 'none',
  },
  foldLine: {
    stroke: '#FF0000',
    strokeWidth: 0.3,
    strokeDasharray: '5,3',
    fill: 'none',
  },
  bleedArea: {
    stroke: '#FF6B6B',
    strokeWidth: 0.4,
    strokeDasharray: '4,2',
    fill: 'rgba(255, 107, 107, 0.05)',
  },
  safetyZone: {
    stroke: '#4CAF50',
    strokeWidth: 0.3,
    strokeDasharray: '6,3',
    fill: 'rgba(76, 175, 80, 0.03)',
  },
  glueTab: {
    stroke: '#0066CC',
    strokeWidth: 0.3,
    fill: 'rgba(0, 102, 204, 0.1)',
  },
};

// Standard measurements
const DEFAULTS = {
  bleed: 3, // mm
  safetyZone: 3, // mm (inside trim line)
  glueTabWidth: 15, // mm
  cornerRadius: 0, // mm (0 for sharp corners)
};

interface BoxDimensions {
  length: number; // X axis (mm)
  width: number;  // Y axis (mm)
  height: number; // Z axis (mm)
}

interface SVGGeneratorOptions {
  bleed?: number;
  includeBleedLines?: boolean;
  includeGlueTabs?: boolean;
  showDimensions?: boolean;
  scale?: number; // 1 = 1:1 scale (1mm = 1 SVG unit)
  visualDesign?: VisualDesign; // AI-generated visual design
}

interface DieLineResult {
  svg: string;
  dieLineData: DieLineData;
  foldLines: FoldLine[];
  flatDimensions: {
    width: number;
    height: number;
  };
}

export class SVGGenerator {
  private bleed: number;
  private options: SVGGeneratorOptions;

  constructor(options: SVGGeneratorOptions = {}) {
    this.bleed = options.bleed ?? DEFAULTS.bleed;
    this.options = {
      includeBleedLines: true,
      includeGlueTabs: true,
      showDimensions: false,
      scale: 1,
      ...options,
    };
  }

  /**
   * Generate die-line SVG for a box template
   */
  generateDieLine(box: BoxTemplate): DieLineResult {
    switch (box.type) {
      case 'gift':
        return this.generateGiftBoxDieLine(box.dimensions);
      case 'truffle':
        return this.generateTruffleBoxDieLine(box.dimensions);
      case 'bar':
        return this.generateBarBoxDieLine(box.dimensions);
      case 'seasonal':
        // Seasonal boxes use gift box structure with variations
        return this.generateGiftBoxDieLine(box.dimensions);
      case 'tray-lid':
        // Two-piece box - return base by default, use generateTrayLidSet for both
        return this.generateTrayBase(box.dimensions);
      default:
        return this.generateGiftBoxDieLine(box.dimensions);
    }
  }

  /**
   * Generate TWO-PIECE BOX SET (Base + Lid)
   * Returns both SVGs for chocolate box with separate tray and lid
   */
  generateTrayLidSet(box: BoxTemplate): {
    base: DieLineResult;
    lid: DieLineResult;
    combined: {
      baseSvg: string;
      lidSvg: string;
      totalFlatArea: number; // mm²
    };
  } {
    const baseDims = box.dimensions;

    // Lid dimensions - slightly larger to fit over base
    // Typically: lid is 2mm larger on each side, and shorter in height
    const lidOverlap = 2; // mm overlap on each side
    const lidDims = box.lidDimensions || {
      length: baseDims.length + (lidOverlap * 2),
      width: baseDims.width + (lidOverlap * 2),
      height: Math.min(baseDims.height * 0.4, 25), // Lid height ~40% of base or max 25mm
    };

    const base = this.generateTrayBase(baseDims);
    const lid = this.generateTrayLid(lidDims, box.lidType || 'telescopic');

    const totalFlatArea =
      (base.flatDimensions.width * base.flatDimensions.height) +
      (lid.flatDimensions.width * lid.flatDimensions.height);

    return {
      base,
      lid,
      combined: {
        baseSvg: base.svg,
        lidSvg: lid.svg,
        totalFlatArea,
      },
    };
  }

  /**
   * TRAY BASE Generator (Alt Tepsi)
   * Simple tray with corner locks for chocolates
   *
   * Layout:
   *        ┌────────────┐
   *        │   FLAP     │
   *   ┌────┼────────────┼────┐
   *   │SIDE│    BASE    │SIDE│
   *   └────┼────────────┼────┘
   *        │   FLAP     │
   *        └────────────┘
   */
  generateTrayBase(dims: BoxDimensions): DieLineResult {
    const { length, width, height } = dims;
    const bleed = this.bleed;

    // Flat dimensions for tray
    const flatWidth = length + (height * 2) + (bleed * 2);
    const flatHeight = width + (height * 2) + (bleed * 2);

    const ox = bleed + height; // Origin X (start of base)
    const oy = bleed + height; // Origin Y (start of base)

    // Generate cut path
    const cutPath = this.generateTrayCutPathWithLocks(dims, bleed);
    const foldLines = this.generateTrayBaseFoldLines(dims, bleed);

    const svg = this.renderSVG({
      width: flatWidth,
      height: flatHeight,
      cutPaths: [cutPath],
      foldLines,
      bleed,
      title: 'TRAY BASE (Alt Tepsi)',
    });

    return {
      svg,
      dieLineData: {
        cutPath,
        dimensions: { flatWidth, flatHeight },
      },
      foldLines,
      flatDimensions: { width: flatWidth, height: flatHeight },
    };
  }

  /**
   * Generate tray cut path with corner ear locks
   */
  private generateTrayCutPathWithLocks(dims: BoxDimensions, bleed: number): string {
    const { length, width, height } = dims;
    const earSize = height * 0.7; // Corner ear size

    // Starting points
    const ox = bleed;
    const oy = bleed;

    let path = '';

    // Top edge with corner cuts
    path += `M ${ox + height} ${oy}`;
    path += ` L ${ox + height + length} ${oy}`;

    // Top-right corner ear
    path += ` L ${ox + height + length} ${oy + height - earSize}`;
    path += ` L ${ox + height + length + earSize} ${oy + height}`;
    path += ` L ${ox + height + length + height} ${oy + height}`;

    // Right edge
    path += ` L ${ox + height + length + height} ${oy + height + width}`;

    // Bottom-right corner ear
    path += ` L ${ox + height + length + earSize} ${oy + height + width}`;
    path += ` L ${ox + height + length} ${oy + height + width + earSize}`;
    path += ` L ${ox + height + length} ${oy + height + width + height}`;

    // Bottom edge
    path += ` L ${ox + height} ${oy + height + width + height}`;

    // Bottom-left corner ear
    path += ` L ${ox + height} ${oy + height + width + earSize}`;
    path += ` L ${ox + height - earSize} ${oy + height + width}`;
    path += ` L ${ox} ${oy + height + width}`;

    // Left edge
    path += ` L ${ox} ${oy + height}`;

    // Top-left corner ear
    path += ` L ${ox + height - earSize} ${oy + height}`;
    path += ` L ${ox + height} ${oy + height - earSize}`;
    path += ` L ${ox + height} ${oy}`;

    path += ' Z';

    return path;
  }

  /**
   * Generate fold lines for tray base
   */
  private generateTrayBaseFoldLines(dims: BoxDimensions, bleed: number): FoldLine[] {
    const { length, width, height } = dims;
    const ox = bleed;
    const oy = bleed;
    const folds: FoldLine[] = [];

    // Four main fold lines around the base
    folds.push({
      id: 'tray-fold-top',
      start: { x: ox + height, y: oy + height },
      end: { x: ox + height + length, y: oy + height },
      type: 'valley',
    });

    folds.push({
      id: 'tray-fold-bottom',
      start: { x: ox + height, y: oy + height + width },
      end: { x: ox + height + length, y: oy + height + width },
      type: 'valley',
    });

    folds.push({
      id: 'tray-fold-left',
      start: { x: ox + height, y: oy + height },
      end: { x: ox + height, y: oy + height + width },
      type: 'valley',
    });

    folds.push({
      id: 'tray-fold-right',
      start: { x: ox + height + length, y: oy + height },
      end: { x: ox + height + length, y: oy + height + width },
      type: 'valley',
    });

    return folds;
  }

  /**
   * TRAY LID Generator (Üst Kapak)
   * Lid that fits over the base tray
   */
  generateTrayLid(dims: BoxDimensions, lidType: string = 'telescopic'): DieLineResult {
    const { length, width, height } = dims;
    const bleed = this.bleed;

    // Flat dimensions for lid
    const flatWidth = length + (height * 2) + (bleed * 2);
    const flatHeight = width + (height * 2) + (bleed * 2);

    // Generate cut path based on lid type
    let cutPath: string;
    let foldLines: FoldLine[];

    if (lidType === 'telescopic') {
      cutPath = this.generateTelescopicLidCutPath(dims, bleed);
      foldLines = this.generateTelescopicLidFoldLines(dims, bleed);
    } else {
      // Default to simple lid
      cutPath = this.generateSimpleLidCutPath(dims, bleed);
      foldLines = this.generateSimpleLidFoldLines(dims, bleed);
    }

    const svg = this.renderSVG({
      width: flatWidth,
      height: flatHeight,
      cutPaths: [cutPath],
      foldLines,
      bleed,
      title: 'TRAY LID (Üst Kapak)',
    });

    return {
      svg,
      dieLineData: {
        cutPath,
        dimensions: { flatWidth, flatHeight },
      },
      foldLines,
      flatDimensions: { width: flatWidth, height: flatHeight },
    };
  }

  /**
   * Telescopic lid - sides that slide over the base
   */
  private generateTelescopicLidCutPath(dims: BoxDimensions, bleed: number): string {
    const { length, width, height } = dims;
    const ox = bleed;
    const oy = bleed;

    // Simple rectangular lid with sides
    let path = '';

    // Outer rectangle with corner notches for folding
    path += `M ${ox + height} ${oy}`;
    path += ` L ${ox + height + length} ${oy}`;
    path += ` L ${ox + height + length} ${oy + height}`;
    path += ` L ${ox + height + length + height} ${oy + height}`;
    path += ` L ${ox + height + length + height} ${oy + height + width}`;
    path += ` L ${ox + height + length} ${oy + height + width}`;
    path += ` L ${ox + height + length} ${oy + height + width + height}`;
    path += ` L ${ox + height} ${oy + height + width + height}`;
    path += ` L ${ox + height} ${oy + height + width}`;
    path += ` L ${ox} ${oy + height + width}`;
    path += ` L ${ox} ${oy + height}`;
    path += ` L ${ox + height} ${oy + height}`;
    path += ` L ${ox + height} ${oy}`;
    path += ' Z';

    return path;
  }

  /**
   * Fold lines for telescopic lid
   */
  private generateTelescopicLidFoldLines(dims: BoxDimensions, bleed: number): FoldLine[] {
    const { length, width, height } = dims;
    const ox = bleed;
    const oy = bleed;
    const folds: FoldLine[] = [];

    // Four fold lines
    folds.push({
      id: 'lid-fold-top',
      start: { x: ox + height, y: oy + height },
      end: { x: ox + height + length, y: oy + height },
      type: 'valley',
    });

    folds.push({
      id: 'lid-fold-bottom',
      start: { x: ox + height, y: oy + height + width },
      end: { x: ox + height + length, y: oy + height + width },
      type: 'valley',
    });

    folds.push({
      id: 'lid-fold-left',
      start: { x: ox + height, y: oy + height },
      end: { x: ox + height, y: oy + height + width },
      type: 'valley',
    });

    folds.push({
      id: 'lid-fold-right',
      start: { x: ox + height + length, y: oy + height },
      end: { x: ox + height + length, y: oy + height + width },
      type: 'valley',
    });

    return folds;
  }

  /**
   * Simple lid cut path (fallback)
   */
  private generateSimpleLidCutPath(dims: BoxDimensions, bleed: number): string {
    return this.generateTelescopicLidCutPath(dims, bleed);
  }

  /**
   * Simple lid fold lines (fallback)
   */
  private generateSimpleLidFoldLines(dims: BoxDimensions, bleed: number): FoldLine[] {
    return this.generateTelescopicLidFoldLines(dims, bleed);
  }

  /**
   * Gift Box Die-Line Generator
   * Standard lid-base gift box (kapaklı kutu)
   *
   * Layout:
   *                    ┌──────┐
   *                    │ TAB  │
   *           ┌────────┼──────┼────────┐
   *           │  SIDE  │ TOP  │  SIDE  │
   *    ┌──────┼────────┼──────┼────────┼──────┐
   *    │ TAB  │  SIDE  │ BASE │  SIDE  │ TAB  │
   *    └──────┼────────┼──────┼────────┼──────┘
   *           │  SIDE  │BOTTOM│  SIDE  │
   *           └────────┼──────┼────────┘
   *                    │ TAB  │
   *                    └──────┘
   */
  private generateGiftBoxDieLine(dims: BoxDimensions): DieLineResult {
    const { length, width, height } = dims;
    const bleed = this.bleed;
    const tabWidth = DEFAULTS.glueTabWidth;

    // Calculate flat dimensions
    const flatWidth = (height * 2) + (length * 2) + (tabWidth * 2) + (bleed * 2);
    const flatHeight = (height * 2) + width + (bleed * 2);

    // Origin offset for bleed
    const ox = bleed;
    const oy = bleed;

    // Key points for the die-line
    const paths: string[] = [];
    const foldLines: FoldLine[] = [];

    // Main cut path - outer boundary
    const cutPath = this.generateGiftBoxCutPath(dims, ox, oy, tabWidth);
    paths.push(cutPath);

    // Generate fold lines
    const folds = this.generateGiftBoxFoldLines(dims, ox, oy, tabWidth);
    foldLines.push(...folds);

    // Generate SVG
    const svg = this.renderSVG({
      width: flatWidth,
      height: flatHeight,
      cutPaths: paths,
      foldLines,
      bleed: this.options.includeBleedLines ? bleed : 0,
      visualDesign: this.options.visualDesign,
    });

    return {
      svg,
      dieLineData: {
        cutPath,
        dimensions: {
          flatWidth,
          flatHeight,
        },
      },
      foldLines,
      flatDimensions: {
        width: flatWidth,
        height: flatHeight,
      },
    };
  }

  /**
   * Generate the cut path for a gift box
   */
  private generateGiftBoxCutPath(
    dims: BoxDimensions,
    ox: number,
    oy: number,
    tabWidth: number
  ): string {
    const { length, width, height } = dims;

    // All coordinates relative to origin (ox, oy)
    // Starting from top-left of the flat pattern

    const points: Array<{ x: number; y: number }> = [];

    // Top tab (above top panel)
    const topTabStart = ox + tabWidth + height;
    const topTabWidth = length;
    const topTabHeight = tabWidth * 0.7; // Tapered tab

    // Start at top-left of top tab
    points.push({ x: topTabStart + tabWidth * 0.3, y: oy });
    points.push({ x: topTabStart + topTabWidth - tabWidth * 0.3, y: oy });
    points.push({ x: topTabStart + topTabWidth, y: oy + topTabHeight });

    // Right side going down
    points.push({ x: ox + tabWidth + height + length + height, y: oy + topTabHeight });
    points.push({ x: ox + tabWidth + height + length + height, y: oy + topTabHeight + height });

    // Right tab
    points.push({ x: ox + tabWidth + height + length + height + tabWidth, y: oy + topTabHeight + height + tabWidth * 0.3 });
    points.push({ x: ox + tabWidth + height + length + height + tabWidth, y: oy + topTabHeight + height + width - tabWidth * 0.3 });

    // Continue right side
    points.push({ x: ox + tabWidth + height + length + height, y: oy + topTabHeight + height + width });
    points.push({ x: ox + tabWidth + height + length + height, y: oy + topTabHeight + height + width + height });

    // Bottom side going left
    points.push({ x: topTabStart + topTabWidth, y: oy + topTabHeight + height + width + height });
    points.push({ x: topTabStart + topTabWidth - tabWidth * 0.3, y: oy + topTabHeight + height + width + height + topTabHeight });
    points.push({ x: topTabStart + tabWidth * 0.3, y: oy + topTabHeight + height + width + height + topTabHeight });
    points.push({ x: topTabStart, y: oy + topTabHeight + height + width + height });

    // Left side going up
    points.push({ x: ox + tabWidth, y: oy + topTabHeight + height + width + height });
    points.push({ x: ox + tabWidth, y: oy + topTabHeight + height + width });

    // Left tab
    points.push({ x: ox, y: oy + topTabHeight + height + width - tabWidth * 0.3 });
    points.push({ x: ox, y: oy + topTabHeight + height + tabWidth * 0.3 });

    // Continue left side up
    points.push({ x: ox + tabWidth, y: oy + topTabHeight + height });
    points.push({ x: ox + tabWidth, y: oy + topTabHeight });
    points.push({ x: topTabStart, y: oy + topTabHeight });

    // Create path string
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    path += ' Z';

    return path;
  }

  /**
   * Generate fold lines for gift box
   */
  private generateGiftBoxFoldLines(
    dims: BoxDimensions,
    ox: number,
    oy: number,
    tabWidth: number
  ): FoldLine[] {
    const { length, width, height } = dims;
    const folds: FoldLine[] = [];
    const topTabHeight = tabWidth * 0.7;

    // Vertical fold lines
    // Left side panel fold
    folds.push({
      id: 'fold-v1',
      start: { x: ox + tabWidth, y: oy + topTabHeight },
      end: { x: ox + tabWidth, y: oy + topTabHeight + height + width + height },
      type: 'valley',
    });

    // Left of center panel
    folds.push({
      id: 'fold-v2',
      start: { x: ox + tabWidth + height, y: oy },
      end: { x: ox + tabWidth + height, y: oy + topTabHeight + height + width + height + topTabHeight },
      type: 'mountain',
    });

    // Right of center panel
    folds.push({
      id: 'fold-v3',
      start: { x: ox + tabWidth + height + length, y: oy },
      end: { x: ox + tabWidth + height + length, y: oy + topTabHeight + height + width + height + topTabHeight },
      type: 'mountain',
    });

    // Right side panel fold
    folds.push({
      id: 'fold-v4',
      start: { x: ox + tabWidth + height + length + height, y: oy + topTabHeight },
      end: { x: ox + tabWidth + height + length + height, y: oy + topTabHeight + height + width + height },
      type: 'valley',
    });

    // Horizontal fold lines
    // Top panel top fold
    folds.push({
      id: 'fold-h1',
      start: { x: ox + tabWidth, y: oy + topTabHeight },
      end: { x: ox + tabWidth + height + length + height, y: oy + topTabHeight },
      type: 'mountain',
    });

    // Top panel bottom fold
    folds.push({
      id: 'fold-h2',
      start: { x: ox, y: oy + topTabHeight + height },
      end: { x: ox + tabWidth + height + length + height + tabWidth, y: oy + topTabHeight + height },
      type: 'valley',
    });

    // Base panel bottom fold
    folds.push({
      id: 'fold-h3',
      start: { x: ox, y: oy + topTabHeight + height + width },
      end: { x: ox + tabWidth + height + length + height + tabWidth, y: oy + topTabHeight + height + width },
      type: 'valley',
    });

    // Bottom panel fold
    folds.push({
      id: 'fold-h4',
      start: { x: ox + tabWidth, y: oy + topTabHeight + height + width + height },
      end: { x: ox + tabWidth + height + length + height, y: oy + topTabHeight + height + width + height },
      type: 'mountain',
    });

    return folds;
  }

  /**
   * Truffle Box Die-Line Generator (Simplified tray style)
   */
  private generateTruffleBoxDieLine(dims: BoxDimensions): DieLineResult {
    const { length, width, height } = dims;
    const bleed = this.bleed;

    // Simple tray box - no lid
    const flatWidth = length + (height * 2) + (bleed * 2);
    const flatHeight = width + (height * 2) + (bleed * 2);

    const ox = bleed + height;
    const oy = bleed + height;

    // Generate simple tray cut path
    const cutPath = this.generateTrayCutPath(dims, bleed);
    const foldLines = this.generateTrayFoldLines(dims, bleed);

    const svg = this.renderSVG({
      width: flatWidth,
      height: flatHeight,
      cutPaths: [cutPath],
      foldLines,
      bleed: this.options.includeBleedLines ? bleed : 0,
    });

    return {
      svg,
      dieLineData: {
        cutPath,
        dimensions: { flatWidth, flatHeight },
      },
      foldLines,
      flatDimensions: { width: flatWidth, height: flatHeight },
    };
  }

  /**
   * Generate tray cut path
   */
  private generateTrayCutPath(dims: BoxDimensions, bleed: number): string {
    const { length, width, height } = dims;
    const ox = bleed;
    const oy = bleed;

    // Simple cross pattern for tray
    let path = '';

    // Top flap
    path += `M ${ox + height} ${oy}`;
    path += ` L ${ox + height + length} ${oy}`;
    path += ` L ${ox + height + length} ${oy + height}`;

    // Right flap
    path += ` L ${ox + height + length + height} ${oy + height}`;
    path += ` L ${ox + height + length + height} ${oy + height + width}`;

    // Bottom right corner cut
    path += ` L ${ox + height + length} ${oy + height + width}`;
    path += ` L ${ox + height + length} ${oy + height + width + height}`;

    // Bottom flap
    path += ` L ${ox + height} ${oy + height + width + height}`;
    path += ` L ${ox + height} ${oy + height + width}`;

    // Left flap
    path += ` L ${ox} ${oy + height + width}`;
    path += ` L ${ox} ${oy + height}`;

    // Back to start
    path += ` L ${ox + height} ${oy + height}`;
    path += ` L ${ox + height} ${oy}`;
    path += ' Z';

    return path;
  }

  /**
   * Generate tray fold lines
   */
  private generateTrayFoldLines(dims: BoxDimensions, bleed: number): FoldLine[] {
    const { length, width, height } = dims;
    const ox = bleed;
    const oy = bleed;
    const folds: FoldLine[] = [];

    // Four main fold lines
    folds.push({
      id: 'tray-fold-top',
      start: { x: ox + height, y: oy + height },
      end: { x: ox + height + length, y: oy + height },
      type: 'valley',
    });

    folds.push({
      id: 'tray-fold-bottom',
      start: { x: ox + height, y: oy + height + width },
      end: { x: ox + height + length, y: oy + height + width },
      type: 'valley',
    });

    folds.push({
      id: 'tray-fold-left',
      start: { x: ox + height, y: oy + height },
      end: { x: ox + height, y: oy + height + width },
      type: 'valley',
    });

    folds.push({
      id: 'tray-fold-right',
      start: { x: ox + height + length, y: oy + height },
      end: { x: ox + height + length, y: oy + height + width },
      type: 'valley',
    });

    return folds;
  }

  /**
   * Bar Box Die-Line Generator (Sleeve style)
   */
  private generateBarBoxDieLine(dims: BoxDimensions): DieLineResult {
    const { length, width, height } = dims;
    const bleed = this.bleed;

    // Sleeve wrapper - wraps around the bar
    const flatWidth = (width * 2) + (height * 2) + bleed * 2;
    const flatHeight = length + bleed * 2;

    const cutPath = this.generateSleeveCutPath(dims, bleed);
    const foldLines = this.generateSleeveFoldLines(dims, bleed);

    const svg = this.renderSVG({
      width: flatWidth,
      height: flatHeight,
      cutPaths: [cutPath],
      foldLines,
      bleed: this.options.includeBleedLines ? bleed : 0,
    });

    return {
      svg,
      dieLineData: {
        cutPath,
        dimensions: { flatWidth, flatHeight },
      },
      foldLines,
      flatDimensions: { width: flatWidth, height: flatHeight },
    };
  }

  /**
   * Generate sleeve cut path
   */
  private generateSleeveCutPath(dims: BoxDimensions, bleed: number): string {
    const { length, width, height } = dims;
    const ox = bleed;
    const oy = bleed;
    const totalWidth = (width * 2) + (height * 2);

    return `M ${ox} ${oy} L ${ox + totalWidth} ${oy} L ${ox + totalWidth} ${oy + length} L ${ox} ${oy + length} Z`;
  }

  /**
   * Generate sleeve fold lines
   */
  private generateSleeveFoldLines(dims: BoxDimensions, bleed: number): FoldLine[] {
    const { length, width, height } = dims;
    const ox = bleed;
    const oy = bleed;
    const folds: FoldLine[] = [];

    // Vertical fold lines for wrapping
    folds.push({
      id: 'sleeve-fold-1',
      start: { x: ox + width, y: oy },
      end: { x: ox + width, y: oy + length },
      type: 'valley',
    });

    folds.push({
      id: 'sleeve-fold-2',
      start: { x: ox + width + height, y: oy },
      end: { x: ox + width + height, y: oy + length },
      type: 'valley',
    });

    folds.push({
      id: 'sleeve-fold-3',
      start: { x: ox + width * 2 + height, y: oy },
      end: { x: ox + width * 2 + height, y: oy + length },
      type: 'valley',
    });

    return folds;
  }

  /**
   * Render complete SVG document
   */
  private renderSVG(params: {
    width: number;
    height: number;
    cutPaths: string[];
    foldLines: FoldLine[];
    bleed: number;
    visualDesign?: VisualDesign;
    title?: string;
  }): string {
    const { width, height, cutPaths, foldLines, bleed, visualDesign, title } = params;

    // Add some padding for viewBox
    const padding = 10;
    const viewBoxWidth = width + padding * 2;
    const viewBoxHeight = height + padding * 2;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     viewBox="${-padding} ${-padding} ${viewBoxWidth} ${viewBoxHeight}"
     width="${viewBoxWidth}mm"
     height="${viewBoxHeight}mm"
     style="background-color: white;">

  <!-- ${title || 'Sade Chocolate Die-Line Drawing'} -->
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Unit: millimeters (mm) -->

  <!-- ============================================ -->
  <!-- PRINT PRODUCTION SPECIFICATIONS -->
  <!-- ============================================ -->

  <!-- PDF/X-1a:2001 Compliance Target -->
  <!-- For conversion to PDF/X-1a using Ghostscript or Adobe Acrobat -->

  <!-- COLOR MANAGEMENT -->
  <!-- Color Space: CMYK -->
  <!-- ICC Profile: FOGRA39 (ISO Coated v2 / ECI) -->
  <!-- Profile File: ISOcoated_v2_300_eci.icc -->
  <!-- Characterization Data: FOGRA39L.txt -->
  <!-- ISO Standard: ISO 12647-2:2013 (Offset lithographic) -->
  <!-- Substrate: Coated paper, gloss or matte, 115-150 gsm -->
  <!-- Screen Ruling: 60 l/cm (150 lpi) -->
  <!-- Dot Gain @ 50%: 11-13% -->
  <!-- Total Ink Coverage: ≤330% (max) -->
  <!-- Rendering Intent: Perceptual (0) or Relative Colorimetric (1) -->

  <!-- OUTPUT INTENT -->
  <!-- OutputConditionIdentifier: FOGRA39 -->
  <!-- OutputCondition: Offset printing, coated paper, positive plates -->
  <!-- RegistryName: http://www.color.org -->
  <!-- Info: ISO 12647-2:2004/Amd 1, OFCOM, paper type 1 or 2 -->

  <!-- DOCUMENT STRUCTURE -->
  <!-- TrimBox (Finished Size): ${width - bleed * 2}mm × ${height - bleed * 2}mm -->
  <!-- BleedBox (With Bleed): ${width}mm × ${height}mm -->
  <!-- MediaBox (Full Page): ${viewBoxWidth}mm × ${viewBoxHeight}mm -->
  <!-- Bleed: ${bleed}mm on all sides -->
  <!-- Safety Zone: ${DEFAULTS.safetyZone}mm inside trim (critical content area) -->

  <!-- FILE DELIVERY -->
  <!-- Format: PDF/X-1a:2001 (converted from this SVG) -->
  <!-- Fonts: Embedded or converted to outlines -->
  <!-- Images: 300 PPI minimum, CMYK only -->
  <!-- Transparency: Flattened (PDF/X-1a does not support transparency) -->

  <!-- PRINT FACILITY NOTES -->
  <!-- Compatible with: GS Packaging, Duran Doğan, OMAKS -->
  <!-- Approval required: Digital proof (color accurate) -->
  <!-- Production: Offset lithography, spot varnish/foil optional -->
  <!-- ============================================ -->

  <!-- DUBLIN CORE METADATA -->
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/">
      <rdf:Description>
        <dc:title>Sade Chocolate Box Die-Line</dc:title>
        <dc:creator>Sade Chocolate Design Tool (AI-Powered)</dc:creator>
        <dc:date>${new Date().toISOString()}</dc:date>
        <dc:format>image/svg+xml</dc:format>
        <dc:type>Technical Drawing / Die-Line</dc:type>
        <dc:description>
          Print-ready die-line drawing for chocolate box packaging.
          Includes bleed, safety zones, and CMYK color annotations.
          Target: PDF/X-1a:2001 with FOGRA39 color profile.
        </dc:description>
        <dc:subject>packaging, die-line, chocolate box, offset printing, CMYK</dc:subject>
        <dc:rights>© ${new Date().getFullYear()} Sade Chocolate. All rights reserved.</dc:rights>
      </rdf:Description>
    </rdf:RDF>

    <!-- CUSTOM PRINT METADATA -->
    <print-spec xmlns="http://sade.vardiya.com/print-spec">
      <color-profile>
        <name>FOGRA39</name>
        <icc-profile>ISOcoated_v2_300_eci.icc</icc-profile>
        <rendering-intent>Perceptual</rendering-intent>
        <characterization-data>FOGRA39L.txt</characterization-data>
      </color-profile>
      <dimensions unit="mm">
        <trim width="${width - bleed * 2}" height="${height - bleed * 2}" />
        <bleed width="${width}" height="${height}" margin="${bleed}" />
        <safety margin="${DEFAULTS.safetyZone}" />
      </dimensions>
      <compliance>
        <standard>PDF/X-1a:2001</standard>
        <iso>ISO 12647-2:2013</iso>
        <output-intent>FOGRA39</output-intent>
      </compliance>
    </print-spec>
  </metadata>

  <defs>
    <style>
      .cut-line {
        stroke: ${SVG_STYLES.cutLine.stroke};
        stroke-width: ${SVG_STYLES.cutLine.strokeWidth};
        fill: ${SVG_STYLES.cutLine.fill};
      }
      .fold-line {
        stroke: ${SVG_STYLES.foldLine.stroke};
        stroke-width: ${SVG_STYLES.foldLine.strokeWidth};
        stroke-dasharray: ${SVG_STYLES.foldLine.strokeDasharray};
        fill: ${SVG_STYLES.foldLine.fill};
      }
      .fold-line-mountain {
        stroke: ${SVG_STYLES.foldLine.stroke};
        stroke-width: ${SVG_STYLES.foldLine.strokeWidth};
        stroke-dasharray: 8,3;
        fill: none;
      }
      .fold-line-valley {
        stroke: #CC0000;
        stroke-width: ${SVG_STYLES.foldLine.strokeWidth};
        stroke-dasharray: 3,3;
        fill: none;
      }
      .bleed-line {
        stroke: ${SVG_STYLES.bleedArea.stroke};
        stroke-width: ${SVG_STYLES.bleedArea.strokeWidth};
        stroke-dasharray: ${SVG_STYLES.bleedArea.strokeDasharray};
        fill: ${SVG_STYLES.bleedArea.fill};
      }
      .safety-zone {
        stroke: ${SVG_STYLES.safetyZone.stroke};
        stroke-width: ${SVG_STYLES.safetyZone.strokeWidth};
        stroke-dasharray: ${SVG_STYLES.safetyZone.strokeDasharray};
        fill: ${SVG_STYLES.safetyZone.fill};
      }
      .dimension-text {
        font-family: Arial, sans-serif;
        font-size: 3px;
        fill: #666666;
      }
      .zone-label {
        font-family: Arial, sans-serif;
        font-size: 2.5px;
        fill: #666666;
        font-weight: normal;
      }
    </style>
  </defs>

  <!-- Production Zones -->
  ${this.renderProductionZones(width, height, bleed)}

  <!-- Cut Lines (Die Lines) -->
  <g id="cut-layer">
    ${cutPaths.map((path, i) => `<path d="${path}" class="cut-line" id="cut-path-${i}" />`).join('\n    ')}
  </g>

  <!-- Fold Lines -->
  <g id="fold-layer">
    ${foldLines.map(fold => `
    <line x1="${fold.start.x}" y1="${fold.start.y}" x2="${fold.end.x}" y2="${fold.end.y}"
          class="fold-line-${fold.type}" id="${fold.id}" />`).join('')}
  </g>

  ${visualDesign ? this.renderVisualDesignLayers(visualDesign, width, height, bleed) : ''}

  ${this.renderPrintMarks(width, height, bleed)}

  <!-- Legend -->
  <g id="legend" transform="translate(${width - 50}, ${height - 20})">
    <line x1="0" y1="0" x2="15" y2="0" class="cut-line" />
    <text x="18" y="1" class="dimension-text">Kesim</text>

    <line x1="0" y1="6" x2="15" y2="6" class="fold-line-mountain" />
    <text x="18" y="7" class="dimension-text">Katlama (Dağ)</text>

    <line x1="0" y1="12" x2="15" y2="12" class="fold-line-valley" />
    <text x="18" y="13" class="dimension-text">Katlama (Vadi)</text>
  </g>

</svg>`;

    return svg;
  }

  /**
   * Generate technical drawing result with SVG content
   */
  async generateTechnicalDrawing(box: BoxTemplate): Promise<Partial<TechnicalDrawing>> {
    const result = this.generateDieLine(box);

    return {
      svgContent: result.svg,
      dieLineData: result.dieLineData,
      foldLines: result.foldLines,
      bleedArea: this.bleed,
      completedAt: new Date(),
    };
  }

  /**
   * Generate DIE-LINE ONLY SVG (for print house / die-cutting)
   * No artwork, no colors - only cut and fold lines
   * With overprint settings for proper plate separation
   */
  generateDieLineOnly(box: BoxTemplate): string {
    const result = this.generateDieLine(box);
    const { flatDimensions, foldLines } = result;
    const { width, height } = flatDimensions;

    const padding = 10;
    const viewBoxWidth = width + padding * 2;
    const viewBoxHeight = height + padding * 2;

    // Die-line only SVG (no visual design layers)
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="${-padding} ${-padding} ${viewBoxWidth} ${viewBoxHeight}"
     width="${viewBoxWidth}mm"
     height="${viewBoxHeight}mm"
     style="background-color: white;">

  <!-- DIE-LINE ONLY - For Die-Cutting / Print Production -->
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Unit: millimeters (mm) -->

  <!-- ============================================ -->
  <!-- PRODUCTION NOTES -->
  <!-- ============================================ -->
  <!-- This file contains ONLY cut and fold lines -->
  <!-- No artwork or color information included -->
  <!-- For die-maker and cutting department use -->
  <!-- Overprint: YES (prints on all plates as registration marks) -->
  <!-- Line Weight: Cut = 0.5pt, Fold = 0.3pt -->
  <!-- ============================================ -->

  <defs>
    <style>
      .cut-line {
        stroke: #000000; /* Registration black - prints on all plates */
        stroke-width: 0.5;
        fill: none;
        paint-order: stroke;
      }
      .fold-line-mountain {
        stroke: #FF0000; /* Red for mountain folds */
        stroke-width: 0.3;
        stroke-dasharray: 8,3;
        fill: none;
      }
      .fold-line-valley {
        stroke: #0000FF; /* Blue for valley folds */
        stroke-width: 0.3;
        stroke-dasharray: 3,3;
        fill: none;
      }
      .dimension-text {
        font-family: Arial, sans-serif;
        font-size: 2.5px;
        fill: #333333;
      }
    </style>
  </defs>

  <!-- METADATA -->
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/">
      <rdf:Description>
        <dc:title>Die-Line Only - ${box.type} Box</dc:title>
        <dc:creator>Sade Chocolate Design Tool</dc:creator>
        <dc:date>${new Date().toISOString()}</dc:date>
        <dc:type>Die-Line / Cutting Guide</dc:type>
        <dc:description>
          Cut and fold lines only. No artwork.
          For die-cutting department and plate-making.
        </dc:description>
      </rdf:Description>
    </rdf:RDF>
  </metadata>

  <!-- CUT LINES -->
  <g id="cut-layer">
    <path d="${result.dieLineData.cutPath}" class="cut-line" />
  </g>

  <!-- FOLD LINES -->
  <g id="fold-layer">
    ${foldLines.map(fold => `
    <line x1="${fold.start.x}" y1="${fold.start.y}" x2="${fold.end.x}" y2="${fold.end.y}"
          class="fold-line-${fold.type}" id="${fold.id}"
          data-fold-type="${fold.type}" />`).join('')}
  </g>

  <!-- DIMENSIONS -->
  <g id="dimensions">
    <text x="${width / 2}" y="${-padding / 2}" text-anchor="middle" class="dimension-text">
      Flat Size: ${width.toFixed(1)} × ${height.toFixed(1)} mm
    </text>
    <text x="${width / 2}" y="${height + padding / 2 + 3}" text-anchor="middle" class="dimension-text">
      Box: ${box.dimensions.length}×${box.dimensions.width}×${box.dimensions.height} mm (L×W×H)
    </text>
  </g>

  <!-- LEGEND -->
  <g id="legend" transform="translate(${padding}, ${height - 15})">
    <line x1="0" y1="0" x2="15" y2="0" class="cut-line" />
    <text x="18" y="1" class="dimension-text">Cut Line</text>

    <line x1="0" y1="6" x2="15" y2="6" class="fold-line-mountain" />
    <text x="18" y="7" class="dimension-text">Fold (Mountain)</text>

    <line x1="0" y1="12" x2="15" y2="12" class="fold-line-valley" />
    <text x="18" y="13" class="dimension-text">Fold (Valley)</text>
  </g>

</svg>`;

    return svg;
  }

  /**
   * Render production zones (bleed, trim, safety)
   * Visual guidelines for designers and print houses
   */
  private renderProductionZones(width: number, height: number, bleed: number): string {
    const zones: string[] = [];
    const safetyZone = DEFAULTS.safetyZone;

    // Calculate zone boundaries
    const trimX = 0;
    const trimY = 0;
    const trimWidth = width - bleed * 2;
    const trimHeight = height - bleed * 2;

    const safetyX = safetyZone;
    const safetyY = safetyZone;
    const safetyWidth = trimWidth - safetyZone * 2;
    const safetyHeight = trimHeight - safetyZone * 2;

    zones.push(`
  <!-- Production Zones Layer -->
  <g id="production-zones">

    <!-- 1. Bleed Area (${bleed}mm extend beyond trim) -->
    <!-- Artwork must extend to here to avoid white edges after cutting -->
    ${bleed > 0 ? `
    <rect x="${-bleed}" y="${-bleed}"
          width="${width}"
          height="${height}"
          class="bleed-line"
          data-zone="bleed"
          data-bleed="${bleed}mm" />

    <!-- Bleed Zone Labels -->
    <text x="${-bleed + 2}" y="${-bleed + 3}" class="zone-label" fill="#FF6B6B">
      BLEED ${bleed}mm
    </text>
    <text x="${width - bleed - 25}" y="${height - bleed - 1}" class="zone-label" fill="#FF6B6B">
      BLEED ${bleed}mm
    </text>` : ''}

    <!-- 2. Trim Box (Final cut line) -->
    <!-- This is where the box will be cut -->
    <rect x="${trimX}" y="${trimY}"
          width="${trimWidth}"
          height="${trimHeight}"
          fill="none"
          stroke="#333333"
          stroke-width="0.3"
          stroke-dasharray="8,4"
          data-zone="trim"
          data-dimensions="${trimWidth}×${trimHeight}mm" />

    <!-- Trim Box Labels -->
    <text x="${trimX + 2}" y="${trimY + 4}" class="zone-label" fill="#333">
      TRIM LINE (${trimWidth}×${trimHeight}mm)
    </text>

    <!-- 3. Safety Zone (${safetyZone}mm inside trim) -->
    <!-- All critical content (text, logos) must stay within this zone -->
    <!-- Prevents content from being cut off due to cutting tolerances -->
    <rect x="${safetyX}" y="${safetyY}"
          width="${safetyWidth}"
          height="${safetyHeight}"
          class="safety-zone"
          data-zone="safety"
          data-margin="${safetyZone}mm" />

    <!-- Safety Zone Labels -->
    <text x="${safetyX + 2}" y="${safetyY + 4}" class="zone-label" fill="#4CAF50">
      SAFE AREA (Keep text & logos here)
    </text>

    <!-- Corner Markers for Safety Zone -->
    ${this.renderCornerMarkers(safetyX, safetyY, safetyWidth, safetyHeight, '#4CAF50')}

    <!-- Zone Measurements -->
    ${this.renderZoneMeasurements(trimX, trimY, trimWidth, trimHeight, bleed, safetyZone)}

  </g>`);

    return zones.join('\n');
  }

  /**
   * Render corner markers for zone boundaries
   */
  private renderCornerMarkers(x: number, y: number, width: number, height: number, color: string): string {
    const markerSize = 5;
    return `
    <!-- Corner Markers -->
    <g stroke="${color}" stroke-width="0.4" fill="none">
      <!-- Top-Left -->
      <line x1="${x}" y1="${y}" x2="${x + markerSize}" y2="${y}" />
      <line x1="${x}" y1="${y}" x2="${x}" y2="${y + markerSize}" />

      <!-- Top-Right -->
      <line x1="${x + width}" y1="${y}" x2="${x + width - markerSize}" y2="${y}" />
      <line x1="${x + width}" y1="${y}" x2="${x + width}" y2="${y + markerSize}" />

      <!-- Bottom-Left -->
      <line x1="${x}" y1="${y + height}" x2="${x + markerSize}" y2="${y + height}" />
      <line x1="${x}" y1="${y + height}" x2="${x}" y2="${y + height - markerSize}" />

      <!-- Bottom-Right -->
      <line x1="${x + width}" y1="${y + height}" x2="${x + width - markerSize}" y2="${y + height}" />
      <line x1="${x + width}" y1="${y + height}" x2="${x + width}" y2="${y + height - markerSize}" />
    </g>`;
  }

  /**
   * Render measurement annotations for production zones
   */
  private renderZoneMeasurements(
    trimX: number,
    trimY: number,
    trimWidth: number,
    trimHeight: number,
    bleed: number,
    safetyZone: number
  ): string {
    const measurements: string[] = [];

    // Measurement line style
    const measurementColor = '#999999';
    const measurementStroke = 0.2;

    // Top bleed measurement (horizontal)
    measurements.push(`
    <!-- Bleed Measurements -->
    <g stroke="${measurementColor}" stroke-width="${measurementStroke}">
      <!-- Top Bleed -->
      <line x1="${-bleed}" y1="${-bleed / 2}" x2="${trimX}" y2="${-bleed / 2}"
            marker-start="url(#arrow)" marker-end="url(#arrow)" />
      <text x="${-bleed / 2}" y="${-bleed / 2 - 0.5}" text-anchor="middle" class="zone-label" fill="${measurementColor}">
        ${bleed}mm
      </text>

      <!-- Safety Zone Margin (Left) -->
      <line x1="${trimX + safetyZone / 2}" y1="${trimY}" x2="${trimX + safetyZone / 2}" y2="${trimY + safetyZone}"
            marker-start="url(#arrow)" marker-end="url(#arrow)" />
      <text x="${trimX + safetyZone / 2 + 1}" y="${trimY + safetyZone / 2}" class="zone-label" fill="${measurementColor}">
        ${safetyZone}mm
      </text>
    </g>`);

    return measurements.join('\n');
  }

  /**
   * Render print marks (crop marks, registration marks, color bars)
   * According to ISO 12647-2 standards
   */
  private renderPrintMarks(width: number, height: number, bleed: number): string {
    const marks: string[] = [];
    const trimX = 0;
    const trimY = 0;
    const trimWidth = width - bleed * 2;
    const trimHeight = height - bleed * 2;

    const markLength = 10; // 10mm crop mark length
    const markOffset = bleed + 4; // 4mm outside bleed (slug area)
    const markStroke = 0.25; // 0.25pt line weight

    // Registration color (100% all CMYK)
    const registrationColor = '#000000'; // Will print on all plates

    marks.push(`
  <!-- Print Marks (Crop & Registration) -->
  <!-- ISO 12647-2 Standard Marks -->
  <g id="print-marks" stroke="${registrationColor}" stroke-width="${markStroke}" fill="none">`);

    // CROP MARKS (4 corners)
    // Top-left corner
    marks.push(`
    <!-- Crop Marks -->
    <g id="crop-marks">
      <!-- Top-Left -->
      <line x1="${trimX - markLength}" y1="${trimY}" x2="${trimX - 2}" y2="${trimY}" />
      <line x1="${trimX}" y1="${trimY - markLength}" x2="${trimX}" y2="${trimY - 2}" />

      <!-- Top-Right -->
      <line x1="${trimX + trimWidth + 2}" y1="${trimY}" x2="${trimX + trimWidth + markLength}" y2="${trimY}" />
      <line x1="${trimX + trimWidth}" y1="${trimY - markLength}" x2="${trimX + trimWidth}" y2="${trimY - 2}" />

      <!-- Bottom-Left -->
      <line x1="${trimX - markLength}" y1="${trimY + trimHeight}" x2="${trimX - 2}" y2="${trimY + trimHeight}" />
      <line x1="${trimX}" y1="${trimY + trimHeight + 2}" x2="${trimX}" y2="${trimY + trimHeight + markLength}" />

      <!-- Bottom-Right -->
      <line x1="${trimX + trimWidth + 2}" y1="${trimY + trimHeight}" x2="${trimX + trimWidth + markLength}" y2="${trimY + trimHeight}" />
      <line x1="${trimX + trimWidth}" y1="${trimY + trimHeight + 2}" x2="${trimX + trimWidth}" y2="${trimY + trimHeight + markLength}" />
    </g>`);

    // REGISTRATION MARKS (circle with crosshairs)
    const regMarkSize = 5; // 5mm diameter
    const regMarkRadius = regMarkSize / 2;

    marks.push(`
    <!-- Registration Marks -->
    <g id="registration-marks">
      <!-- Top-Left Registration Mark -->
      <circle cx="${trimX - markOffset}" cy="${trimY - markOffset}" r="${regMarkRadius}"
              fill="none" stroke="${registrationColor}" stroke-width="0.2" />
      <line x1="${trimX - markOffset - regMarkRadius - 2}" y1="${trimY - markOffset}"
            x2="${trimX - markOffset + regMarkRadius + 2}" y2="${trimY - markOffset}"
            stroke="${registrationColor}" stroke-width="0.1" />
      <line x1="${trimX - markOffset}" y1="${trimY - markOffset - regMarkRadius - 2}"
            x2="${trimX - markOffset}" y2="${trimY - markOffset + regMarkRadius + 2}"
            stroke="${registrationColor}" stroke-width="0.1" />

      <!-- Top-Right Registration Mark -->
      <circle cx="${trimX + trimWidth + markOffset}" cy="${trimY - markOffset}" r="${regMarkRadius}"
              fill="none" stroke="${registrationColor}" stroke-width="0.2" />
      <line x1="${trimX + trimWidth + markOffset - regMarkRadius - 2}" y1="${trimY - markOffset}"
            x2="${trimX + trimWidth + markOffset + regMarkRadius + 2}" y2="${trimY - markOffset}"
            stroke="${registrationColor}" stroke-width="0.1" />
      <line x1="${trimX + trimWidth + markOffset}" y1="${trimY - markOffset - regMarkRadius - 2}"
            x2="${trimX + trimWidth + markOffset}" y2="${trimY - markOffset + regMarkRadius + 2}"
            stroke="${registrationColor}" stroke-width="0.1" />

      <!-- Bottom-Left Registration Mark -->
      <circle cx="${trimX - markOffset}" cy="${trimY + trimHeight + markOffset}" r="${regMarkRadius}"
              fill="none" stroke="${registrationColor}" stroke-width="0.2" />
      <line x1="${trimX - markOffset - regMarkRadius - 2}" y1="${trimY + trimHeight + markOffset}"
            x2="${trimX - markOffset + regMarkRadius + 2}" y2="${trimY + trimHeight + markOffset}"
            stroke="${registrationColor}" stroke-width="0.1" />
      <line x1="${trimX - markOffset}" y1="${trimY + trimHeight + markOffset - regMarkRadius - 2}"
            x2="${trimX - markOffset}" y2="${trimY + trimHeight + markOffset + regMarkRadius + 2}"
            stroke="${registrationColor}" stroke-width="0.1" />

      <!-- Bottom-Right Registration Mark -->
      <circle cx="${trimX + trimWidth + markOffset}" cy="${trimY + trimHeight + markOffset}" r="${regMarkRadius}"
              fill="none" stroke="${registrationColor}" stroke-width="0.2" />
      <line x1="${trimX + trimWidth + markOffset - regMarkRadius - 2}" y1="${trimY + trimHeight + markOffset}"
            x2="${trimX + trimWidth + markOffset + regMarkRadius + 2}" y2="${trimY + trimHeight + markOffset}"
            stroke="${registrationColor}" stroke-width="0.1" />
      <line x1="${trimX + trimWidth + markOffset}" y1="${trimY + trimHeight + markOffset - regMarkRadius - 2}"
            x2="${trimX + trimWidth + markOffset}" y2="${trimY + trimHeight + markOffset + regMarkRadius + 2}"
            stroke="${registrationColor}" stroke-width="0.1" />
    </g>`);

    // COLOR CONTROL BARS (bottom edge)
    const barWidth = 8;
    const barHeight = 5;
    const barStartX = trimX + 20;
    const barY = trimY + trimHeight + markOffset;

    marks.push(`
    <!-- Color Control Bars (CMYK) -->
    <g id="color-bars">
      <!-- 100% Cyan -->
      <rect x="${barStartX}" y="${barY}" width="${barWidth}" height="${barHeight}"
            fill="cyan" stroke="none" />
      <text x="${barStartX + barWidth / 2}" y="${barY + barHeight + 3}"
            text-anchor="middle" font-size="2" fill="#666">C100</text>

      <!-- 100% Magenta -->
      <rect x="${barStartX + barWidth + 2}" y="${barY}" width="${barWidth}" height="${barHeight}"
            fill="magenta" stroke="none" />
      <text x="${barStartX + barWidth + 2 + barWidth / 2}" y="${barY + barHeight + 3}"
            text-anchor="middle" font-size="2" fill="#666">M100</text>

      <!-- 100% Yellow -->
      <rect x="${barStartX + (barWidth + 2) * 2}" y="${barY}" width="${barWidth}" height="${barHeight}"
            fill="yellow" stroke="none" />
      <text x="${barStartX + (barWidth + 2) * 2 + barWidth / 2}" y="${barY + barHeight + 3}"
            text-anchor="middle" font-size="2" fill="#666">Y100</text>

      <!-- 100% Black -->
      <rect x="${barStartX + (barWidth + 2) * 3}" y="${barY}" width="${barWidth}" height="${barHeight}"
            fill="black" stroke="none" />
      <text x="${barStartX + (barWidth + 2) * 3 + barWidth / 2}" y="${barY + barHeight + 3}"
            text-anchor="middle" font-size="2" fill="#666">K100</text>

      <!-- 50% Tint Patches -->
      <rect x="${barStartX + (barWidth + 2) * 4 + 5}" y="${barY}" width="${barWidth}" height="${barHeight}"
            fill="cyan" opacity="0.5" stroke="none" />
      <text x="${barStartX + (barWidth + 2) * 4 + 5 + barWidth / 2}" y="${barY + barHeight + 3}"
            text-anchor="middle" font-size="2" fill="#666">C50</text>

      <rect x="${barStartX + (barWidth + 2) * 5 + 5}" y="${barY}" width="${barWidth}" height="${barHeight}"
            fill="magenta" opacity="0.5" stroke="none" />
      <text x="${barStartX + (barWidth + 2) * 5 + 5 + barWidth / 2}" y="${barY + barHeight + 3}"
            text-anchor="middle" font-size="2" fill="#666">M50</text>

      <rect x="${barStartX + (barWidth + 2) * 6 + 5}" y="${barY}" width="${barWidth}" height="${barHeight}"
            fill="yellow" opacity="0.5" stroke="none" />
      <text x="${barStartX + (barWidth + 2) * 6 + 5 + barWidth / 2}" y="${barY + barHeight + 3}"
            text-anchor="middle" font-size="2" fill="#666">Y50</text>

      <rect x="${barStartX + (barWidth + 2) * 7 + 5}" y="${barY}" width="${barWidth}" height="${barHeight}"
            fill="black" opacity="0.5" stroke="none" />
      <text x="${barStartX + (barWidth + 2) * 7 + 5 + barWidth / 2}" y="${barY + barHeight + 3}"
            text-anchor="middle" font-size="2" fill="#666">K50</text>
    </g>`);

    marks.push(`
  </g>`);

    return marks.join('\n');
  }

  /**
   * Render visual design layers (colors, logo, patterns, gold foil)
   */
  private renderVisualDesignLayers(
    visualDesign: VisualDesign,
    width: number,
    height: number,
    bleed: number
  ): string {
    const layers: string[] = [];

    // 1. Background Color Layer
    if (visualDesign.colorPalette?.colors?.length > 0) {
      const primaryColor = visualDesign.colorPalette.colors.find(c => c.role === 'primary');
      if (primaryColor) {
        const cmyk = hexToCmyk(primaryColor.hex);
        const cmykStr = formatCmykString(cmyk);
        const coverage = calculateInkCoverage(cmyk);

        layers.push(`
  <!-- Background Color Layer -->
  ${generateCmykComment(primaryColor.hex, `${primaryColor.name} - Primary`)}
  <!-- CMYK: ${cmykStr} | Ink Coverage: ${coverage}% -->
  <g id="background-layer" opacity="0.15">
    <rect x="${bleed}" y="${bleed}"
          width="${width - bleed * 2}"
          height="${height - bleed * 2}"
          fill="${primaryColor.hex}"
          data-cmyk="${cmykStr}" />
  </g>`);
      }
    }

    // 2. Logo Placement Layer
    if (visualDesign.logoPlacement) {
      const logo = visualDesign.logoPlacement;
      const logoX = logo.coordinates?.x || (width / 2);
      const logoY = logo.coordinates?.y || (height / 2);

      layers.push(`
  <!-- Logo Placement Layer -->
  <g id="logo-layer">
    <rect x="${logoX - (logo.size.width / 2)}"
          y="${logoY - (logo.size.height / 2)}"
          width="${logo.size.width}"
          height="${logo.size.height}"
          fill="none"
          stroke="#999"
          stroke-width="0.2"
          stroke-dasharray="2,1" />
    <text x="${logoX}"
          y="${logoY}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="Arial"
          font-size="4"
          fill="#999">LOGO</text>
  </g>`);
    }

    // 3. Gold Foil Areas Layer
    if (visualDesign.goldFoilAreas && visualDesign.goldFoilAreas.length > 0) {
      const foilElements = visualDesign.goldFoilAreas.map((foil, index) => `
    <rect x="${foil.coordinates.x}"
          y="${foil.coordinates.y}"
          width="${foil.dimensions.width}"
          height="${foil.dimensions.height}"
          fill="none"
          stroke="#D4A945"
          stroke-width="0.3"
          stroke-dasharray="3,1"
          id="foil-area-${index}" />
    <text x="${foil.coordinates.x + foil.dimensions.width / 2}"
          y="${foil.coordinates.y + foil.dimensions.height / 2}"
          text-anchor="middle"
          font-size="3"
          fill="#D4A945">${foil.foilColor.toUpperCase()} FOIL</text>`).join('');

      layers.push(`
  <!-- Gold Foil Areas Layer -->
  <g id="foil-layer">
    ${foilElements}
  </g>`);
    }

    // 4. Color Palette Reference with CMYK values
    if (visualDesign.colorPalette?.colors?.length > 0) {
      const swatchSize = 15;

      // Generate CMYK comments for all colors
      const cmykComments = visualDesign.colorPalette.colors
        .map(color => generateCmykComment(color.hex, color.name))
        .join('\n  ');

      const swatchesHtml = visualDesign.colorPalette.colors.map((color, index) => {
        const cmyk = hexToCmyk(color.hex);
        const cmykStr = formatCmykString(cmyk);

        return `
    <rect x="${width - 80 + (index * (swatchSize + 3))}"
          y="${bleed + 10}"
          width="${swatchSize}"
          height="${swatchSize}"
          fill="${color.hex}"
          stroke="#333"
          stroke-width="0.2"
          data-cmyk="${cmykStr}" />
    <text x="${width - 80 + (index * (swatchSize + 3)) + swatchSize / 2}"
          y="${bleed + 10 + swatchSize + 4}"
          text-anchor="middle"
          font-size="2.5"
          fill="#666">${color.name}</text>
    <text x="${width - 80 + (index * (swatchSize + 3)) + swatchSize / 2}"
          y="${bleed + 10 + swatchSize + 8}"
          text-anchor="middle"
          font-size="1.8"
          fill="#999">C${cmyk.c} M${cmyk.m}</text>
    <text x="${width - 80 + (index * (swatchSize + 3)) + swatchSize / 2}"
          y="${bleed + 10 + swatchSize + 11}"
          text-anchor="middle"
          font-size="1.8"
          fill="#999">Y${cmyk.y} K${cmyk.k}</text>`;
      }).join('');

      layers.push(`
  <!-- Color Palette Reference -->
  ${cmykComments}
  <g id="color-palette">
    <text x="${width - 80}" y="${bleed + 5}" font-size="3" fill="#333" font-weight="bold">Renk Paleti (CMYK):</text>
    ${swatchesHtml}
  </g>`);
    }

    return layers.join('\n');
  }
}

// Singleton instance
export const svgGenerator = new SVGGenerator();

// Export utility function for direct use
export const generateBoxDieLine = (box: BoxTemplate): DieLineResult => {
  return svgGenerator.generateDieLine(box);
};
