'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Logo from './Logo';

export default function FloatingLogo({ currentSection }: { currentSection: number }) {
  const logoRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const prevSectionRef = useRef(currentSection);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      setIsMobile(mobile);
      console.log('isMobile:', mobile);
    };
    
    checkMobile();
    
    // Следим за изменением размера экрана
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Общий эффект для всех устройств
  useEffect(() => {
    if (!logoRef.current) return;
    
    console.log('Section changed:', currentSection, 'isMobile:', isMobile);
    
    // Сохраняем предыдущую секцию
    prevSectionRef.current = currentSection;
    
    // Останавливаем все текущие анимации
    gsap.killTweensOf(logoRef.current);
    
    if (isMobile) {
      // Для мобильных - принудительно устанавливаем opacity
      if (currentSection === 0) {
        // Hero - скрываем
        gsap.set(logoRef.current, { 
          opacity: 0, 
          scale: 1,
          immediateRender: true 
        });
        console.log('Mobile: hiding logo (section 0)');
      } else {
        // Все остальные секции - показываем
        gsap.set(logoRef.current, { 
          opacity: 1, 
          scale: 1,
          immediateRender: true 
        });
        console.log('Mobile: showing logo (section', currentSection, ')');
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
          });
          break;
        case 1: // TwoMobile – появляется
          gsap.to(logoRef.current, { 
            opacity: 1, 
            scale: 1, 
            duration: 0.5,
            ease: 'power2.out',
          });
          break;
        case 2: // Cards – без изменений
          gsap.to(logoRef.current, { 
            opacity: 1, 
            scale: 1, 
            duration: 0.3,
            ease: 'power2.out',
          });
          break;
        case 3: // Cta – увеличивается
          gsap.to(logoRef.current, { 
            opacity: 1, 
            scale: 1.2, 
            duration: 0.5,
            ease: 'power2.out',
          });
          break;
      }
    }
  }, [currentSection, isMobile]);

  // Принудительно проверяем при монтировании
  useEffect(() => {
    if (!logoRef.current || !isMobile) return;
    
    // Через небольшую задержку проверяем текущую секцию
    setTimeout(() => {
      if (currentSection !== 0) {
        gsap.set(logoRef.current, { 
          opacity: 1, 
          scale: 1,
          immediateRender: true 
        });
        console.log('Mobile: force show logo on mount');
      }
    }, 100);
  }, [isMobile, currentSection]);

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