'use client';

import { useEffect, useRef, useCallback } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const isMobileRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const isInTelegramRef = useRef(false);

  // Проверка на Telegram WebView
  useEffect(() => {
    // @ts-ignore
    isInTelegramRef.current = window.TelegramWebview || navigator.userAgent.includes('Telegram');
  }, []);

  // Обновление целей (оставим для совместимости, но не используем для примагничивания)
  const updateTargets = useCallback(() => {
    const mobile = window.matchMedia('(max-width: 980px)').matches;
    isMobileRef.current = mobile;
  }, []);

  // Обработка свайпа для мобильных (без примагничивания)
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Просто пропускаем события для обычного скролла
    // Никакого примагничивания
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStartYRef.current = null;
  }, []);

  // Обработчик колеса мыши (без примагничивания)
  const handleWheel = useCallback((e: WheelEvent) => {
    // Просто пропускаем событие, Lenis обработает его сам
    // Никаких дополнительных действий
  }, []);

  useEffect(() => {
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

    // Конфигурация Lenis - без примагничивания
    const lenis = new Lenis({
      duration: isMobileRef.current ? 0.6 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // smoothTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 1,
      lerp: 0.1,
      infinite: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    });
    
    lenisRef.current = lenis;

    // Добавляем обработчики только для touch (минимально)
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true }); // passive: true для лучшей производительности
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // НЕ добавляем обработчик wheel с preventDefault, чтобы Lenis работал нормально
    // window.addEventListener('wheel', handleWheel, { passive: false }); - УДАЛЯЕМ

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
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      mql.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, updateTargets]);

  return <>{children}</>;
}