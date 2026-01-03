import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { WorkflowStep } from '../../types/workflow.types';

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  currentStep: number;
}

export const WorkflowProgress = ({ steps }: WorkflowProgressProps) => {
  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'running':
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <LoadingSpinner size="sm" color="text-white" />
          </div>
        );
      case 'failed':
        return (
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">{steps.findIndex(s => s.status === 'pending') + 1}</span>
          </div>
        );
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  return (
    <Card>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">AI Tasarım Süreci</h3>
          <span className="text-sm text-gray-600">
            {steps.filter(s => s.status === 'completed').length} / {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gray-800 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.name} className="flex items-start gap-4">
            {/* Icon */}
            {getStatusIcon(step.status)}

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${
                  step.status === 'running' ? 'text-blue-600' :
                  step.status === 'completed' ? 'text-green-600' :
                  step.status === 'failed' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {step.displayName}
                </h4>
                {step.status === 'running' && (
                  <span className="text-xs text-blue-600 animate-pulse">
                    İşleniyor...
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{step.icon}</p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-4 mt-10 h-8 w-0.5 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
