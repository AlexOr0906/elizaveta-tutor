"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { SiteHeader } from "../components/SiteHeader";

type Slot = {
  id: number; slot_date: string; slot_time: string; status: string;
  booking_id?: number | null; booking_name?: string | null;
};
type Booking = {
  id: number; name: string; phone?: string; email?: string; student_grade: string;
  subject: string; lesson_format: string; goal: string; status: string;
  admin_note?: string; slot_date: string; slot_time: string; email_sent: number;
};

const statusNames: Record<string, string> = {
  available: "Свободно", blocked: "Закрыто", pending: "Ожидает", booked: "Занято",
  confirmed: "Подтверждено", completed: "Проведено", cancelled: "Отменено", rejected: "Отклонено",
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [csrf, setCsrf] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const api = useCallback(async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(csrf ? { "X-CSRF-Token": csrf } : {}), ...(options.headers ?? {}) },
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || "Не удалось выполнить действие");
    return result;
  }, [csrf]);

  const loadData = useCallback(async () => {
    const [slotResult, bookingResult] = await Promise.all([
      api("/api/admin/slots.php"), api("/api/admin/bookings.php"),
    ]);
    setSlots(slotResult.slots.map((slot: Slot) => ({ ...slot, id: Number(slot.id) })));
    setBookings(bookingResult.bookings.map((booking: Booking) => ({ ...booking, id: Number(booking.id) })));
  }, [api]);

  useEffect(() => {
    fetch("/api/admin/session.php")
      .then((response) => response.json())
      .then(async (result) => {
        setConfigured(Boolean(result.configured));
        setAuthenticated(Boolean(result.authenticated));
        setCsrf(result.csrf_token || "");
      })
      .catch(() => setError("Не удалось подключиться к админ-панели"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (authenticated && csrf) loadData().catch((reason) => setError(reason.message)); }, [authenticated, csrf, loadData]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await api("/api/admin/login.php", { method: "POST", body: JSON.stringify({ username: form.get("username"), password: form.get("password") }) });
      setCsrf(result.csrf_token); setAuthenticated(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Не удалось войти"); }
  };

  const mutate = async (url: string, body: Record<string, unknown>, success: string) => {
    setError(""); setMessage("");
    try { await api(url, { method: "POST", body: JSON.stringify(body) }); setMessage(success); await loadData(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Не удалось сохранить изменения"); }
  };

  const addSlot = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    return mutate("/api/admin/slots.php", { action: "create", date: form.get("date"), time: form.get("time") }, "Свободное окно добавлено");
  };
  const generate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const weekdays = form.getAll("weekdays").map(Number);
    const times = String(form.get("times") || "").split(/[,\s]+/).filter(Boolean);
    return mutate("/api/admin/slots.php", { action: "generate", from_date: form.get("from_date"), to_date: form.get("to_date"), weekdays, times }, "Расписание создано");
  };

  if (loading) return <main className="admin-page"><SiteHeader /><div className="admin-shell schedule-state">Загружаем админ-панель…</div></main>;
  if (!authenticated) return <main className="admin-page"><SiteHeader /><section className="admin-login shell"><p className="eyebrow"><span /> Закрытый раздел</p><div className="admin-login-card"><h1>Вход для Елизаветы</h1>{!configured && <p className="form-error">Сначала задайте пароль администратора в настройках сервера.</p>}<form onSubmit={login}><label>Логин<input name="username" autoComplete="username" defaultValue="elizaveta" required /></label><label>Пароль<input type="password" name="password" autoComplete="current-password" required /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark" disabled={!configured}>Войти</button></form></div></section></main>;

  return <main className="admin-page"><SiteHeader /><section className="admin-shell shell">
    <div className="admin-top"><div><p className="eyebrow"><span /> Управление записью</p><h1>Расписание и заявки</h1></div><div className="admin-top-actions"><a className="button button-light" href="/api/admin/backup.php">Скачать резервную копию</a><button onClick={() => mutate("/api/admin/logout.php", {}, "").then(() => location.reload())}>Выйти</button></div></div>
    {message && <p className="admin-message" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}
    <div className="admin-grid">
      <section className="admin-card"><h2>Добавить одно окно</h2><form className="admin-inline-form" onSubmit={addSlot}><label>Дата<input type="date" name="date" required /></label><label>Время<input type="time" name="time" required /></label><button className="button button-dark">Добавить</button></form></section>
      <section className="admin-card"><h2>Создать повторяющееся расписание</h2><form className="admin-generate-form" onSubmit={generate}><div className="form-row"><label>С даты<input type="date" name="from_date" required /></label><label>По дату<input type="date" name="to_date" required /></label></div><fieldset><legend>Дни недели</legend>{["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((day,index)=><label key={day}><input type="checkbox" name="weekdays" value={index+1}/>{day}</label>)}</fieldset><label>Время через пробел или запятую<input name="times" placeholder="17:00 18:00 19:00" required /></label><button className="button button-dark">Создать окна</button></form></section>
    </div>
    <section className="admin-section"><div className="admin-section-head"><h2>Временные окна</h2><span>{slots.length}</span></div><div className="admin-slot-list">{slots.map(slot=><article key={slot.id} className={`admin-slot status-${slot.status}`}><div><b>{slot.slot_date}</b><strong>{slot.slot_time}</strong></div><span>{statusNames[slot.status] ?? slot.status}{slot.booking_name ? ` · ${slot.booking_name}` : ""}</span>{["available","blocked"].includes(slot.status) && <button onClick={()=>mutate("/api/admin/slots.php",{action:"set_status",slot_id:slot.id,status:slot.status==="available"?"blocked":"available"},slot.status==="available"?"Окно закрыто":"Окно открыто")}>{slot.status === "available" ? "Закрыть" : "Открыть"}</button>}</article>)}</div></section>
    <section className="admin-section"><div className="admin-section-head"><h2>Заявки</h2><span>{bookings.length}</span></div><div className="admin-bookings">{bookings.map(booking=><article key={booking.id} className={`admin-booking status-${booking.status}`}><header><div><small>#{booking.id} · {statusNames[booking.status] ?? booking.status}</small><h3>{booking.slot_date}, {booking.slot_time}</h3></div><b>{booking.name}</b></header><div className="admin-booking-details"><p><strong>Связь:</strong> {[booking.phone,booking.email].filter(Boolean).join(", ")}</p><p><strong>Ученик:</strong> {booking.student_grade}, {booking.subject}, {booking.lesson_format}</p><p><strong>Запрос:</strong> {booking.goal}</p></div><label>Внутренняя заметка<textarea defaultValue={booking.admin_note ?? ""} onBlur={(event)=>mutate("/api/admin/bookings.php",{action:"note",booking_id:booking.id,admin_note:event.target.value},"Заметка сохранена")}/></label><footer>{booking.status==="pending"&&<><button className="confirm" onClick={()=>mutate("/api/admin/bookings.php",{action:"confirm",booking_id:booking.id,admin_note:booking.admin_note??""},"Заявка подтверждена")}>Подтвердить</button><button onClick={()=>mutate("/api/admin/bookings.php",{action:"reject",booking_id:booking.id,admin_note:booking.admin_note??""},"Заявка отклонена")}>Отклонить</button></>}{booking.status==="confirmed"&&<><button className="confirm" onClick={()=>mutate("/api/admin/bookings.php",{action:"complete",booking_id:booking.id,admin_note:booking.admin_note??""},"Занятие отмечено проведённым")}>Проведено</button><button onClick={()=>mutate("/api/admin/bookings.php",{action:"cancel",booking_id:booking.id,admin_note:booking.admin_note??""},"Заявка отменена")}>Отменить</button></>}</footer></article>)}</div></section>
  </section></main>;
}

