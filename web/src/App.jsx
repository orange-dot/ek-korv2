import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import SimulationPage from './pages/SimulationPage';
import LADeliveryPage from './pages/LADeliveryPage';
import PatentPage from './pages/PatentPage';
import PatentPortfolioPage from './pages/PatentPortfolioPage';
import PitchPage from './pages/PitchPage';
import StrategyPage from './pages/StrategyPage';
import JezgroDevPage from './pages/JezgroDevPage';
import RojIntelligencePage from './pages/RojIntelligencePage';
import SimulatorDemoPage from './pages/SimulatorDemoPage';
import QuickPitchPage from './pages/QuickPitchPage';
import V2GControlPage from './pages/V2GControlPage';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-primary">
            <Navbar />
            <main>
              <HomePage />
            </main>
            <Footer />
          </div>
        }
      />
      <Route path="/simulation" element={<SimulationPage />} />
      <Route path="/la-demo" element={<LADeliveryPage />} />
      <Route path="/la-delivery" element={<LADeliveryPage />} />
      <Route path="/gv-demo" element={<LADeliveryPage />} />
      <Route path="/patent" element={<PatentPage />} />
      <Route path="/patent-portfolio" element={<PatentPortfolioPage />} />
      <Route path="/pitch" element={<PitchPage />} />
      <Route path="/strategy" element={<StrategyPage />} />
      <Route path="/jezgro-dev" element={<JezgroDevPage />} />
      <Route path="/roj" element={<RojIntelligencePage />} />
      <Route path="/simulator-demo" element={<SimulatorDemoPage />} />
      <Route path="/quick" element={<QuickPitchPage />} />
      <Route path="/v2g" element={<V2GControlPage />} />
    </Routes>
  );
}

export default App;
