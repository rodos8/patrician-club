'use client';

import { useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isTelegram, setIsTelegram] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Получаем стабильную высоту один раз при загрузке
  const getStableHeight = () => {
    if (typeof window === 'undefined') return 1000;
    // Используем document.documentElement.clientHeight как более стабильный
    return Math.max(document.documentElement.clientHeight, window.innerHeight);
  };

  useEffect(() => {
    setIsClient(true);
    
    const ua = navigator.userAgent.toLowerCase();
    const isTelegramApp = ua.includes('telegram') || ua.includes('tgweb') || ua.includes('telegram web');
    
    setIsTelegram(isTelegramApp);
    
    if (isTelegramApp) {
      document.documentElement.setAttribute('data-telegram', 'true');
      document.body.setAttribute('data-telegram', 'true');
      
      // Фиксируем высоту при загрузке
      const initialHeight = getStableHeight();
      setViewportHeight(initialHeight);
      
      // Устанавливаем CSS переменные
      document.documentElement.style.setProperty('--telegram-vh-fixed', `${initialHeight}px`);
      document.documentElement.style.setProperty('--telegram-vh', `${initialHeight * 0.01}px`);
      
      // Блокируем любые изменения высоты
      const preventResize = () => {
        const currentHeight = getStableHeight();
        if (Math.abs(currentHeight - initialHeight) > 50) {
          // Если высота изменилась сильно, обновляем, но с задержкой
          setTimeout(() => {
            const newHeight = getStableHeight();
            setViewportHeight(newHeight);
            document.documentElement.style.setProperty('--telegram-vh-fixed', `${newHeight}px`);
            document.documentElement.style.setProperty('--telegram-vh', `${newHeight * 0.01}px`);
          }, 300);
        }
      };

      // Используем throttling для предотвращения частых обновлений
      let timeoutId: NodeJS.Timeout;
      const throttledPrevent = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(preventResize, 200);
      };

      window.addEventListener('resize', throttledPrevent);
      window.addEventListener('orientationchange', () => {
        setTimeout(preventResize, 300);
      });

      return () => {
        document.documentElement.removeAttribute('data-telegram');
        document.body.removeAttribute('data-telegram');
        window.removeEventListener('resize', throttledPrevent);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  // Для Telegram - используем простой скролл с фиксированными размерами
  if (isClient && isTelegram) {
    return (
      <div 
        ref={containerRef}
        className="telegram-container"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch', // Для плавности на iOS
          transform: 'translateZ(0)', // Аппаратное ускорение
        }}
      >
        <style jsx>{`
          .telegram-container {
            display: block;
          }
          
          /* Глобальные стили для Telegram */
          :global([data-telegram]) {
            overflow: hidden;
            height: 100%;
            position: fixed;
            width: 100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
          
          :global([data-telegram] body) {
            overflow: hidden;
            height: 100%;
            position: fixed;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          
          /* Фикс для всех элементов с vh */
          :global([data-telegram] [style*="vh"]),
          :global([data-telegram] .h-screen),
          :global([data-telegram] .min-h-screen),
          :global([data-telegram] .max-h-screen) {
            height: var(--telegram-vh-fixed, 100vh) !important;
            min-height: var(--telegram-vh-fixed, 100vh) !important;
            max-height: var(--telegram-vh-fixed, 100vh) !important;
          }
          
          /* Специальный фикс для snap-step */
          :global([data-telegram] .snap-step) {
            height: min(600px, var(--telegram-vh-fixed, 100vh)) !important;
            max-height: min(600px, var(--telegram-vh-fixed, 100vh)) !important;
            position: relative !important;
            overflow: hidden !important;
            transform: translateZ(0) !important;
            backface-visibility: hidden !important;
            perspective: 1000 !important;
            contain: strict !important; /* Максимальная изоляция */
          }
          
          /* Предотвращаем любые изменения при скролле */
          :global([data-telegram] .snap-step > *) {
            transform: translateZ(0);
            backface-visibility: hidden;
            position: relative;
            z-index: 1;
          }
          
          /* Фикс для sticky элементов */
          :global([data-telegram] .sticky) {
            position: sticky !important;
            transform: translateZ(0);
            top: 0;
          }
          
          @media (max-width: 768px) {
            :global([data-telegram] .snap-step) {
              height: min(600px, var(--telegram-vh-fixed, 100vh)) !important;
              max-height: min(600px, var(--telegram-vh-fixed, 100vh)) !important;
            }
          }
        `}</style>
        {children}
      </div>
    );
  }

  // Для остальных браузеров - Lenis
  useEffect(() => {
    if (!isClient || isTelegram) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
    });
    
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value);
        }
        return window.scrollY;
      },
    });

    return () => {
      lenis.destroy();
    };
  }, [isClient, isTelegram]);

  return <>{children}</>;
}