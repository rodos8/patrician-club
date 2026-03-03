'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TwoMobile() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const leftBlock = useRef<HTMLDivElement>(null);
  const rightBlock = useRef<HTMLDivElement>(null);

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
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 20%',
            end: 'bottom 90%',
            scrub: 3,
          },
        });

        // Появление левого телефона
        tl.from(leftPhone.current, {
          y: 180,
          scale: 0.85,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
        })
          // Появление правого телефона (чуть позже)
          .from(
            rightPhone.current,
            {
              y: 200,
              scale: 0.85,
              opacity: 0,
              duration: 1.2,
              ease: 'power3.out',
            },
            '-=0.2'
          )
          // Появление уведомления (с лёгким пружинистым эффектом)
          .from(
            notification.current,
            {
              y: -80,
              scale: 0.5,
              opacity: 0,
              ease: 'back.out(1.2)',
              duration: 0.9,
            },
            '-=0.6'
          )
          // Текст теперь только появляется (без смещения X)
          .from(
            [leftText.current, rightText.current],
            {
              opacity: 0,
              duration: 0.8,
              ease: 'power2.out',
            },
            '-=0.4'
          );
      });

      /* ================= MOBILE ================= */
      mm.add('(max-width: 767px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 100%',
            end: 'bottom 90%',
            scrub: 1,
          },
        });

        tl.from(leftPhone.current, {
          y: 80,
          opacity: 0,
          scale: 0.9,
          ease: 'power3.out',
        })
          .from(
            rightPhone.current,
            {
              y: 80,
              opacity: 0,
              scale: 0.9,
              ease: 'power3.out',
            },
            '+=0.2'
          )
          .from(
            notification.current,
            {
              y: 80,
              scale: 0.6,
              opacity: 0,
              ease: 'back.out(1.2)',
            },
            '-=0.5'
          )
          // Текст на мобильных тоже без смещения
          .from(
            [leftText.current, rightText.current],
            {
              opacity: 0,
              duration: 0.8,
              ease: 'power2.out',
            },
            '-=0.3'
          );
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
          <div ref={leftBlock} className="twomobile__block">
            <div className="twomobile__list-imgs">
              <Image ref={leftPhone} src="/img/ipone-1.png" alt="" width={634} height={634} />
            </div>
            <div ref={leftText} className="twomobile__list-item">
              <div className="twomobile__list-item-title">
                Общие<br />ценности
              </div>
              <div className="twomobile__list-item-text">
                Фундамент для тех, кто строит
совместное будущее
              </div>
            </div>
          </div>

          {/* RIGHT BLOCK */}
          <div ref={rightBlock} className="twomobile__block">
            <div className="twomobile__list-imgs">
              <Image ref={rightPhone} src="/img/iphone-2.png" alt="" width={596} height={596} />
              <Image ref={notification} src="/img/screen.png" alt="" width={403} height={609} />
            </div>
            <div ref={rightText} className="twomobile__list-item">
              <div className="twomobile__list-item-title">
                Медицинский<br />протокол
              </div>
              <div className="twomobile__list-item-text">
               Обязательная верификация здоровья
по 4 ключевым показателям
              </div>
            </div>
          </div>

        </div>
      </div>
      <div ref={glow} className="twomobile__glow" />
    </section>
  );
}