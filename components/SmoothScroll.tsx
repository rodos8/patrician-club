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

  // Простая проверка Telegram
  useEffect(() => {
    setIsClient(true);
    
    // Максимально простая проверка
    const ua = navigator.userAgent.toLowerCase();
    const isTelegramApp = ua.includes('telegram') || ua.includes('tgweb');
    
    console.log('User Agent:', ua);
    console.log('Is Telegram:', isTelegramApp);
    
    setIsTelegram(isTelegramApp);
  }, []);

  // Для Telegram - ничего не делаем, просто рендерим детей
  // Никаких стилей, никаких эффектов, чистый нативный скролл
  if (isClient && isTelegram) {
    console.log('Telegram detected - using native scroll only');
    return <>{children}</>;
  }

  // Для всех остальных случаев используем Lenis
  useEffect(() => {
    // Если еще не на клиенте или это Telegram - ничего не делаем
    if (!isClient || isTelegram) return;

    console.log('Initializing Lenis for non-Telegram browser');

    // Базовая конфигурация Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1,
      wheelMultiplier: 1,
      lerp: 0.1,
    });
    
    lenisRef.current = lenis;

    // RAF цикл
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Интеграция с ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value);
        }
        return window.scrollY;
      },
    });

    // Очистка
    return () => {
      lenis.destroy();
    };
  }, [isClient, isTelegram]);

  return <>{children}</>;
}