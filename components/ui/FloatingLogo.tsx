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
  const scaleTweenRef = useRef<gsap.core.Tween | null>(null);

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

  // Эффект для анимаций при смене секции - ИСПРАВЛЕН ДЛЯ ПЛАВНОГО ИЗМЕНЕНИЯ РАЗМЕРА
  useEffect(() => {
    if (!logoRef.current || !mounted || isMobile) return;
    
    const logo = logoRef.current;
    
    // Сохраняем предыдущую секцию
    prevSectionRef.current = currentSection;
    
    // Останавливаем только предыдущую анимацию размера, но не все анимации
    if (scaleTweenRef.current) {
      scaleTweenRef.current.kill();
    }
    
    // Обновляем pointer-events
    if (logo) {
      logo.style.pointerEvents = currentSection === 0 ? 'none' : 'auto';
    }
    
    // Для десктопа - анимации с приоритетом на плавность
    switch (currentSection) {
      case 0: // Hero – скрыт
        gsap.to(logo, { 
          opacity: 0, 
          scale: 1, 
          duration: 0.4,
          ease: 'power2.inOut',
          overwrite: true,
        });
        break;
      case 1: // TwoMobile – появляется
      case 2: // Cards – без изменений
        gsap.to(logo, { 
          opacity: 1, 
          scale: 1, 
          duration: 0.4,
          ease: 'power2.out',
          overwrite: true,
        });
        break;
      case 3: // Cta – увеличивается
        // Сохраняем ссылку на анимацию размера
        scaleTweenRef.current = gsap.to(logo, { 
          scale: 1.2, 
          duration: 0,
          ease: 'power2.out',
          delay: 0.3,
          overwrite: true,
        });
        
        // Opacity анимируем отдельно
        gsap.to(logo, { 
          opacity: 1, 
          duration: 0.3,
          ease: 'power2.out',
          overwrite: false,
        });
        break;
      default:
        gsap.set(logo, { 
          opacity: 1, 
          scale: 1,
          immediateRender: true,
          overwrite: true,
        });
    }
  }, [currentSection, isMobile, mounted]);

  // Улучшенный эффект для обработки скролла - с сохранением плавности размера
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
        // Плавно скрываем с возвратом к нормальному размеру
        gsap.to(logo, {
          opacity: 0,
          scale: 1, // Возвращаем к 1, если был увеличен
          duration: 0.4,
          ease: 'power2.inOut',
          overwrite: true,
          onComplete: () => {
            logo.style.pointerEvents = 'none';
          }
        });
      }
      
      // Если скроллим вниз от Hero секции
      if (!isScrollingUp && currentSection === 0 && currentScrollY > 100) {
        gsap.to(logo, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: true,
          onStart: () => {
            logo.style.pointerEvents = 'auto';
          }
        });
      }
      
      // Для мобильных
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
        pointerEvents: 'auto',
        transition: 'opacity 0.2s ease, transform 0.8s ease',
        willChange: 'opacity, transform',
      }}
    >
      <Logo />
       <div 
      className='logo__header'
      ref={logoRef}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        pointerEvents: 'auto',
        transition: 'opacity 0.2s ease, transform 0.8s ease',
        willChange: 'opacity, transform',
      }}
    ></div>
    </div>
  );
}