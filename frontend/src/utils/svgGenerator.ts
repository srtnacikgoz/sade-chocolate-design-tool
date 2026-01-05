/**
 * Client-side SVG Die-Line Generator
 * Generates print-ready SVG die-lines for chocolate box packaging
 *
 * Compliant with:
 * - ECMA standards (A20.20.03.01, A60)
 * - ISO 12647-2 PSO
 * - PDF/X-1a:2001 and PDF/X-4:2010
 * - Turkish printing ecosystem standards
 */

import { SVG_LAYERS, BLEED_STANDARDS, calculateCreasingChannel } from './printSpecifications';
import {
  calculateGlueFlapWidth,
  calculateTuckFlapHeight,
  calculateDustFlapHeight,
} from './ecmaPanelCalculator';
import { DEFAULT_ECMA_TOLERANCES, PANEL_CALC_CONSTANTS } from '../types/ecma-box.types';

interface BoxDimensions {
  length: number;
  width: number;
  height: number;
}

interface SVGGeneratorOptions {
  bleed?: number;
  showFoldLines?: boolean;
  showLabels?: boolean;
  isTwoPiece?: boolean;
  boardThickness?: number; // mm - karton kalınlığı
  includeLayers?: boolean; // Adobe Illustrator uyumlu katmanlar
  showSpotUVArea?: boolean;
  showFoilArea?: boolean;
  showEmbossArea?: boolean;
  resolution?: 'screen' | 'print'; // screen: 72dpi, print: 300dpi
}

interface GeneratedSVG {
  svg: string;
  filename: string;
  dimensions: {
    width: number;
    height: number;
  };
  metadata: {
    bleed: number;
    creaseChannel?: number;
    colorProfile: string;
    resolution: number;
  };
}

const DEFAULT_BLEED = BLEED_STANDARDS.standard; // 3mm
const DEFAULT_BOARD_THICKNESS = 0.5; // mm

/**
 * Generate layer group with Adobe Illustrator compatible naming
 */
function createLayerGroup(
  layerKey: keyof typeof SVG_LAYERS,
  content: string,
  visible: boolean = true
): string {
  const layer = SVG_LAYERS[layerKey];
  return `
  <!-- Layer: ${layer.name} - ${layer.description} -->
  <g id="${layer.name}" inkscape:groupmode="layer" inkscape:label="${layer.name}" ${!visible ? 'visibility="hidden"' : ''}>
    ${content}
  </g>`;
}

/**
 * Generate SVG header with proper metadata and namespaces
 */
