'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TwoMobile() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const leftPhone = useRef<HTMLImageElement>(null);
  const rightPhone = useRef<HTMLImageElement>(null);
  const notification = useRef<HTMLImageElement>(null);

  const leftText = useRef<HTMLDivElement>(null);
  const rightText = useRef<HTMLDivElement>(null);

  const glow = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ================= DESKTOP ================= */
      mm.add('(min-width: 768px)', () => {
        // Начальное состояние: телефоны слегка смещены и прозрачны
        gsap.set(leftPhone.current, { x: -30, opacity: 0 });
        gsap.set(rightPhone.current, { x: 30, opacity: 0 });
        gsap.set(notification.current, { opacity: 0 }); // уведомление просто появляется
        gsap.set([leftText.current, rightText.current], { opacity: 0 });

        // Анимация при скролле
        gsap.to(leftPhone.current, {
          x: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 2,
          },
          ease: 'none',
        });

        gsap.to(rightPhone.current, {
          x: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 2,
          },
          ease: 'none',
        });

        // Уведомление и текст появляются чуть позже или одновременно
        gsap.to(notification.current, {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 2,
          },
          ease: 'none',
        });

        gsap.to([leftText.current, rightText.current], {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 2,
          },
          ease: 'none',
        });
      });

      /* ================= MOBILE ================= */
      mm.add('(max-width: 767px)', () => {
        // На мобильных можно оставить только появление без движения
        gsap.set([leftPhone.current, rightPhone.current, notification.current, leftText.current, rightText.current], { opacity: 0 });

        gsap.to([leftPhone.current, rightPhone.current, notification.current, leftText.current, rightText.current], {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 1.5,
          },
          ease: 'none',
        });
      });

      /* ================= PARALLAX ================= */
      mm.add('(min-width: 768px)', () => {
        const move = (e: MouseEvent) => {
          const x = e.clientX / window.innerWidth - 0.5;
          const y = e.clientY / window.innerHeight - 0.5;

          gsap.to(leftPhone.current, { x: x * 20, y: y * 20, overwrite: 'auto' });
          gsap.to(rightPhone.current, { x: x * -10, y: y * -20, overwrite: 'auto' });
          gsap.to(notification.current, { x: x * -20, y: y * -35, overwrite: 'auto' });
        };

        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
      });

      /* ================= GLOW ================= */
      gsap.fromTo(
        glow.current,
        { scale: 0.3, opacity: 0 },
        {
          scale: 1.8,
          opacity: 0.35,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="twomobile">
      <div className="container">
        <div className="twomobile__list">

          {/* LEFT BLOCK */}
          <div className="twomobile__block">
            <div className="twomobile__list-imgs">
              <Image ref={leftPhone} src="/img/ipone-1.png" alt="" width={634} height={634} />
            </div>
            <div ref={leftText} className="twomobile__list-item">
              <div className="twomobile__list-item-title">
                Общие<br />ценности
              </div>
              <div className="twomobile__list-item-text">
                Фундамент для тех, кто строит совместное будущее
              </div>
            </div>
          </div>

          {/* RIGHT BLOCK */}
          <div className="twomobile__block">
            <div className="twomobile__list-imgs">
              <Image ref={rightPhone} src="/img/iphone-2.png" alt="" width={596} height={596} />
              <Image ref={notification} src="/img/screen.png" alt="" width={403} height={609} />
            </div>
            <div ref={rightText} className="twomobile__list-item">
              <div className="twomobile__list-item-title">
                Медицинский<br />протокол
              </div>
              <div className="twomobile__list-item-text">
                Обязательная верификация здоровья по 4 ключевым показателям
              </div>
            </div>
          </div>

        </div>
      </div>
      <div ref={glow} className="twomobile__glow" />
    </section>
  );
}