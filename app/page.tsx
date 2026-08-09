import Link from "next/link";

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  return (
    <main>
      <header className="site-header shell">
        <Link className="brand" href="/" aria-label="Алексей Орлов — главная">
          <span className="brand-mark">АО</span>
          <span className="brand-copy">Алексей Орлов<br /><small>частный репетитор</small></span>
        </Link>
        <nav aria-label="Основная навигация">
          <a href="#about">Обо мне</a>
          <a href="#approach">Как учимся</a>
          <a href="#reviews">Отзывы</a>
        </nav>
        <Link className="header-cta" href="/booking">Записаться <Arrow /></Link>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Математика и физика · 7–11 класс</p>
          <h1>Сложное становится <em>понятным.</em></h1>
          <p className="hero-lead">Помогаю не заучивать формулы, а видеть логику. Подготовлю к ОГЭ и ЕГЭ, разберу пробелы и верну уверенность на уроках.</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/booking">Выбрать время <Arrow /></Link>
            <a className="text-link" href="#about">Сначала познакомимся ↓</a>
          </div>
          <div className="hero-note">
            <span className="avatars" aria-hidden="true"><i>М</i><i>А</i><i>К</i></span>
            <p><b>4,9 из 5</b><br />по отзывам учеников и родителей</p>
          </div>
        </div>

        <div className="portrait-card" aria-label="Карточка репетитора Алексея Орлова">
          <div className="portrait-topline"><span>На связи</span><span>Екатеринбург · онлайн</span></div>
          <div className="portrait-visual">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <span className="portrait-monogram">АО</span>
            <span className="formula formula-one">a² + b²</span>
            <span className="formula formula-two">∑ → ясно</span>
          </div>
          <div className="portrait-caption">
            <div><strong>Алексей Орлов</strong><small>преподаю 8 лет</small></div>
            <span className="round-arrow">↗</span>
          </div>
        </div>
      </section>

      <section className="ticker" aria-label="Основные преимущества">
        <div>Понятно без зубрёжки <span>✦</span> Спокойно без давления <span>✦</span> Результат с первого месяца <span>✦</span> Понятно без зубрёжки <span>✦</span></div>
      </section>

      <section className="about section shell" id="about">
        <div className="section-kicker">01 · Обо мне</div>
        <div className="about-intro">
          <h2>Учитель, который помнит, каково это — <em>не понимать.</em></h2>
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

      <section className="approach section" id="approach">
        <div className="shell">
          <div className="section-kicker light">02 · Как проходят занятия</div>
          <div className="section-heading-row">
            <h2>Каждый урок —<br /><em>по вашему маршруту.</em></h2>
            <p>Без универсальных шаблонов. Строим план вокруг цели, темпа и характера ученика.</p>
          </div>
          <div className="steps">
            <article><span>01</span><div className="step-symbol">⌁</div><h3>Находим точку старта</h3><p>На первой встрече знакомимся, определяем пробелы и формулируем измеримую цель.</p></article>
            <article><span>02</span><div className="step-symbol">◎</div><h3>Собираем систему</h3><p>Объясняю тему на понятных примерах, закрепляем её практикой от простого к сложному.</p></article>
            <article><span>03</span><div className="step-symbol">↗</div><h3>Видим прогресс</h3><p>Раз в месяц сверяем результат и корректируем план. Родители получают короткий отчёт.</p></article>
          </div>
        </div>
      </section>

      <section className="results section shell">
        <div className="section-kicker">03 · Форматы и стоимость</div>
        <div className="section-heading-row dark-text">
          <h2>Занятия, которые<br /><em>встраиваются в жизнь.</em></h2>
          <p>Работаем онлайн в интерактивной доске. Все конспекты и домашние задания остаются у ученика.</p>
        </div>
        <div className="price-grid">
          <article className="price-card featured">
            <span className="tag">Самый популярный</span>
            <p className="card-number">01</p><h3>Индивидуально</h3><p>Персональный темп и программа под конкретную цель.</p>
            <div className="price"><strong>1 800 ₽</strong><span>/ 60 минут</span></div>
            <Link href="/booking">Выбрать время <Arrow /></Link>
          </article>
          <article className="price-card">
            <p className="card-number">02</p><h3>В паре</h3><p>Для друзей или учеников одного уровня. Больше практики и живого диалога.</p>
            <div className="price"><strong>1 200 ₽</strong><span>/ 60 минут</span></div>
            <Link href="/booking">Выбрать время <Arrow /></Link>
          </article>
          <article className="price-card">
            <p className="card-number">03</p><h3>Знакомство</h3><p>Диагностика знаний, постановка цели и персональный план занятий.</p>
            <div className="price"><strong>Бесплатно</strong><span>/ 30 минут</span></div>
            <Link href="/booking">Записаться <Arrow /></Link>
          </article>
        </div>
      </section>

      <section className="reviews section" id="reviews">
        <div className="shell">
          <div className="section-kicker light">04 · Что говорят ученики</div>
          <div className="quote-mark">“</div>
          <blockquote>Раньше на контрольных я просто замирала. Через два месяца с Алексеем впервые получила пятёрку и поняла, что математика — это не страшно, а даже красиво.</blockquote>
          <div className="review-author"><span>С</span><p><b>Софья, 9 класс</b><br />подготовка к ОГЭ</p></div>
          <div className="review-nav" aria-hidden="true">01 <span>—</span> 03</div>
        </div>
      </section>

      <section className="booking-teaser section shell">
        <div className="booking-copy">
          <div className="section-kicker">05 · Запись</div>
          <h2>Давайте найдём<br /><em>ваше время.</em></h2>
          <p>Выберите удобный день и свободное окно. Я подтвержу запись и пришлю ссылку на встречу.</p>
          <Link className="button button-dark" href="/booking">Открыть расписание <Arrow /></Link>
        </div>
        <div className="schedule-preview">
          <div className="schedule-head"><span>Ближайшие окна</span><small>МСК +2</small></div>
          <div className="schedule-row"><div><b>Пн</b><span>10 авг</span></div><button>16:00</button><button>18:30</button></div>
          <div className="schedule-row"><div><b>Вт</b><span>11 авг</span></div><button>15:00</button><button>19:00</button></div>
          <div className="schedule-row muted"><div><b>Ср</b><span>12 авг</span></div><p>мест нет</p></div>
          <Link href="/booking">Смотреть всё расписание <Arrow /></Link>
        </div>
      </section>

      <footer>
        <div className="shell footer-grid">
          <div><span className="brand-mark footer-mark">АО</span><p>Математика становится понятной,<br />когда объясняют по-человечески.</p></div>
          <div><small>Связаться</small><a href="mailto:hello@orlov-tutor.ru">hello@orlov-tutor.ru</a><a href="https://t.me/orlov_tutor">Telegram ↗</a></div>
          <div><small>Навигация</small><a href="#about">Обо мне</a><a href="#approach">Как учимся</a><Link href="/booking">Расписание</Link></div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 Алексей Орлов</span><span>Сайт частного репетитора</span></div>
      </footer>
    </main>
  );
}
