import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BoxDimensionPicker } from '../components/design/BoxDimensionPicker';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { LoadingPage } from '../components/ui/LoadingSpinner';
import { boxService, designService } from '../services/designService';
import type { BoxTemplate } from '../types/design.types';
import { queryClient } from '../lib/queryClient';

export const DesignStudioPage = () => {
  const navigate = useNavigate();
  const [selectedBox, setSelectedBox] = useState<BoxTemplate | null>(null);

  // Fetch box templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxService.listBoxes(),
  });

  // Create design mutation
  const createDesignMutation = useMutation({
    mutationFn: (boxId: string) =>
      designService.createDesign({ boxId }),
    onSuccess: (design) => {
      // Invalidate designs list
      queryClient.invalidateQueries({ queryKey: ['designs'] });

      // Navigate to design detail page
      navigate(`/designs/${design.id}`);
    },
  });

  const handleBoxSelect = (template: BoxTemplate) => {
    setSelectedBox(template);
  };

  const handleStartDesign = () => {
    if (!selectedBox) return;
    createDesignMutation.mutate(selectedBox.id);
  };

  if (isLoadingTemplates) {
    return <LoadingPage message="Kutu şablonları yükleniyor..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tasarım Stüdyosu
          </h1>
          <p className="text-gray-600">
            Kutu boyutlarını seçin ve AI destekli tasarım sürecini başlatın
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Box Selector */}
          <div className="lg:col-span-2">
            <BoxDimensionPicker
              templates={templates}
              onSelect={handleBoxSelect}
              selectedId={selectedBox?.id}
            />
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1">
            <Card padding="lg" shadow="lg">
              <CardHeader
                title="Tasarım Özeti"
                subtitle="Seçilen kutu bilgileri"
              />

              {selectedBox ? (
                <div className="space-y-4">
                  {/* Selected Box Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Seçili Kutu
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900">{selectedBox.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedBox.dimensions.length} × {selectedBox.dimensions.width} × {selectedBox.dimensions.height} mm
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Kapasite: {selectedBox.capacity} adet
                      </p>
                    </div>
                  </div>

                  {/* AI Workflow Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      AI Süreç Adımları
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-2 h-2 bg-brand-blue rounded-full"></span>
                        Trend Analizi (~2 dakika)
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-2 h-2 bg-brand-yellow rounded-full"></span>
                        Görsel Tasarım (~2 dakika)
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-2 h-2 bg-brand-green rounded-full"></span>
                        Teknik Çizim (~3 dakika)
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-2 h-2 bg-brand-orange rounded-full"></span>
                        Maliyet Hesaplama (~1 dakika)
                      </li>
                    </ul>
                  </div>

                  {/* Start Button */}
                  <Button
                    onClick={handleStartDesign}
                    className="w-full"
                    size="lg"
                    isLoading={createDesignMutation.isPending}
                  >
                    {createDesignMutation.isPending
                      ? 'Tasarım Oluşturuluyor...'
                      : 'Tasarımı Başlat'}
                  </Button>

                  {createDesignMutation.isError && (
                    <p className="text-sm text-red-600">
                      Hata: {(createDesignMutation.error as Error).message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    Lütfen bir kutu şablonu seçin
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
