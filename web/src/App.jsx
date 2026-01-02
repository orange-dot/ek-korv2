import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import SimulationPage from './pages/SimulationPage';
import PatentPage from './pages/PatentPage';

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
      <Route path="/patent" element={<PatentPage />} />
    </Routes>
  );
}

export default App;
