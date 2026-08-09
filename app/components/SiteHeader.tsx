import Link from "next/link";

type SiteHeaderProps = {
  active?: "about" | "prices" | "booking";
};

export function SiteHeader({ active = "about" }: SiteHeaderProps) {
  return (
    <header className="site-header shell">
      <Link className="brand" href="/" aria-label="Елизавета Вячеславовна — обо мне">
        <span className="brand-mark">ЕВ</span>
        <span className="brand-copy">Елизавета Вячеславовна<br /><small>помощник в учёбе</small></span>
      </Link>
      <nav className="page-nav" aria-label="Основная навигация">
        <Link className={active === "about" ? "active" : ""} href="/">Обо мне</Link>
        <Link className={active === "prices" ? "active" : ""} href="/prices">Цены</Link>
        <Link className={active === "booking" ? "active" : ""} href="/booking">Расписание</Link>
      </nav>
    </header>
  );
}
