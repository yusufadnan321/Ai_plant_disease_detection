import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import SupportedCrops from '@/components/sections/SupportedCrops';
import About from '@/components/sections/About';
import RecentHistory from '@/components/sections/RecentHistory';
import Contact from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <SupportedCrops />
      <About />
      <RecentHistory />
      <Contact />
    </>
  );
}
