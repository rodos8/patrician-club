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
        gsap.set(notification.current, { opacity: 0 });
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

  // ========== PARALLAX EFFECT (плавный, с lerp) ==========
  useLayoutEffect(() => {
    // Целевые значения (от -0.5 до 0.5)
    const targetX = { current: 0 };
    const targetY = { current: 0 };
    // Текущие значения для интерполяции
    const currentX = { current: 0 };
    const currentY = { current: 0 };

    // Множители для каждого элемента
    const multipliers = {
      left: { x: 20, y: 20 },
      right: { x: -10, y: -20 },
      notif: { x: -20, y: -35 },
    };

    // Определяем тип устройства для возможного уменьшения интенсивности
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) {
      // Можно уменьшить амплитуду на мобильных, чтобы не перекрывать контент
      multipliers.left.x *= 0.5;
      multipliers.left.y *= 0.5;
      multipliers.right.x *= 0.5;
      multipliers.right.y *= 0.5;
      multipliers.notif.x *= 0.5;
      multipliers.notif.y *= 0.5;
    }

    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if (e instanceof TouchEvent) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        // Предотвращаем скролл страницы при касании внутри секции (если нужно)
        e.preventDefault();
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      // Нормализуем координаты относительно окна
      targetX.current = (clientX / window.innerWidth - 0.5);
      targetY.current = (clientY / window.innerHeight - 0.5);
    };

    // Добавляем слушатели в зависимости от устройства
    if (isMobile) {
      window.addEventListener('touchmove', handleMove, { passive: false });
      // Также можно добавить touchstart, чтобы сразу начать отслеживание
      window.addEventListener('touchstart', handleMove, { passive: false });
    } else {
      window.addEventListener('mousemove', handleMove);
    }

    // Функция плавного обновления через ticker
    const update = () => {
      if (!leftPhone.current || !rightPhone.current || !notification.current) return;

      // Коэффициент интерполяции (чем меньше, тем плавнее и медленнее)
      const lerpFactor = 0.1;
      currentX.current += (targetX.current - currentX.current) * lerpFactor;
      currentY.current += (targetY.current - currentY.current) * lerpFactor;

      // Применяем трансформации
      gsap.set(leftPhone.current, {
        x: currentX.current * multipliers.left.x,
        y: currentY.current * multipliers.left.y,
      });
      gsap.set(rightPhone.current, {
        x: currentX.current * multipliers.right.x,
        y: currentY.current * multipliers.right.y,
      });
      gsap.set(notification.current, {
        x: currentX.current * multipliers.notif.x,
        y: currentY.current * multipliers.notif.y,
      });
    };

    gsap.ticker.add(update);

    // Очистка
    return () => {
      if (isMobile) {
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchstart', handleMove);
      } else {
        window.removeEventListener('mousemove', handleMove);
      }
      gsap.ticker.remove(update);
    };
  }, []); // Пустой массив зависимостей, так как refs стабильны

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