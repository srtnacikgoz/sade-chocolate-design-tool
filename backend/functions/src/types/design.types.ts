export interface Design {
  id: string;
  boxId: string;
  workflowId?: string;

  // Agent outputs
  trendAnalysis?: TrendAnalysis;
  visualDesign?: VisualDesign;
  technicalDrawing?: TechnicalDrawing;
  costReport?: CostReport;

  // Custom design upload (from Canva, Illustrator, etc.)
  customDesign?: CustomDesignUpload;

  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomDesignUpload {
  fileName: string;
  fileUrl: string; // Firebase Storage URL
  fileType: 'svg' | 'pdf' | 'png' | 'jpg' | 'jpeg';
  fileSize: number; // bytes
  uploadedAt: Date;
  uploadedBy?: string;
  thumbnailUrl?: string; // Preview için
}

export interface TrendAnalysis {
  summary: string;
  visualReferences: string[];
  recommendations: string[];
  completedAt: Date;
}

export interface VisualDesign {
  colorPalette: ColorPalette;
  logoPlacement?: LogoPlacement;
  typography?: Typography;
  goldFoilAreas?: FoilArea[];
  patterns?: Pattern[];
  completedAt: Date;
}

export interface ColorPalette {
  name: string;
  colors: Color[];
}

export interface Color {
  hex: string;
  name: string;
  role: 'primary' | 'accent' | 'neutral' | 'foil';
  pantone?: string;
  cmyk?: CMYK;
}

export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface LogoPlacement {
  position: 'center' | 'top-left' | 'top-right' | 'bottom-center';
  size: { width: number; height: number }; // mm
  coordinates?: { x: number; y: number };
}

export interface Typography {
  primaryFont: string;
  secondaryFont?: string;
  hierarchy: {
    heading: { font: string; size: number; weight: number };
    subheading?: { font: string; size: number; weight: number };
    body?: { font: string; size: number; weight: number };
  };
}

export interface FoilArea {
  id: string;
  type: 'logo' | 'pattern' | 'text' | 'seal';
  foilColor: 'gold' | 'rose-gold' | 'silver' | 'champagne';
  coordinates: { x: number; y: number };
  dimensions: { width: number; height: number };
  technique: 'hot-foil' | 'cold-foil';
}

export interface Pattern {
  id: string;
  type: 'geometric' | 'floral' | 'abstract' | 'minimal';
  svgPath?: string;
  repeat: boolean;
  opacity?: number;
}

export interface TechnicalDrawing {
  svgUrl: string;
  svgContent?: string;
  dieLineData: DieLineData;
  foldLines: FoldLine[];
  bleedArea: number; // mm
  completedAt: Date;

  // Two-piece box support (base + lid)
  isTwoPiece?: boolean;
  baseSvgContent?: string;  // Alt tepsi SVG
  lidSvgContent?: string;   // Üst kapak SVG
  baseDieLineData?: DieLineData;
  lidDieLineData?: DieLineData;
}

export interface DieLineData {
  cutPath: string; // SVG path string
  dimensions: {
    flatWidth: number;
    flatHeight: number;
  };
}

export interface FoldLine {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  type: 'mountain' | 'valley';
}

export interface CostReport {
  breakdown: CostBreakdown;
  totalUnitCost: number; // TRY
  recommendedPrice: number; // TRY
  scenarios: CostScenario[];
  completedAt: Date;
}

export interface CostBreakdown {
  material: number;
  printing: number;
  labor: number;
  logistics: number;
  overhead: number;
  total: number;
  currency: string;
}

export interface CostScenario {
  quantity: number;
  unitCost: number;
  totalCost: number;
  savingsPercent?: number;
}

// Box Template Interface
export interface BoxTemplate {
  id: string;
  name: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  type: 'gift' | 'truffle' | 'bar' | 'seasonal' | 'tray-lid' | 'sleeve' | 'display' | string;
  structure?: 'single' | 'two-piece'; // single = tek parça, two-piece = base + lid (default: single)
  capacity: number;
  description: string;

  // Two-piece specific dimensions (optional)
  lidDimensions?: {
    length: number;
    width: number;
    height: number; // Kapak yüksekliği (genelde base'den az)
  };
  lidType?: 'telescopic' | 'hinged' | 'sleeve' | 'magnetic';
}
