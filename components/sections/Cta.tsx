'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassButton from '@/components/ui/GlassButton';

gsap.registerPlugin(ScrollTrigger);

export default function Cta() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Устанавливаем начальное состояние (невидимы и смещены)
      gsap.set([titleRef.current, textRef.current, buttonRef.current], {
        opacity: 0,
        y: 80,
      });

      // Создаём анимацию появления при скролле
      gsap.to([titleRef.current, textRef.current, buttonRef.current], {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse', // при входе играем вперёд, при выходе назад
        },
        y: 0,
        opacity: 1,
        stagger: 0.25,
        duration: 1.2,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cta snap-section h-screen snap-step">
      <div className="container">
        <h2 ref={titleRef} className="cta__title">
          Любовь - дело случая,<br />
          Безопасность - дело принципа
        </h2>

        <div ref={textRef} className="cta__text">
          Высокие стандарты. Абсолютная честность.
        </div>

        {/* Прямая ссылка на кнопку – работает благодаря forwardRef */}
        <GlassButton ref={buttonRef} href="https://apps.apple.com/ru/app/patrician/id6503259972" target="_blank">Вступить в клуб</GlassButton>
      </div>
    </section>
  );
}