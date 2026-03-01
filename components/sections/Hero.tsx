'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import GlassButton from '@/components/ui/GlassButton';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<any[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(itemsRef.current, { opacity: 0, y: 40 });

      gsap.to(itemsRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="hero">
      <div className="container">
        <div ref={el => itemsRef.current[0] = el} className="hero__subtitle">Закрытый клуб знакомств</div>
        <h1 ref={el => itemsRef.current[1] = el} className="hero__title">Высокие стандарты.<br />Абсолютная честность</h1>
        <div ref={el => itemsRef.current[2] = el}><GlassButton>Вступить в клуб</GlassButton></div>
        <p ref={el => itemsRef.current[3] = el}><span>Эксклюзивно на IOS</span> Москва & Санкт-Петербург</p>
      </div>

      <div className="hero__images">
        <Image src="/img/hero.png" alt="Hero" fill priority />
        <Image src="/img/image-wrapper (1).png" alt="Overlay" fill priority />
      </div>
    </section>
  );
}