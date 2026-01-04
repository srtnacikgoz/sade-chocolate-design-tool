import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingPage } from '../components/ui/LoadingSpinner';
import { designService } from '../services/designService';

export const MyDesignsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['designs'],
    queryFn: () => designService.listDesigns({ limit: 20 }),
  });

  if (isLoading) {
    return <LoadingPage message="Tasarimlar yukleniyor..." />;
  }

  const designs = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Tasarimlarim</h1>
            <p className="text-gray-600 mt-2">
              Tum kutu tasarimlarinizi buradan gorebilirsiniz
            </p>
          </div>
          <Link to="/studio">
            <Button>Yeni Tasarim</Button>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <Card className="text-center py-8">
            <p className="text-red-600 mb-4">Tasarimlar yuklenirken hata olustu</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tekrar Dene
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!error && designs.length === 0 && (
          <Card className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Henuz tasarim yok
            </h2>
            <p className="text-gray-600 mb-6">
              Ilk kutu tasariminizi olusturmak icin baslayalim
            </p>
            <Link to="/studio">
              <Button size="lg">Tasarim Olustur</Button>
            </Link>
          </Card>
        )}

        {/* Designs Grid */}
        {designs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <Link key={design.id} to={`/designs/${design.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {/* Preview Area */}
                  <div className="h-40 bg-gradient-to-br from-brand-peach/20 to-brand-mint/20 rounded-lg mb-4 flex items-center justify-center">
                    {design.technicalDrawing?.svgContent ? (
                      <div
                        className="w-full h-full p-4"
                        dangerouslySetInnerHTML={{
                          __html: design.technicalDrawing.svgContent.replace(
                            /width="[^"]*"/,
                            'width="100%"'
                          ).replace(
                            /height="[^"]*"/,
                            'height="100%"'
                          )
                        }}
                      />
                    ) : (
                      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {design.boxId || 'Isimsiz Tasarim'}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          design.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : design.status === 'processing'
                            ? 'bg-blue-100 text-blue-700'
                            : design.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {design.status === 'completed'
                          ? 'Tamamlandi'
                          : design.status === 'processing'
                          ? 'Isleniyor'
                          : design.status === 'failed'
                          ? 'Basarisiz'
                          : 'Taslak'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(design.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
