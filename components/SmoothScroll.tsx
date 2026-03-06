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

  // Обновление мобильного статуса
  const updateTargets = useCallback(() => {
    const mobile = window.matchMedia('(max-width: 980px)').matches;
    isMobileRef.current = mobile;
  }, []);

  // Если это Telegram - возвращаем обычный скролл без Lenis
  if (isClient && isTelegram) {
    return (
      <>
        {/* Добавляем минимальные стили для Telegram */}
        <style jsx global>{`
          .telegram-webview {
            scroll-behavior: auto !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          
          .telegram-webview body {
            overflow-y: auto !important;
            height: 100%;
          }
          
          /* Отключаем любые скролл-эффекты */
          .telegram-webview * {
            scroll-behavior: auto !important;
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