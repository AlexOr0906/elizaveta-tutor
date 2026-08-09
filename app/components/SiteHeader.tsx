import Link from "next/link";

type SiteHeaderProps = {
  active?: "home" | "about" | "prices" | "booking";
};

export function SiteHeader({ active = "home" }: SiteHeaderProps) {
  return (
    <header className="site-header shell">
      <Link className="brand" href="/" aria-label="Алексей Орлов — главная">
        <span className="brand-mark">АО</span>
        <span className="brand-copy">Алексей Орлов<br /><small>частный репетитор</small></span>
      </Link>
      <nav className="page-nav" aria-label="Основная навигация">
        <Link className={active === "home" ? "active" : ""} href="/">Главная</Link>
        <Link className={active === "about" ? "active" : ""} href="/about">Обо мне</Link>
        <Link className={active === "prices" ? "active" : ""} href="/prices">Цены</Link>
        <Link className={active === "booking" ? "active" : ""} href="/booking">Расписание</Link>
      </nav>
      <Link className="header-cta" href="/booking">Записаться <span aria-hidden="true">↗</span></Link>
    </header>
  );
}
