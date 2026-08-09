import Link from "next/link";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";

export default function AboutHomePage() {
  return (
    <main className="about-page profile-page">
      <SiteHeader active="about" />

      <section className="profile-hero shell">
        <div className="photo-placeholder">
          <div className="photo-frame photo-frame-filled">
            <img src="/images/elizaveta-vyacheslavovna.png" alt="Елизавета Вячеславовна — репетитор по математике и русскому языку" />
          </div>
          <div className="photo-label"><span>Елизавета Вячеславовна</span><span>Репетитор</span></div>
        </div>

        <div className="profile-copy">
          <p className="eyebrow"><span /> Математика и русский язык</p>
          <h1>Здравствуйте!<br />Я — <em>Елизавета Вячеславовна.</em></h1>
          <p className="profile-lead">Я преподаватель, которому можно спокойно сказать: «Я не знаю», «Я не понял» или «Повторите, пожалуйста» — и вместе разобраться без страха и стеснения.</p>
          <div className="profile-facts">
            <span>Беру учеников 1–9 классов</span><span>Онлайн и офлайн</span>
          </div>
        </div>
      </section>

      <section className="profile-story shell">
        <div className="section-kicker">Обо мне</div>
        <div className="about-intro balanced-about">
          <h2>Преподаватель и помощник,<br />которому <em>доверяют.</em></h2>
          <div className="about-copy about-copy-balanced">
            <div className="about-text-columns">
              <div className="about-text-primary">
                <p>Меня зовут Елизавета. Я студентка 3 курса ЮУрГУ по направлению «Прикладная математика и информатика». Мои результаты ЕГЭ: математика — 85 баллов, русский язык — 90 баллов, информатика — 85 баллов.</p>
              </div>
              <div className="about-text-history">
                <p>Преподавание для меня — семейное дело: в нашей семье учителя уже не в первом поколении.</p>
                <p>Несколько лет назад я в течение года преподавала математику в мини-группах в детском центре «Талантия». Также у меня есть опыт преподавания английского языка в небольших группах и два года работы администратором в этом центре.</p>
                <p>Сейчас уже не первый год работаю репетитором индивидуально.</p>
              </div>
            </div>
            <p className="about-method-line">Этот опыт помогает мне легко находить общий язык с учениками, держать структуру занятия и выстраивать понятную систему обучения под каждого ребёнка.</p>
            <dl className="stats confirmed-stats">
              <div><dt>85</dt><dd>ЕГЭ по математике</dd></div>
              <div><dt>90</dt><dd>ЕГЭ по русскому</dd></div>
              <div><dt>85</dt><dd>ЕГЭ по информатике</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="cases-section">
        <div className="shell">
          <div className="section-kicker">Результаты учеников и кейсы</div>
          <div className="cases-heading"><h2>Прогресс, который<br /><em>видно в учёбе.</em></h2><p>Работаем не только над конкретными темами, но и над внимательностью, самостоятельностью и уверенностью ребёнка.</p></div>
          <div className="case-grid">
            <article><span>Кейс 01</span><h3>С риска завалить год — до твёрдой четвёрки</h3><p>Ученица пришла с неутешительными оценками: учёба шла тяжело, а тройку за год поставили авансом. Мы закрыли ключевые пробелы и разобрали логику решения задач.</p><div><b>Результат</b><strong>ВПР по математике — 4<br />Итоговая оценка — 4</strong></div></article>
            <article><span>Кейс 02</span><h3>Работа с невнимательностью и сильная база</h3><p>Основная сложность была не в понимании, а в потере концентрации и ошибках при подсчётах. Мы отдельно отрабатывали самопроверку, чтение условий и аккуратность.</p><div><b>Результат</b><strong>Стабильные оценки<br />и уверенность в предмете</strong></div></article>
          </div>
        </div>
      </section>

      <section className="allergy-note shell">
        <span>Важно · офлайн-занятия</span>
        <div><h2>У меня аллергия<br />на <em>кошек.</em></h2><p>Поэтому я не смогу проводить занятия офлайн дома у ученика, если там живёт кошечка. В любом случае мы можем выбрать онлайн-формат или провести занятие у меня дома.</p></div>
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
