import { useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDesignStore } from '../stores/designStore';
import { useWorkflowStore } from '../stores/workflowStore';
import { designService } from '../services/designService';
import { workflowService } from '../services/workflowService';
import type { Design } from '../types/design.types';
import type { WorkflowStep } from '../types/workflow.types';

/**
 * Custom hook for managing design workflow
 * Handles workflow creation, polling, and state updates
 */
export const useDesignWorkflow = (designId?: string) => {
  const { currentDesign, setCurrentDesign } = useDesignStore();
  const {
    steps,
    setSteps,
    getProgressPercentage,
    getCompletedStepsCount,
  } = useWorkflowStore();

  /**
   * Fetch design by ID with auto-refresh when polling is active
   */
  const { data: design, isLoading: isLoadingDesign, refetch: refetchDesign } = useQuery({
    queryKey: ['design', designId],
    queryFn: () => designService.getDesignById(designId!),
    enabled: !!designId,
    // Auto-refresh every 5 seconds when polling is active
    refetchInterval: (query) => {
      const data = query.state.data as Design | undefined;
      const shouldPoll = data?.status === 'processing';
      return shouldPoll ? 5000 : false;
    },
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
      // Gerçek workflow API'sini çağır
      return await workflowService.startWorkflow(designId);
    },
    onSuccess: () => {
      // Mutation başarılı olduğunda design'ı refresh et
      // Bu design'ı 'processing' status'üne getirecek ve otomatik polling başlayacak
      refetchDesign();
      console.log('[useDesignWorkflow] Workflow started, refetching design');
    },
  });

  /**
   * Start workflow handler
   */
  const handleStartWorkflow = useCallback(
    (designId: string) => {
      startWorkflowMutation.mutate(designId);
    },
    [startWorkflowMutation]
  );

  return {
    // Design data
    design: currentDesign || design,
    isLoadingDesign,

    // Workflow state
    steps,
    progressPercentage: getProgressPercentage(),
    completedStepsCount: getCompletedStepsCount(),
    isPolling: design?.status === 'processing', // Auto-polling when processing

    // Actions
    startWorkflow: handleStartWorkflow,
    refetchDesign,

    // Workflow mutation state
    isStartingWorkflow: startWorkflowMutation.isPending,
    workflowError: startWorkflowMutation.error,
  };
};
