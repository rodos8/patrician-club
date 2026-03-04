import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer snap-start">
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