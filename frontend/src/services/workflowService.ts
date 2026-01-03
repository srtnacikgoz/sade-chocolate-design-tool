import apiClient from './api';
import type { ApiResponse } from './api';
import type { Workflow } from '../types/workflow.types';

/**
 * Workflow Service - API çağrıları
 */
export const workflowService = {
  /**
   * Yeni workflow başlatır
   */
  startWorkflow: async (designId: string, type: Workflow['type'] = 'full-pipeline'): Promise<Workflow> => {
    const response = await apiClient.post<ApiResponse<Workflow>>('/api/v1/workflows/start', {
      designId,
      type,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Workflow başlatılamadı');
    }

    return response.data.data;
  },

  /**
   * Workflow durumunu getirir
   */
  getWorkflowStatus: async (workflowId: string): Promise<Partial<Workflow>> => {
    const response = await apiClient.get<ApiResponse<Partial<Workflow>>>(
      `/api/v1/workflows/${workflowId}/status`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Workflow durumu alınamadı');
    }

    return response.data.data;
  },

  /**
   * Workflow detaylarını getirir
   */
  getWorkflowById: async (workflowId: string): Promise<Workflow> => {
    const response = await apiClient.get<ApiResponse<Workflow>>(`/api/v1/workflows/${workflowId}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Workflow bulunamadı');
    }

    return response.data.data;
  },

  /**
   * Workflow'ları listeler
   */
  listWorkflows: async (params?: {
    status?: Workflow['status'];
    designId?: string;
    limit?: number;
  }): Promise<Workflow[]> => {
    const response = await apiClient.get<ApiResponse<Workflow[]>>('/api/v1/workflows', {
      params,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error('Workflow listesi alınamadı');
    }

    return response.data.data;
  },

  /**
   * Workflow'u durdurur
   */
  pauseWorkflow: async (workflowId: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/api/v1/workflows/${workflowId}/pause`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Workflow durdurulamadı');
    }
  },

  /**
   * Workflow'u yeniden başlatır
   */
  resumeWorkflow: async (workflowId: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/api/v1/workflows/${workflowId}/resume`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Workflow yeniden başlatılamadı');
    }
  },

  /**
   * Workflow'u siler
   */
  deleteWorkflow: async (workflowId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/v1/workflows/${workflowId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Workflow silinemedi');
    }
  },
};
