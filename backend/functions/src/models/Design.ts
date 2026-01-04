import { Timestamp } from 'firebase-admin/firestore';

export interface Design {
  id: string;
  boxId: string;
  workflowId?: string;

  trendAnalysis?: {
    summary: string;
    recommendations: string[];
    completedAt: Timestamp;
  };

  visualDesign?: {
    colorPalette: any;
    logoPlacement?: any;
    typography?: any;
    goldFoilAreas?: any[];
    patterns?: any[];
    completedAt: Timestamp;
  };

  technicalDrawing?: {
    svgUrl: string;
    svgContent?: string;
    dieLineData: any;
    foldLines: any[];
    bleedArea: number;
    completedAt: Timestamp;
  };

  costReport?: {
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
    scenarios: any[];
    completedAt: Timestamp;
  };

  // Custom design upload (from Canva, Illustrator, etc.)
  customDesign?: {
    fileName: string;
    fileUrl: string; // Firebase Storage URL
    fileType: 'svg' | 'pdf' | 'png' | 'jpg' | 'jpeg';
    fileSize: number; // bytes
    uploadedAt: Timestamp;
    uploadedBy?: string;
    thumbnailUrl?: string; // Preview için
  };

  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateDesignInput {
  boxId?: string;
  customDimensions?: {
    length: number;
    width: number;
    height: number;
  };
  preferences?: any;
}
