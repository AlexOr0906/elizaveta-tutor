import Link from "next/link";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";

export default function AboutHomePage() {
  return (
    <main className="about-page profile-page">
      <SiteHeader active="about" />

      <section className="profile-hero shell">
        <div className="photo-placeholder" aria-label="Место для фотографии репетитора">
          <div className="photo-frame">
            <span className="photo-icon" aria-hidden="true">◇</span>
            <strong>Место для вашего фото</strong>
            <small>Лучше всего подойдёт вертикальный портрет<br />на спокойном светлом фоне</small>
          </div>
          <div className="photo-label"><span>Фото репетитора</span><span>01 / 01</span></div>
        </div>

        <div className="profile-copy">
          <p className="eyebrow"><span /> Репетитор по математике и русскому языку</p>
          <h1>Здравствуйте!<br />Я — <em>Алексей Орлов.</em></h1>
          <p className="profile-lead">Помогаю школьникам понять предмет, закрыть пробелы и увереннее чувствовать себя на уроках и экзаменах.</p>
          <div className="profile-facts">
            <span>1–11 класс</span><span>Онлайн</span><span>8 лет практики</span>
          </div>
        </div>
      </section>

      <section className="profile-story shell">
        <div className="section-kicker">Обо мне</div>
        <div className="about-intro">
          <h2>Объясняю спокойно,<br />понятно и <em>без давления.</em></h2>
          <div className="about-copy">
            <p>Я окончил УрФУ и уже 8 лет помогаю школьникам находить общий язык с учебой. На занятиях можно ошибаться, задавать один вопрос несколько раз и не бояться выглядеть «не тем».</p>
            <p>Мы не заучиваем материал вслепую. Сначала разбираемся в логике темы, затем закрепляем её на понятных примерах и только после этого переходим к более сложным заданиям.</p>
            <dl className="stats">
              <div><dt>120+</dt><dd>учеников</dd></div>
              <div><dt>86</dt><dd>средний балл</dd></div>
              <div><dt>8 лет</dt><dd>практики</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="profile-principles">
        <div className="shell">
          <div className="section-kicker">Как проходят занятия</div>
          <div className="principle-grid">
            <article><span>01</span><h3>Определяем цель</h3><p>Разбираемся, что именно мешает ученику и к какому результату хотим прийти.</p></article>
            <article><span>02</span><h3>Строим понятный план</h3><p>Двигаемся от базовых тем к сложным в комфортном для ребёнка темпе.</p></article>
            <article><span>03</span><h3>Отслеживаем прогресс</h3><p>Регулярно сверяем результаты и при необходимости корректируем программу.</p></article>
          </div>
        </div>
      </section>

      <section className="next-step shell">
        <div className="section-kicker">Что дальше?</div>
        <h2>Выберите нужный<br /><em>раздел.</em></h2>
        <div className="two-actions">
          <Link href="/prices"><span>01</span><div><small>Узнать стоимость</small><strong>Цены</strong></div><i>↗</i></Link>
          <Link href="/booking"><span>02</span><div><small>Выбрать свободное окно</small><strong>Расписание</strong></div><i>↗</i></Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
