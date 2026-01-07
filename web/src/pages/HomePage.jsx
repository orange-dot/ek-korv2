import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Product from '../components/Product';
import Philosophy from '../components/Philosophy';
import RobotSystem from '../components/RobotSystem';
import SelfHealingFleet from '../components/SelfHealingFleet';
import Configurations from '../components/Configurations';
import Timeline from '../components/Timeline';
import Team from '../components/Team';
import Contact from '../components/Contact';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <Product />
      <Philosophy />
      <RobotSystem />
      <SelfHealingFleet />
      <Configurations />
      <Timeline />
      <Team />
      <Contact />
    </>
  );
}
