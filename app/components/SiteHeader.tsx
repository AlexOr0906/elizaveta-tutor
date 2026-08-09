import Link from "next/link";

type SiteHeaderProps = {
  active?: "about" | "prices" | "booking";
};

export function SiteHeader({ active = "about" }: SiteHeaderProps) {
  return (
    <header className="site-header shell">
      <Link className="brand" href="/" aria-label="Алексей Орлов — главная">
        <span className="brand-mark">АО</span>
        <span className="brand-copy">Алексей Орлов<br /><small>частный репетитор</small></span>
      </Link>
      <nav className="page-nav" aria-label="Основная навигация">
        <Link className={active === "about" ? "active" : ""} href="/">Обо мне</Link>
        <Link className={active === "prices" ? "active" : ""} href="/prices">Цены</Link>
        <Link className={active === "booking" ? "active" : ""} href="/booking">Расписание</Link>
      </nav>
    </header>
  );
}
