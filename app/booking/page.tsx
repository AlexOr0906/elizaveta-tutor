"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

type Slot = { id: number; slot_date: string; slot_time: string };
type SlotDay = { date: string; label: string; weekday: string; slots: Slot[] };

function formatSlotDays(slots: Slot[]): SlotDay[] {
  const groups = new Map<string, Slot[]>();
  for (const slot of slots) groups.set(slot.slot_date, [...(groups.get(slot.slot_date) ?? []), slot]);
  return [...groups.entries()].map(([date, daySlots]) => {
    const value = new Date(`${date}T12:00:00+05:00`);
    return {
      date,
      label: new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(value),
      weekday: new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(value),
      slots: daySlots.sort((a, b) => a.slot_time.localeCompare(b.slot_time)),
    };
  });
}

export default function BookingPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState("");
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const days = useMemo(() => formatSlotDays(slots), [slots]);
  const selectedDay = days.find((day) => day.date === selectedDate) ?? days[0];
  const selectedSlot = selectedDay?.slots.find((slot) => slot.id === selectedSlotId) ?? selectedDay?.slots[0];

  useEffect(() => {
    let active = true;
    fetch("/api/schedule.php", { headers: { Accept: "application/json" } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message || "Не удалось загрузить расписание");
        return (result.slots as Array<Record<string, unknown>>).map((slot) => ({
          id: Number(slot.id), slot_date: String(slot.slot_date), slot_time: String(slot.slot_time),
        }));
      })
      .then((loadedSlots) => {
        if (!active) return;
        setSlots(loadedSlots);
        if (loadedSlots[0]) {
          setSelectedDate(loadedSlots[0].slot_date);
          setSelectedSlotId(loadedSlots[0].id);
        }
      })
      .catch((error: unknown) => {
        if (active) setScheduleError(error instanceof Error ? error.message : "Не удалось загрузить расписание");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const chooseDay = (day: SlotDay) => {
    setSelectedDate(day.date);
    setSelectedSlotId(day.slots[0]?.id ?? null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSlot) return setSubmitError("Выберите свободную дату и время");
    setSubmitting(true);
    setSubmitError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/submit.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          name: form.get("name"), phone: form.get("phone"), email: form.get("email"),
          grade: form.get("grade"), subject: form.get("subject"),
          lesson_format: form.get("lesson_format"), goal: form.get("goal"),
          website: form.get("website"), consent,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Не удалось отправить заявку");
      setSent(true);
      setSlots((current) => current.filter((slot) => slot.id !== selectedSlot.id));
    } catch (error) {
      setSubmitError(error instanceof Error && error.message ? error.message : "Не получилось отправить заявку. Попробуйте ещё раз через несколько минут.");
    } finally {
      setSubmitting(false);
    }
  };

  const choiceText = selectedDay && selectedSlot
    ? `${selectedDay.weekday}, ${selectedDay.label}, ${selectedSlot.slot_time}`
    : "Сначала выберите свободное окно";

  return (
    <main className="booking-page">
      <SiteHeader active="booking" />
      <section className="booking-hero shell">
        <p className="eyebrow"><span /> Свободные даты и время</p>
        <h1>Выберите <em>удобную дату.</em></h1>
        <p>На странице показаны только свободные окна. После отправки заявки время будет зарезервировано до подтверждения Елизаветой.</p>
      </section>
      <section className="booking-shell shell">
        <div className="booking-panel weekly-booking-panel">
          <div className="calendar-side">
            <div className="panel-title"><div><span>Шаг 1</span><h2>Дата и время</h2></div><span>Занятие · 60 минут</span></div>
            {loading && <div className="schedule-state" role="status">Загружаем свободные даты…</div>}
            {scheduleError && <div className="schedule-state form-error" role="alert">{scheduleError}</div>}
            {!loading && !scheduleError && days.length === 0 && <div className="schedule-state">Свободных окон пока нет. Новые даты появятся после обновления расписания.</div>}
            <div className="availability-list date-availability" aria-label="Свободные даты">
              {days.map((day, index) => (
                <button type="button" className={selectedDay?.date === day.date ? "selected" : ""} key={day.date} onClick={() => chooseDay(day)} aria-pressed={selectedDay?.date === day.date}>
                  <span>{String(index + 1).padStart(2, "0")}</span><b>{day.weekday}</b><small>{day.label} · {day.slots.length} {day.slots.length === 1 ? "окно" : "окна"}</small><i>→</i>
                </button>
              ))}
            </div>
            {selectedDay && <p className="time-heading">Свободное время · {selectedDay.label}</p>}
            <div className="times" aria-label="Свободное время">
              {selectedDay?.slots.map((slot) => <button type="button" className={`time-button ${selectedSlot?.id === slot.id ? "selected" : ""}`} key={slot.id} onClick={() => setSelectedSlotId(slot.id)} aria-pressed={selectedSlot?.id === slot.id}>{slot.slot_time}</button>)}
            </div>
            <div className="lesson-note"><i>i</i><span>После отправки заявки окно исчезнет из свободного расписания. Елизавета свяжется с вами для окончательного подтверждения.</span></div>
          </div>
          <div className="form-side">
            {!sent ? <>
              <div className="panel-title"><div><span>Шаг 2</span><h2>Оставьте контакты</h2></div></div>
              <div className="choice-summary"><small>Выбранное время</small><p>{choiceText}</p></div>
              <form className="booking-form" onSubmit={submit}>
                <label>Как вас зовут<input type="text" name="name" placeholder="Имя ученика или родителя" required /></label>
                <div className="form-row"><label>Телефон<input type="tel" name="phone" placeholder="+7 900 000-00-00" /></label><label>Электронная почта<input type="email" name="email" placeholder="name@example.ru" /></label></div>
                <p className="field-hint">Укажите хотя бы один способ связи.</p>
                <div className="form-row"><label>Класс<select name="grade" required defaultValue=""><option value="" disabled>Выберите</option><option>1–4 класс</option><option>5–8 класс</option><option>9 класс</option></select></label><label>Предмет<select name="subject" required defaultValue=""><option value="" disabled>Выберите</option><option>Математика</option><option>Русский язык</option></select></label></div>
                <label>Формат занятия<select name="lesson_format" required defaultValue=""><option value="" disabled>Выберите</option><option>Онлайн</option><option>Офлайн</option></select></label>
                <label>Цель занятий<textarea name="goal" placeholder="Например: повысить успеваемость, подготовиться к ВПР или ОГЭ" required /></label>
                <label className="form-honeypot" aria-hidden="true">Ваш сайт<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
                <label className="privacy-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> <span>Я согласен(на) на обработку данных и принимаю <Link href="/privacy">политику конфиденциальности</Link></span></label>
                {submitError && <p className="form-error" role="alert">{submitError}</p>}
                <button className="button button-dark form-submit" type="submit" disabled={!consent || submitting || !selectedSlot}>{submitting ? "Отправляем…" : "Забронировать окно"} <span>↗</span></button>
              </form>
            </> : <div className="success-card" role="status"><div className="success-icon">✓</div><h2>Время зарезервировано</h2><p>Заявка принята. Елизавета получила письмо и свяжется с вами для подтверждения занятия.</p><button type="button" onClick={() => setSent(false)}>Выбрать другое время</button></div>}
          </div>
        </div>
        <div className="booking-facts"><div><b>Реальные даты</b><p>Занятые окна автоматически исчезают.</p></div><div><b>Онлайн и офлайн</b><p>Формат указывается в заявке.</p></div><div><b>60 минут</b><p>Продолжительность основного занятия.</p></div></div>
      </section>
      <SiteFooter />
    </main>
  );
}
