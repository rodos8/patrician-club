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
    
    // На мобильном лого всегда видимо и без изменений
    if (isMobile) {
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
      case 3: // Cta – увеличивается (только на десктопе)
        tl.to(logoRef.current, { opacity: 1, scale: 1, duration: 0.5 });
        break;
      }
      return;
    }

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
      case 3: // Cta – увеличивается (только на десктопе)
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