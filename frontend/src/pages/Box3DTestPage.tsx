/**
 * Box 3D Test Page
 * Standalone page for testing 3D box preview without backend
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box3DPreview } from '../components/design/Box3DPreview';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { exportBoxSVG } from '../utils/svgGenerator';

const BOX_PRESETS = [
  {
    name: '9lu Pralin Kutusu',
    dimensions: { length: 120, width: 120, height: 40 },
    lidDimensions: { length: 124, width: 124, height: 25 },
    isTwoPiece: true,
  },
  {
    name: '16lı Premium Kutu',
    dimensions: { length: 160, width: 160, height: 45 },
    lidDimensions: { length: 164, width: 164, height: 30 },
    isTwoPiece: true,
  },
  {
    name: '25li Hediye Kutusu',
    dimensions: { length: 200, width: 200, height: 50 },
    lidDimensions: { length: 204, width: 204, height: 35 },
    isTwoPiece: true,
  },
  {
    name: 'Bar Çikolata (Tek Parça)',
    dimensions: { length: 180, width: 80, height: 15 },
    isTwoPiece: false,
  },
  {
    name: '4lü Truffle Kutusu',
    dimensions: { length: 80, width: 80, height: 35 },
    lidDimensions: { length: 84, width: 84, height: 20 },
    isTwoPiece: true,
  },
];

const COLOR_PRESETS = [
  { name: 'Klasik Çikolata', primary: '#8B7355', accent: '#D4AF37' },
  { name: 'Midnight Gold', primary: '#1a1a2e', accent: '#D4AF37' },
  { name: 'Rose Gold', primary: '#f5e6e0', accent: '#b76e79' },
  { name: 'Ivory & Gold', primary: '#fffff0', accent: '#D4AF37' },
  { name: 'Dark Elegance', primary: '#2d2d2d', accent: '#c0c0c0' },
  { name: 'Pastel Pink', primary: '#ffd1dc', accent: '#D4AF37' },
];

export const Box3DTestPage = () => {
  const [selectedBox, setSelectedBox] = useState(BOX_PRESETS[1]);
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [customDimensions, setCustomDimensions] = useState({
    length: 160,
    width: 160,
    height: 45,
  });
  const [useCustom, setUseCustom] = useState(false);

  const currentDimensions = useCustom ? customDimensions : selectedBox.dimensions;
  const currentLidDimensions = useCustom
    ? {
        length: customDimensions.length + 4,
        width: customDimensions.width + 4,
        height: Math.max(20, customDimensions.height * 0.6),
      }
    : selectedBox.lidDimensions;

  // Debug log
  console.log('useCustom:', useCustom, 'dimensions:', currentDimensions);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/studio"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Tasarım Stüdyosu
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">3D Kutu Önizleme Test</h1>
          <p className="text-gray-600 mt-2">
            Farklı kutu boyutları ve renk kombinasyonlarını test edin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 3D Preview */}
          <div className="lg:col-span-2">
            <Card padding="lg" shadow="lg">
              <CardHeader
                title="3D Önizleme"
                subtitle={`${useCustom ? 'Özel' : selectedBox.name}: ${currentDimensions.length}×${currentDimensions.width}×${currentDimensions.height}mm`}
              />
              <Box3DPreview
                key={`${currentDimensions.length}-${currentDimensions.width}-${currentDimensions.height}-${useCustom}`}
                dimensions={currentDimensions}
                lidDimensions={currentLidDimensions}
                isTwoPiece={useCustom ? true : selectedBox.isTwoPiece}
                primaryColor={selectedColor.primary}
                accentColor={selectedColor.accent}
                showLabels={true}
              />

              {/* SVG Export Buttons */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">SVG Die-Line İndir</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportBoxSVG(currentDimensions, { part: 'single', showLabels: true })}
                  >
                    Tek Parça
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportBoxSVG(currentDimensions, { part: 'base', showLabels: true })}
                  >
                    Tepsi (Base)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportBoxSVG(currentDimensions, { part: 'lid', showLabels: true })}
                  >
                    Kapak (Lid)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => exportBoxSVG(currentDimensions, { part: 'both', showLabels: true })}
                  >
                    İkisini İndir
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Box Presets */}
            <Card padding="lg">
              <CardHeader title="Kutu Şablonları" subtitle="Hazır boyutlar" />
              <div className="space-y-2">
                {BOX_PRESETS.map((box, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedBox(box);
                      setUseCustom(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      !useCustom && selectedBox.name === box.name
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{box.name}</p>
                    <p className="text-xs text-gray-500">
                      {box.dimensions.length} × {box.dimensions.width} × {box.dimensions.height} mm
                      {box.isTwoPiece && ' • İki Parça'}
                    </p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Custom Dimensions */}
            <Card padding="lg">
              <CardHeader title="Özel Boyutlar" subtitle="Manuel giriş" />
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useCustom}
                    onChange={(e) => setUseCustom(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Özel boyut kullan</span>
                </label>

                {useCustom && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Uzunluk (mm)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={customDimensions.length}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 10;
                          setCustomDimensions(prev => ({ ...prev, length: val }));
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Genişlik (mm)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={customDimensions.width}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 10;
                          setCustomDimensions(prev => ({ ...prev, width: val }));
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Yükseklik (mm)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={customDimensions.height}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 10;
                          setCustomDimensions(prev => ({ ...prev, height: val }));
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Güncel: {customDimensions.length} × {customDimensions.width} × {customDimensions.height} mm
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Color Presets */}
            <Card padding="lg">
              <CardHeader title="Renk Paleti" subtitle="Tema seçimi" />
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(color)}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedColor.name === color.name
                        ? 'border-gray-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: color.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: color.accent }}
                      />
                    </div>
                    <p className="text-xs text-gray-700">{color.name}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
