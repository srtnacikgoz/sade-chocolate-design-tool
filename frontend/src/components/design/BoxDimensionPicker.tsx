import { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';

interface BoxTemplate {
  id: string;
  name: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  type: string;
  capacity: number;
  description: string;
}

interface BoxDimensionPickerProps {
  templates: BoxTemplate[];
  onSelect: (template: BoxTemplate) => void;
  selectedId?: string;
}

export const BoxDimensionPicker = ({
  templates,
  onSelect,
  selectedId
}: BoxDimensionPickerProps) => {
  const [activeType, setActiveType] = useState<string>('all');

  const types = [
    { id: 'all', label: 'Tümü' },
    { id: 'gift', label: 'Hediye Kutusu' },
    { id: 'truffle', label: 'Truffle' },
    { id: 'bar', label: 'Bar' },
    { id: 'seasonal', label: 'Sezonluk' }
  ];

  const filteredTemplates = activeType === 'all'
    ? templates
    : templates.filter(t => t.type === activeType);

  return (
    <Card>
      <CardHeader
        title="Kutu Boyutu Seçin"
        subtitle="Standart şablonlardan birini seçin veya özel boyut girin"
      />

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeType === type.id
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedId === template.id
                ? 'border-gray-800 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-800">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {template.dimensions.length} × {template.dimensions.width} × {template.dimensions.height} mm
                </p>
              </div>
              {selectedId === template.id && (
                <div className="flex-shrink-0 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">{template.description}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-brand-peach rounded text-gray-700">
                {template.capacity} adet
              </span>
              <span className="px-2 py-1 bg-brand-blue rounded text-gray-700">
                {template.type}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Custom Dimensions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">Özel Boyut</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Uzunluk (mm)</label>
            <input
              type="number"
              placeholder="250"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Genişlik (mm)</label>
            <input
              type="number"
              placeholder="200"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Yükseklik (mm)</label>
            <input
              type="number"
              placeholder="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            />
          </div>
        </div>
        <Button variant="outline" className="mt-3 w-full">
          Özel Boyut Kullan
        </Button>
      </div>
    </Card>
  );
};
