import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Designer from './pages/Designer';

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/designer" element={<Designer />} />
                <Route path="/templates" element={<div className="p-8 text-stone-500">Templates Coming Soon</div>} />
                <Route path="/settings" element={<div className="p-8 text-stone-500">Settings Coming Soon</div>} />
            </Routes>
        </Layout>
    );
}

export default App;
