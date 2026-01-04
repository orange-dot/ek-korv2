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
    </Routes>
  );
}

export default App;
