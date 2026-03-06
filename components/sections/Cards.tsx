'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Cards() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef(null);
  const glowRef = useRef(null);
  const svgRefs = useRef<HTMLDivElement[]>([]);
  const borderRefs = useRef<HTMLDivElement[]>([]); 

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.cards__list-item');
      
      const centerCard = cards[1];
      const sideCards = [cards[0], cards[2]];
      const validSvgs = svgRefs.current.filter(Boolean);
      const validBorders = borderRefs.current.filter(Boolean);

      gsap.set(sideCards, { opacity: 0, y: 40 });
      gsap.set(centerCard, { opacity: 0, y: 30 });
      gsap.set(validSvgs, { opacity: 0, scale: 1, y: 0 });
      gsap.set(validBorders, { opacity: 0 }); 

      const appearTimeline = gsap.timeline({
        paused: true,
      });

      appearTimeline
        .to({}, { duration: 0.5 })

        // Боковые карточки появляются
        .to(sideCards, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0,
        })

        // Центральная карточка начинает появляться, когда боковые почти на месте
        .to(centerCard, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
        }, '-=0.8') // Начинаем на 0.8с раньше окончания анимации боковых

        .to({}, { duration: 0.3 }) 
        .to(validBorders, {
          opacity: 1,
          duration: 1.5,
          ease: 'power2.inOut',
          stagger: 0.1,
        })

        .to({}, { duration: 0.2 });

      
      appearTimeline.to(validSvgs[0], {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 3,
        ease: 'power2.inOut',
      }, 0.4);

      if (validSvgs[1]) {
        appearTimeline.to(validSvgs[1], {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 3,
          ease: 'power2.inOut',
        }, 1);
      }

      if (validSvgs[2]) {
        appearTimeline.to(validSvgs[2], {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 3,
          ease: 'power2.inOut',
        }, 1.6);
      }

      appearTimeline.to({}, { duration: 0.5 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
          gsap.set(sideCards, { opacity: 0, y: 40 });
          gsap.set(centerCard, { opacity: 0, y: 30 });
          gsap.set(validSvgs, { opacity: 0, scale: 1, y: 0 });
          gsap.set(validBorders, { opacity: 0 });
          
          appearTimeline.play(0);
        },
        onLeave: () => {
          appearTimeline.progress(1);
        },
        onEnterBack: () => {
          gsap.set(sideCards, { opacity: 0, y: 40 });
          gsap.set(centerCard, { opacity: 0, y: 30 });
          gsap.set(validSvgs, { opacity: 0, scale: 1, y: 0 });
          gsap.set(validBorders, { opacity: 0 });
          
          appearTimeline.play(0);
        },
        onLeaveBack: () => {
          appearTimeline.progress(0);
        },
      });

      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          setTimeout(() => {
            gsap.to(sideCards, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
            gsap.to(centerCard, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 });
            
            gsap.to(validBorders, { 
              opacity: 1, 
              duration: 2, 
              ease: 'power2.inOut',
              stagger: 0,
              delay: 0.8 
            });
            
            gsap.to(validSvgs[0], { opacity: 1, scale: 1, y: 0, duration: 2.5, ease: 'power2.inOut', delay: 0.8 });
            gsap.to(validSvgs[1], { opacity: 1, scale: 1, y: 0, duration: 2.5, ease: 'power2.inOut', delay: 1.2 });
            gsap.to(validSvgs[2], { opacity: 1, scale: 1, y: 0, duration: 2.5, ease: 'power2.inOut', delay: 1.6 });
          }, 300);
        }
      }

      gsap.fromTo(glowRef.current,
        { scale: 0.4, opacity: 0 },
        {
          scale: 1.2,
          opacity: 0.4,
          ease: 'sine.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 1.5,
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cards snap-section h-screen">
      <div className="container">
        <div ref={cardsRef} className="cards__list">
          {/* CARD 1 - Левая */}
          <div className="cards__list-item snap-step">
            <div className="cards__image-wrapper" style={{ position: 'relative' }}>
              <Image src="/img/image (4).png" alt="" width={330} height={330} />
              <div 
                ref={(el) => {
                  if (el) borderRefs.current[0] = el;
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '2.4rem',
                  borderLeft: '0.1rem solid transparent',
                  borderRight: '0.1rem solid transparent',
                  borderImageSource: 'linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, #ffffff 50.66%, rgba(255, 255, 255, 0) 95.9%)',
                  borderImageSlice: 1,
                  borderImageRepeat: 'stretch',
                  pointerEvents: 'none',
                  opacity: 0,
                }}
              />
            </div>
            <div className="cards__list-item-title">Качество важнее количества</div>
            <span />
            <p>Серьезные отношения, романтика, светское общение</p>
          </div>

          {/* CARD 2 - Центральная */}
          <div className="cards__list-item snap-step">
            <div className="cards__image-wrapper" style={{ position: 'relative' }}>
              <Image src="/img/image (7).png" alt="" width={330} height={330} />
              <div 
                ref={(el) => {
                  if (el) borderRefs.current[1] = el;
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '2.4rem',
                  borderLeft: '0.1rem solid transparent',
                  borderRight: '0.1rem solid transparent',
                  borderImageSource: 'linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, #ffffff 50.66%, rgba(255, 255, 255, 0) 95.9%)',
                  borderImageSlice: 1,
                  borderImageRepeat: 'stretch',
                  pointerEvents: 'none',
                  opacity: 0,
                }}
              />
              <div className="cards__svg-container">
                {[
                  {
                    pos: ['12rem', '9.9rem'],
                    svg: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="17" viewBox="0 0 15 17" fill="none">
                        <path d="M10.502 0.338989C12.8709 -0.218386 14.9897 1.93015 14.3994 4.29114L12.1221 13.4015C11.4582 16.0562 8.01105 16.7518 6.36914 14.5626L0.902344 7.27454C-0.503442 5.39956 0.47752 2.69802 2.75879 2.16125L10.502 0.338989Z" fill="#00A99D" fillOpacity="0.1" stroke="#00A99D" strokeWidth="0.5" />
                      </svg>
                    ),
                  },
                  {
                    pos: ['12.9rem', '10.1rem'],
                    svg: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="107" height="90" viewBox="0 0 107 90" fill="none">
                        <path d="M64.3398 0.592529C63.2881 0.183374 62.1177 0.204044 61.0811 0.650146L41.1377 9.23511C40.8297 9.36767 40.5384 9.53583 40.2695 9.73608L2.03125 38.2146C-0.0852801 39.7911 -0.295232 42.885 1.58887 44.7332L28.9766 71.5984L28.9922 71.613L29.0088 71.6248L51.3174 88.116C52.5761 89.0465 54.2419 89.22 55.665 88.5681L77.0781 78.7595C77.8581 78.4022 78.5137 77.8194 78.96 77.0867L105.168 34.0603C106.157 32.4359 105.962 30.354 104.688 28.9421L87.7695 10.199C87.3206 9.70156 86.7612 9.31603 86.1367 9.073L64.3398 0.592529Z" fill="#00A99D" fillOpacity="0.1" stroke="#00A99D" strokeWidth="0.6" />
                      </svg>
                    ),
                  },
                  {
                    pos: ['8.1rem', '11.6rem'],
                    svg: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="104" height="78" viewBox="0 0 104 78" fill="none">
                        <path d="M45.1948 0.693237C46.2614 0.283061 47.4461 0.304405 48.4976 0.751831L70.0298 9.91394C70.378 10.0621 70.7054 10.2552 71.0044 10.4872L101.566 34.2059C103.192 35.4683 103.726 37.6902 102.85 39.5536L86.3286 74.7147C85.3322 76.8353 82.8487 77.803 80.6802 76.9159L62.9263 69.6532C62.4938 69.4763 62.0312 69.3857 61.564 69.3856H23.1313C21.576 69.3856 20.1361 68.5641 19.3442 67.2255L1.01318 36.2362C0.0282741 34.5711 0.245856 32.4578 1.55029 31.0292L19.9185 10.913C20.3789 10.4087 20.9501 10.0185 21.5874 9.77332L45.1948 0.693237Z" fill="#00A99D" fillOpacity="0.3" stroke="#00A99D" strokeWidth="0.8" />
                      </svg>
                    ),
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      if (el) svgRefs.current[i] = el;
                    }}
                    style={{
                      position: 'absolute',
                      top: item.pos[0],
                      right: item.pos[1],
                      opacity: 0,
                    }}
                  >
                    {item.svg}
                  </div>
                ))}
              </div>
            </div>
            <div className="cards__list-item-title">Без территориальных ограничений</div>
            <span />
            <p>Основа - Москва и Санкт-Петербург. Общайтесь из любой точки России</p>
          </div>

          {/* CARD 3 - Правая */}
          <div className="cards__list-item snap-step">
            <div className="cards__image-wrapper" style={{ position: 'relative' }}>
              <Image src="/img/image (6).png" alt="" width={330} height={330} />
              <div 
                ref={(el) => {
                  if (el) borderRefs.current[2] = el;
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '2.4rem',
                  borderLeft: '0.1rem solid transparent',
                  borderRight: '0.1rem solid transparent',
                  borderImageSource: 'linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, #ffffff 50.66%, rgba(255, 255, 255, 0) 95.9%)',
                  borderImageSlice: 1,
                  borderImageRepeat: 'stretch',
                  pointerEvents: 'none',
                  opacity: 0,
                }}
              />
            </div>
            <div className="cards__list-item-title">Конфиденциальность</div>
            <span />
            <p>Без публикации медицинских документов. В профиле только статус</p>
          </div>
        </div>
      </div>

      <div ref={glowRef} className="cards__glow" />
    </section>
  );
}