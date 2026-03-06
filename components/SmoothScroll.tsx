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

  // Проверка Telegram
  useEffect(() => {
    setIsClient(true);
    
    const ua = navigator.userAgent.toLowerCase();
    const isTelegramApp = ua.includes('telegram') || ua.includes('tgweb');
    
    setIsTelegram(isTelegramApp);
    
    // Добавляем data-атрибут для CSS
    if (isTelegramApp) {
      document.documentElement.setAttribute('data-telegram', 'true');
      document.body.setAttribute('data-telegram', 'true');
    } else {
      document.documentElement.removeAttribute('data-telegram');
      document.body.removeAttribute('data-telegram');
    }
    
    return () => {
      // Очищаем при размонтировании
      document.documentElement.removeAttribute('data-telegram');
      document.body.removeAttribute('data-telegram');
    };
  }, []);

  // Для Telegram - только нативный скролл
  if (isClient && isTelegram) {
    return <>{children}</>;
  }

  // Для остальных браузеров - Lenis
  useEffect(() => {
    if (!isClient || isTelegram) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
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