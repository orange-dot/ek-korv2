import { useTranslation } from 'react-i18next';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Product from './components/Product';
import Philosophy from './components/Philosophy';
import Configurations from './components/Configurations';
import Timeline from './components/Timeline';
import Team from './components/Team';
import Contact from './components/Contact';

function App() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Product />
        <Philosophy />
        <Configurations />
        <Timeline />
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