function createSVGHeader(
  width: number,
  height: number,
  title: string,
  description: string,
  resolution: 'screen' | 'print' = 'print'
): string {
  const dpi = resolution === 'print' ? 300 : 72;
  const pxWidth = (width / 25.4) * dpi; // mm to pixels
  const pxHeight = (height / 25.4) * dpi;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
     width="${width}mm"
     height="${height}mm"
     viewBox="0 0 ${width} ${height}"
     version="1.1">

  <!-- Sade Chocolate Die-Line SVG -->
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Resolution: ${dpi} DPI (${pxWidth.toFixed(0)} x ${pxHeight.toFixed(0)} px) -->
  <!-- Color Profile: FOGRA39 (ISO Coated v2) -->

  <title>${title}</title>
  <desc>${description}</desc>

  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/"
             xmlns:cc="http://creativecommons.org/ns#">
      <cc:Work rdf:about="">
        <dc:title>${title}</dc:title>
        <dc:creator>Sade Chocolate Design Tool</dc:creator>
        <dc:description>${description}</dc:description>
        <dc:format>image/svg+xml</dc:format>
      </cc:Work>
    </rdf:RDF>
  </metadata>`;
}

/**
 * Generate SVG styles with proper print specifications
 */
function createSVGStyles(): string {
  return `
  <defs>
    <style type="text/css">
      /* Die-Line (Kesim Çizgisi) - CutContour için */
      .cut-line {
        fill: none;
        stroke: ${SVG_LAYERS.dieLine.color};
        stroke-width: ${SVG_LAYERS.dieLine.strokeWidth};
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      /* Fold Mountain (Dış Katlama) */
      .fold-mountain {
        fill: none;
        stroke: ${SVG_LAYERS.foldMountain.color};
        stroke-width: ${SVG_LAYERS.foldMountain.strokeWidth};
        stroke-dasharray: ${SVG_LAYERS.foldMountain.dashArray};
        stroke-linecap: round;
      }

      /* Fold Valley (İç Katlama) */
      .fold-valley {
        fill: none;
        stroke: ${SVG_LAYERS.foldValley.color};
        stroke-width: ${SVG_LAYERS.foldValley.strokeWidth};
        stroke-dasharray: ${SVG_LAYERS.foldValley.dashArray};
        stroke-linecap: round;
      }

      /* Bleed Area (Taşma Alanı) */
      .bleed-area {
        fill: none;
        stroke: ${SVG_LAYERS.bleed.color};
        stroke-width: 0.1;
        stroke-dasharray: ${SVG_LAYERS.bleed.dashArray};
      }

      /* Glue Area (Yapıştırma Alanı) */
      .glue-area {
        fill: ${SVG_LAYERS.glueArea.fill};
        fill-opacity: ${SVG_LAYERS.glueArea.fillOpacity};
        stroke: ${SVG_LAYERS.glueArea.color};
        stroke-width: 0.15;
      }

      /* Spot UV Area */
      .spot-uv {
        fill: ${SVG_LAYERS.spotUV.color};
        fill-opacity: 0.2;
        stroke: ${SVG_LAYERS.spotUV.color};
        stroke-width: 0.15;
      }

      /* Hot Foil Area */
      .hot-foil {
        fill: ${SVG_LAYERS.foil.color};
        fill-opacity: 0.3;
        stroke: ${SVG_LAYERS.foil.color};
        stroke-width: 0.15;
      }

      /* Emboss Area */
      .emboss {
        fill: ${SVG_LAYERS.emboss.color};
        fill-opacity: 0.15;
        stroke: ${SVG_LAYERS.emboss.color};
        stroke-width: 0.15;
      }

      /* Labels */
      .label {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 3px;
        fill: #666666;
        text-anchor: middle;
      }

      .dimension {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 2.5px;
        fill: #999999;
        text-anchor: middle;
      }

      .technical-note {
        font-family: 'Courier New', monospace;
        font-size: 2px;
        fill: #CCCCCC;
      }
    </style>
  </defs>`;
}

/**
 * Generate registration marks for print alignment
 */
function createRegistrationMarks(width: number, height: number, bleed: number): string {
  const markSize = 5;
  const offset = bleed - 1;

  const mark = (x: number, y: number) => `
    <g class="registration-mark" transform="translate(${x}, ${y})">
      <circle r="1.5" fill="none" stroke="#000" stroke-width="0.1"/>
      <line x1="-${markSize}" y1="0" x2="${markSize}" y2="0" stroke="#000" stroke-width="0.1"/>
      <line x1="0" y1="-${markSize}" x2="0" y2="${markSize}" stroke="#000" stroke-width="0.1"/>
    </g>`;

  return `
  <!-- Registration Marks (Paskalar) -->
  <g id="Registration-Marks" inkscape:groupmode="layer" inkscape:label="Registration-Marks">
    ${mark(offset, height / 2)}
    ${mark(width - offset, height / 2)}
    ${mark(width / 2, offset)}
    ${mark(width / 2, height - offset)}
  </g>`;
}

/**
 * Generate color bar for print quality control
 */
function createColorBar(width: number, height: number, bleed: number): string {
  const barHeight = 3;
  const barY = height - bleed + 1;
  const colors = ['#00FFFF', '#FF00FF', '#FFFF00', '#000000', '#FF0000', '#00FF00', '#0000FF'];
  const barWidth = (width - bleed * 2) / colors.length;

  return `
  <!-- Color Bar (Renk Kontrolü) -->
  <g id="Color-Bar" inkscape:groupmode="layer" inkscape:label="Color-Bar" visibility="hidden">
    ${colors.map((color, i) => `
      <rect x="${bleed + i * barWidth}" y="${barY}"
            width="${barWidth}" height="${barHeight}"
            fill="${color}"/>
    `).join('')}
  </g>`;
}

/**
 * Generate a single-piece folding box die-line
 */
export function generateSinglePieceBox(
  dims: BoxDimensions,
  options: SVGGeneratorOptions = {}
): GeneratedSVG {
  const { length, width, height } = dims;
  const bleed = options.bleed ?? DEFAULT_BLEED;
  const boardThickness = options.boardThickness ?? DEFAULT_BOARD_THICKNESS;
  const resolution = options.resolution ?? 'print';
  const creaseChannel = calculateCreasingChannel(boardThickness);

  // Calculate flat dimensions
  const flatWidth = length + (height * 2) + (bleed * 2);
  const flatHeight = width + (height * 2) + (bleed * 2);

  // Die-line content
  const dieLineContent = `
    <rect class="cut-line"
          x="${bleed}"
          y="${bleed}"
          width="${flatWidth - bleed * 2}"
          height="${flatHeight - bleed * 2}" />`;

  // Fold lines content
  const foldLinesContent = `
    <!-- Horizontal Fold Lines -->
    <line class="fold-mountain"
          x1="${bleed}" y1="${bleed + height}"
          x2="${flatWidth - bleed}" y2="${bleed + height}" />
    <line class="fold-mountain"
          x1="${bleed}" y1="${bleed + height + width}"
          x2="${flatWidth - bleed}" y2="${bleed + height + width}" />

    <!-- Vertical Fold Lines -->
    <line class="fold-mountain"
          x1="${bleed + height}" y1="${bleed}"
          x2="${bleed + height}" y2="${flatHeight - bleed}" />
    <line class="fold-mountain"
          x1="${bleed + height + length}" y1="${bleed}"
          x2="${bleed + height + length}" y2="${flatHeight - bleed}" />`;

  // Bleed area content
  const bleedContent = `
    <rect class="bleed-area" x="0" y="0" width="${flatWidth}" height="${flatHeight}" />`;

  // Labels content
  const labelsContent = options.showLabels ? `
    <text class="label" x="${flatWidth / 2}" y="${flatHeight / 2}">
      ${length} × ${width} × ${height} mm
    </text>
    <text class="dimension" x="${flatWidth / 2}" y="${flatHeight - bleed + 2}">
      Sade Chocolate - Single-Piece Box Die-Line
    </text>
    <text class="technical-note" x="${bleed + 2}" y="${bleed - 0.5}">
      Bleed: ${bleed}mm | Crease: ${creaseChannel.toFixed(2)}mm | Board: ${boardThickness}mm
    </text>` : '';

  // Artwork area (empty placeholder)
  const artworkContent = `
    <rect x="${bleed + height}" y="${bleed + height}"
          width="${length}" height="${width}"
          fill="none" stroke="#CCCCCC" stroke-width="0.05" stroke-dasharray="2,2"/>
    <text class="dimension" x="${bleed + height + length/2}" y="${bleed + height + width/2}">
      ARTWORK AREA
    </text>`;

  const svg = `${createSVGHeader(flatWidth, flatHeight,
    'Sade Chocolate Box Die-Line',
    `Single-piece folding box: ${length}×${width}×${height}mm`,
    resolution)}

  ${createSVGStyles()}

  ${createLayerGroup('bleed', bleedContent)}
  ${createLayerGroup('dieLine', dieLineContent)}
  ${createLayerGroup('foldMountain', foldLinesContent)}
  ${createLayerGroup('artwork', artworkContent, false)}

  <!-- Labels Layer -->
  <g id="Labels" inkscape:groupmode="layer" inkscape:label="Labels">
    ${labelsContent}
  </g>

  ${createRegistrationMarks(flatWidth, flatHeight, bleed)}
  ${createColorBar(flatWidth, flatHeight, bleed)}

</svg>`;

  return {
    svg,
    filename: `sade-chocolate-box-${length}x${width}x${height}.svg`,
    dimensions: { width: flatWidth, height: flatHeight },
    metadata: {
      bleed,
      creaseChannel,
      colorProfile: 'FOGRA39',
      resolution: resolution === 'print' ? 300 : 72,
    },
  };
}

/**
 * Generate tray (base) die-line for two-piece box
 */
export function generateTrayBase(
  dims: BoxDimensions,
  options: SVGGeneratorOptions = {}
): GeneratedSVG {
  const { length, width, height } = dims;
  const bleed = options.bleed ?? DEFAULT_BLEED;
  const boardThickness = options.boardThickness ?? DEFAULT_BOARD_THICKNESS;
  const resolution = options.resolution ?? 'print';
  const creaseChannel = calculateCreasingChannel(boardThickness);
  const glueFlapWidth = 15;
  const earSize = height * 0.8;

  // Calculate flat dimensions
  const flatWidth = length + (height * 2) + (bleed * 2);
  const flatHeight = width + (height * 2) + glueFlapWidth + (bleed * 2);

  // Die-line path
  const dieLineContent = `
    <path class="cut-line" d="
      M ${bleed + height} ${bleed}
      L ${bleed + height + length} ${bleed}
      L ${bleed + height + length} ${bleed + height - earSize}
      L ${bleed + height + length + earSize} ${bleed + height}
      L ${bleed + height + length + height} ${bleed + height}
      L ${bleed + height + length + height} ${bleed + height + width}
      L ${bleed + height + length + earSize} ${bleed + height + width}
      L ${bleed + height + length} ${bleed + height + width + earSize}
      L ${bleed + height + length} ${bleed + height + width + height}
      L ${bleed + height} ${bleed + height + width + height}
      L ${bleed + height} ${bleed + height + width + earSize}
      L ${bleed + height - earSize} ${bleed + height + width}
      L ${bleed} ${bleed + height + width}
      L ${bleed} ${bleed + height}
      L ${bleed + height - earSize} ${bleed + height}
      L ${bleed + height} ${bleed + height - earSize}
      Z
    "/>`;

  // Fold lines
  const foldLinesContent = `
    <line class="fold-mountain"
          x1="${bleed + height}" y1="${bleed + height}"
          x2="${bleed + height + length}" y2="${bleed + height}" />
    <line class="fold-mountain"
          x1="${bleed + height}" y1="${bleed + height + width}"
          x2="${bleed + height + length}" y2="${bleed + height + width}" />
    <line class="fold-mountain"
          x1="${bleed + height}" y1="${bleed + height}"
          x2="${bleed + height}" y2="${bleed + height + width}" />
    <line class="fold-mountain"
          x1="${bleed + height + length}" y1="${bleed + height}"
          x2="${bleed + height + length}" y2="${bleed + height + width}" />`;

  // Bleed area
  const bleedContent = `
    <rect class="bleed-area" x="0" y="0" width="${flatWidth}" height="${flatHeight}" />`;

  // Labels
  const labelsContent = options.showLabels ? `
    <text class="label" x="${flatWidth / 2}" y="${flatHeight / 2}">
      TRAY BASE: ${length} × ${width} × ${height} mm
    </text>
    <text class="technical-note" x="${bleed + 2}" y="${bleed - 0.5}">
      Bleed: ${bleed}mm | Crease: ${creaseChannel.toFixed(2)}mm | ECMA: A20.20.03.01
    </text>` : '';

  // Artwork area
  const artworkContent = `
    <rect x="${bleed + height}" y="${bleed + height}"
          width="${length}" height="${width}"
          fill="none" stroke="#CCCCCC" stroke-width="0.05" stroke-dasharray="2,2"/>`;

  const svg = `${createSVGHeader(flatWidth, flatHeight,
    'Sade Chocolate Tray Base Die-Line',
    `Two-piece box base (tray): ${length}×${width}×${height}mm`,
    resolution)}

  ${createSVGStyles()}

  ${createLayerGroup('bleed', bleedContent)}
  ${createLayerGroup('dieLine', dieLineContent)}
  ${createLayerGroup('foldMountain', foldLinesContent)}
  ${createLayerGroup('artwork', artworkContent, false)}

  <!-- Labels Layer -->
  <g id="Labels" inkscape:groupmode="layer" inkscape:label="Labels">
    ${labelsContent}
  </g>

  ${createRegistrationMarks(flatWidth, flatHeight, bleed)}
  ${createColorBar(flatWidth, flatHeight, bleed)}

</svg>`;

  return {
    svg,
    filename: `sade-chocolate-tray-base-${length}x${width}x${height}.svg`,
    dimensions: { width: flatWidth, height: flatHeight },
    metadata: {
      bleed,
      creaseChannel,
      colorProfile: 'FOGRA39',
      resolution: resolution === 'print' ? 300 : 72,
    },
  };
}

/**
 * Generate lid die-line for two-piece box
 */
export function generateTrayLid(
  dims: BoxDimensions,
  options: SVGGeneratorOptions = {}
): GeneratedSVG {
  // Lid is slightly larger than base
  const length = dims.length + 4;
  const width = dims.width + 4;
  const height = Math.max(20, dims.height * 0.6);
  const bleed = options.bleed ?? DEFAULT_BLEED;
  const boardThickness = options.boardThickness ?? DEFAULT_BOARD_THICKNESS;
  const resolution = options.resolution ?? 'print';
  const creaseChannel = calculateCreasingChannel(boardThickness);

  // Calculate flat dimensions
  const flatWidth = length + (height * 2) + (bleed * 2);
  const flatHeight = width + (height * 2) + (bleed * 2);

  // Die-line path (telescopic lid style)
  const dieLineContent = `
    <path class="cut-line" d="
      M ${bleed + height} ${bleed}
      L ${bleed + height + length} ${bleed}
      L ${bleed + height + length + height} ${bleed + height}
      L ${bleed + height + length + height} ${bleed + height + width}
      L ${bleed + height + length} ${bleed + height + width + height}
      L ${bleed + height} ${bleed + height + width + height}
      L ${bleed} ${bleed + height + width}
      L ${bleed} ${bleed + height}
      Z
    "/>`;

  // Fold lines
  const foldLinesContent = `
    <line class="fold-mountain"
          x1="${bleed + height}" y1="${bleed + height}"
          x2="${bleed + height + length}" y2="${bleed + height}" />
    <line class="fold-mountain"
          x1="${bleed + height}" y1="${bleed + height + width}"
          x2="${bleed + height + length}" y2="${bleed + height + width}" />
    <line class="fold-mountain"
          x1="${bleed + height}" y1="${bleed + height}"
          x2="${bleed + height}" y2="${bleed + height + width}" />
    <line class="fold-mountain"
          x1="${bleed + height + length}" y1="${bleed + height}"
          x2="${bleed + height + length}" y2="${bleed + height + width}" />`;

  // Bleed area
  const bleedContent = `
    <rect class="bleed-area" x="0" y="0" width="${flatWidth}" height="${flatHeight}" />`;

  // Spot UV area (logo placement on lid top)
  const spotUVContent = options.showSpotUVArea ? `
    <rect class="spot-uv"
          x="${bleed + height + length * 0.3}" y="${bleed + height + width * 0.3}"
          width="${length * 0.4}" height="${width * 0.4}"
          rx="2" ry="2"/>` : '';

  // Hot foil area (accent elements)
  const foilContent = options.showFoilArea ? `
    <rect class="hot-foil"
          x="${bleed + height + length * 0.35}" y="${bleed + height + width * 0.7}"
          width="${length * 0.3}" height="${width * 0.05}"/>` : '';

  // Labels
  const labelsContent = options.showLabels ? `
    <text class="label" x="${flatWidth / 2}" y="${flatHeight / 2}">
      LID: ${length} × ${width} × ${height} mm
    </text>
    <text class="technical-note" x="${bleed + 2}" y="${bleed - 0.5}">
      Bleed: ${bleed}mm | Crease: ${creaseChannel.toFixed(2)}mm | Telescopic Lid
    </text>` : '';

  // Artwork area
  const artworkContent = `
    <rect x="${bleed + height}" y="${bleed + height}"
          width="${length}" height="${width}"
          fill="none" stroke="#CCCCCC" stroke-width="0.05" stroke-dasharray="2,2"/>`;

  const svg = `${createSVGHeader(flatWidth, flatHeight,
    'Sade Chocolate Tray Lid Die-Line',
    `Two-piece box lid: ${length}×${width}×${height}mm (Telescopic)`,
    resolution)}

  ${createSVGStyles()}

  ${createLayerGroup('bleed', bleedContent)}
  ${createLayerGroup('dieLine', dieLineContent)}
  ${createLayerGroup('foldMountain', foldLinesContent)}
  ${createLayerGroup('artwork', artworkContent, false)}
  ${spotUVContent ? createLayerGroup('spotUV', spotUVContent, false) : ''}
  ${foilContent ? createLayerGroup('foil', foilContent, false) : ''}

  <!-- Labels Layer -->
  <g id="Labels" inkscape:groupmode="layer" inkscape:label="Labels">
    ${labelsContent}
  </g>

  ${createRegistrationMarks(flatWidth, flatHeight, bleed)}
  ${createColorBar(flatWidth, flatHeight, bleed)}

</svg>`;

  return {
    svg,
    filename: `sade-chocolate-tray-lid-${length}x${width}x${height}.svg`,
    dimensions: { width: flatWidth, height: flatHeight },
    metadata: {
      bleed,
      creaseChannel,
      colorProfile: 'FOGRA39',
      resolution: resolution === 'print' ? 300 : 72,
    },
  };
}

/**
 * Download SVG as file
 */
export function downloadSVG(svgContent: string, filename: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download box die-line
 */
export function exportBoxSVG(
  dims: BoxDimensions,
  options: SVGGeneratorOptions & { part?: 'single' | 'base' | 'lid' | 'both' } = {}
): void {
  const { part = 'single' } = options;

  if (part === 'single') {
    const result = generateSinglePieceBox(dims, options);
    downloadSVG(result.svg, result.filename);
  } else if (part === 'base') {
    const result = generateTrayBase(dims, options);
    downloadSVG(result.svg, result.filename);
  } else if (part === 'lid') {
    const result = generateTrayLid(dims, options);
    downloadSVG(result.svg, result.filename);
  } else if (part === 'both') {
    const base = generateTrayBase(dims, options);
    const lid = generateTrayLid(dims, options);
    downloadSVG(base.svg, base.filename);
    setTimeout(() => downloadSVG(lid.svg, lid.filename), 500);
  }
}

/**
 * Get SVG content without downloading (for preview)
 */
export function getBoxSVGContent(
  dims: BoxDimensions,
  options: SVGGeneratorOptions & { part?: 'single' | 'base' | 'lid' | 'ecma-a20' } = {}
): GeneratedSVG {
  const { part = 'single' } = options;

  if (part === 'base') {
    return generateTrayBase(dims, options);
  } else if (part === 'lid') {
    return generateTrayLid(dims, options);
  } else if (part === 'ecma-a20') {
    return generateECMAA20DieLine(dims, options);
  }
  return generateSinglePieceBox(dims, options);
}

// ============================================================
// ECMA A20.20.03.01 DIE-LINE GENERATOR
// ============================================================


/**
 * Tuck flap icin ozel path (ucgen kilitli)
 * Kilit centigi ile birlikte
 */
function generateTuckFlapPath(
  x: number,
  y: number,
  width: number,
  height: number,
  hasLockNotch: boolean = true
): string {
  const notchWidth = PANEL_CALC_CONSTANTS.LOCK_NOTCH_WIDTH;
  const notchDepth = PANEL_CALC_CONSTANTS.LOCK_NOTCH_DEPTH;

  // Kilit centigi merkezi
  const centerX = x + width / 2;

  if (hasLockNotch) {
    // Kilit centikli tuck flap
    return `
      M ${x} ${y + height}
      L ${x} ${y}
      L ${centerX - notchWidth / 2} ${y}
      L ${centerX - notchWidth / 2} ${y + notchDepth}
      L ${centerX + notchWidth / 2} ${y + notchDepth}
      L ${centerX + notchWidth / 2} ${y}
      L ${x + width} ${y}
      L ${x + width} ${y + height}
      Z
    `.trim().replace(/\s+/g, ' ');
  }

  // Basit dikdortgen
  return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
}

/**
 * Dust flap icin path (trapez seklinde)
 */
function generateDustFlapPath(
  x: number,
  y: number,
  width: number,
  height: number,
  isTop: boolean = true
): string {
  const inset = height * 0.3; // Ic taraf daraltma

  if (isTop) {
    // Ust dust flap - ustten daralan
    return `
      M ${x} ${y + height}
      L ${x + inset} ${y}
      L ${x + width - inset} ${y}
      L ${x + width} ${y + height}
      Z
    `.trim().replace(/\s+/g, ' ');
  }

  // Alt dust flap - alttan daralan
  return `
    M ${x} ${y}
    L ${x + width} ${y}
    L ${x + width - inset} ${y + height}
    L ${x + inset} ${y + height}
    Z
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Glue tab icin path (egimli kenarli)
 */
function generateGlueTabPath(
  x: number,
  y: number,
  width: number,
  height: number
): string {
  const taper = width * 0.3; // Daralma miktari

  return `
    M ${x + width} ${y}
    L ${x + width} ${y + height}
    L ${x + taper} ${y + height}
    L ${x} ${y + height * 0.8}
    L ${x} ${y + height * 0.2}
    L ${x + taper} ${y}
    Z
  `.trim().replace(/\s+/g, ' ');
}

/**
 * ECMA A20.20.03.01 Reverse Tuck End Box - Tam Die-Line
 *
 * Layout:
 * [Glue Tab] [B1] [A1] [B2] [A2]
 *
 * Her ana panel icin (A1, A2):
 * - Ust: Dust Flap + Tuck Flap
 * - Alt: Dust Flap + Tuck Flap
 */
export function generateECMAA20DieLine(
  dims: BoxDimensions,
  options: SVGGeneratorOptions = {}
): GeneratedSVG {
  const { length, width, height } = dims;
  const bleed = options.bleed ?? DEFAULT_BLEED;
  const boardThickness = options.boardThickness ?? DEFAULT_BOARD_THICKNESS;
  const resolution = options.resolution ?? 'print';
  const creaseChannel = calculateCreasingChannel(boardThickness);
  const tolerances = DEFAULT_ECMA_TOLERANCES;

  // Panel boyutlarini hesapla
  const glueFlapWidth = calculateGlueFlapWidth(height);
  const tuckFlapHeight = calculateTuckFlapHeight(width);
  const dustFlapHeight = calculateDustFlapHeight(width);
  const mainPanelHeight = height + tolerances.panelTolerance;
  const sidePanelHeight = height;

  // Toplam duz boyutlar
  const flatWidth = glueFlapWidth + width + length + width + length + (bleed * 2);
  const flatHeight = (tuckFlapHeight * 2) + (dustFlapHeight * 2) + mainPanelHeight + (bleed * 2);

  // Baslangic pozisyonlari
  let currentX = bleed;
  const topTuckY = bleed;
  const topDustY = bleed + tuckFlapHeight;
  const mainPanelY = bleed + tuckFlapHeight + dustFlapHeight;
  const bottomDustY = mainPanelY + mainPanelHeight;
  const bottomTuckY = bottomDustY + dustFlapHeight;

  // ============================================================
  // SVG Path'leri Olustur
  // ============================================================

  // Kesim cizgileri (cut-line)
  const cutPaths: string[] = [];

  // Katlama cizgileri
  const foldMountainPaths: string[] = [];
  const foldValleyPaths: string[] = [];

  // Yapistirma alanlari
  const glueAreaPaths: string[] = [];

  // ===== GLUE TAB =====
  cutPaths.push(generateGlueTabPath(currentX, mainPanelY, glueFlapWidth, sidePanelHeight));
  glueAreaPaths.push(generateGlueTabPath(currentX, mainPanelY, glueFlapWidth, sidePanelHeight));
  foldMountainPaths.push(`M ${currentX + glueFlapWidth} ${mainPanelY} L ${currentX + glueFlapWidth} ${mainPanelY + sidePanelHeight}`);
  currentX += glueFlapWidth;

  // ===== B1 (Sol Yan Panel) =====
  cutPaths.push(`M ${currentX} ${mainPanelY} L ${currentX + width} ${mainPanelY} L ${currentX + width} ${mainPanelY + sidePanelHeight} L ${currentX} ${mainPanelY + sidePanelHeight} Z`);

  // B1 Dust Flaps
  cutPaths.push(generateDustFlapPath(currentX, topDustY, width, dustFlapHeight, true));
  cutPaths.push(generateDustFlapPath(currentX, bottomDustY, width, dustFlapHeight, false));
  foldValleyPaths.push(`M ${currentX} ${mainPanelY} L ${currentX + width} ${mainPanelY}`);
  foldValleyPaths.push(`M ${currentX} ${mainPanelY + sidePanelHeight} L ${currentX + width} ${mainPanelY + sidePanelHeight}`);

  // B1-A1 arasi katlama
  foldMountainPaths.push(`M ${currentX + width} ${topDustY} L ${currentX + width} ${bottomDustY + dustFlapHeight}`);
  currentX += width;

  // ===== A1 (On Panel - Ana) =====
  cutPaths.push(`M ${currentX} ${mainPanelY} L ${currentX + length} ${mainPanelY} L ${currentX + length} ${mainPanelY + mainPanelHeight} L ${currentX} ${mainPanelY + mainPanelHeight} Z`);

  // A1 Ust Dust Flap
  cutPaths.push(generateDustFlapPath(currentX, topDustY, length, dustFlapHeight, true));
  foldValleyPaths.push(`M ${currentX} ${topDustY + dustFlapHeight} L ${currentX + length} ${topDustY + dustFlapHeight}`);

  // A1 Ust Tuck Flap (kilit centikli)
  cutPaths.push(generateTuckFlapPath(currentX, topTuckY, length, tuckFlapHeight, true));
  foldValleyPaths.push(`M ${currentX} ${topTuckY + tuckFlapHeight} L ${currentX + length} ${topTuckY + tuckFlapHeight}`);

  // A1 Alt Dust Flap
  cutPaths.push(generateDustFlapPath(currentX, bottomDustY, length, dustFlapHeight, false));
  foldValleyPaths.push(`M ${currentX} ${bottomDustY} L ${currentX + length} ${bottomDustY}`);

  // A1 Alt Tuck Flap (one kapanir)
  cutPaths.push(generateTuckFlapPath(currentX, bottomTuckY, length, tuckFlapHeight, true));
  foldValleyPaths.push(`M ${currentX} ${bottomTuckY} L ${currentX + length} ${bottomTuckY}`);

  // A1-B2 arasi katlama
  foldMountainPaths.push(`M ${currentX + length} ${topDustY} L ${currentX + length} ${bottomDustY + dustFlapHeight}`);
  currentX += length;

  // ===== B2 (Sag Yan Panel) =====
  cutPaths.push(`M ${currentX} ${mainPanelY} L ${currentX + width} ${mainPanelY} L ${currentX + width} ${mainPanelY + sidePanelHeight} L ${currentX} ${mainPanelY + sidePanelHeight} Z`);

  // B2 Dust Flaps
  cutPaths.push(generateDustFlapPath(currentX, topDustY, width, dustFlapHeight, true));
  cutPaths.push(generateDustFlapPath(currentX, bottomDustY, width, dustFlapHeight, false));
  foldValleyPaths.push(`M ${currentX} ${mainPanelY} L ${currentX + width} ${mainPanelY}`);
  foldValleyPaths.push(`M ${currentX} ${mainPanelY + sidePanelHeight} L ${currentX + width} ${mainPanelY + sidePanelHeight}`);

  // B2-A2 arasi katlama
  foldMountainPaths.push(`M ${currentX + width} ${topDustY} L ${currentX + width} ${bottomDustY + dustFlapHeight}`);
  currentX += width;

  // ===== A2 (Arka Panel) =====
  cutPaths.push(`M ${currentX} ${mainPanelY} L ${currentX + length} ${mainPanelY} L ${currentX + length} ${mainPanelY + mainPanelHeight} L ${currentX} ${mainPanelY + mainPanelHeight} Z`);

  // A2 Ust Dust Flap
  cutPaths.push(generateDustFlapPath(currentX, topDustY, length, dustFlapHeight, true));
  foldValleyPaths.push(`M ${currentX} ${topDustY + dustFlapHeight} L ${currentX + length} ${topDustY + dustFlapHeight}`);

  // A2 Ust Tuck Flap (REVERSE - arkaya kapanir, bu yuzden mountain fold)
  cutPaths.push(generateTuckFlapPath(currentX, topTuckY, length, tuckFlapHeight, true));
  foldMountainPaths.push(`M ${currentX} ${topTuckY + tuckFlapHeight} L ${currentX + length} ${topTuckY + tuckFlapHeight}`);

  // A2 Alt Dust Flap
  cutPaths.push(generateDustFlapPath(currentX, bottomDustY, length, dustFlapHeight, false));
  foldValleyPaths.push(`M ${currentX} ${bottomDustY} L ${currentX + length} ${bottomDustY}`);

  // A2 Alt Tuck Flap
  cutPaths.push(generateTuckFlapPath(currentX, bottomTuckY, length, tuckFlapHeight, true));
  foldValleyPaths.push(`M ${currentX} ${bottomTuckY} L ${currentX + length} ${bottomTuckY}`);

  // ============================================================
  // SVG Icerigini Olustur
  // ============================================================

  // Die-line icerigi
  const dieLineContent = cutPaths.map(path =>
    `<path class="cut-line" d="${path}"/>`
  ).join('\n    ');

  // Fold mountain icerigi
  const foldMountainContent = foldMountainPaths.map(path =>
    `<path class="fold-mountain" d="${path}"/>`
  ).join('\n    ');

  // Fold valley icerigi
  const foldValleyContent = foldValleyPaths.map(path =>
    `<path class="fold-valley" d="${path}"/>`
  ).join('\n    ');

  // Glue area icerigi
  const glueAreaContent = glueAreaPaths.map(path =>
    `<path class="glue-area" d="${path}"/>`
  ).join('\n    ');

  // Bleed area
  const bleedContent = `
    <rect class="bleed-area" x="0" y="0" width="${flatWidth}" height="${flatHeight}" />`;

  // Etiketler
  const labelsContent = options.showLabels ? `
    <text class="label" x="${flatWidth / 2}" y="${flatHeight / 2 - 5}">
      ECMA A20.20.03.01 - Reverse Tuck End Box
    </text>
    <text class="dimension" x="${flatWidth / 2}" y="${flatHeight / 2 + 5}">
      ${length} x ${width} x ${height} mm
    </text>
    <text class="technical-note" x="${bleed + 2}" y="${bleed - 0.5}">
      Bleed: ${bleed}mm | Crease: ${creaseChannel.toFixed(2)}mm | Glue Flap: ${glueFlapWidth.toFixed(1)}mm | Tuck: ${tuckFlapHeight.toFixed(1)}mm
    </text>
    <text class="technical-note" x="${flatWidth - bleed - 2}" y="${bleed - 0.5}" text-anchor="end">
      Sade Chocolate - ECMA Standart Die-Line
    </text>` : '';

  // Artwork area gosterimi
  const artworkContent = `
    <rect x="${bleed + glueFlapWidth + width}" y="${mainPanelY}"
          width="${length}" height="${mainPanelHeight}"
          fill="none" stroke="#CCCCCC" stroke-width="0.05" stroke-dasharray="2,2"/>
    <text class="dimension" x="${bleed + glueFlapWidth + width + length/2}" y="${mainPanelY + mainPanelHeight/2}">
      ON YUZ (A1)
    </text>
    <rect x="${bleed + glueFlapWidth + width + length + width}" y="${mainPanelY}"
          width="${length}" height="${mainPanelHeight}"
          fill="none" stroke="#CCCCCC" stroke-width="0.05" stroke-dasharray="2,2"/>
    <text class="dimension" x="${bleed + glueFlapWidth + width + length + width + length/2}" y="${mainPanelY + mainPanelHeight/2}">
      ARKA YUZ (A2)
    </text>`;

  // Tam SVG
  const svg = `${createSVGHeader(flatWidth, flatHeight,
    'Sade Chocolate ECMA A20.20.03.01 Die-Line',
    `Reverse Tuck End Box: ${length}x${width}x${height}mm`,
    resolution)}

  ${createSVGStyles()}

  ${createLayerGroup('bleed', bleedContent)}

  <!-- Kesim Cizgileri -->
  ${createLayerGroup('dieLine', dieLineContent)}

  <!-- Dis Katlama (Mountain) -->
  ${createLayerGroup('foldMountain', foldMountainContent)}

  <!-- Ic Katlama (Valley) -->
  <g id="Fold-Valley" inkscape:groupmode="layer" inkscape:label="Fold-Valley">
    ${foldValleyContent}
  </g>

  <!-- Yapistirma Alani -->
  ${createLayerGroup('glueArea', glueAreaContent)}

  <!-- Artwork Alanlari -->
  ${createLayerGroup('artwork', artworkContent, false)}

  <!-- Etiketler -->
  <g id="Labels" inkscape:groupmode="layer" inkscape:label="Labels">
    ${labelsContent}
  </g>

  ${createRegistrationMarks(flatWidth, flatHeight, bleed)}
  ${createColorBar(flatWidth, flatHeight, bleed)}

</svg>`;

  return {
    svg,
    filename: `sade-chocolate-ecma-a20-${length}x${width}x${height}.svg`,
    dimensions: { width: flatWidth, height: flatHeight },
    metadata: {
      bleed,
      creaseChannel,
      colorProfile: 'FOGRA39',
      resolution: resolution === 'print' ? 300 : 72,
    },
  };
}
