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
    // Контейнер с вертикальным скроллом и снаппингом
    <div
      ref={containerRef}
      className="relative h-screen overflow-y-scroll snap-y snap-mandatory"
    >
      <FloatingLogo currentSection={currentSection} />

      {/* Все секции, включая Footer, должны быть прямыми потомками контейнера */}
      <main>
        {/* Оборачиваем каждую секцию в div с классами snap-start и h-screen,
            если сами компоненты не имеют этих классов */}
        <div className="snap-start h-screen">
          <Hero />
        </div>
        <div className="snap-start h-screen">
          <TwoMobile />
        </div>
        <div className="snap-start h-screen">
          <Cards />
        </div>
        <div className="snap-start h-screen">
          <Cta />
        </div>
      </main>

      <Footer />
    </div>
  );
}