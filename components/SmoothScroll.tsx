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
  const isInTelegramRef = useRef(false);
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const lastDirectionRef = useRef(0);
  const canSwitchRef = useRef(true); // Защита от слишком частых переключений

  // Проверка на Telegram WebView
  useEffect(() => {
    // @ts-ignore
    isInTelegramRef.current = window.TelegramWebview || navigator.userAgent.includes('Telegram');
  }, []);

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
  const goToTarget = useCallback((index: number, immediate = false) => {
    const targets = targetsRef.current;
    if (targets.length === 0 || index < 0 || index >= targets.length) return;
    if (isAnimating.current && !immediate) return;

    isAnimating.current = true;
    canSwitchRef.current = false;
    
    // Блокируем переключение на короткое время
    setTimeout(() => {
      canSwitchRef.current = true;
    }, 300); // 300ms между переключениями
    
    lenisRef.current?.scrollTo(targets[index], {
      offset: 0,
      duration: immediate ? 0 : (isMobileRef.current ? 0.6 : 0.8), // Увеличил с 0.3 до 0.6 на мобильных
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

  // Для мобильных - плавный переход при скролле
  const handleMobileScroll = useCallback((e: WheelEvent | TouchEvent) => {
    if (isAnimating.current || !canSwitchRef.current) return;
    
    const now = Date.now();
    const timeDiff = now - lastScrollTimeRef.current;
    lastScrollTimeRef.current = now;
    
    // Определяем направление
    let direction = 0;
    if (e instanceof WheelEvent) {
      direction = e.deltaY > 0 ? 1 : -1;
    }
    
    // Если направление изменилось, сбрасываем счетчик
    if (direction !== 0 && direction !== lastDirectionRef.current) {
      lastDirectionRef.current = direction;
    }
    
    const currentIndex = getClosestTargetIndex();
    if (currentIndex === -1) return;
    
    // Сбрасываем таймер для магнитного эффекта
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // На мобильных переходим на следующий слайд при достаточном скролле
    if (Math.abs(e instanceof WheelEvent ? e.deltaY : 0) > 40) { // Увеличил порог с 20 до 40
      const targetIndex = currentIndex + direction;
      if (targetIndex >= 0 && targetIndex < targetsRef.current.length) {
        e.preventDefault();
        goToTarget(targetIndex);
      }
    }
    
    // Магнитный эффект после остановки
    scrollTimeoutRef.current = setTimeout(() => {
      if (!isAnimating.current && canSwitchRef.current) {
        const closestIndex = getClosestTargetIndex();
        if (closestIndex !== -1 && closestIndex !== currentIndex) {
          goToTarget(closestIndex);
        }
      }
      isScrollingRef.current = false;
    }, isMobileRef.current ? 200 : 150); // Увеличил с 100 до 200 на мобильных
  }, [getClosestTargetIndex, goToTarget]);

  // Обработка свайпа для мобильных
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartYRef.current || isAnimating.current || !canSwitchRef.current) return;
    
    const touchY = e.touches[0].clientY;
    const deltaY = touchStartYRef.current - touchY;
    
    // Увеличил порог свайпа с 30 до 50
    if (Math.abs(deltaY) > 50 && !isAnimating.current) {
      const direction = deltaY > 0 ? 1 : -1;
      const currentIndex = getClosestTargetIndex();
      
      if (currentIndex !== -1) {
        const targetIndex = currentIndex + direction;
        if (targetIndex >= 0 && targetIndex < targetsRef.current.length) {
          e.preventDefault();
          goToTarget(targetIndex);
          touchStartYRef.current = touchY; // Обновляем начало для следующего свайпа
        }
      }
    }
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, [getClosestTargetIndex, goToTarget]);

  const handleTouchEnd = useCallback(() => {
    touchStartYRef.current = null;
  }, []);

  // Обработчик колеса мыши для ПК
  const handleWheel = useCallback((e: WheelEvent) => {
    if (isMobileRef.current) {
      handleMobileScroll(e);
      return;
    }
    
    // Для ПК - только сброс таймера, магнитный эффект позже
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (!isAnimating.current) {
        const closestIndex = getClosestTargetIndex();
        if (closestIndex !== -1) {
          goToTarget(closestIndex);
        }
      }
    }, 150);
  }, [getClosestTargetIndex, goToTarget, handleMobileScroll]);

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

    // Конфигурация Lenis в зависимости от платформы
    const lenis = new Lenis({
      duration: isMobileRef.current ? 0.6 : 1.2, // Увеличил с 0.3 до 0.6 на мобильных
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !isMobileRef.current,
      touchMultiplier: 1,
      wheelMultiplier: isMobileRef.current ? 0.8 : 1, // Увеличил с 0.5 до 0.8
      lerp: 0.1,
      infinite: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    });
    
    lenisRef.current = lenis;

    // Добавляем обработчики
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', () => {}, { passive: true });

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

    setTimeout(() => {
      const initialIndex = getClosestTargetIndex();
      if (initialIndex !== -1) {
        goToTarget(initialIndex, true);
      }
    }, 200);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      lenis.destroy();
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      mql.removeEventListener('change', handleChange);
      observer.disconnect();
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel, updateTargets, getClosestTargetIndex, goToTarget]);

  return <>{children}</>;
}