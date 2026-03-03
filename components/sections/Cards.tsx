'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Cards() {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);
  const glowRef = useRef(null);
  const svgRefs = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      const cards = gsap.utils.toArray<HTMLElement>('.cards__list-item');

      /* ================= CARD APPEAR ================= */

      gsap.set(cards, { opacity: 0, y: 120 });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.25,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });

      /* ================= SVG SEQUENCE ================= */

      const validSvgs = svgRefs.current.filter(Boolean);

      gsap.set(validSvgs, {
        opacity: 0,
        scale: 0.6,
        y: 40,
      });

      const svgTl = gsap.timeline({
        scrollTrigger: {
          trigger: cards[1],
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      validSvgs.forEach((svg) => {
        svgTl.to(svg, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: 'back.out(2)',
        }, '+=0.25');
      });

      /* ================= GLOW PARALLAX ================= */

      gsap.fromTo(glowRef.current,
        { scale: 0.4, opacity: 0 },
        {
          scale: 1.8,
          opacity: 0.35,
          ease: 'none',
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
    <section ref={sectionRef} className="cards">
      <div className="container">
        <div ref={cardsRef} className="cards__list">

          {/* CARD 1 */}
          <div className="cards__list-item">
            <div className="cards__image-wrapper">
              <Image src="/img/image (4).png" alt="" width={330} height={330}/>
            </div>
            <div className="cards__list-item-title">Качество важнее количества</div>
            <span/>
            <p>Серьезные отношения, романтика, светское общение</p>
          </div>

          {/* CARD 2 */}
          <div className="cards__list-item">
            <div className="cards__image-wrapper" style={{ position: 'relative' }}>
              <Image src="/img/image (7).png" alt="" width={330} height={330}/>
              <div className="cards__svg-container">
                {[
  {
    pos: ['12rem','9.9rem'],
    svg: (
     <svg xmlns="http://www.w3.org/2000/svg" width="15" height="17" viewBox="0 0 15 17" fill="none">
<path d="M10.502 0.338989C12.8709 -0.218386 14.9897 1.93015 14.3994 4.29114L12.1221 13.4015C11.4582 16.0562 8.01105 16.7518 6.36914 14.5626L0.902344 7.27454C-0.503442 5.39956 0.47752 2.69802 2.75879 2.16125L10.502 0.338989Z" fill="#00A99D" fill-opacity="0.1" stroke="#00A99D" stroke-width="0.5"/>
</svg>
    )
  },
  {
    pos: ['12.9rem','10.1rem'],
    svg: (
     <svg xmlns="http://www.w3.org/2000/svg" width="107" height="90" viewBox="0 0 107 90" fill="none">
<path d="M64.3398 0.592529C63.2881 0.183374 62.1177 0.204044 61.0811 0.650146L41.1377 9.23511C40.8297 9.36767 40.5384 9.53583 40.2695 9.73608L2.03125 38.2146C-0.0852801 39.7911 -0.295232 42.885 1.58887 44.7332L28.9766 71.5984L28.9922 71.613L29.0088 71.6248L51.3174 88.116C52.5761 89.0465 54.2419 89.22 55.665 88.5681L77.0781 78.7595C77.8581 78.4022 78.5137 77.8194 78.96 77.0867L105.168 34.0603C106.157 32.4359 105.962 30.354 104.688 28.9421L87.7695 10.199C87.3206 9.70156 86.7612 9.31603 86.1367 9.073L64.3398 0.592529Z" fill="#00A99D" fill-opacity="0.1" stroke="#00A99D" stroke-width="0.6"/>
</svg>
    )
  },
  {
    pos: ['8.1rem','11.6rem'],
    svg: (
     <svg xmlns="http://www.w3.org/2000/svg" width="104" height="78" viewBox="0 0 104 78" fill="none">
<path d="M45.1948 0.693237C46.2614 0.283061 47.4461 0.304405 48.4976 0.751831L70.0298 9.91394C70.378 10.0621 70.7054 10.2552 71.0044 10.4872L101.566 34.2059C103.192 35.4683 103.726 37.6902 102.85 39.5536L86.3286 74.7147C85.3322 76.8353 82.8487 77.803 80.6802 76.9159L62.9263 69.6532C62.4938 69.4763 62.0312 69.3857 61.564 69.3856H23.1313C21.576 69.3856 20.1361 68.5641 19.3442 67.2255L1.01318 36.2362C0.0282741 34.5711 0.245856 32.4578 1.55029 31.0292L19.9185 10.913C20.3789 10.4087 20.9501 10.0185 21.5874 9.77332L45.1948 0.693237Z" fill="#00A99D" fill-opacity="0.3" stroke="#00A99D" stroke-width="0.8"/>
</svg>
    )
  }
].map((item,i)=>(
  <div
    key={i}
    ref={el => {
      if (el) svgRefs.current[i] = el;
    }}
    style={{
      position:'absolute',
      top:item.pos[0],
      right:item.pos[1],
      opacity:0
    }}
  >
    {item.svg}
  </div>
))}
              </div>
            </div>
             <div className="cards__list-item-title">Без территориальных ограничений</div>
            <span/>
            <p>Основа - Москва и Санкт-Петербург. Общайтесь из любой точки России</p>
          </div>

          {/* CARD 3 */}
          <div className="cards__list-item">
            <div className="cards__image-wrapper">
              <Image src="/img/image (6).png" alt="" width={330} height={330}/>
            </div>
            <div className="cards__list-item-title">Конфиденциальность</div>
            <span/>
            <p>Без публикации медицинских документов. В профиле только статус</p>
          </div>

        </div>
      </div>

      <div ref={glowRef} className="cards__glow"/>
    </section>
  );
}