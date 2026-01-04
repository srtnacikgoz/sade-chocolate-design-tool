import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { WorkflowProgress } from '../components/design/WorkflowProgress';
import { SVGViewer } from '../components/design/SVGViewer';
import { Box3DPreview } from '../components/design/Box3DPreview';
import { DesignUpload } from '../components/design/DesignUpload';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { LoadingPage } from '../components/ui/LoadingSpinner';
import { useDesignWorkflow } from '../hooks/useDesignWorkflow';
import { designService, boxService } from '../services/designService';
import { exportService } from '../services/exportService';

export const DesignDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch design data
  const { data: design, isLoading } = useQuery({
    queryKey: ['design', id],
    queryFn: () => designService.getDesignById(id!),
    enabled: !!id,
  });

  // Fetch box template for dimensions
  const { data: boxTemplate } = useQuery({
    queryKey: ['box', design?.boxId],
    queryFn: () => boxService.getBoxById(design!.boxId),
    enabled: !!design?.boxId,
  });

  // Use workflow hook
  const {
    steps,
    progressPercentage,
    completedStepsCount,
    isPolling,
    startWorkflow,
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
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                Otomatik güncelleniyor...
              </div>
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

              {/* Technical Drawing with SVG Viewer */}
              {design.technicalDrawing && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Teknik Cizim
                  </h3>
                  <SVGViewer
                    svgContent={design.technicalDrawing.svgContent || ''}
                    title={`Die-Line - ${design.boxId}`}
                    downloadFileName={`sade-chocolate-${design.id}.svg`}
                    onDownload={() => exportService.downloadSVG(design.id)}
                  />
                  {design.technicalDrawing.dieLineData && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Olculer:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Duz Genislik:</span>
                          <span className="ml-2 font-medium">{design.technicalDrawing.dieLineData.dimensions.flatWidth}mm</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duz Yukseklik:</span>
                          <span className="ml-2 font-medium">{design.technicalDrawing.dieLineData.dimensions.flatHeight}mm</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tasmasi (Bleed):</span>
                          <span className="ml-2 font-medium">{design.technicalDrawing.bleedArea}mm</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Katlama Cizgisi:</span>
                          <span className="ml-2 font-medium">{design.technicalDrawing.foldLines?.length || 0} adet</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3D Box Preview */}
              {boxTemplate && (
                <Card padding="lg">
                  <CardHeader
                    title="3D Kutu Onizleme"
                    subtitle="Bitmiş kutunun 3D görünümü"
                  />
                  <Box3DPreview
                    dimensions={boxTemplate.dimensions}
                    lidDimensions={boxTemplate.lidDimensions}
                    isTwoPiece={boxTemplate.structure === 'two-piece' || design.technicalDrawing?.isTwoPiece}
                    primaryColor={design.visualDesign?.colorPalette?.colors?.[0]?.hex || '#8B7355'}
                    accentColor={design.visualDesign?.colorPalette?.colors?.[1]?.hex || '#D4AF37'}
                  />
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

              {/* Custom Design Upload */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📤 Özel Tasarım
                </h3>

                {/* Show uploaded design if exists */}
                {design.customDesign ? (
                  <Card padding="lg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Yüklenmiş Tasarım</h4>
                          <p className="text-sm text-gray-600">{design.customDesign.fileName}</p>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={design.customDesign.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-700 hover:text-gray-900 underline"
                          >
                            Görüntüle
                          </a>
                          <a
                            href={design.customDesign.fileUrl}
                            download={design.customDesign.fileName}
                            className="text-sm text-gray-700 hover:text-gray-900 underline"
                          >
                            İndir
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Dosya Tipi:</span>
                          <span className="ml-2 font-medium uppercase">{design.customDesign.fileType}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Boyut:</span>
                          <span className="ml-2 font-medium">
                            {(design.customDesign.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Yüklenme:</span>
                          <span className="ml-2 font-medium">
                            {new Date(design.customDesign.uploadedAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>

                      {/* Show preview for images */}
                      {['png', 'jpg', 'jpeg', 'svg'].includes(design.customDesign.fileType) && (
                        <div className="mt-4">
                          <img
                            src={design.customDesign.fileUrl}
                            alt={design.customDesign.fileName}
                            className="max-w-full h-auto border border-gray-200 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  // Show upload component if no design uploaded yet
                  <DesignUpload designId={design.id} />
                )}
              </div>
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
