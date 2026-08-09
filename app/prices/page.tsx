"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

type Subject = "math" | "russian";

const subjectNames: Record<Subject, string> = {
  math: "Математика",
  russian: "Русский язык",
};

function getLessonPrice(grade: number, subject: Subject) {
  if (grade <= 4) return subject === "math" ? 1200 : 1200;
  if (grade <= 8) return subject === "math" ? 1500 : 1400;
  if (grade === 9) return subject === "math" ? 1800 : 1700;
  if (grade === 10) return subject === "math" ? 1900 : 1800;
  return subject === "math" ? 2200 : 2100;
}

export default function PricesPage() {
  const [grade, setGrade] = useState(7);
  const [subject, setSubject] = useState<Subject>("math");
  const price = useMemo(() => getLessonPrice(grade, subject), [grade, subject]);
  const examLabel = grade === 9 ? "Подготовка к ОГЭ" : grade === 11 ? "Подготовка к ЕГЭ" : "Школьная программа";

  return (
    <main className="inner-page price-page">
      <SiteHeader active="prices" />
      <section className="inner-hero prices-hero shell">
        <p className="eyebrow"><span /> Стоимость занятий</p>
        <h1>Выберите класс<br />и <em>предмет.</em></h1>
        <div className="inner-hero-bottom"><p>Цена рассчитывается сразу после выбора. Сейчас указаны примерные значения — позже их можно заменить на ваши.</p></div>
      </section>

      <section className="calculator-section shell">
        <div className="price-calculator">
          <div className="calculator-controls">
            <div className="calculator-heading"><span>01</span><div><small>Первый шаг</small><h2>В каком классе ребёнок?</h2></div></div>
            <label className="select-label" htmlFor="grade">Класс</label>
            <div className="select-wrap">
              <select id="grade" value={grade} onChange={(event) => setGrade(Number(event.target.value))}>
                {Array.from({ length: 11 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item} класс</option>)}
              </select>
              <span aria-hidden="true">↓</span>
            </div>

            <div className="calculator-heading subject-heading"><span>02</span><div><small>Второй шаг</small><h2>Какой предмет нужен?</h2></div></div>
            <div className="subject-options" role="radiogroup" aria-label="Выберите предмет">
              {(Object.keys(subjectNames) as Subject[]).map((key) => (
                <button type="button" key={key} className={subject === key ? "selected" : ""} onClick={() => setSubject(key)} aria-pressed={subject === key}>
                  <span>{key === "math" ? "∑" : "Аа"}</span><b>{subjectNames[key]}</b>
                </button>
              ))}
            </div>
          </div>

          <aside className="calculated-price" aria-live="polite">
            <span className="result-label">Ваша стоимость</span>
            <div className="result-subject">{subjectNames[subject]} · {grade} класс</div>
            <strong>{price.toLocaleString("ru-RU")} ₽</strong>
            <small>за индивидуальное занятие · 60 минут</small>
            <dl>
              <div><dt>Программа</dt><dd>{examLabel}</dd></div>
              <div><dt>Формат</dt><dd>Онлайн, индивидуально</dd></div>
              <div><dt>Материалы</dt><dd>Включены в стоимость</dd></div>
            </dl>
            <Link className="button button-dark" href="/booking">Перейти к расписанию <span>↗</span></Link>
          </aside>
        </div>

        <p className="price-disclaimer">Это демонстрационная сетка цен. Перед публикацией подставим вашу настоящую стоимость для каждого класса и предмета.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
