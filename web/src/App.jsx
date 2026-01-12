import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import SimulationPage from './pages/SimulationPage';
import LADeliveryPage from './pages/LADeliveryPage';
import SimulatorDemoPage from './pages/SimulatorDemoPage';

// Documentation pages (public)
import DocsPage from './pages/DocsPage';
import SelfHealingPage from './pages/docs/SelfHealingPage';
import ArchitecturePage from './pages/docs/ArchitecturePage';
import V2GConceptPage from './pages/docs/V2GConceptPage';
import RojOverviewPage from './pages/docs/RojOverviewPage';
import CompetitionPage from './pages/docs/CompetitionPage';
import SmallBatteryPage from './pages/docs/SmallBatteryPage';

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
      <Route path="/simulator-demo" element={<SimulatorDemoPage />} />

      {/* Public documentation */}
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/docs/self-healing" element={<SelfHealingPage />} />
      <Route path="/docs/architecture" element={<ArchitecturePage />} />
      <Route path="/docs/v2g-concept" element={<V2GConceptPage />} />
      <Route path="/docs/roj-overview" element={<RojOverviewPage />} />
      <Route path="/docs/competition" element={<CompetitionPage />} />
      <Route path="/docs/small-battery" element={<SmallBatteryPage />} />
    </Routes>
  );
}

export default App;
