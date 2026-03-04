'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const isAnimating = useRef(false);
  const [hasSections, setHasSections] = useState(false);

  // Получение всех секций с классом snap-section
  const getSections = useCallback((): HTMLElement[] => {
    return Array.from(document.querySelectorAll('.snap-section'));
  }, []);

  // Переход к секции по индексу
  const goToSection = useCallback(
    (index: number) => {
      const sections = getSections();
      if (sections.length === 0 || index < 0 || index >= sections.length) return;
      if (isAnimating.current) return;

      isAnimating.current = true;
      lenisRef.current?.scrollTo(sections[index], {
        offset: 0,
        duration: 2.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        immediate: false,
        lock: true,
        onComplete: () => {
          isAnimating.current = false;
          ScrollTrigger.refresh(); // Обновляем триггеры после перехода
        },
      });
    },
    [getSections]
  );

  useEffect(() => {
    // Проверяем наличие секций
    const checkSections = () => {
      const sections = getSections();
      setHasSections(sections.length > 0);
      return sections;
    };

    // Инициализация Lenis
    const sections = checkSections();
    const lenis = new Lenis({
      duration: 2.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !hasSections, // Если секций нет – обычная плавная прокрутка
    });

    lenisRef.current = lenis;

    // Обработчик колесика мыши для постраничного переключения
    const handleWheel = (e: WheelEvent) => {
      if (!hasSections) return; // Если нет секций – ничего не делаем (работает обычный скролл)

      e.preventDefault(); // Отключаем стандартное поведение

      if (isAnimating.current) return;

      const direction = e.deltaY > 0 ? 'down' : 'up';
      const sections = getSections();
      const currentIndex = sections.findIndex((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
      });

      let targetIndex = currentIndex;
      if (direction === 'down' && currentIndex < sections.length - 1) {
        targetIndex = currentIndex + 1;
      } else if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      }

      if (targetIndex !== currentIndex) {
        goToSection(targetIndex);
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
    };
  }, [getSections, goToSection, hasSections]);

  return <>{children}</>;
}