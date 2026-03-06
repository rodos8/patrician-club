'use client';

import { useLayoutEffect, useRef, useEffect, useState } from 'react';
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
  
  const [isMobile, setIsMobile] = useState(false);
  const [isFirefox, setIsFirefox] = useState(false);

  // Определяем браузер и устройство
  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    setIsFirefox(navigator.userAgent.toLowerCase().includes('firefox'));
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ================= DESKTOP ================= */
      mm.add('(min-width: 768px)', () => {
        // Начальное состояние - убираем ease из set
        gsap.set(leftPhone.current, { opacity: 0 });
        gsap.set(rightPhone.current, { opacity: 0 });
        gsap.set(notification.current, { opacity: 0 });
        gsap.set([leftText.current, rightText.current], { opacity: 0 });

        // Анимация появления при скролле - убираем ease для Firefox
        gsap.to(leftPhone.current, {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 4,
          },
        });

        gsap.to(rightPhone.current, {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 4,
          },
        });

        gsap.to(notification.current, {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 6,
          },
        });

        gsap.to([leftText.current, rightText.current], {
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 4,
          },
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
            scrub: 3,
          },
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
            scrub: 3,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ========== ПАРАЛЛАКС ЭФФЕКТ ДЛЯ ВСЕХ БРАУЗЕРОВ ==========
  useEffect(() => {
    // Не запускаем на мобильных
    if (isMobile) return;

    let animationFrame: number;
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const multipliers = {
      left: { x: 15, y: 15 },
      right: { x: -8, y: -12 },
      notif: { x: -5, y: -8 },
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };

    const animate = () => {
      if (!leftPhone.current || !rightPhone.current || !notification.current) return;

      // Плавная интерполяция
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      // Для Firefox используем transform3d для аппаратного ускорения
      const transformStyle = isFirefox ? 'transform3d' : 'transform';
      
      // Применяем трансформации напрямую
      leftPhone.current.style.transform = `translate3d(${currentX * multipliers.left.x}px, ${currentY * multipliers.left.y}px, 0) rotate(${currentX * 0.5}deg)`;
      rightPhone.current.style.transform = `translate3d(${currentX * multipliers.right.x}px, ${currentY * multipliers.right.y}px, 0) rotate(${currentX * 0.5}deg)`;
      
      // Экран двигается медленнее
      const notifX = currentX + (mouseX - currentX) * 0.04;
      const notifY = currentY + (mouseY - currentY) * 0.04;
      notification.current.style.transform = `translate3d(${notifX * multipliers.notif.x}px, ${notifY * multipliers.notif.y}px, 0) rotate(${currentX * 0.2}deg)`;

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
      
      // Сбрасываем трансформации
      if (leftPhone.current) leftPhone.current.style.transform = '';
      if (rightPhone.current) rightPhone.current.style.transform = '';
      if (notification.current) notification.current.style.transform = '';
    };
  }, [isMobile, isFirefox]);

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
                style={{ 
                  willChange: 'transform',
                  transform: 'translateZ(0)', // Аппаратное ускорение
                  backfaceVisibility: 'hidden', // Оптимизация для Firefox
                }}
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
                style={{ 
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              />
              <Image 
                ref={notification} 
                src="/img/screen.png" 
                alt="" 
                width={403} 
                height={609}
                style={{ 
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
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