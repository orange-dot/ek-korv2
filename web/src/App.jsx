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
import JezgroDevBlogPage from './pages/JezgroDevBlogPage';
import RojIntelligencePage from './pages/RojIntelligencePage';
import SimulatorDemoPage from './pages/SimulatorDemoPage';
import QuickPitchPage from './pages/QuickPitchPage';
import V2GControlPage from './pages/V2GControlPage';

// New portal pages
import DocsPage from './pages/DocsPage';
import PartnerPage from './pages/PartnerPage';
import InvestorPage from './pages/InvestorPage';

// Documentation pages (public)
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

      {/* Public documentation */}
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/docs/self-healing" element={<SelfHealingPage />} />
      <Route path="/docs/architecture" element={<ArchitecturePage />} />
      <Route path="/docs/v2g-concept" element={<V2GConceptPage />} />
      <Route path="/docs/roj-overview" element={<RojOverviewPage />} />
      <Route path="/docs/competition" element={<CompetitionPage />} />
      <Route path="/docs/small-battery" element={<SmallBatteryPage />} />

      {/* Partner portal (PARTNER tier) */}
      <Route path="/partner" element={<PartnerPage />} />
      <Route path="/jezgro-dev" element={<JezgroDevPage />} />
      <Route path="/jezgro-blog" element={<JezgroDevBlogPage />} />
      <Route path="/roj" element={<RojIntelligencePage />} />
      <Route path="/v2g" element={<V2GControlPage />} />
      <Route path="/simulator-demo" element={<SimulatorDemoPage />} />

      {/* Investor portal (INVESTOR tier) */}
      <Route path="/investor" element={<InvestorPage />} />
      <Route path="/patent" element={<PatentPage />} />
      <Route path="/patent-portfolio" element={<PatentPortfolioPage />} />
      <Route path="/pitch" element={<PitchPage />} />
      <Route path="/strategy" element={<StrategyPage />} />
      <Route path="/quick" element={<QuickPitchPage />} />
    </Routes>
  );
}

export default App;
