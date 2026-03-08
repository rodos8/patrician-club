'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Logo from './Logo';

export default function FloatingLogo({ currentSection }: { currentSection: number }) {
  const logoRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prevSectionRef = useRef(currentSection);
  const lastScrollYRef = useRef(0);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia('(max-width: 1024px)').matches;
      setIsMobile(mobile);
    };
    
    checkMobile();
    setMounted(true);
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Эффект для начальной установки opacity
  useEffect(() => {
    if (!logoRef.current || !mounted) return;
    
    const logo = logoRef.current;
    
    if (isMobile) {
      if (currentSection === 0) {
        gsap.set(logo, { opacity: 0, scale: 1, immediateRender: true });
        if (logo) logo.style.pointerEvents = 'none';
      } else {
        gsap.set(logo, { opacity: 1, scale: 1, immediateRender: true });
        if (logo) logo.style.pointerEvents = 'auto';
      }
    } else {
      if (currentSection === 0) {
        gsap.set(logo, { opacity: 0, scale: 1, immediateRender: true });
        if (logo) logo.style.pointerEvents = 'none';
      } else {
        gsap.set(logo, { opacity: 1, scale: 1, immediateRender: true });
        if (logo) logo.style.pointerEvents = 'auto';
      }
    }
    
  }, [mounted, isMobile, currentSection]);

  // Эффект для анимаций при смене секции
  useEffect(() => {
    if (!logoRef.current || !mounted) return;
    
    const logo = logoRef.current;
    
    // Сохраняем предыдущую секцию
    prevSectionRef.current = currentSection;
    
    // Останавливаем все текущие анимации
    gsap.killTweensOf(logo);
    
    // Обновляем pointer-events
    if (logo) {
      logo.style.pointerEvents = currentSection === 0 ? 'none' : 'auto';
    }
    
    if (isMobile) {
      // Для мобильных - принудительно устанавливаем opacity
      gsap.set(logo, { 
        opacity: currentSection === 0 ? 0 : 1, 
        scale: 1,
        immediateRender: true,
        overwrite: true
      });
    } else {
      // Для десктопа - анимации
      switch (currentSection) {
        case 0: // Hero – скрыт
          gsap.to(logo, { 
            opacity: 0, 
            scale: 1, 
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true,
            onUpdate: function() {
              if (logo && this.progress === 1) {
                logo.style.pointerEvents = 'none';
              }
            }
          });
          break;
        case 1: // TwoMobile – появляется
          gsap.to(logo, { 
            opacity: 1, 
            scale: 1, 
            duration: 0.5,
            ease: 'power2.out',
            overwrite: true
          });
          break;
        case 2: // Cards – без изменений
          gsap.to(logo, { 
            opacity: 1, 
            scale: 1, 
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
          });
          break;
        case 3: // Cta – увеличивается
          gsap.to(logo, { 
            opacity: 1, 
            scale: 1.2, 
            duration: 1,
            ease: 'power2.out',
            delay: 0.5,
            overwrite: true
          });
          break;
        default:
          // Для любых других секций показываем лого
          gsap.set(logo, { 
            opacity: 1, 
            scale: 1,
            immediateRender: true,
            overwrite: true
          });
      }
    }
  }, [currentSection, isMobile, mounted]);

  // Улучшенный эффект для обработки скролла
  useEffect(() => {
    if (!logoRef.current || !mounted) return;
    
    const logo = logoRef.current;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollYRef.current;
      
      // Определяем, находимся ли мы на Hero секции (верх страницы)
      const isAtTop = currentScrollY < 100;
      
      // Если скроллим вверх и дошли до Hero секции
      if (isScrollingUp && isAtTop) {
        // Скрываем лого
        gsap.to(logo, {
          opacity: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true
        });
        logo.style.pointerEvents = 'none';
      }
      
      // Если скроллим вниз от Hero секции
      if (!isScrollingUp && currentSection === 0 && currentScrollY > 100) {
        // Показываем лого
        gsap.to(logo, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true
        });
        logo.style.pointerEvents = 'auto';
      }
      
      // Обновляем для мобильных
      if (isMobile) {
        if (currentScrollY < 100) {
          gsap.set(logo, {
            opacity: 0,
            scale: 1,
            immediateRender: true,
            overwrite: true
          });
          logo.style.pointerEvents = 'none';
        } else if (currentSection === 0 && currentScrollY > 100) {
          gsap.set(logo, {
            opacity: 1,
            scale: 1,
            immediateRender: true,
            overwrite: true
          });
          logo.style.pointerEvents = 'auto';
        }
      }
      
      lastScrollYRef.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, mounted, currentSection]);

  return (
    <div 
      className='logo__header'
      ref={logoRef}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: 100,
        opacity: 0,
        pointerEvents: 'none',
        transition: 'opacity 0.2s ease',
        willChange: 'opacity, transform',
      }}
    >
      <Logo />
    </div>
  );
}