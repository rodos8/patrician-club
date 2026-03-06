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
        // Начальное состояние
        gsap.set(leftPhone.current, { opacity: 0 });
        gsap.set(rightPhone.current, { opacity: 0 });
        gsap.set(notification.current, { opacity: 0 });
        gsap.set([leftText.current, rightText.current], { opacity: 0 });

        // Анимация появления при скролле - ОЧЕНЬ МЕДЛЕННАЯ
        gsap.to(leftPhone.current, {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 4, // увеличено с 2 до 4
          },
          ease: 'power1.inOut', // более плавное easing
        });

        gsap.to(rightPhone.current, {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 4, // увеличено с 2 до 4
          },
          ease: 'power1.inOut',
        });

        // Экран появляется еще медленнее
        gsap.to(notification.current, {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 6, // еще медленнее для экрана
          },
          ease: 'power1.inOut',
        });

        gsap.to([leftText.current, rightText.current], {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 4,
          },
          ease: 'power1.inOut',
        });
      });

      /* ================= MOBILE ================= */
      mm.add('(max-width: 767px)', () => {
        gsap.set([leftPhone.current, rightPhone.current, notification.current, leftText.current, rightText.current], { opacity: 0 });

        gsap.to([leftPhone.current, rightPhone.current, notification.current, leftText.current, rightText.current], {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 3, // увеличено с 1.5 до 3
          },
          ease: 'power1.inOut',
        });
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
            scrub: 3, // увеличено с 1 до 3
          },
          ease: 'power1.inOut',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ========== ОЧЕНЬ МЕДЛЕННЫЙ PARALLAX EFFECT ==========
  useLayoutEffect(() => {
    const targetX = { current: 0 };
    const targetY = { current: 0 };
    const currentX = { current: 0 };
    const currentY = { current: 0 };

    // Уменьшаем multipliers для более subtle эффекта
    const multipliers = {
      left: { x: 15, y: 15 },      // левый телефон
      right: { x: -8, y: -12 },     // правый телефон
      notif: { x: -5, y: -8 },      // экран двигается МЕНЬШЕ ВСЕХ
    };

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) {
      multipliers.left.x *= 0.4;
      multipliers.left.y *= 0.4;
      multipliers.right.x *= 0.4;
      multipliers.right.y *= 0.4;
      multipliers.notif.x *= 0.3; // на мобильных экран двигается еще меньше
      multipliers.notif.y *= 0.3;
    }

    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if (e instanceof TouchEvent) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      // Уменьшаем чувствительность
      targetX.current = (clientX / window.innerWidth - 0.5) * 0.6;
      targetY.current = (clientY / window.innerHeight - 0.5) * 0.6;
    };

    if (isMobile) {
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchstart', handleMove, { passive: false });
    } else {
      window.addEventListener('mousemove', handleMove);
    }

    const update = () => {
      if (!leftPhone.current || !rightPhone.current || !notification.current) return;

      // ОЧЕНЬ МЕДЛЕННОЕ движение с маленьким lerp
      const lerpFactor = 0.08; // уменьшено с 0.05 для очень медленного движения
      
      currentX.current += (targetX.current - currentX.current) * lerpFactor;
      currentY.current += (targetY.current - currentY.current) * lerpFactor;

      // Плавное применение трансформаций
      gsap.set(leftPhone.current, {
        x: currentX.current * multipliers.left.x,
        y: currentY.current * multipliers.left.y,
        rotation: currentX.current * 0.5, // минимальный поворот
        ease: 'power1.inOut', // добавляем easing для плавности
      });
      
      gsap.set(rightPhone.current, {
        x: currentX.current * multipliers.right.x,
        y: currentY.current * multipliers.right.y,
        rotation: currentX.current * 0.5,
        ease: 'power1.inOut',
      });
      
      // Экран двигается с дополнительным замедлением
      const notifLerpFactor = 0.04; // еще медленнее для экрана
      const notifX = currentX.current + (targetX.current - currentX.current) * notifLerpFactor;
      const notifY = currentY.current + (targetY.current - currentY.current) * notifLerpFactor;
      
      gsap.set(notification.current, {
        x: notifX * multipliers.notif.x,
        y: notifY * multipliers.notif.y,
        rotation: currentX.current * 0.2, // почти без поворота
        ease: 'power1.inOut',
      });
    };

    gsap.ticker.add(update);

    return () => {
      if (isMobile) {
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchstart', handleMove);
      } else {
        window.removeEventListener('mousemove', handleMove);
      }
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <section ref={sectionRef} className="twomobile snap-section h-screen">
      <div className="container">
        <div className="twomobile__list">

          {/* LEFT BLOCK */}
          <div className="twomobile__block snap-step">
            <div className="twomobile__list-imgs">
              <Image 
                ref={leftPhone} 
                src="/img/ipone-1.png" 
                alt="" 
                width={634} 
                height={634}
                style={{ willChange: 'transform' }}
              />
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
          <div className="twomobile__block snap-step">
            <div className="twomobile__list-imgs">
              <Image 
                ref={rightPhone} 
                src="/img/iphone-2.png" 
                alt="" 
                width={596} 
                height={596}
                style={{ willChange: 'transform' }}
              />
              <Image 
                ref={notification} 
                src="/img/screen.png" 
                alt="" 
                width={403} 
                height={609}
                style={{ willChange: 'transform' }}
              />
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