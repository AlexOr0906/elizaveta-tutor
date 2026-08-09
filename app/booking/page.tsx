"use client";

import { FormEvent, useState } from "react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

const schedule = [
  { day: "Понедельник", summary: "17:00–22:00", slots: ["17:00", "18:00", "19:00", "20:00", "21:00"] },
  { day: "Вторник", summary: "17:00–22:00", slots: ["17:00", "18:00", "19:00", "20:00", "21:00"] },
  { day: "Среда", summary: "20:00–21:00", slots: ["20:00"] },
  { day: "Четверг", summary: "с 09:00", slots: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"] },
  { day: "Пятница", summary: "09:00–10:00", slots: ["09:00"] },
  { day: "Суббота", summary: "Выходной", slots: [] },
  { day: "Воскресенье", summary: "Выходной", slots: [] },
];

export default function BookingPage() {
  const [preferredDay, setPreferredDay] = useState("Понедельник");
  const [preferredTime, setPreferredTime] = useState("17:00");
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  const selectedDay = schedule.find(({ day }) => day === preferredDay) ?? schedule[0];

  const chooseDay = (day: (typeof schedule)[number]) => {
    if (day.slots.length === 0) return;
    setPreferredDay(day.day);
    setPreferredTime(day.slots[0]);
  };

  return (
    <main className="booking-page">
      <SiteHeader active="booking" />
      <section className="booking-hero shell">
        <p className="eyebrow"><span /> Свободные даты и время</p>
        <h1>Выберите <em>удобный день.</em></h1>
        <p>Выберите подходящий день и свободное часовое окно. Каждое основное занятие длится 60 минут.</p>
      </section>

      <section className="booking-shell shell">
        <div className="booking-panel weekly-booking-panel">
          <div className="calendar-side">
            <div className="panel-title"><div><span>Шаг 1</span><h2>День и время</h2></div><span>Занятие · 60 минут</span></div>
            <div className="availability-list" aria-label="Свободные дни недели">
              {schedule.map((item, index) => (
                <button type="button" className={preferredDay === item.day ? "selected" : ""} key={item.day} onClick={() => chooseDay(item)} aria-pressed={preferredDay === item.day} disabled={item.slots.length === 0}>
                  <span>{String(index + 1).padStart(2, "0")}</span><b>{item.day}</b><small>{item.summary}</small><i>{item.slots.length === 0 ? "—" : "→"}</i>
                </button>
              ))}
            </div>
            <p className="time-heading">Свободное время · {selectedDay.day}</p>
            <div className="times" aria-label={`Свободное время в ${selectedDay.day}`}>
              {selectedDay.slots.map((time) => (
                <button type="button" className={`time-button ${preferredTime === time ? "selected" : ""}`} key={time} onClick={() => setPreferredTime(time)} aria-pressed={preferredTime === time}>{time}</button>
              ))}
            </div>
            <div className="lesson-note"><i>i</i><span>Сейчас форма фиксирует предпочтение. Автоматическое бронирование без подтверждения появится после подключения базы данных.</span></div>
          </div>

          <div className="form-side">
            {!sent ? (
              <>
                <div className="panel-title"><div><span>Шаг 2</span><h2>Оставьте контакты</h2></div></div>
                <div className="choice-summary"><small>Выбранное время</small><p>{preferredDay}, {preferredTime}</p></div>
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
                <p>Вы выбрали <b>{preferredDay}, {preferredTime}</b>. После подключения постоянного хранения заявки будут передаваться Елизавете автоматически.</p>
                <button type="button" onClick={() => setSent(false)}>Изменить данные</button>
              </div>
            )}
          </div>
        </div>

        <div className="booking-facts">
          <div><b>1–9 класс</b><p>Математика и русский язык.</p></div>
          <div><b>Онлайн и офлайн</b><p>Формат согласуем при подтверждении.</p></div>
          <div><b>60 минут</b><p>Продолжительность основного занятия.</p></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
