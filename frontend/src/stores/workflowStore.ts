import { create } from 'zustand';
import type { Workflow, WorkflowStep } from '../types/workflow.types';

interface WorkflowState {
  // Current active workflow
  currentWorkflow: Workflow | null;

  // Workflow steps for UI display
  steps: WorkflowStep[];

  // Current step index
  currentStepIndex: number;

  // Polling state
  isPolling: boolean;
  pollingInterval: number; // milliseconds

  // Actions
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setSteps: (steps: WorkflowStep[]) => void;
  updateStepStatus: (stepName: string, status: WorkflowStep['status'], output?: any) => void;
  setCurrentStepIndex: (index: number) => void;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;

  // Helper methods
  getStepByName: (name: WorkflowStep['name']) => WorkflowStep | undefined;
  isStepCompleted: (name: WorkflowStep['name']) => boolean;
  getCompletedStepsCount: () => number;
  getProgressPercentage: () => number;
}

const initialState = {
  currentWorkflow: null,
  steps: [],
  currentStepIndex: 0,
  isPolling: false,
  pollingInterval: 5000, // 5 seconds
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  ...initialState,

  setCurrentWorkflow: (workflow) => {
    set({ currentWorkflow: workflow });

    // Auto-update steps when workflow changes
    if (workflow?.steps) {
      set({ steps: workflow.steps });
    }
  },

  setSteps: (steps) =>
    set({ steps }),

  updateStepStatus: (stepName, status, output) =>
    set((state) => ({
      steps: state.steps.map((step) =>
        step.name === stepName
          ? {
              ...step,
              status,
              ...(output && { output }),
              ...(status === 'running' && { startedAt: new Date() }),
              ...(status === 'completed' && { completedAt: new Date() }),
            }
          : step
      ),
    })),

  setCurrentStepIndex: (index) =>
    set({ currentStepIndex: index }),

  startPolling: () =>
    set({ isPolling: true }),

  stopPolling: () =>
    set({ isPolling: false }),

  reset: () =>
    set(initialState),

  // Helper methods
  getStepByName: (name) => {
    const { steps } = get();
    return steps.find((step) => step.name === name);
  },

  isStepCompleted: (name) => {
    const { steps } = get();
    const step = steps.find((s) => s.name === name);
    return step?.status === 'completed';
  },

  getCompletedStepsCount: () => {
    const { steps } = get();
    return steps.filter((step) => step.status === 'completed').length;
  },

  getProgressPercentage: () => {
    const { steps } = get();
    if (steps.length === 0) return 0;
    const completedCount = steps.filter((step) => step.status === 'completed').length;
    return Math.round((completedCount / steps.length) * 100);
  },
}));
