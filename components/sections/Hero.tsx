'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import GlassButton from '@/components/ui/GlassButton';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
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
    <section ref={sectionRef} className="hero snap-section h-screen snap-step">
      <div className="container">
        <div ref={subtitleRef} className="hero__subtitle">
          Закрытый клуб знакомств
        </div>

        <h1 ref={titleRef} className="hero__title">
          Высокие стандарты<br />Абсолютная честность
        </h1>

        <GlassButton ref={buttonRef} href="https://apps.apple.com/ru/app/patrician/id6503259972" target="_blank">Вступить в клуб</GlassButton>

        <p ref={textRef}>
          <span>Эксклюзивно на IOS</span> Москва & Санкт-Петербург
        </p>
      </div>

      <div className="hero__images">
        {/* <Image 
          src="/img/hero.png" 
          alt="Hero" 
          fill 
          priority 
          sizes="100vw"
          className="object-cover hidden md:block"
        /> */}
        <Image 
  src="/img/image-wrapper (8).png" 
  alt="Hero" 
  fill 
  priority 
  sizes="100vw"
  className="object-cover hidden md:block"
  style={{
    animation: 'fadeIn 0.3s ease-in-out 0.2s forwards',
    opacity: 0,
  }}
/>
        <Image 
          src="/img/image-wrapper (4).png" 
          alt="Hero Mobile" 
          fill 
          priority 
          sizes="100vw"
          className="object-cover block md:hidden"
        />
         <Image 
          src="/img/image-wrapper.svg" 
          alt="Hero" 
          fill 
          priority 
          sizes="100vw"
          className="object-cover hidden md:block"
        />
      </div>
    </section>
  );
}