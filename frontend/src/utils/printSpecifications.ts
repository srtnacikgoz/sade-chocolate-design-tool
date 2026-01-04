/**
 * Print Specifications for Sade Chocolate Box Packaging
 * Based on industry standards and Turkish printing ecosystem
 */

// Color Profile Standards
export const COLOR_PROFILES = {
  FOGRA39: {
    name: 'FOGRA39',
    description: 'ISO Coated v2 (ECI) - Kaplamalı kağıt için',
    dotGain: 16, // %14-16 orta değer
    usage: 'coated',
  },
  FOGRA51: {
    name: 'FOGRA51',
    description: 'PSO Coated v3 - Modern kaplamalı kağıt',
    dotGain: 15,
    usage: 'coated',
  },
  FOGRA52: {
    name: 'FOGRA52',
    description: 'PSO Uncoated v3 - Kaplamasız kağıt',
    dotGain: 19, // %18-20 orta değer
    usage: 'uncoated',
  },
} as const;

// Screen Angles (Tram Açıları)
export const SCREEN_ANGLES = {
  C: 15,  // Cyan
  M: 75,  // Magenta
  Y: 0,   // Yellow (Sarı)
  K: 45,  // Black (Siyah)
} as const;

// Resolution Standards
export const RESOLUTION_STANDARDS = {
  raster: {
    minimum: 300,  // PPI
    optimal: 350,
    maximum: 450,
  },
  vector: {
    ctpPlate: 2540, // DPI - CTP kalıp çözünürlüğü
  },
  lineArt: {
    minimum: 600,
    optimal: 1200,
  },
} as const;

// Bleed Standards
export const BLEED_STANDARDS = {
  standard: 3,    // mm
  premium: 5,     // mm - lüks baskılar için
  minimum: 2,     // mm
} as const;

// Paper/Board GSM Values
export const GSM_VALUES = {
  lightweight: { min: 250, max: 300, description: 'Hafif kutu' },
  standard: { min: 300, max: 350, description: 'Standart çikolata kutusu' },
  premium: { min: 350, max: 400, description: 'Premium hediye kutusu' },
  luxury: { min: 400, max: 450, description: 'Ultra lüks kutu' },
} as const;

// Creasing (Pilyaj) Formula
export function calculateCreasingChannel(
  boardThickness: number, // mm
  creasingBladeWidth: number = 0.7 // mm - standart pilyaj bıçak genişliği
): number {
  // Kanal Genişliği = (Karton Kalınlığı × 1.5) + Pilyaj Bıçak Genişliği
  return (boardThickness * 1.5) + creasingBladeWidth;
}

// Perforation Ratios
export const PERFORATION_RATIOS = {
  standard: { cut: 3, tie: 1, description: 'Standart direnç' },
  highStrength: { cut: 4, tie: 1, description: 'Yüksek direnç' },
} as const;

// ECMA Box Codes for Chocolate Packaging
export const ECMA_CODES = {
  A20_20_03_01: {
    code: 'A20.20.03.01',
    description: 'Standart kulaklı geçme sistem',
    usage: 'Genel çikolata kutuları',
  },
  A60: {
    code: 'A60',
    description: 'Otomatik kilitli alt mekanizma',
    usage: 'Hızlı montaj gerektiren kutular',
  },
} as const;

// Rich Black for Large Areas
export const RICH_BLACK = {
  C: 60,
  M: 40,
  Y: 40,
  K: 100,
  css: 'cmyk(60%, 40%, 40%, 100%)',
  hex: '#000000', // Approximate
} as const;

// Food Safety Standards
export const FOOD_SAFETY = {
  migration: {
    eu: {
      unassessed: 10, // ppb - değerlendirilmemiş maddeler
      specific: 0.5,  // ppb - FDA listeli maddeler
    },
    barrier: {
      required: true,
      materials: ['Alüminyum folyo', 'PET film', 'Özel kaplama'],
    },
  },
  mvtr: {
    maxCoated: 150, // g/m²/gün - Nem Buharı Geçiş Oranı
    description: 'Şeker ve yağ çiçeklenmesini önlemek için',
  },
} as const;

// PDF/X Standards
export const PDF_STANDARDS = {
  'PDF/X-1a:2001': {
    colorSpace: 'CMYK only',
    transparency: false,
    fonts: 'embedded',
    usage: 'Geleneksel ofset baskı',
  },
  'PDF/X-4:2010': {
    colorSpace: 'CMYK + Spot',
    transparency: true,
    fonts: 'embedded',
    usage: 'Modern dijital ve ofset baskı',
  },
} as const;

// Turkish Printing Ecosystem
export const TURKISH_PRINTING = {
  capacity: {
    sheetsPerHour: { min: 18000, max: 21000 },
    machine: 'Heidelberg XL 106',
  },
  certifications: ['ISO 12647-2 PSO', 'BRCGS', 'FSC'],
  regulations: {
    code: '2019/44',
    euCompliance: 'EU 10/2011',
  },
} as const;

// Print Order (KCMY)
export const PRINT_ORDER = ['K', 'C', 'M', 'Y'] as const;

// Layer Organization for Die-Line SVG
export const SVG_LAYERS = {
  dieLine: {
    name: 'Die-Line',
    color: '#000000',
    strokeWidth: 0.25,
    description: 'Kesim çizgileri',
  },
  foldMountain: {
    name: 'Fold-Mountain',
    color: '#FF0000',
    strokeWidth: 0.25,
    dashArray: '5,3',
    description: 'Dış katlama çizgileri',
  },
  foldValley: {
    name: 'Fold-Valley',
    color: '#0000FF',
    strokeWidth: 0.25,
    dashArray: '2,2',
    description: 'İç katlama çizgileri',
  },
  bleed: {
    name: 'Bleed',
    color: '#00FF00',
    strokeWidth: 0.1,
    dashArray: '1,1',
    description: 'Taşma alanı',
  },
  glueArea: {
    name: 'Glue-Area',
    color: '#00AA00',
    fill: '#CCFFCC',
    fillOpacity: 0.3,
    description: 'Yapıştırma alanları',
  },
  artwork: {
    name: 'Artwork',
    description: 'Grafik tasarım alanı',
  },
  spotUV: {
    name: 'Spot-UV',
    color: '#FF00FF',
    description: 'Spot UV alanları',
  },
  foil: {
    name: 'Hot-Foil',
    color: '#FFD700',
    description: 'Sıcak varak alanları',
  },
  emboss: {
    name: 'Emboss',
    color: '#808080',
    description: 'Kabartma/gömme alanları',
  },
} as const;

// Export all specifications as a single object
export const PRINT_SPECIFICATIONS = {
  colorProfiles: COLOR_PROFILES,
  screenAngles: SCREEN_ANGLES,
  resolution: RESOLUTION_STANDARDS,
  bleed: BLEED_STANDARDS,
  gsm: GSM_VALUES,
  perforation: PERFORATION_RATIOS,
  ecmaCodes: ECMA_CODES,
  richBlack: RICH_BLACK,
  foodSafety: FOOD_SAFETY,
  pdfStandards: PDF_STANDARDS,
  turkishPrinting: TURKISH_PRINTING,
  printOrder: PRINT_ORDER,
  svgLayers: SVG_LAYERS,
} as const;

export type PrintSpecifications = typeof PRINT_SPECIFICATIONS;
