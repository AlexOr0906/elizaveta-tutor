import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div><span className="brand-mark footer-mark">АО</span><p>Математика становится понятной,<br />когда объясняют по-человечески.</p></div>
        <div><small>Связаться</small><a href="mailto:hello@orlov-tutor.ru">hello@orlov-tutor.ru</a><a href="https://t.me/orlov_tutor">Telegram ↗</a></div>
        <div><small>Страницы</small><Link href="/about">Обо мне</Link><Link href="/prices">Цены</Link><Link href="/booking">Расписание</Link></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Алексей Орлов</span><span>Сайт частного репетитора</span></div>
    </footer>
  );
}
