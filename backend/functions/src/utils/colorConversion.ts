/**
 * Color Conversion Utilities
 * RGB ↔ CMYK conversion for print-ready output
 * Based on offset printing standards (ISO 12647-2)
 */

export interface CMYK {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Convert HEX color to RGB
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Convert RGB to CMYK
 * Standard formula for offset printing
 *
 * Note: This is a basic conversion. Professional color management
 * requires ICC profile transformation for accurate FOGRA39/51 compliance.
 */
export function rgbToCmyk(rgb: RGB): CMYK {
  const { r, g, b } = rgb;

  // Normalize RGB values to 0-1 range
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Calculate K (black)
  const k = 1 - Math.max(rNorm, gNorm, bNorm);

  // Handle pure black (avoid division by zero)
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  // Calculate CMY
  const c = ((1 - rNorm - k) / (1 - k));
  const m = ((1 - gNorm - k) / (1 - k));
  const y = ((1 - bNorm - k) / (1 - k));

  // Convert to percentage (0-100) and round to 1 decimal
  return {
    c: Math.round(c * 1000) / 10,
    m: Math.round(m * 1000) / 10,
    y: Math.round(y * 1000) / 10,
    k: Math.round(k * 1000) / 10,
  };
}

/**
 * Convert HEX to CMYK (combined helper)
 */
export function hexToCmyk(hex: string): CMYK {
  const rgb = hexToRgb(hex);
  return rgbToCmyk(rgb);
}

/**
 * Calculate total ink coverage
 * Must be ≤ 300-330% for offset printing
 */
export function calculateInkCoverage(cmyk: CMYK): number {
  return cmyk.c + cmyk.m + cmyk.y + cmyk.k;
}

/**
 * Check if ink coverage is within safe limits
 */
export function isInkCoverageSafe(cmyk: CMYK, maxCoverage: number = 330): boolean {
  return calculateInkCoverage(cmyk) <= maxCoverage;
}

/**
 * Generate CMYK color string for SVG/PDF
 * Format: "cmyk(C%, M%, Y%, K%)"
 */
export function formatCmykString(cmyk: CMYK): string {
  return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
}

/**
 * Generate rich black for large areas
 * Standard: C60 M40 Y40 K100
 */
export const RICH_BLACK: CMYK = {
  c: 60,
  m: 40,
  y: 40,
  k: 100,
};

/**
 * Pure black for text (100% K only)
 */
export const PURE_BLACK: CMYK = {
  c: 0,
  m: 0,
  y: 0,
  k: 100,
};

/**
 * Generate CMYK comment for SVG metadata
 * Used for print house reference
 */
export function generateCmykComment(hex: string, name?: string): string {
  const cmyk = hexToCmyk(hex);
  const coverage = calculateInkCoverage(cmyk);
  const coverageWarning = coverage > 330 ? ' ⚠ HIGH INK COVERAGE' : '';

  const namePart = name ? ` (${name})` : '';

  return `<!-- Color${namePart}: ${hex} = CMYK ${cmyk.c}/${cmyk.m}/${cmyk.y}/${cmyk.k} | Coverage: ${coverage}%${coverageWarning} -->`;
}

/**
 * Validate color for print production
 */
export interface ColorValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  cmyk: CMYK;
}

export function validateColorForPrint(hex: string, maxCoverage: number = 330): ColorValidation {
  const cmyk = hexToCmyk(hex);
  const coverage = calculateInkCoverage(cmyk);
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check ink coverage
  if (coverage > maxCoverage) {
    errors.push(`Ink coverage ${coverage}% exceeds maximum ${maxCoverage}%`);
  } else if (coverage > 300) {
    warnings.push(`Ink coverage ${coverage}% is high (recommended: ≤300%)`);
  }

  // Check for very light colors (may not print well)
  if (coverage < 10) {
    warnings.push('Very light color - may not print visibly');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    cmyk,
  };
}
