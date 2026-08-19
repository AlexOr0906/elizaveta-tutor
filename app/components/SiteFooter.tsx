import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div><p>Можно не знать, не понимать<br />и всегда задавать вопросы.</p></div>
        <div><small>Формат</small><span>Онлайн и офлайн</span><span>Ученики 1–9 классов</span></div>
        <div><small>Страницы</small><Link href="/">Обо мне</Link><Link href="/prices">Цены</Link><Link href="/booking">Расписание</Link><Link href="/privacy">Политика данных</Link><Link className="admin-footer-link" href="/admin">Вход для Елизаветы</Link></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Елизавета Вячеславовна</span><span>Математика и русский язык</span></div>
    </footer>
  );
}
