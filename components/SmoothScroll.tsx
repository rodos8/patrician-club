'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isTelegram, setIsTelegram] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const isMobileRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const documentHeightRef = useRef(0);

  // Проверка на Telegram WebView при монтировании на клиенте
  useEffect(() => {
    setIsClient(true);
    
    // Улучшенная проверка Telegram WebView
    const ua = navigator.userAgent.toLowerCase();
    const isTelegramWebView = 
      ua.includes('telegram') || 
      ua.includes('tgweb') || 
      ua.includes('telegram web') ||
      // @ts-ignore
      window.TelegramWebview || 
      // @ts-ignore
      window.Telegram ||
      // @ts-ignore
      window.external?.toString().includes('Telegram');
    
    setIsTelegram(isTelegramWebView);
    
    // Добавляем класс для стилизации под Telegram
    if (isTelegramWebView) {
      document.documentElement.classList.add('telegram-webview');
      document.body.classList.add('telegram-webview');
    }
  }, []);

  // Обновление размеров
  const updateDimensions = useCallback(() => {
    viewportHeightRef.current = window.innerHeight;
    documentHeightRef.current = document.documentElement.scrollHeight;
  }, []);

  // Обновление мобильного статуса
  const updateTargets = useCallback(() => {
    const mobile = window.matchMedia('(max-width: 980px)').matches;
    isMobileRef.current = mobile;
    updateDimensions();
  }, [updateDimensions]);

  // Стабилизация скролла для Telegram
  useEffect(() => {
    if (!isClient || !isTelegram) return;

    let ticking = false;
    let lastScrollTop = window.scrollY;
    let scrollDirection = 0;
    let preventScroll = false;
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollTop = window.scrollY;
          const newDirection = currentScrollTop > lastScrollTop ? 1 : -1;
          
          // Если направление изменилось
          if (newDirection !== scrollDirection) {
            scrollDirection = newDirection;
            
            // Блокируем скролл на короткое время чтобы избежать дерганья
            preventScroll = true;
            document.body.style.overflow = 'hidden';
            
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              document.body.style.overflow = '';
              preventScroll = false;
            }, 100);
          }
          
          lastScrollTop = currentScrollTop;
          ticking = false;
        });
        
        ticking = true;
      }
    };

    // Фикс для виртуальной клавиатуры и навигационных плашек
    const handleResize = () => {
      const newViewportHeight = window.innerHeight;
      const viewportDiff = Math.abs(newViewportHeight - viewportHeightRef.current);
      
      // Если изменилась высота вьюпорта (появились/скрылись плашки)
      if (viewportDiff > 50) {
        const currentScroll = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - newViewportHeight;
        
        // Корректируем скролл если он вышел за пределы
        if (currentScroll > maxScroll) {
          window.scrollTo({
            top: maxScroll,
            behavior: 'auto'
          });
        }
        
        viewportHeightRef.current = newViewportHeight;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [isClient, isTelegram]);

  // Если это Telegram - возвращаем обычный скролл с дополнительными стилями
  if (isClient && isTelegram) {
    return (
      <>
        <style jsx global>{`
          .telegram-webview {
            scroll-behavior: auto !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            height: 100%;
            position: relative;
          }
          
          .telegram-webview body {
            overflow-y: auto !important;
            height: 100%;
            position: relative;
            margin: 0;
            padding: 0;
          }
          
          /* Фикс для изменения высоты при появлении плашек */
          .telegram-webview {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
          
          .telegram-webview body {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
          
          /* Отключаем любые скролл-эффекты */
          .telegram-webview * {
            scroll-behavior: auto !important;
          }
          
          /* Стабилизация контента */
          .telegram-webview .snap-section,
          .telegram-webview .snap-step {
            position: relative;
            transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
        `}</style>
        {children}
      </>
    );
  }

  // Для всех остальных браузеров используем Lenis
  useEffect(() => {
    if (!isClient || isTelegram) return;

    updateTargets();

    const mql = window.matchMedia('(max-width: 980px)');
    const handleChange = () => {
      updateTargets();
    };
    mql.addEventListener('change', handleChange);

    const observer = new MutationObserver(() => {
      updateTargets();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    // Конфигурация Lenis для не-Telegram браузеров
    const lenis = new Lenis({
      duration: isMobileRef.current ? 0.6 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1,
      wheelMultiplier: 1,
      lerp: 0.1,
      infinite: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    });
    
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value);
        }
        return window.scrollY;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    ScrollTrigger.defaults({ scroller: document.body });

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      lenis.destroy();
      mql.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, [isClient, isTelegram, updateTargets]);

  return <>{children}</>;
}