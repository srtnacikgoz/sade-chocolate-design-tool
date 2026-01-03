// API Request/Response types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Design API
export interface CreateDesignRequest {
  boxId?: string;
  customDimensions?: {
    length: number;
    width: number;
    height: number;
  };
  preferences?: DesignPreferences;
  autoStartWorkflow?: boolean;
}

export interface DesignPreferences {
  theme?: string;
  colorPreferences?: string[];
  materialPreference?: string;
  budgetRange?: {
    min: number;
    max: number;
  };
}

export interface CreateDesignResponse {
  designId: string;
  workflowId?: string;
  status: string;
}

// Workflow API
export interface StartWorkflowRequest {
  designId: string;
  type?: 'full-pipeline' | 'cost-only';
}

export interface StartWorkflowResponse {
  workflowId: string;
  status: string;
  estimatedDuration: number; // seconds
}

export interface WorkflowStatusResponse {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: number;
  totalSteps: number;
  progress: number; // 0-100
  currentStepName?: string;
  error?: string;
}

// Cost Calculation API
export interface CalculateCostRequest {
  boxId?: string;
  customDimensions?: {
    length: number;
    width: number;
    height: number;
  };
  material: {
    paperType: string;
    thickness: number;
    coating?: string;
  };
  printingTechniques: string[];
  quantity: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
