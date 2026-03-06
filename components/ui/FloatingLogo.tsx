'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Logo from './Logo';

export default function FloatingLogo({ currentSection }: { currentSection: number }) {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logoRef.current) return;

    // Проверяем мобильное устройство
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    
    if (isMobile) {
      // На мобильном - только opacity, без scale
      switch (currentSection) {
        case 0: // Hero – скрыт
          gsap.to(logoRef.current, { opacity: 0, duration: 0.3 });
          break;
        case 1: // TwoMobile – появляется
        case 2: // Cards – видим
        case 3: // Cta – видим
          gsap.to(logoRef.current, { opacity: 1, duration: 0.3 });
          break;
      }
      return;
    }

    // Для десктопа - анимации с scale
    const tl = gsap.timeline();

    switch (currentSection) {
      case 0: // Hero – скрыт
        tl.to(logoRef.current, { opacity: 0, scale: 1, duration: 0.3 });
        break;
      case 1: // TwoMobile – появляется
        tl.to(logoRef.current, { opacity: 1, scale: 1, duration: 0.5 });
        break;
      case 2: // Cards – без изменений
        tl.to(logoRef.current, { opacity: 1, scale: 1, duration: 0.3 });
        break;
      case 3: // Cta – увеличивается
        tl.to(logoRef.current, { opacity: 1, scale: 1.2, duration: 0.5 });
        break;
    }
  }, [currentSection]);

  return (
    <div 
      className='logo__header'
      ref={logoRef}
      style={{
        position: 'fixed',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      <Logo />
    </div>
  );
}