'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Logo from './Logo';

export default function FloatingLogo({ currentSection }: { currentSection: number }) {
  const logoRef = useRef<HTMLDivElement>(null);
  const isMobile = useRef(false);

  useEffect(() => {
    // Проверяем мобильное устройство один раз
    isMobile.current = window.matchMedia('(max-width: 767px)').matches;
  }, []);

  useEffect(() => {
    if (!logoRef.current) return;
    
    // Останавливаем все текущие анимации
    gsap.killTweensOf(logoRef.current);
    
    if (isMobile.current) {
      // На мобильных - просто меняем opacity без таймлайна
      if (currentSection === 0) {
        // Hero - скрываем
        gsap.to(logoRef.current, { 
          opacity: 0, 
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true 
        });
      } else {
        // Все остальные секции - показываем
        gsap.to(logoRef.current, { 
          opacity: 1, 
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true 
        });
      }
    } else {
      // Для десктопа - анимации с scale
      switch (currentSection) {
        case 0: // Hero – скрыт
          gsap.to(logoRef.current, { 
            opacity: 0, 
            scale: 1, 
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true 
          });
          break;
        case 1: // TwoMobile – появляется
          gsap.to(logoRef.current, { 
            opacity: 1, 
            scale: 1, 
            duration: 0.5,
            ease: 'power2.out',
            overwrite: true 
          });
          break;
        case 2: // Cards – без изменений
          gsap.to(logoRef.current, { 
            opacity: 1, 
            scale: 1, 
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true 
          });
          break;
        case 3: // Cta – увеличивается
          gsap.to(logoRef.current, { 
            opacity: 1, 
            scale: 1.2, 
            duration: 0.5,
            ease: 'power2.out',
            overwrite: true 
          });
          break;
      }
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