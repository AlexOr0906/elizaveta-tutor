import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";

export default function Home() {
  return (
    <main className="home-page">
      <SiteHeader active="home" />
      <section className="hero home-hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Математика и физика · 7–11 класс</p>
          <h1>Сложное становится <em>понятным.</em></h1>
          <p className="hero-lead">Алексей Орлов — частный репетитор. Помогаю видеть логику, закрывать пробелы и уверенно готовиться к ОГЭ и ЕГЭ.</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/booking">Выбрать время <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" href="/about">Познакомиться ближе →</Link>
          </div>
          <div className="route-links" aria-label="Разделы сайта">
            <Link href="/about"><span>01</span><b>Обо мне</b><i>↗</i></Link>
            <Link href="/prices"><span>02</span><b>Цены</b><i>↗</i></Link>
            <Link href="/booking"><span>03</span><b>Запись</b><i>↗</i></Link>
          </div>
        </div>

        <div className="portrait-card home-portrait" aria-label="Карточка репетитора Алексея Орлова">
          <div className="portrait-topline"><span>На связи</span><span>Екатеринбург · онлайн</span></div>
          <div className="portrait-visual">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <span className="portrait-monogram">АО</span>
            <span className="formula formula-one">a² + b²</span>
            <span className="formula formula-two">∑ → ясно</span>
          </div>
          <div className="portrait-caption">
            <div><strong>Алексей Орлов</strong><small>преподаю 8 лет · рейтинг 4,9</small></div>
            <span className="round-arrow">↗</span>
          </div>
        </div>
      </section>
    </main>
  );
}
