import apiClient from './api';
import type { ApiResponse } from './api';
import type { TechnicalDrawing, DieLineData, FoldLine } from '../types/design.types';

interface SVGExportResponse {
  svg: string;
  dimensions?: {
    flatWidth: number;
    flatHeight: number;
  };
  bleed?: number;
  generated?: boolean;
}

interface SVGPreviewResponse {
  svg: string;
  dieLineData: DieLineData;
  foldLines: FoldLine[];
  flatDimensions: {
    width: number;
    height: number;
  };
  boxInfo: {
    id: string;
    name: string;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    type: string;
  };
}

interface SVGGenerateResponse {
  designId: string;
  technicalDrawing: TechnicalDrawing;
  message: string;
}

/**
 * Export Service - SVG ve diger export islemleri
 */
export const exportService = {
  /**
   * Design icin SVG export eder
   */
  getSVG: async (designId: string): Promise<SVGExportResponse> => {
    const response = await apiClient.get<ApiResponse<SVGExportResponse>>(
      `/v1/export/${designId}/svg`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error('SVG alinamadi');
    }

    return response.data.data;
  },

  /**
   * Design icin SVG onizlemesi yapar
   */
  previewSVG: async (designId: string): Promise<SVGPreviewResponse> => {
    const response = await apiClient.get<ApiResponse<SVGPreviewResponse>>(
      `/v1/export/${designId}/svg/preview`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error('SVG onizlemesi alinamadi');
    }

    return response.data.data;
  },

  /**
   * Kutu sablonu icin SVG onizlemesi yapar
   */
  previewBoxSVG: async (boxId: string): Promise<SVGPreviewResponse> => {
    const response = await apiClient.get<ApiResponse<SVGPreviewResponse>>(
      `/v1/export/box/${boxId}/preview`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error('Kutu SVG onizlemesi alinamadi');
    }

    return response.data.data;
  },

  /**
   * SVG olusturur ve design'a kaydeder
   */
  generateSVG: async (designId: string): Promise<SVGGenerateResponse> => {
    const response = await apiClient.post<ApiResponse<SVGGenerateResponse>>(
      `/v1/export/${designId}/svg/generate`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error('SVG olusturulamadi');
    }

    return response.data.data;
  },

  /**
   * SVG dosyasini indirir
   */
  downloadSVG: async (designId: string, filename?: string): Promise<void> => {
    const response = await apiClient.get<string>(
      `/v1/export/${designId}/svg?download=true`,
      {
        responseType: 'blob',
      }
    );

    // Blob'u indir
    const blob = new Blob([response.data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `sade-chocolate-${designId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
