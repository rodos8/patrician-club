'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import GlassButton from '@/components/ui/GlassButton';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Анимируем элементы по отдельности, включая саму кнопку
      gsap.set([subtitleRef.current, titleRef.current, buttonRef.current, textRef.current], {
        opacity: 0,
        y: 40,
      });

      gsap.to([subtitleRef.current, titleRef.current, buttonRef.current, textRef.current], {
        opacity: 1,
        y: 0,
        duration: 1.6,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="hero snap-section h-screen">
      <div className="container">
        <div ref={subtitleRef} className="hero__subtitle">
          Закрытый клуб знакомств
        </div>

        <h1 ref={titleRef} className="hero__title">
          Высокие стандарты.<br />Абсолютная честность
        </h1>

        {/* Теперь ref вешаем прямо на кнопку */}
        <GlassButton ref={buttonRef}>Вступить в клуб</GlassButton>

        <p ref={textRef}>
          <span>Эксклюзивно на IOS</span> Москва & Санкт-Петербург
        </p>
      </div>

      <div className="hero__images">
        <Image src="/img/hero.png" alt="Hero" fill priority />
      </div>
    </section>
  );
}