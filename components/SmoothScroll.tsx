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

  // Переход к цели по индексу (магнитный эффект)
  const snapToTarget = useCallback((index: number, immediate = false) => {
    const targets = targetsRef.current;
    if (targets.length === 0 || index < 0 || index >= targets.length) return;
    if (isAnimating.current && !immediate) return;

    isAnimating.current = true;
    
    lenisRef.current?.scrollTo(targets[index], {
      offset: 0,
      duration: immediate ? 0 : 0.8,
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
    
    scrollTimeoutRef.current = setTimeout(handleScrollEnd, 150);
  }, [handleScrollEnd]);

  // Обработка свайпа для мобильных
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // В Telegram WebView нужно предотвращать стандартное поведение для плавности
    if (isInTelegramRef.current) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartYRef.current === null) return;
    if (isAnimating.current) return;

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;
    
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
      setTimeout(() => {
        snapToTarget(currentIndex);
      }, 50);
    }

    touchStartYRef.current = null;
  }, [snapToTarget, getClosestTargetIndex]);

  // Обработчик колеса мыши
  const handleWheel = useCallback((e: WheelEvent) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
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

    // Оптимизированная конфигурация Lenis для мобильных
    const lenis = new Lenis({
      duration: isMobileRef.current ? 0.8 : 1.2, // Меньше длительность на мобильных
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // smoothTouch: isInTelegramRef.current ? false : true, // Отключаем smoothTouch в Telegram
      touchMultiplier: isInTelegramRef.current ? 1.5 : 2, // Меньше множитель в Telegram
      wheelMultiplier: 1,
      lerp: 0.1, // Добавляем lerp для более плавного движения
      infinite: false,
    });
    
    lenisRef.current = lenis;

    // Добавляем обработчики с правильными опциями
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false }); // Важно: passive: false для предотвращения скролла
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Оптимизированный RAF
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

    // Задержка перед первым магнитным эффектом
    setTimeout(() => {
      const initialIndex = getClosestTargetIndex();
      if (initialIndex !== -1) {
        snapToTarget(initialIndex, true);
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