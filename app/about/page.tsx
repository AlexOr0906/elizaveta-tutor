import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export default function AboutPage() {
  return (
    <main className="inner-page about-page">
      <SiteHeader active="about" />
      <section className="inner-hero shell">
        <p className="eyebrow"><span /> Обо мне</p>
        <h1>Учитель, который помнит, каково это — <em>не понимать.</em></h1>
        <div className="inner-hero-bottom">
          <p>Я не требую зубрить правила. Вместо этого мы собираем знания в понятную систему и учимся применять её без страха.</p>
          <Link className="button button-dark" href="/booking">Познакомиться на уроке <span>↗</span></Link>
        </div>
      </section>

      <section className="about-story section shell">
        <div className="section-kicker">01 · История и подход</div>
        <div className="about-intro">
          <h2>От сложных формул —<br />к ясной <em>логике.</em></h2>
          <div className="about-copy">
            <p>Я окончил УрФУ по направлению «Прикладная математика» и уже 8 лет помогаю школьникам находить общий язык с точными науками.</p>
            <p>На занятиях можно ошибаться, задавать один вопрос несколько раз и не бояться выглядеть «не тем». Моя задача — найти объяснение, которое сработает именно для вас.</p>
            <dl className="stats">
              <div><dt>120+</dt><dd>учеников</dd></div>
              <div><dt>86</dt><dd>средний балл ЕГЭ</dd></div>
              <div><dt>8 лет</dt><dd>практики</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="approach section">
        <div className="shell">
          <div className="section-kicker light">02 · Как проходят занятия</div>
          <div className="section-heading-row">
            <h2>Каждый урок —<br /><em>по вашему маршруту.</em></h2>
            <p>Без универсальных шаблонов. Строим план вокруг цели, темпа и характера ученика.</p>
          </div>
          <div className="steps">
            <article><span>01</span><div className="step-symbol">⌁</div><h3>Находим точку старта</h3><p>Знакомимся, определяем пробелы и формулируем измеримую цель.</p></article>
            <article><span>02</span><div className="step-symbol">◎</div><h3>Собираем систему</h3><p>Разбираем тему на понятных примерах и закрепляем её практикой.</p></article>
            <article><span>03</span><div className="step-symbol">↗</div><h3>Видим прогресс</h3><p>Раз в месяц сверяем результат и корректируем учебный план.</p></article>
          </div>
        </div>
      </section>

      <section className="reviews section">
        <div className="shell">
          <div className="section-kicker light">03 · Отзыв ученика</div>
          <div className="quote-mark">“</div>
          <blockquote>Раньше на контрольных я просто замирала. Через два месяца впервые получила пятёрку и поняла, что математика — это не страшно, а даже красиво.</blockquote>
          <div className="review-author"><span>С</span><p><b>Софья, 9 класс</b><br />подготовка к ОГЭ</p></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
