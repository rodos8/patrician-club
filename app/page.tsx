'use client';

import { useRef } from 'react';
import Hero from '@/components/sections/Hero';
import TwoMobile from '@/components/sections/TwoMobile';
import Cards from '@/components/sections/Cards';
import Cta from '@/components/sections/Cta';
import Footer from '@/components/layout/Footer';
import FloatingLogo from '@/components/ui/FloatingLogo';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentSection } = useScrollAnimation(containerRef);

  return (
    <div ref={containerRef} className="relative">
      <FloatingLogo currentSection={currentSection} />
      <main>
        <Hero />
        <TwoMobile />
        <Cards />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}