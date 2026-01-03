import { useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDesignStore } from '../stores/designStore';
import { useWorkflowStore } from '../stores/workflowStore';
import { designService } from '../services/designService';
import type { Design } from '../types/design.types';
import type { WorkflowStep } from '../types/workflow.types';

/**
 * Custom hook for managing design workflow
 * Handles workflow creation, polling, and state updates
 */
export const useDesignWorkflow = (designId?: string) => {
  const { currentDesign, setCurrentDesign, updateDesign } = useDesignStore();
  const {
    steps,
    isPolling,
    pollingInterval,
    setSteps,
    startPolling,
    stopPolling,
    getProgressPercentage,
    getCompletedStepsCount,
  } = useWorkflowStore();

  /**
   * Fetch design by ID
   */
  const { data: design, isLoading: isLoadingDesign } = useQuery({
    queryKey: ['design', designId],
    queryFn: () => designService.getDesignById(designId!),
    enabled: !!designId,
  });

  // Update store when design data changes
  useEffect(() => {
    if (design) {
      setCurrentDesign(design);
    }
  }, [design, setCurrentDesign]);

  /**
   * Initialize workflow steps from design
   */
  useEffect(() => {
    if (!design) return;

    const workflowSteps: WorkflowStep[] = [
      {
        name: 'trend',
        displayName: 'Trend Analizi',
        status: design.trendAnalysis ? 'completed' : 'pending',
        icon: '🔍 Pazar araştırması ve trend analizi',
        agentName: 'trend-analisti',
        ...(design.trendAnalysis && { completedAt: design.trendAnalysis.completedAt }),
      },
      {
        name: 'visual',
        displayName: 'Görsel Tasarım',
        status: design.visualDesign ? 'completed' : 'pending',
        icon: '🎨 Renk paleti ve görsel öğeler',
        agentName: 'gorsel-tasarimci',
        ...(design.visualDesign && { completedAt: design.visualDesign.completedAt }),
      },
      {
        name: 'technical',
        displayName: 'Teknik Çizim',
        status: design.technicalDrawing ? 'completed' : 'pending',
        icon: '📐 Die-line ve teknik spesifikasyonlar',
        agentName: 'teknik-cizimci',
        ...(design.technicalDrawing && { completedAt: design.technicalDrawing.completedAt }),
      },
      {
        name: 'cost',
        displayName: 'Maliyet Hesaplama',
        status: design.costReport ? 'completed' : 'pending',
        icon: '💰 Malzeme ve üretim maliyeti',
        agentName: 'maliyet-uzmani',
        ...(design.costReport && { completedAt: design.costReport.completedAt }),
      },
    ];

    setSteps(workflowSteps);
  }, [design, setSteps]);

  /**
   * Start workflow mutation
   */
  const startWorkflowMutation = useMutation({
    mutationFn: async (designId: string) => {
      // TODO: Call workflow API endpoint when implemented
      // For now, this is a placeholder
      console.log('Starting workflow for design:', designId);
      return { workflowId: 'placeholder' };
    },
  });

  // Start polling when workflow mutation succeeds
  useEffect(() => {
    if (startWorkflowMutation.isSuccess) {
      startPolling();
    }
  }, [startWorkflowMutation.isSuccess, startPolling]);

  /**
   * Poll for workflow updates
   */
  const { refetch: refetchDesign } = useQuery({
    queryKey: ['design-poll', designId],
    queryFn: () => designService.getDesignById(designId!),
    enabled: isPolling && !!designId,
    refetchInterval: pollingInterval,
  });

  // Update design when polling data changes
  useEffect(() => {
    if (isPolling && design) {
      setCurrentDesign(design);
      updateDesign(design.id, design as Partial<Design>);

      // Check if workflow is complete
      if (design.status === 'completed' || design.status === 'failed') {
        stopPolling();
      }
    }
  }, [design, isPolling, setCurrentDesign, updateDesign, stopPolling]);

  /**
   * Start workflow handler
   */
  const handleStartWorkflow = useCallback(
    (designId: string) => {
      startWorkflowMutation.mutate(designId);
    },
    [startWorkflowMutation]
  );

  /**
   * Stop polling handler
   */
  const handleStopPolling = useCallback(() => {
    stopPolling();
  }, [stopPolling]);

  return {
    // Design data
    design: currentDesign || design,
    isLoadingDesign,

    // Workflow state
    steps,
    progressPercentage: getProgressPercentage(),
    completedStepsCount: getCompletedStepsCount(),
    isPolling,

    // Actions
    startWorkflow: handleStartWorkflow,
    stopPolling: handleStopPolling,
    refetchDesign,

    // Workflow mutation state
    isStartingWorkflow: startWorkflowMutation.isPending,
    workflowError: startWorkflowMutation.error,
  };
};
