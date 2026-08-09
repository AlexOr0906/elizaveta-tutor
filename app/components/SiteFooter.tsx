import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div><span className="brand-mark footer-mark">ЕВ</span><p>Можно не знать, не понимать<br />и всегда задавать вопросы.</p></div>
        <div><small>Формат</small><span>Онлайн и офлайн</span><span>1–9 класс</span></div>
        <div><small>Страницы</small><Link href="/">Обо мне</Link><Link href="/prices">Цены</Link><Link href="/booking">Расписание</Link></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Елизавета Вячеславовна</span><span>Математика и русский язык</span></div>
    </footer>
  );
}
