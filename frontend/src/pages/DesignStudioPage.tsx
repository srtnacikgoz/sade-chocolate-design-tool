import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BoxDimensionPicker } from '../components/design/BoxDimensionPicker';
import { Box3DPreview } from '../components/design/Box3DPreview';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { LoadingPage } from '../components/ui/LoadingSpinner';
import { boxService, designService } from '../services/designService';
import { exportBoxSVG } from '../utils/svgGenerator';
import type { BoxTemplate } from '../types/design.types';
import { queryClient } from '../lib/queryClient';

type DesignMethod = 'ai' | 'custom' | null;
type Step = 'box-selection' | 'method-selection' | 'custom-upload' | 'preview';
type Alignment = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface UploadedGraphic {
  file: File;
  preview: string;
  scale: number;
  alignment: Alignment;
}

export const DesignStudioPage = () => {
  const navigate = useNavigate();
  const [selectedBox, setSelectedBox] = useState<BoxTemplate | null>(null);
  const [designMethod, setDesignMethod] = useState<DesignMethod>(null);
  const [currentStep, setCurrentStep] = useState<Step>('box-selection');

  // Graphic upload states
  const [lidGraphic, setLidGraphic] = useState<UploadedGraphic | null>(null);
  const [sideGraphic, setSideGraphic] = useState<UploadedGraphic | null>(null);

  const lidInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);

  // Fetch box templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['boxes'],
    queryFn: () => boxService.listBoxes(),
  });

  // Create design mutation (for AI workflow)
  const createDesignMutation = useMutation({
    mutationFn: (boxId: string) =>
      designService.createDesign({ boxId }),
    onSuccess: (design) => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      navigate(`/designs/${design.id}`);
    },
    onError: (error) => {
      console.error('Create design failed:', error);
      setCurrentStep('preview');
    },
  });

  const handleBoxSelect = (template: BoxTemplate) => {
    setSelectedBox(template);
  };

  const handleContinueToMethod = () => {
    if (selectedBox) {
      setCurrentStep('method-selection');
    }
  };

  const handleMethodSelect = (method: DesignMethod) => {
    setDesignMethod(method);
    if (method === 'ai') {
      if (selectedBox) {
        createDesignMutation.mutate(selectedBox.id);
      }
    } else if (method === 'custom') {
      setCurrentStep('custom-upload');
    }
  };

  const handleGraphicUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'lid' | 'side'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Geçersiz dosya tipi! SVG, PNG, JPEG veya WebP yükleyin.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya çok büyük! Maksimum 5MB yüklenebilir.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const graphic: UploadedGraphic = {
        file,
        preview: event.target?.result as string,
        scale: 80,
        alignment: 'center',
      };

      if (type === 'lid') {
        setLidGraphic(graphic);
      } else {
        setSideGraphic(graphic);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleScaleChange = (type: 'lid' | 'side', scale: number) => {
    if (type === 'lid' && lidGraphic) {
      setLidGraphic({ ...lidGraphic, scale });
    } else if (type === 'side' && sideGraphic) {
      setSideGraphic({ ...sideGraphic, scale });
    }
  };

  const handleAlignmentChange = (type: 'lid' | 'side', alignment: Alignment) => {
    if (type === 'lid' && lidGraphic) {
      setLidGraphic({ ...lidGraphic, alignment });
    } else if (type === 'side' && sideGraphic) {
      setSideGraphic({ ...sideGraphic, alignment });
    }
  };

  const handleRemoveGraphic = (type: 'lid' | 'side') => {
    if (type === 'lid') {
      setLidGraphic(null);
      if (lidInputRef.current) lidInputRef.current.value = '';
    } else {
      setSideGraphic(null);
      if (sideInputRef.current) sideInputRef.current.value = '';
    }
  };

  const handleContinueToPreview = () => {
    setCurrentStep('preview');
  };

  const handleBack = () => {
    if (currentStep === 'method-selection') {
      setCurrentStep('box-selection');
      setDesignMethod(null);
    } else if (currentStep === 'custom-upload') {
      setCurrentStep('method-selection');
    } else if (currentStep === 'preview') {
      if (designMethod === 'custom') {
        setCurrentStep('custom-upload');
      } else {
        setCurrentStep('method-selection');
      }
    }
  };

  const handleDownloadTemplate = (part: 'single' | 'base' | 'lid' | 'both') => {
    if (selectedBox) {
      exportBoxSVG(selectedBox.dimensions, { part, showLabels: true });
    }
  };

  if (isLoadingTemplates) {
    return <LoadingPage message="Kutu şablonları yükleniyor..." />;
  }

  const isTwoPiece = selectedBox?.type === 'gift' || selectedBox?.type === 'truffle';
  const hasAnyGraphic = lidGraphic || sideGraphic;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tasarım Stüdyosu
          </h1>
          <p className="text-gray-600">
            {currentStep === 'box-selection' && 'Adım 1: Kutu boyutlarını seçin'}
            {currentStep === 'method-selection' && 'Adım 2: Tasarım yöntemini seçin'}
            {currentStep === 'custom-upload' && 'Adım 3: Grafiklerinizi yükleyin'}
            {currentStep === 'preview' && 'Önizleme ve Export'}
          </p>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`flex items-center gap-2 ${currentStep === 'box-selection' ? 'text-gray-900' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'box-selection' ? 'bg-gray-900 text-white' :
                selectedBox ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {selectedBox && currentStep !== 'box-selection' ? '✓' : '1'}
              </span>
              <span className="text-sm font-medium">Kutu</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'method-selection' ? 'text-gray-900' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'method-selection' ? 'bg-gray-900 text-white' :
                designMethod ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {designMethod && currentStep !== 'method-selection' ? '✓' : '2'}
              </span>
              <span className="text-sm font-medium">Yöntem</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'custom-upload' ? 'text-gray-900' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'custom-upload' ? 'bg-gray-900 text-white' :
                hasAnyGraphic ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {hasAnyGraphic && currentStep !== 'custom-upload' ? '✓' : '3'}
              </span>
              <span className="text-sm font-medium">Grafik</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'preview' ? 'text-gray-900' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'preview' ? 'bg-gray-900 text-white' : 'bg-gray-200'
              }`}>
                4
              </span>
              <span className="text-sm font-medium">Önizleme</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        {currentStep !== 'box-selection' && (
          <button
            onClick={handleBack}
            className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            ← Geri
          </button>
        )}

        {/* STEP 1: Box Selection */}
        {currentStep === 'box-selection' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BoxDimensionPicker
                templates={templates}
                onSelect={handleBoxSelect}
                selectedId={selectedBox?.id}
              />
            </div>

            <div className="lg:col-span-1">
              <Card padding="lg" shadow="lg">
                <CardHeader title="Seçilen Kutu" subtitle="Boyut bilgileri" />

                {selectedBox ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900">{selectedBox.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedBox.dimensions.length} × {selectedBox.dimensions.width} × {selectedBox.dimensions.height} mm
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Kapasite: {selectedBox.capacity} adet
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Tip: {isTwoPiece ? 'İki Parça (Tepsi + Kapak)' : 'Tek Parça'}
                      </p>
                    </div>

                    <Button onClick={handleContinueToMethod} className="w-full" size="lg">
                      Devam Et →
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">Lütfen bir kutu şablonu seçin</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* STEP 2: Method Selection */}
        {currentStep === 'method-selection' && selectedBox && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* AI Design Option */}
            <Card
              padding="lg"
              shadow="lg"
              className="cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-2 border-transparent hover:border-gray-300"
              onClick={() => handleMethodSelect('ai')}
            >
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI ile Tasarla</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Yapay zeka trend analizi yapıp tasarım önerileri sunsun
                </p>
                <ul className="text-left text-sm text-gray-500 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span> Trend Analizi
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span> Görsel Tasarım Önerileri
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Otomatik Teknik Çizim
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span> Maliyet Hesaplama
                  </li>
                </ul>
                <Button className="w-full" size="lg" isLoading={createDesignMutation.isPending}>
                  {createDesignMutation.isPending ? 'Başlatılıyor...' : 'AI Sürecini Başlat'}
                </Button>
              </div>
            </Card>

            {/* Custom Upload Option */}
            <Card
              padding="lg"
              shadow="lg"
              className="cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-2 border-transparent hover:border-gray-300"
              onClick={() => handleMethodSelect('custom')}
            >
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🎨</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kendi Grafiğimi Yükle</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Hazırladığın logo veya deseni yükle, sistem kutuya yerleştirsin
                </p>
                <ul className="text-left text-sm text-gray-500 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500">✓</span> Logo veya desen yükle
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span> Boyut ve konum ayarla
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">✓</span> 3D önizleme
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-500">✓</span> Baskıya hazır SVG indir
                  </li>
                </ul>
                <Button variant="outline" className="w-full" size="lg">
                  Grafik Yükle
                </Button>
              </div>
            </Card>

            {createDesignMutation.isError && (
              <div className="md:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Backend bağlantısı yok.</strong> "Kendi Grafiğimi Yükle" seçeneğini kullanabilirsiniz.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Custom Upload - Simplified */}
        {currentStep === 'custom-upload' && selectedBox && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Lid Graphic Upload */}
            <Card padding="lg" shadow="lg">
              <CardHeader
                title="Kapak Üstü Grafiği"
                subtitle="Logo, desen veya görsel yükleyin"
              />

              <div className="space-y-4">
                {lidGraphic ? (
                  <div className="space-y-4">
                    {/* Preview */}
                    <div className="relative bg-gray-100 rounded-lg p-4 flex justify-center">
                      <img
                        src={lidGraphic.preview}
                        alt="Kapak grafiği"
                        className="max-h-48 object-contain rounded"
                        style={{ maxWidth: `${lidGraphic.scale}%` }}
                      />
                      <button
                        onClick={() => handleRemoveGraphic('lid')}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Boyut: {lidGraphic.scale}%
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={lidGraphic.scale}
                          onChange={(e) => handleScaleChange('lid', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yerleşim
                        </label>
                        <select
                          value={lidGraphic.alignment}
                          onChange={(e) => handleAlignmentChange('lid', e.target.value as Alignment)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="center">Ortala</option>
                          <option value="top-left">Sol Üst</option>
                          <option value="top-right">Sağ Üst</option>
                          <option value="bottom-left">Sol Alt</option>
                          <option value="bottom-right">Sağ Alt</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => lidInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <div className="text-5xl mb-3">📤</div>
                    <p className="text-gray-700 font-medium">Kapak grafiğini yükleyin</p>
                    <p className="text-sm text-gray-500 mt-1">SVG, PNG veya JPEG</p>
                    <p className="text-xs text-gray-400 mt-2">Maks. 5MB</p>
                  </div>
                )}

                <input
                  ref={lidInputRef}
                  type="file"
                  accept=".svg,.png,.jpg,.jpeg,.webp,image/*"
                  onChange={(e) => handleGraphicUpload(e, 'lid')}
                  className="hidden"
                />
              </div>
            </Card>

            {/* Side Graphic Upload (Optional) */}
            <Card padding="lg" shadow="lg">
              <CardHeader
                title="Yan Yüzey Grafiği"
                subtitle="Opsiyonel - Kutu kenarlarına gelecek grafik"
              />

              <div className="space-y-4">
                {sideGraphic ? (
                  <div className="space-y-4">
                    {/* Preview */}
                    <div className="relative bg-gray-100 rounded-lg p-4 flex justify-center">
                      <img
                        src={sideGraphic.preview}
                        alt="Yan yüzey grafiği"
                        className="max-h-32 object-contain rounded"
                        style={{ maxWidth: `${sideGraphic.scale}%` }}
                      />
                      <button
                        onClick={() => handleRemoveGraphic('side')}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Boyut: {sideGraphic.scale}%
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={sideGraphic.scale}
                          onChange={(e) => handleScaleChange('side', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yerleşim
                        </label>
                        <select
                          value={sideGraphic.alignment}
                          onChange={(e) => handleAlignmentChange('side', e.target.value as Alignment)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="center">Ortala</option>
                          <option value="top-left">Sol Üst</option>
                          <option value="top-right">Sağ Üst</option>
                          <option value="bottom-left">Sol Alt</option>
                          <option value="bottom-right">Sağ Alt</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => sideInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    <div className="text-3xl mb-2 opacity-50">📤</div>
                    <p className="text-gray-500 text-sm">Yan yüzey grafiği ekle (opsiyonel)</p>
                  </div>
                )}

                <input
                  ref={sideInputRef}
                  type="file"
                  accept=".svg,.png,.jpg,.jpeg,.webp,image/*"
                  onChange={(e) => handleGraphicUpload(e, 'side')}
                  className="hidden"
                />
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleContinueToPreview}
                className="flex-1"
                size="lg"
                disabled={!lidGraphic}
              >
                3D Önizleme →
              </Button>
              <Button
                variant="outline"
                onClick={handleContinueToPreview}
                size="lg"
              >
                Grafiksiz Devam Et
              </Button>
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>İpucu:</strong> En iyi sonuç için şeffaf arka planlı PNG veya SVG dosyası kullanın.
                Sistem grafiğinizi otomatik olarak kutu yüzeyine yerleştirecektir.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Preview */}
        {currentStep === 'preview' && selectedBox && (
          <div className="space-y-6">
            {/* 3D Preview */}
            <Card padding="lg" shadow="lg">
              <CardHeader
                title="3D Kutu Önizleme"
                subtitle={`${selectedBox.name} - ${selectedBox.dimensions.length} × ${selectedBox.dimensions.width} × ${selectedBox.dimensions.height} mm`}
              />

              {/* Show uploaded graphic info */}
              {lidGraphic && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <img src={lidGraphic.preview} alt="" className="w-12 h-12 object-contain rounded" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Kapak Grafiği Yüklendi</p>
                    <p className="text-xs text-green-600">Boyut: {lidGraphic.scale}% | Konum: {lidGraphic.alignment}</p>
                  </div>
                </div>
              )}

              <Box3DPreview
                key={`${selectedBox.id}-${selectedBox.dimensions.length}-${lidGraphic?.preview}`}
                dimensions={selectedBox.dimensions}
                isTwoPiece={isTwoPiece}
                primaryColor="#8B7355"
                accentColor="#D4AF37"
                showLabels={true}
                lidGraphic={lidGraphic ? {
                  dataUrl: lidGraphic.preview,
                  scale: lidGraphic.scale,
                  alignment: lidGraphic.alignment,
                } : undefined}
              />
            </Card>

            {/* Graphic Preview Panel */}
            {(lidGraphic || sideGraphic) && (
              <Card padding="lg" shadow="lg">
                <CardHeader
                  title="Yüklenen Grafikler"
                  subtitle="Bu grafikler kutu yüzeyine yerleştirilecek"
                />
                <div className="grid grid-cols-2 gap-4">
                  {lidGraphic && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 mb-2">Kapak Üstü</p>
                      <img
                        src={lidGraphic.preview}
                        alt="Kapak"
                        className="max-h-32 mx-auto object-contain"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        {lidGraphic.scale}% | {lidGraphic.alignment}
                      </p>
                    </div>
                  )}
                  {sideGraphic && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 mb-2">Yan Yüzey</p>
                      <img
                        src={sideGraphic.preview}
                        alt="Yan"
                        className="max-h-32 mx-auto object-contain"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        {sideGraphic.scale}% | {sideGraphic.alignment}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Export Options */}
            <Card padding="lg" shadow="lg">
              <CardHeader
                title="Baskıya Hazır Dosyalar"
                subtitle="Die-line SVG dosyalarını indirin"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {isTwoPiece ? (
                  <>
                    <Button variant="outline" onClick={() => handleDownloadTemplate('base')}>
                      Tepsi SVG
                    </Button>
                    <Button variant="outline" onClick={() => handleDownloadTemplate('lid')}>
                      Kapak SVG
                    </Button>
                    <Button onClick={() => handleDownloadTemplate('both')} className="md:col-span-2">
                      Tüm Dosyaları İndir
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => handleDownloadTemplate('single')}>
                      Die-Line SVG
                    </Button>
                    <Button variant="outline" onClick={() => handleDownloadTemplate('base')}>
                      Tepsi Versiyon
                    </Button>
                    <Button onClick={() => handleDownloadTemplate('both')} className="md:col-span-2">
                      Tüm Versiyonları İndir
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                SVG dosyaları katmanlı ve baskıya hazırdır. Adobe Illustrator, Inkscape veya herhangi bir vektör editöründe açabilirsiniz.
              </p>
            </Card>

            {/* Next Steps */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Sonraki Adımlar</h4>
              <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                <li>SVG dosyasını indirin</li>
                <li>Adobe Illustrator veya Inkscape'te açın</li>
                <li>Yüklediğiniz grafiği "Artwork" katmanına yerleştirin</li>
                <li>Baskıya gönderin!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
