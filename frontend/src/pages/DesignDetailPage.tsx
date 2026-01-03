import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { WorkflowProgress } from '../components/design/WorkflowProgress';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { LoadingPage } from '../components/ui/LoadingSpinner';
import { useDesignWorkflow } from '../hooks/useDesignWorkflow';
import { designService } from '../services/designService';

export const DesignDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch design data
  const { data: design, isLoading } = useQuery({
    queryKey: ['design', id],
    queryFn: () => designService.getDesignById(id!),
    enabled: !!id,
  });

  // Use workflow hook
  const {
    steps,
    progressPercentage,
    completedStepsCount,
    isPolling,
    startWorkflow,
    stopPolling,
    isStartingWorkflow,
  } = useDesignWorkflow(id);

  if (isLoading) {
    return <LoadingPage message="Tasarım yükleniyor..." />;
  }

  if (!design) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Tasarım Bulunamadı
        </h2>
        <Link to="/studio">
          <Button>Yeni Tasarım Başlat</Button>
        </Link>
      </div>
    );
  }

  const isWorkflowComplete = design.status === 'completed';
  const isWorkflowProcessing = design.status === 'processing';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/studio"
              className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
            >
              ← Tasarım Stüdyosu
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">
              Tasarım Detayı
            </h1>
            <p className="text-gray-600 mt-1">
              ID: {design.id}
            </p>
          </div>

          <div className="flex gap-2">
            {!isWorkflowComplete && !isWorkflowProcessing && (
              <Button
                onClick={() => startWorkflow(design.id)}
                isLoading={isStartingWorkflow}
              >
                AI Sürecini Başlat
              </Button>
            )}
            {isPolling && (
              <Button variant="outline" onClick={stopPolling}>
                Güncellemeyi Durdur
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress */}
          <div className="lg:col-span-2">
            <WorkflowProgress steps={steps} currentStep={completedStepsCount} />

            {/* Agent Outputs */}
            <div className="mt-6 space-y-6">
              {/* Trend Analysis */}
              {design.trendAnalysis && (
                <Card padding="lg">
                  <CardHeader
                    title="🔍 Trend Analizi"
                    subtitle="Pazar araştırması ve öneriler"
                  />
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{design.trendAnalysis.summary}</p>
                    {design.trendAnalysis.recommendations?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Öneriler:</h4>
                        <ul className="space-y-1">
                          {design.trendAnalysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-600">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Visual Design */}
              {design.visualDesign && (
                <Card padding="lg">
                  <CardHeader
                    title="🎨 Görsel Tasarım"
                    subtitle="Renk paleti ve görsel öğeler"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Renk Paleti:</h4>
                    <div className="flex gap-3">
                      {design.visualDesign.colorPalette?.colors?.map((color, idx) => (
                        <div key={idx} className="text-center">
                          <div
                            className="w-16 h-16 rounded-lg border border-gray-200 shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <p className="text-xs text-gray-600 mt-1">{color.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Technical Drawing */}
              {design.technicalDrawing && (
                <Card padding="lg">
                  <CardHeader
                    title="📐 Teknik Çizim"
                    subtitle="Die-line ve spesifikasyonlar"
                  />
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      SVG die-line hazır. İndirmek için butona tıklayın.
                    </p>
                    <Button variant="outline">
                      SVG İndir
                    </Button>
                  </div>
                </Card>
              )}

              {/* Cost Report */}
              {design.costReport && (
                <Card padding="lg">
                  <CardHeader
                    title="💰 Maliyet Raporu"
                    subtitle="Birim maliyet analizi"
                  />
                  <div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {design.costReport.totalUnitCost.toFixed(2)} ₺
                      </p>
                      <p className="text-sm text-gray-600">Birim maliyet</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Box Info */}
          <div className="lg:col-span-1">
            <Card padding="lg" shadow="lg">
              <CardHeader
                title="Kutu Bilgileri"
                subtitle="Seçilen şablon"
              />

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Kutu ID</p>
                  <p className="font-medium text-gray-900">{design.boxId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Durum</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      design.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : design.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : design.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {design.status === 'completed'
                      ? 'Tamamlandı'
                      : design.status === 'processing'
                      ? 'İşleniyor'
                      : design.status === 'failed'
                      ? 'Başarısız'
                      : 'Taslak'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600">İlerleme</p>
                  <p className="font-medium text-gray-900">{progressPercentage}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gray-800 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Oluşturulma: {new Date(design.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Güncelleme: {new Date(design.updatedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
