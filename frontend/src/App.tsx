function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-peach to-brand-blue">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Sade Chocolate
            </h1>
            <p className="text-xl text-gray-600">
              Tasarım Aracı
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                🎨 Phase 1: Foundation
              </h2>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                ✅ Tamamlandı
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500">✓</span>
                <span>React 18 + TypeScript + Vite</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500">✓</span>
                <span>Tailwind CSS v3</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500">✓</span>
                <span>Firebase Configuration</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500">✓</span>
                <span>4 AI Agents (Trend, Görsel, Teknik, Maliyet)</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500">✓</span>
                <span>TypeScript Type Definitions</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500">✓</span>
                <span>Seed Data (Kutu şablonları + Fiyatlandırma)</span>
              </div>
            </div>
          </div>

          {/* Brand Colors Showcase */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Marka Renk Paleti
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-full h-24 bg-brand-blue rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600">Brand Blue</p>
                <p className="text-xs text-gray-400">#a4d1e8</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 bg-brand-yellow rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600">Brand Yellow</p>
                <p className="text-xs text-gray-400">#e7c57d</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 bg-brand-mustard rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600">Brand Mustard</p>
                <p className="text-xs text-gray-400">#d4a945</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 bg-brand-green rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600">Brand Green</p>
                <p className="text-xs text-gray-400">#a4d4bc</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 bg-brand-peach rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600">Brand Peach</p>
                <p className="text-xs text-gray-400">#f3d1c8</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 bg-brand-orange rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600">Brand Orange</p>
                <p className="text-xs text-gray-400">#e59a77</p>
              </div>
            </div>
          </div>

          {/* Next Phase */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-full">
              <span>Sıradaki:</span>
              <span className="font-semibold">Phase 2 - Backend Core</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
