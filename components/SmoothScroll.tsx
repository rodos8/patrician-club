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
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Переход к цели по индексу (магнитный эффект)
  const snapToTarget = useCallback((index: number, immediate = false) => {
    const targets = targetsRef.current;
    if (targets.length === 0 || index < 0 || index >= targets.length) return;
    if (isAnimating.current && !immediate) return;

    isAnimating.current = true;
    
    lenisRef.current?.scrollTo(targets[index], {
      offset: 0,
      duration: immediate ? 0 : 0.8, // Быстрая, но плавная анимация
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      immediate: false,
      lock: true,
      onComplete: () => {
        isAnimating.current = false;
        ScrollTrigger.refresh();
      },
    });
  }, []);

  // Определение ближайшей цели
  const getClosestTargetIndex = useCallback(() => {
    const targets = targetsRef.current;
    if (targets.length === 0) return -1;
    
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    targets.forEach((target, index) => {
      const targetRect = target.getBoundingClientRect();
      const targetTop = scrollPosition + targetRect.top;
      const targetCenter = targetTop + targetRect.height / 2;
      const viewportCenter = scrollPosition + windowHeight / 2;
      
      const distance = Math.abs(targetCenter - viewportCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    
    return closestIndex;
  }, []);

  // Обработка окончания скролла (магнитный эффект)
  const handleScrollEnd = useCallback(() => {
    if (isAnimating.current) return;
    
    const closestIndex = getClosestTargetIndex();
    if (closestIndex !== -1) {
      snapToTarget(closestIndex);
    }
  }, [getClosestTargetIndex, snapToTarget]);

  // Обработчик скролла для сброса таймера
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Устанавливаем новый таймер для срабатывания после остановки скролла
    scrollTimeoutRef.current = setTimeout(handleScrollEnd, 150); // 150ms после остановки
  }, [handleScrollEnd]);

  // Обработка свайпа
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    
    // Отменяем запланированный магнитный эффект во время активного касания
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    // Сбрасываем таймер при движении
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
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
    const currentIndex = getClosestTargetIndex();
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
      snapToTarget(targetIndex);
    } else {
      // Если свайп недостаточно сильный для переключения, просто примагничиваемся к текущему
      setTimeout(() => {
        snapToTarget(currentIndex);
      }, 50);
    }

    touchStartYRef.current = null;
  }, [snapToTarget, getClosestTargetIndex]);

  // Обработчик колеса мыши (для десктопа)
  const handleWheel = useCallback((e: WheelEvent) => {
    // Не блокируем обычный скролл, просто сбрасываем таймер
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

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

    // Инициализация Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // smoothTouch: false, 
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    // Добавляем обработчики
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

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
        return window.scrollY; // Используем нативный scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    // Первоначальный магнитный эффект после загрузки
    setTimeout(() => {
      const initialIndex = getClosestTargetIndex();
      if (initialIndex !== -1) {
        snapToTarget(initialIndex, true);
      }
    }, 100);

    return () => {
      lenis.destroy();
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      mql.removeEventListener('change', handleChange);
      observer.disconnect();
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel, handleScroll, updateTargets, getClosestTargetIndex, snapToTarget]);

  return <>{children}</>;
}