import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const HomePage = () => {
  return (
    <div className="bg-gradient-to-b from-brand-peach/20 to-white min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Destekli Kutu Tasarım Aracı
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Sade Chocolate için lüks çikolata kutusu tasarımlarını AI teknolojisi ile
            otomatik oluşturun. Trend analizi, görsel tasarım, teknik çizim ve maliyet
            hesaplama - hepsi tek bir platformda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/studio">
              <Button size="lg">
                Yeni Tasarım Başlat
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg">
                Özellikleri Keşfet
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Nasıl Çalışır?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card padding="lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trend Analizi</h3>
              <p className="text-sm text-gray-600">
                Global lüks markalar analiz edilerek güncel tasarım trendleri belirlenir
              </p>
            </div>
          </Card>

          <Card padding="lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Görsel Tasarım</h3>
              <p className="text-sm text-gray-600">
                Renk paleti, tipografi ve altın varak yerleşimleri otomatik oluşturulur
              </p>
            </div>
          </Card>

          <Card padding="lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📐</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Teknik Çizim</h3>
              <p className="text-sm text-gray-600">
                Bichak izi (die-line) SVG formatında üretilir, ölçüler ve katlanma çizgileri eklenir
              </p>
            </div>
          </Card>

          <Card padding="lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Maliyet Hesaplama</h3>
              <p className="text-sm text-gray-600">
                Malzeme, baskı tekniği ve adet bazında detaylı maliyet raporu hazırlanır
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card padding="lg" shadow="lg">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hemen Deneyin
            </h2>
            <p className="text-gray-600 mb-6">
              Kutu boyutlarını seçin, AI ajanlarımız sizin için tasarım sürecini
              otomatik olarak tamamlasın. Dakikalar içinde profesyonel tasarımlara
              ulaşın.
            </p>
            <Link to="/studio">
              <Button size="lg">
                Tasarım Aracını Başlat →
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
};
