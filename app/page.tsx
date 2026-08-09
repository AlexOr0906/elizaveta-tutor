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
          <p className="eyebrow"><span /> Математика и русский язык · 1–9 класс</p>
          <h1>Здравствуйте!<br />Я — <em>Елизавета Вячеславовна.</em></h1>
          <p className="profile-lead">Я позиционирую себя не как строгого учителя, а как помощника, которому ребёнок может доверять и с которым не страшно честно говорить о своих трудностях.</p>
          <div className="profile-facts">
            <span>1–9 класс</span><span>Онлайн и офлайн</span><span>Математика и русский</span>
          </div>
        </div>
      </section>

      <section className="profile-story shell">
        <div className="section-kicker">Обо мне</div>
        <div className="about-intro">
          <h2>Не учитель над ребёнком,<br />а помощник <em>рядом.</em></h2>
          <div className="about-copy">
            <p>На наших занятиях можно спросить: «А почему здесь так?», «Для чего это?», «Что это значит?» — или просто честно сказать: «Я ничего не понимаю», «Не знаю», «Мне вообще не хочется».</p>
            <p>Моя роль — дать знания в понятной и доступной форме, чтобы они действительно запомнились. Ребёнок не должен бояться сказать «не понял» или попросить: «Повторите, пожалуйста».</p>
            <p>Мы можем готовиться к ВПР и ОГЭ, выполнять домашние задания, разбирать непонятные темы или последовательно идти по школьной программе.</p>
          </div>
        </div>
      </section>

      <section className="profile-principles">
        <div className="shell">
          <div className="section-kicker">Как проходят занятия</div>
          <div className="principle-grid">
            <article><span>01</span><h3>Можно сказать честно</h3><p>«Не знаю», «не понимаю» и «не хочу» — это начало разговора, а не повод для стыда.</p></article>
            <article><span>02</span><h3>Объясняю доступно</h3><p>Ищем понятные слова, примеры и ассоциации, чтобы знания действительно запомнились.</p></article>
            <article><span>03</span><h3>Работаем под задачу</h3><p>Школьная программа, домашние задания, ВПР или подготовка к ОГЭ — онлайн и офлайн.</p></article>
          </div>
        </div>
      </section>

      <section className="allergy-note shell">
        <span>Важно для офлайн-занятий</span>
        <div><h2>Пожалуйста, предупредите,<br />если дома есть <em>кошка.</em></h2><p>У меня аллергия на кошек, поэтому я не смогу проводить занятие офлайн дома у ученика, если там живёт кошка. В таком случае мы сможем выбрать онлайн-формат или другое подходящее место.</p></div>
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
