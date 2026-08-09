"use client";

import { FormEvent, useMemo, useState } from "react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

type DayOption = {
  iso: string;
  weekday: string;
  day: number;
  month: string;
  full: string;
};

const timePatterns = [
  ["15:00", "16:30", "18:00", "19:30"],
  ["14:00", "15:30", "17:00", "20:00"],
  ["16:00", "17:30", "19:00"],
  ["13:00", "15:00", "18:30", "20:00"],
  ["15:30", "17:00", "18:30"],
  ["11:00", "12:30", "15:00"],
];

const shortWeekday = new Intl.DateTimeFormat("ru-RU", { weekday: "short" });
const shortMonth = new Intl.DateTimeFormat("ru-RU", { month: "short" });
const longDate = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" });

function getUpcomingDays(): DayOption[] {
  const result: DayOption[] = [];
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  while (result.length < 6) {
    if (date.getDay() !== 0) {
      result.push({
        iso: date.toISOString().slice(0, 10),
        weekday: shortWeekday.format(date).replace(".", ""),
        day: date.getDate(),
        month: shortMonth.format(date).replace(".", ""),
        full: longDate.format(date),
      });
    }
    date.setDate(date.getDate() + 1);
  }
  return result;
}

export default function BookingPage() {
  const days = useMemo(getUpcomingDays, []);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);

  const chooseDay = (index: number) => {
    setSelectedDay(index);
    setSelectedTime("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="booking-page">
      <SiteHeader active="booking" />

      <section className="booking-hero shell">
        <p className="eyebrow"><span /> Онлайн · МСК +2</p>
        <h1>Выберите <em>удобное время.</em></h1>
        <p>Знакомство длится 30 минут и ничего не стоит. Обсудим цель, формат занятий и составим первый план.</p>
      </section>

      <section className="booking-shell shell">
        <div className="booking-panel">
          <div className="calendar-side">
            <div className="panel-title">
              <div><span>Шаг 1</span><h2>День и время</h2></div>
              <span>Ближайшие 7 дней</span>
            </div>
            <div className="week" aria-label="Выбор дня">
              {days.map((day, index) => (
                <button
                  type="button"
                  className={`day-button ${selectedDay === index ? "selected" : ""}`}
                  key={day.iso}
                  onClick={() => chooseDay(index)}
                  aria-pressed={selectedDay === index}
                >
                  <span>{day.weekday}</span><b>{day.day}</b><small>{day.month}</small>
                </button>
              ))}
            </div>

            <p className="time-heading">Свободные окна</p>
            <div className="times" aria-label="Выбор времени">
              {timePatterns[selectedDay].map((time, index) => (
                <button
                  type="button"
                  className={`time-button ${selectedTime === time ? "selected" : ""}`}
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  aria-pressed={selectedTime === time}
                  disabled={index === 1 && selectedDay === 2}
                >{time}</button>
              ))}
            </div>

            <div className="lesson-note"><i>i</i><span>Время указано по Екатеринбургу. После заявки я напишу вам в мессенджер и подтвержу встречу.</span></div>
          </div>

          <div className="form-side">
            {!sent ? (
              <>
                <div className="panel-title"><div><span>Шаг 2</span><h2>Оставьте контакты</h2></div></div>
                <div className="choice-summary">
                  <small>Вы выбрали</small>
                  <p>{selectedTime ? `${days[selectedDay]?.full}, ${selectedTime}` : "Сначала выберите время слева"}</p>
                </div>
                <form className="booking-form" onSubmit={submit}>
                  <label>Как вас зовут<input type="text" name="name" placeholder="Имя ученика или родителя" required /></label>
                  <label>Телефон или Telegram<input type="text" name="contact" placeholder="+7 900 000-00-00 или @username" required /></label>
                  <label>Класс и цель<textarea name="goal" placeholder="Например: 9 класс, подготовка к ОГЭ" /></label>
                  <label className="privacy-check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> Я согласен(на) на обработку указанных данных для связи по заявке</label>
                  <button className="button button-dark form-submit" type="submit" disabled={!selectedTime || !consent}>Отправить заявку <span>↗</span></button>
                </form>
              </>
            ) : (
              <div className="success-card" role="status">
                <div className="success-icon">✓</div>
                <h2>Заявка принята</h2>
                <p>Спасибо! Время <b>{selectedTime}</b> на <b>{days[selectedDay]?.full}</b> предварительно закреплено. Я свяжусь с вами, чтобы всё подтвердить.</p>
                <button type="button" onClick={() => setSent(false)}>Изменить данные</button>
              </div>
            )}
          </div>
        </div>

        <div className="booking-facts">
          <div><b>30 минут бесплатно</b><p>Знакомство, диагностика и план подготовки без оплаты.</p></div>
          <div><b>Без обязательств</b><p>После встречи вы спокойно решите, подходит ли вам формат.</p></div>
          <div><b>Нужен другой день?</b><p>Напишите в Telegram — попробуем подобрать дополнительное окно.</p></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
