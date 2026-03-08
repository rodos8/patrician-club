'use client';

import { useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isTelegram, setIsTelegram] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Функция для обновления CSS переменной с реальной высотой окна
  const updateVhVariable = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  useEffect(() => {
    setIsClient(true);
    
    const ua = navigator.userAgent.toLowerCase();
    const isTelegramApp = ua.includes('telegram') || ua.includes('tgweb');
    
    setIsTelegram(isTelegramApp);
    
    if (isTelegramApp) {
      document.documentElement.setAttribute('data-telegram', 'true');
      document.body.setAttribute('data-telegram', 'true');
      
      // Инициализация переменной vh
      updateVhVariable();
      
      // Обновляем переменную при изменении размера окна и скролле
      window.addEventListener('resize', updateVhVariable);
      window.addEventListener('scroll', updateVhVariable);
      window.addEventListener('orientationchange', updateVhVariable);
      
      // Дополнительная проверка через MutationObserver для обнаружения изменений UI
      const observer = new MutationObserver(updateVhVariable);
      observer.observe(document.body, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
      
      return () => {
        document.documentElement.removeAttribute('data-telegram');
        document.body.removeAttribute('data-telegram');
        window.removeEventListener('resize', updateVhVariable);
        window.removeEventListener('scroll', updateVhVariable);
        window.removeEventListener('orientationchange', updateVhVariable);
        observer.disconnect();
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

  // Для Telegram - только нативный скролл с фиксом vh
  if (isClient && isTelegram) {
    return (
      <div className="telegram-fix">
        <style jsx>{`
          .telegram-fix {
            display: contents;
          }
          
          /* Глобальные стили для фикса vh в Telegram */
          :global([data-telegram] .vh-fix) {
            height: calc(var(--vh, 1vh) * 100) !important;
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
      // Добавляем настройки для лучшей совместимости
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