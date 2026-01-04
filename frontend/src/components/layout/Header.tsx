import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-peach to-brand-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Sade Chocolate</h1>
              <p className="text-xs text-gray-600">Tasarım Aracı</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
              Ana Sayfa
            </Link>
            <Link to="/studio" className="text-gray-600 hover:text-gray-800 transition-colors">
              Tasarim Studyosu
            </Link>
            <Link to="/my-designs" className="text-gray-600 hover:text-gray-800 transition-colors">
              Tasarimlarim
            </Link>
            <Link to="/3d-test" className="text-gray-600 hover:text-gray-800 transition-colors">
              3D Test
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/studio"
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Yeni Tasarim
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
