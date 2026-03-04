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

  // Обновление целей без изменения состояния
  const updateTargets = useCallback(() => {
    const mobile = window.matchMedia('(max-width: 767px)').matches;
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

  useEffect(() => {
    // Первичное обновление целей
    updateTargets();

    // Слушаем изменение размера экрана
    const mql = window.matchMedia('(max-width: 767px)');
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

    // Инициализация Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // smoothTouch: false, // Отключаем на тач-устройствах
    });
    lenisRef.current = lenis;

    // Обработчик колеса мыши
    const handleWheel = (e: WheelEvent) => {
      const targets = targetsRef.current;
      if (targets.length === 0) return;

      if (isAnimating.current) return;

      const direction = e.deltaY > 0 ? 'down' : 'up';

      const currentIndex = targets.findIndex((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
      });

      let targetIndex = currentIndex;
      if (direction === 'down' && currentIndex < targets.length - 1) {
        targetIndex = currentIndex + 1;
      } else if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      }

      if (targetIndex !== currentIndex && targetIndex >= 0) {
        e.preventDefault();
        goToTarget(targetIndex);
      }
    };

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
      window.removeEventListener('wheel', handleWheel);
      mql.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, [goToTarget, updateTargets]); // Зависимости стабильны

  return <>{children}</>;
}