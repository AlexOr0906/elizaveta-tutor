import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export default function PricesPage() {
  return (
    <main className="inner-page price-page">
      <SiteHeader active="prices" />
      <section className="inner-hero prices-hero shell">
        <p className="eyebrow"><span /> Форматы и стоимость</p>
        <h1>Понятные цены.<br /><em>Никаких сюрпризов.</em></h1>
        <div className="inner-hero-bottom"><p>Оплата после подтверждения времени. Все материалы, интерактивная доска и короткие отчёты уже входят в стоимость.</p></div>
      </section>

      <section className="prices-content shell">
        <div className="price-grid standalone-prices">
          <article className="price-card featured">
            <span className="tag">Самый популярный</span>
            <p className="card-number">01</p><h3>Индивидуально</h3><p>Персональный темп и программа под конкретную цель: школьная программа, ОГЭ или ЕГЭ.</p>
            <div className="price"><strong>1 800 ₽</strong><span>/ 60 минут</span></div>
            <Link href="/booking">Выбрать время <span>↗</span></Link>
          </article>
          <article className="price-card">
            <p className="card-number">02</p><h3>В паре</h3><p>Для друзей или учеников одного уровня. Больше практики, обсуждений и живого диалога.</p>
            <div className="price"><strong>1 200 ₽</strong><span>/ 60 минут с человека</span></div>
            <Link href="/booking">Выбрать время <span>↗</span></Link>
          </article>
          <article className="price-card">
            <p className="card-number">03</p><h3>Знакомство</h3><p>Диагностика знаний, обсуждение цели и персональный план первых занятий.</p>
            <div className="price"><strong>Бесплатно</strong><span>/ 30 минут</span></div>
            <Link href="/booking">Записаться <span>↗</span></Link>
          </article>
        </div>

        <div className="price-details">
          <div><span>В стоимость входит</span><h2>Всё, что нужно<br />для результата.</h2></div>
          <ul>
            <li><b>Интерактивные занятия</b><small>Видеосвязь и онлайн-доска — ничего дополнительно устанавливать не нужно.</small></li>
            <li><b>Все учебные материалы</b><small>Конспекты, задания и записи с доски остаются у ученика.</small></li>
            <li><b>Обратная связь</b><small>Можно задать короткий вопрос между занятиями в мессенджере.</small></li>
            <li><b>Отчёт о прогрессе</b><small>Раз в месяц родители получают краткий и понятный итог.</small></li>
          </ul>
        </div>
      </section>

      <section className="price-cta">
        <div className="shell"><p>Не уверены, какой формат выбрать?</p><h2>Начните с бесплатного <em>знакомства.</em></h2><Link className="button" href="/booking">Посмотреть расписание <span>↗</span></Link></div>
      </section>
      <SiteFooter />
    </main>
  );
}
