import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { HomePage } from './pages/HomePage';
import { DesignStudioPage } from './pages/DesignStudioPage';
import { DesignDetailPage } from './pages/DesignDetailPage';
import { MyDesignsPage } from './pages/MyDesignsPage';
import { Box3DTestPage } from './pages/Box3DTestPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/studio" element={<DesignStudioPage />} />
          <Route path="/my-designs" element={<MyDesignsPage />} />
          <Route path="/designs/:id" element={<DesignDetailPage />} />
          <Route path="/3d-test" element={<Box3DTestPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
