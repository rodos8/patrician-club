import { useEffect } from 'react';
import { gsap } from 'gsap';

export const useMouseParallax = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (clientX - centerX) / 40;
      const moveY = (clientY - centerY) / 40;

      // Телефоны на втором экране
      const phones = document.querySelectorAll('.twomobile__list-imgs img');
      phones.forEach((phone, i) => {
        const speed = i === 0 ? 0.02 : i === 1 ? 0.04 : 0.01;
        gsap.to(phone, {
          x: moveX * speed * 50,
          y: moveY * speed * 50,
          duration: 1,
          ease: 'power2.out',
        });
      });

      // Карточки на третьем экране
      const cards = document.querySelectorAll('.cards__list-item');
      cards.forEach((card, i) => {
        const speed = 0.02 * (i + 1);
        gsap.to(card, {
          x: moveX * speed * 30,
          y: moveY * speed * 30,
          duration: 1,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
};