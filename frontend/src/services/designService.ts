import apiClient from './api';
import type { ApiResponse, PaginatedResponse } from './api';
import type { Design, BoxTemplate } from '../types/design.types';

/**
 * Firestore Timestamp'i Date'e dönüştürür
 */
const parseFirestoreDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  }
  return new Date(timestamp);
};

/**
 * Design objesindeki tüm timestamp'leri Date'e dönüştürür
 */
const transformDesign = (design: any): Design => {
  return {
    ...design,
    createdAt: parseFirestoreDate(design.createdAt),
    updatedAt: parseFirestoreDate(design.updatedAt),
    trendAnalysis: design.trendAnalysis ? {
      ...design.trendAnalysis,
      completedAt: parseFirestoreDate(design.trendAnalysis.completedAt),
    } : undefined,
    visualDesign: design.visualDesign ? {
      ...design.visualDesign,
      completedAt: parseFirestoreDate(design.visualDesign.completedAt),
    } : undefined,
    technicalDrawing: design.technicalDrawing ? {
      ...design.technicalDrawing,
      completedAt: parseFirestoreDate(design.technicalDrawing.completedAt),
    } : undefined,
    costReport: design.costReport ? {
      ...design.costReport,
      completedAt: parseFirestoreDate(design.costReport.completedAt),
    } : undefined,
  };
};

// Design Service - API calls for designs
export const designService = {
  /**
   * Create a new design
   */
  createDesign: async (data: {
    boxId: string;
    preferences?: Record<string, any>;
  }): Promise<Design> => {
    const response = await apiClient.post<ApiResponse<Design>>('/v1/designs', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create design');
    }
    return transformDesign(response.data.data);
  },

  /**
   * Get design by ID
   */
  getDesignById: async (id: string): Promise<Design> => {
    const response = await apiClient.get<ApiResponse<Design>>(`/v1/designs/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch design');
    }
    return transformDesign(response.data.data);
  },

  /**
   * List all designs with optional filters
   */
  listDesigns: async (params?: {
    status?: Design['status'];
    boxId?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<Design>> => {
    const response = await apiClient.get<PaginatedResponse<Design>>('/v1/designs', {
      params,
    });
    if (!response.data.success) {
      throw new Error('Failed to fetch designs');
    }
    // Transform all designs in the list
    return {
      ...response.data,
      data: response.data.data?.map(transformDesign) || [],
    };
  },

  /**
   * Update design
   */
  updateDesign: async (
    id: string,
    updates: Partial<Design>
  ): Promise<Design> => {
    const response = await apiClient.patch<ApiResponse<Design>>(
      `/v1/designs/${id}`,
      updates
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update design');
    }
    return transformDesign(response.data.data);
  },

  /**
   * Delete design
   */
  deleteDesign: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/v1/designs/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete design');
    }
  },

  /**
   * Update design status
   */
  updateDesignStatus: async (
    id: string,
    status: Design['status']
  ): Promise<Design> => {
    return designService.updateDesign(id, { status });
  },

  /**
   * Upload custom design file (from Canva, Illustrator, etc.)
   */
  uploadDesign: async (
    id: string,
    file: File
  ): Promise<Design> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<{
      design: Design;
      upload: {
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
      };
    }>>(`/v1/designs/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to upload design');
    }

    return transformDesign(response.data.data.design);
  },
};

// Fallback templates when backend is not available
const FALLBACK_BOX_TEMPLATES: BoxTemplate[] = [
  {
    id: 'gift-9',
    name: '9\'lu Pralin Kutusu',
    dimensions: { length: 120, width: 120, height: 40 },
    type: 'gift',
    capacity: 9,
    description: 'Kompakt hediye kutusu, 3x3 pralin dizilimi',
  },
  {
    id: 'gift-16',
    name: '16\'lı Premium Kutu',
    dimensions: { length: 160, width: 160, height: 45 },
    type: 'gift',
    capacity: 16,
    description: 'Orta boy premium kutu, 4x4 pralin dizilimi',
  },
  {
    id: 'gift-25',
    name: '25\'li Hediye Kutusu',
    dimensions: { length: 200, width: 200, height: 50 },
    type: 'gift',
    capacity: 25,
    description: 'Büyük hediye kutusu, 5x5 pralin dizilimi',
  },
  {
    id: 'truffle-4',
    name: '4\'lü Truffle Kutusu',
    dimensions: { length: 80, width: 80, height: 35 },
    type: 'truffle',
    capacity: 4,
    description: 'Mini truffle kutusu, 2x2 dizilim',
  },
  {
    id: 'bar-single',
    name: 'Tablet Çikolata',
    dimensions: { length: 180, width: 80, height: 15 },
    type: 'bar',
    capacity: 1,
    description: 'Tek tablet çikolata ambalajı',
  },
  {
    id: 'seasonal-heart',
    name: 'Sevgililer Günü Kalp',
    dimensions: { length: 150, width: 150, height: 40 },
    type: 'seasonal',
    capacity: 12,
    description: 'Kalp şeklinde özel kutu',
  },
];

// Box Service - API calls for box templates
export const boxService = {
  /**
   * List all box templates
   */
  listBoxes: async (type?: string): Promise<BoxTemplate[]> => {
    try {
      const response = await apiClient.get<ApiResponse<BoxTemplate[]>>('/v1/boxes', {
        params: type ? { type } : undefined,
      });
      if (!response.data.success || !response.data.data) {
        console.warn('API returned no data, using fallback templates');
        return FALLBACK_BOX_TEMPLATES;
      }
      return response.data.data;
    } catch (error) {
      console.warn('Failed to fetch boxes from API, using fallback templates:', error);
      return FALLBACK_BOX_TEMPLATES;
    }
  },

  /**
   * Get box template by ID
   */
  getBoxById: async (id: string): Promise<BoxTemplate> => {
    try {
      const response = await apiClient.get<ApiResponse<BoxTemplate>>(`/v1/boxes/${id}`);
      if (!response.data.success || !response.data.data) {
        const fallback = FALLBACK_BOX_TEMPLATES.find(t => t.id === id);
        if (fallback) return fallback;
        throw new Error(response.data.message || 'Failed to fetch box');
      }
      return response.data.data;
    } catch (error) {
      // Try to find in fallback templates
      const fallback = FALLBACK_BOX_TEMPLATES.find(t => t.id === id);
      if (fallback) {
        console.warn(`Using fallback template for box ${id}`);
        return fallback;
      }
      throw error;
    }
  },
};

// Health Check Service
export const healthService = {
  /**
   * Check API health
   */
  checkHealth: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await apiClient.get<ApiResponse<{ status: string; timestamp: string }>>(
      '/health'
    );
    if (!response.data.success || !response.data.data) {
      throw new Error('Health check failed');
    }
    return response.data.data;
  },
};
