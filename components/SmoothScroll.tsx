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
  const lenisRef = useRef<Lenis | null>(null);
  const scrollPositionRef = useRef(0);

  // Функция для получения стабильной высоты
  const getStableViewportHeight = () => {
    if (typeof window === 'undefined') return 0;
    // Используем минимальную высоту между window.innerHeight и document.documentElement.clientHeight
    // и вычитаем возможные отступы от интерфейса Telegram
    const height = Math.min(
      window.innerHeight,
      document.documentElement.clientHeight
    );
    return Math.max(height, 0); // Гарантируем неотрицательное значение
  };

  // Обновление CSS переменных с фиксированной высотой
  const updateVhVariable = () => {
    if (typeof window === 'undefined') return;
    
    const height = getStableViewportHeight();
    setViewportHeight(height);
    
    // Устанавливаем стабильную высоту
    document.documentElement.style.setProperty('--stable-vh', `${height}px`);
    document.documentElement.style.setProperty('--viewport-height', `${height}px`);
    
    // Для обратной совместимости
    const vh = height * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Блокировка прокрутки во время изменения UI
  const lockScroll = () => {
    if (!isTelegram) return;
    scrollPositionRef.current = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = '100%';
  };

  const unlockScroll = () => {
    if (!isTelegram) return;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPositionRef.current);
  };

  useEffect(() => {
    setIsClient(true);
    
    const ua = navigator.userAgent.toLowerCase();
    const isTelegramApp = ua.includes('telegram') || ua.includes('tgweb') || ua.includes('telegram web');
    
    setIsTelegram(isTelegramApp);
    
    if (isTelegramApp) {
      document.documentElement.setAttribute('data-telegram', 'true');
      document.body.setAttribute('data-telegram', 'true');
      
      // Инициализация с задержкой для корректного получения высоты
      setTimeout(() => {
        updateVhVariable();
      }, 100);
      
      // Блокируем скролл во время изменения UI
      let scrollTimeout: NodeJS.Timeout;
      
      const handleScrollStart = () => {
        clearTimeout(scrollTimeout);
        lockScroll();
      };
      
      const handleScrollEnd = () => {
        scrollTimeout = setTimeout(() => {
          unlockScroll();
          updateVhVariable(); // Обновляем высоту после скролла
        }, 150);
      };
      
      // Обработчики событий
      window.addEventListener('resize', () => {
        handleScrollStart();
        requestAnimationFrame(() => {
          updateVhVariable();
          handleScrollEnd();
        });
      });
      
      window.addEventListener('orientationchange', () => {
        handleScrollStart();
        setTimeout(() => {
          updateVhVariable();
          handleScrollEnd();
        }, 200);
      });
      
      // Наблюдаем за изменениями в DOM
      const observer = new MutationObserver(() => {
        requestAnimationFrame(updateVhVariable);
      });
      
      observer.observe(document.body, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
      
      // Дополнительная проверка видимости
      const visibilityHandler = () => {
        if (!document.hidden) {
          updateVhVariable();
        }
      };
      
      document.addEventListener('visibilitychange', visibilityHandler);
      
      return () => {
        document.documentElement.removeAttribute('data-telegram');
        document.body.removeAttribute('data-telegram');
        window.removeEventListener('resize', updateVhVariable);
        window.removeEventListener('orientationchange', updateVhVariable);
        document.removeEventListener('visibilitychange', visibilityHandler);
        observer.disconnect();
        clearTimeout(scrollTimeout);
        unlockScroll(); // Разблокируем скролл при размонтировании
      };
    } else {
      document.documentElement.removeAttribute('data-telegram');
      document.body.removeAttribute('data-telegram');
    }
    
    return () => {
      document.documentElement.removeAttribute('data-telegram');
      document.body.removeAttribute('data-telegram');
    };
  }, []);

  // Для Telegram - используем кастомный скролл через transform
  if (isClient && isTelegram) {
    return (
      <div className="telegram-fix">
        <style jsx>{`
          .telegram-fix {
            display: block;
            width: 100%;
            min-height: var(--stable-vh, 100vh);
            position: relative;
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          /* Глобальные стили для Telegram */
          :global([data-telegram]) {
            overflow-x: hidden;
            position: relative;
            width: 100%;
          }
          
          :global([data-telegram] body) {
            overflow-x: hidden;
            position: relative;
            width: 100%;
            min-height: var(--stable-vh, 100vh);
          }
          
          /* Фикс для элементов с vh */
          :global([data-telegram] .vh-fix),
          :global([data-telegram] [class*="h-screen"]),
          :global([data-telegram] [class*="min-h-screen"]) {
            height: var(--stable-vh, 100vh) !important;
            min-height: var(--stable-vh, 100vh) !important;
            max-height: var(--stable-vh, 100vh) !important;
          }
          
          /* Фикс для snap-элементов */
          :global([data-telegram] .snap-step) {
            height: min(600px, var(--stable-vh, 100vh)) !important;
            max-height: min(600px, var(--stable-vh, 100vh)) !important;
            transition: height 0.1s ease-out;
          }
          
          @media (max-width: 768px) {
            :global([data-telegram] .snap-step) {
              height: min(600px, var(--stable-vh, 100vh)) !important;
              max-height: min(600px, var(--stable-vh, 100vh)) !important;
            }
          }
        `}</style>
        {children}
      </div>
    );
  }

  // Для остальных браузеров - Lenis с улучшенными настройками
  useEffect(() => {
    if (!isClient || isTelegram) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    });
    
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    
    // Улучшенная настройка scroller proxy
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          if (value !== undefined) {
            lenis.scrollTo(value);
          }
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    // Обновляем ScrollTrigger при изменении размера окна
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      lenis.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, [isClient, isTelegram]);

  return <>{children}</>;
}