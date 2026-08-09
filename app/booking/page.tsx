"use client";

import { FormEvent, useState } from "react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

const weekDays = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

export default function BookingPage() {
  const [preferredDay, setPreferredDay] = useState("Понедельник");
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="booking-page">
      <SiteHeader active="booking" />
      <section className="booking-hero shell">
        <p className="eyebrow"><span /> Свободные даты и время</p>
        <h1>Выберите <em>удобный день.</em></h1>
        <p>Точные свободные часы будут добавлены позже. Пока можно указать предпочтительный день недели и оставить контакты.</p>
      </section>

      <section className="booking-shell shell">
        <div className="booking-panel weekly-booking-panel">
          <div className="calendar-side">
            <div className="panel-title"><div><span>Шаг 1</span><h2>День недели</h2></div><span>Время уточняется</span></div>
            <div className="availability-list" aria-label="Предпочтительный день недели">
              {weekDays.map((day, index) => (
                <button type="button" className={preferredDay === day ? "selected" : ""} key={day} onClick={() => setPreferredDay(day)} aria-pressed={preferredDay === day}>
                  <span>{String(index + 1).padStart(2, "0")}</span><b>{day}</b><small>Время будет указано</small><i>→</i>
                </button>
              ))}
            </div>
            <div className="lesson-note"><i>i</i><span>Выбор дня пока не бронирует конкретное время. Актуальные часы появятся после согласования расписания.</span></div>
          </div>

          <div className="form-side">
            {!sent ? (
              <>
                <div className="panel-title"><div><span>Шаг 2</span><h2>Оставьте контакты</h2></div></div>
                <div className="choice-summary"><small>Предпочтительный день</small><p>{preferredDay}, время уточняется</p></div>
                <form className="booking-form" onSubmit={submit}>
                  <label>Как вас зовут<input type="text" name="name" placeholder="Имя ученика или родителя" required /></label>
                  <label>Телефон или Telegram<input type="text" name="contact" placeholder="+7 900 000-00-00 или @username" required /></label>
                  <label>Класс, предмет и цель<textarea name="goal" placeholder="Например: 7 класс, математика, повысить успеваемость" required /></label>
                  <label className="privacy-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> Я согласен(на) на обработку указанных данных для связи по заявке</label>
                  <button className="button button-dark form-submit" type="submit" disabled={!consent}>Оставить заявку <span>↗</span></button>
                </form>
              </>
            ) : (
              <div className="success-card" role="status">
                <div className="success-icon">✓</div><h2>Форма заполнена</h2>
                <p>Вы выбрали <b>{preferredDay}</b>. После подключения постоянного хранения заявки будут передаваться Елизавете автоматически.</p>
                <button type="button" onClick={() => setSent(false)}>Изменить данные</button>
              </div>
            )}
          </div>
        </div>

        <div className="booking-facts">
          <div><b>1–9 класс</b><p>Математика и русский язык.</p></div>
          <div><b>Онлайн и офлайн</b><p>Формат согласуем при подтверждении.</p></div>
          <div><b>Точные часы позже</b><p>Обновим страницу, когда расписание будет готово.</p></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
