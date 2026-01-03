export interface AgentContext {
  designId: string;
  boxDimensions: {
    length: number;
    width: number;
    height: number;
  };
  boxType: string;
  previousOutputs?: {
    trendAnalysis?: any;
    visualDesign?: any;
    technicalDrawing?: any;
  };
}

export interface AgentOutput {
  success: boolean;
  data: any;
  error?: string;
  timestamp: Date;
  duration?: number; // milliseconds
}

export interface TrendAgentOutput {
  summary: string;
  visualReferences: string[];
  recommendations: string[];
  competitorInsights: CompetitorInsight[];
  materialTrends: string[];
  colorTrends: string[];
}

export interface CompetitorInsight {
  brand: string;
  observation: string;
  relevance: 'high' | 'medium' | 'low';
}

export interface VisualAgentOutput {
  colorPalette: {
    name: string;
    colors: Array<{
      hex: string;
      name: string;
      role: string;
      pantone?: string;
      cmyk?: { c: number; m: number; y: number; k: number };
    }>;
  };
  logoPlacement: {
    position: string;
    size: { width: number; height: number };
  };
  typography: {
    primaryFont: string;
    secondaryFont?: string;
  };
  goldFoilAreas: Array<{
    type: string;
    foilColor: string;
    coordinates: { x: number; y: number };
    dimensions: { width: number; height: number };
  }>;
}

export interface TechnicalAgentOutput {
  svgContent: string;
  dieLineData: {
    cutPath: string;
    dimensions: {
      flatWidth: number;
      flatHeight: number;
    };
  };
  foldLines: Array<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    type: string;
  }>;
  bleedArea: number;
  specifications: {
    boxType: string;
    netDimensions: string;
    material: string;
  };
}

export interface CostAgentOutput {
  breakdown: {
    material: number;
    printing: number;
    labor: number;
    logistics: number;
    overhead: number;
    total: number;
  };
  totalUnitCost: number;
  recommendedPrice: number;
  scenarios: Array<{
    quantity: number;
    unitCost: number;
    totalCost: number;
    savingsPercent?: number;
  }>;
  pricingData: {
    source: 'google-sheets' | 'fallback';
    lastUpdate: Date;
  };
}
