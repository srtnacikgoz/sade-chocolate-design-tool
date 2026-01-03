export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Sade Chocolate</h3>
            <p className="text-sm text-gray-600">
              AI destekli lüks çikolata kutu tasarım platformu
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Bağlantılar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://sadechocolate.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                  Ana Web Sitesi
                </a>
              </li>
              <li>
                <a href="https://github.com/srtnacikgoz/sade-chocolate-design-tool" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Teknoloji</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>React 18 + TypeScript</li>
              <li>Firebase + Firestore</li>
              <li>Claude AI Agents</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Sade Chocolate. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};
