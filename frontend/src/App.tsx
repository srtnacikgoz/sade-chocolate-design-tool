import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { HomePage } from './pages/HomePage';
import { DesignStudioPage } from './pages/DesignStudioPage';
import { DesignDetailPage } from './pages/DesignDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/studio" element={<DesignStudioPage />} />
          <Route path="/designs/:id" element={<DesignDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
