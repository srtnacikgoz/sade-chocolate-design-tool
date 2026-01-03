export interface Workflow {
  id: string;
  designId: string;
  type: 'full-pipeline' | 'cost-only' | 'visual-only';

  steps: WorkflowStep[];
  currentStep: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';

  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  error?: WorkflowError;
}

export interface WorkflowStep {
  name: 'trend' | 'visual' | 'technical' | 'cost';
  displayName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  icon: string;
  agentName: string;
  startedAt?: Date;
  completedAt?: Date;
  output?: any;
  error?: string;
  progress?: number; // 0-100
}

export interface WorkflowError {
  step: string;
  message: string;
  timestamp: Date;
  code?: string;
}

export interface WorkflowConfig {
  skipTrend?: boolean;
  skipVisual?: boolean;
  skipTechnical?: boolean;
  skipCost?: boolean;
  customMaterials?: boolean;
}
