'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('footer--visible');
          }
        });
      },
      {
        threshold: 0.1, // Срабатывает когда видно хотя бы 10% футера
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <footer ref={footerRef} className="footer footer--hidden snap-start">
      <div className="footer__list">
        <ul>
          <li>
            <Link href="/terms">Условия использования</Link>
          </li>
          <li><Link href="/privacy">Политика конфиденциальности</Link></li>
        </ul>
      </div>
      <p>© 2025 Patrician Club</p>
    </footer>
  );
}