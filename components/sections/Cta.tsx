'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassButton from '@/components/ui/GlassButton';

gsap.registerPlugin(ScrollTrigger);

export default function Cta() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(itemsRef.current, {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 80,
        opacity: 0,
        stagger: 0.25,
        duration: 1.2,
        ease: "power3.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cta">
      <div className="container">
       <div
  ref={el => {
    itemsRef.current[0] = el!;
  }}
  className="cta__title"
>
  Любовь - дело случая,<br />
  безопасность - дело принципа
</div>

<div
  ref={el => {
    itemsRef.current[1] = el!;
  }}
  className="cta__text"
>
  Высокие стандарты
</div>

<div
  ref={el => {
    itemsRef.current[2] = el!;
  }}
>
  <GlassButton>Вступить</GlassButton>
</div>
      </div>
    </section>
  );
}