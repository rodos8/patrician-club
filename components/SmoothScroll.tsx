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

  // Все хуки вызываются безусловно на верхнем уровне
  useEffect(() => {
    setIsClient(true);
    
    const ua = navigator.userAgent.toLowerCase();
    const isTelegramApp = ua.includes('telegram') || ua.includes('tgweb');
    
    setIsTelegram(isTelegramApp);
    
    // Применяем атрибуты в любом случае
    if (isTelegramApp) {
      document.documentElement.setAttribute('data-telegram', 'true');
      document.body.setAttribute('data-telegram', 'true');
    } else {
      document.documentElement.removeAttribute('data-telegram');
      document.body.removeAttribute('data-telegram');
    }
  }, []);

  // Хук для Lenis - вызывается всегда, но с условием внутри
  useEffect(() => {
    // Не вызываем Lenis если это Telegram или не клиент
    if (!isClient || isTelegram) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });
    
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    const rafId = requestAnimationFrame(raf);

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
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isClient, isTelegram]); // Зависимости корректно указаны

  // Хук для Telegram фиксов
  useEffect(() => {
    if (!isClient || !isTelegram) return;

    const updateVhVariable = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--stable-vh', `${window.innerHeight}px`);
    };

    updateVhVariable();
    
    window.addEventListener('resize', updateVhVariable);
    window.addEventListener('orientationchange', updateVhVariable);
    
    return () => {
      window.removeEventListener('resize', updateVhVariable);
      window.removeEventListener('orientationchange', updateVhVariable);
    };
  }, [isClient, isTelegram]);

  // Больше никакого условного рендеринга с хуками!
  // Просто возвращаем children, все стили применяются через CSS и атрибуты
  return <>{children}</>;
}