import apiClient from './api';
import type { ApiResponse, PaginatedResponse } from './api';
import type { Design, BoxTemplate } from '../types/design.types';

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
    return response.data.data;
  },

  /**
   * Get design by ID
   */
  getDesignById: async (id: string): Promise<Design> => {
    const response = await apiClient.get<ApiResponse<Design>>(`/api/v1/designs/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch design');
    }
    return response.data.data;
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
    return response.data;
  },

  /**
   * Update design
   */
  updateDesign: async (
    id: string,
    updates: Partial<Design>
  ): Promise<Design> => {
    const response = await apiClient.patch<ApiResponse<Design>>(
      `/api/v1/designs/${id}`,
      updates
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update design');
    }
    return response.data.data;
  },

  /**
   * Delete design
   */
  deleteDesign: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/v1/designs/${id}`);
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
};

// Box Service - API calls for box templates
export const boxService = {
  /**
   * List all box templates
   */
  listBoxes: async (type?: string): Promise<BoxTemplate[]> => {
    const response = await apiClient.get<ApiResponse<BoxTemplate[]>>('/v1/boxes', {
      params: type ? { type } : undefined,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch boxes');
    }
    return response.data.data;
  },

  /**
   * Get box template by ID
   */
  getBoxById: async (id: string): Promise<BoxTemplate> => {
    const response = await apiClient.get<ApiResponse<BoxTemplate>>(`/api/v1/boxes/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch box');
    }
    return response.data.data;
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
