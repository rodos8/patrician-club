'use client';

import { useEffect, useRef, useCallback } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const isAnimating = useRef(false);
  const targetsRef = useRef<HTMLElement[]>([]);
  const isMobileRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Обновление целей без изменения состояния
  const updateTargets = useCallback(() => {
    const mobile = window.matchMedia('(max-width: 980px)').matches;
    isMobileRef.current = mobile;
    
    if (mobile) {
      const steps = Array.from(document.querySelectorAll('.snap-step'));
      if (steps.length > 0) {
        targetsRef.current = steps as HTMLElement[];
        return;
      }
    }
    targetsRef.current = Array.from(document.querySelectorAll('.snap-section'));
  }, []);

  // Переход к цели по индексу
  const goToTarget = useCallback((index: number) => {
    const targets = targetsRef.current;
    if (targets.length === 0 || index < 0 || index >= targets.length) return;
    if (isAnimating.current) return;

    isAnimating.current = true;
    lenisRef.current?.scrollTo(targets[index], {
      offset: 0,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      immediate: false,
      lock: true,
      onComplete: () => {
        isAnimating.current = false;
        ScrollTrigger.refresh();
      },
    });
  }, []);

  // Определение текущей видимой цели
  const getCurrentIndex = useCallback(() => {
    const targets = targetsRef.current;
    if (targets.length === 0) return -1;
    
    return targets.findIndex((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
    });
  }, []);

  // Обработка свайпа
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartYRef.current === null) return;
    if (isAnimating.current) return;

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;
    
    // Минимальное расстояние для свайпа (в пикселях)
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaY) < minSwipeDistance) {
      touchStartYRef.current = null;
      return;
    }

    const direction = deltaY > 0 ? 'down' : 'up';
    const currentIndex = getCurrentIndex();
    const targets = targetsRef.current;

    if (currentIndex === -1) {
      touchStartYRef.current = null;
      return;
    }

    let targetIndex = currentIndex;
    if (direction === 'down' && currentIndex < targets.length - 1) {
      targetIndex = currentIndex + 1;
    } else if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    }

    if (targetIndex !== currentIndex) {
      e.preventDefault();
      goToTarget(targetIndex);
    }

    touchStartYRef.current = null;
  }, [goToTarget, getCurrentIndex]);

  // Обработчик колеса мыши (для десктопа)
  const handleWheel = useCallback((e: WheelEvent) => {
    const targets = targetsRef.current;
    if (targets.length === 0) return;
    if (isAnimating.current) return;

    const direction = e.deltaY > 0 ? 'down' : 'up';
    const currentIndex = getCurrentIndex();

    if (currentIndex === -1) return;

    let targetIndex = currentIndex;
    if (direction === 'down' && currentIndex < targets.length - 1) {
      targetIndex = currentIndex + 1;
    } else if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    }

    if (targetIndex !== currentIndex) {
      e.preventDefault();
      goToTarget(targetIndex);
    }
  }, [goToTarget, getCurrentIndex]);

  useEffect(() => {
    // Первичное обновление целей
    updateTargets();

    // Слушаем изменение размера экрана
    const mql = window.matchMedia('(max-width: 980px)');
    const handleChange = () => {
      updateTargets();
    };
    mql.addEventListener('change', handleChange);

    // MutationObserver для отслеживания появления новых секций
    const observer = new MutationObserver(() => {
      updateTargets();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    // Инициализация Lenis с поддержкой touch
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2, // Ускоряем реакцию на touch
    });
    lenisRef.current = lenis;

    // Добавляем обработчики touch событий
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });

    // RAF для Lenis
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Интеграция с ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value);
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    return () => {
      lenis.destroy();
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      mql.removeEventListener('change', handleChange);
      observer.disconnect();
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, [handleTouchStart, handleTouchEnd, handleWheel, updateTargets]);

  return <>{children}</>;
}