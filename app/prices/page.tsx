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

function getLessonPrice(grade: number, _subject: Subject) {
  if (grade <= 4) return 850;
  if (grade <= 8) return 1000;
  return 1200;
}

function getProgramDescription(grade: number) {
  if (grade <= 4) return "Заполнение пробелов, помощь с домашними заданиями, интерес к предмету и развитие усидчивости.";
  if (grade <= 8) return "Разбор сложных тем, повышение успеваемости, подготовка к контрольным и ВПР, обучение самопроверке.";
  return "Системный разбор заданий ОГЭ, отработка типовых ошибок и уверенная подготовка к экзамену.";
}

export default function PricesPage() {
  const [grade, setGrade] = useState(5);
  const [subject, setSubject] = useState<Subject>("math");
  const price = useMemo(() => getLessonPrice(grade, subject), [grade, subject]);
  const examLabel = grade === 9 ? "Подготовка к ОГЭ" : "Школьная программа / ВПР";
  const programDescription = getProgramDescription(grade);

  return (
    <main className="inner-page price-page">
      <SiteHeader active="prices" />
      <section className="inner-hero prices-hero shell">
        <p className="eyebrow"><span /> Стоимость занятий</p>
        <h1>Выберите класс<br />и <em>предмет.</em></h1>
        <div className="inner-hero-bottom"><p>Выберите класс ребёнка и предмет — стоимость индивидуального занятия рассчитается автоматически.</p></div>
      </section>

      <section className="calculator-section shell">
        <div className="trial-offer"><div><span>Пробное занятие</span><p>Для любого класса и направления</p></div><strong>500 ₽</strong><small>первое занятие</small></div>
        <div className="price-calculator">
          <div className="calculator-controls">
            <div className="calculator-heading"><span>01</span><div><small>Первый шаг</small><h2>В каком классе ребёнок?</h2></div></div>
            <label className="select-label" htmlFor="grade">Класс</label>
            <div className="select-wrap">
              <select id="grade" value={grade} onChange={(event) => setGrade(Number(event.target.value))}>
                {Array.from({ length: 9 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item} класс</option>)}
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
              <div><dt>Формат</dt><dd>Онлайн или офлайн</dd></div>
            </dl>
            <p className="program-description">{programDescription}</p>
            <Link className="button button-dark" href="/booking">Перейти к расписанию <span>↗</span></Link>
          </aside>
        </div>

        <p className="price-disclaimer">Пробное занятие — 500 ₽. 1–4 класс — 850 ₽; 5–8 класс — 1 000 ₽; подготовка к ОГЭ — 1 200 ₽. Продолжительность основного занятия — 60 минут.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
