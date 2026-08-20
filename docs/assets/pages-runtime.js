(() => {
  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  const pricePage = document.querySelector(".price-page");
  if (pricePage) {
    const gradeSelect = pricePage.querySelector("#grade");
    const subjectButtons = [...pricePage.querySelectorAll(".subject-options button")];
    const resultSubject = pricePage.querySelector(".result-subject");
    const resultPrice = pricePage.querySelector(".calculated-price > strong");
    const resultProgram = pricePage.querySelector(".calculated-price dl div:first-child dd");
    const programDescription = pricePage.querySelector(".program-description");
    let subject = "Математика";
    const updatePrice = () => {
      const grade = Number(gradeSelect.value);
      const price = grade <= 4 ? 850 : grade <= 8 ? 1000 : 1200;
      resultSubject.textContent = `${subject} · ${grade} класс`;
      resultPrice.textContent = `${price.toLocaleString("ru-RU")} ₽`;
      resultProgram.textContent = grade === 9 ? "Школьная программа / подготовка к ОГЭ" : "Школьная программа / ВПР";
      programDescription.textContent = grade <= 4
        ? "Заполнение пробелов, помощь с домашними заданиями, интерес к предмету и развитие усидчивости."
        : grade <= 8
          ? "Разбор сложных тем, повышение успеваемости, подготовка к контрольным и ВПР, обучение самопроверке."
          : "Школьная программа или системная подготовка к ОГЭ: разбор тем и заданий и отработка типовых ошибок.";
    };
    gradeSelect?.addEventListener("change", updatePrice);
    subjectButtons.forEach((button) => button.addEventListener("click", () => {
      subjectButtons.forEach((item) => { item.classList.remove("selected"); item.setAttribute("aria-pressed", "false"); });
      button.classList.add("selected"); button.setAttribute("aria-pressed", "true");
      subject = button.querySelector("b")?.textContent || subject; updatePrice();
    }));
  }

  const bookingPage = document.querySelector(".booking-page");
  if (bookingPage) initBooking(bookingPage);

  async function initBooking(page) {
    const dateList = page.querySelector(".date-availability");
    const times = page.querySelector(".times");
    const calendarSide = page.querySelector(".calendar-side");
    const summary = page.querySelector(".choice-summary p");
    const form = page.querySelector(".booking-form");
    const formSide = page.querySelector(".form-side");
    const consent = form?.querySelector('.privacy-check input[type="checkbox"]');
    const submit = form?.querySelector(".form-submit");
    let slots = [];
    let days = [];
    let selectedDay = null;
    let selectedSlot = null;

    const state = document.createElement("div");
    state.className = "schedule-state";
    state.setAttribute("role", "status");
    state.textContent = "Загружаем свободные даты…";
    calendarSide?.querySelector(".schedule-state")?.replaceWith(state);

    const groupSlots = () => {
      const grouped = new Map();
      slots.forEach((slot) => grouped.set(slot.slot_date, [...(grouped.get(slot.slot_date) || []), slot]));
      days = [...grouped.entries()].map(([date, daySlots]) => {
        const value = new Date(`${date}T12:00:00+05:00`);
        return {
          date,
          label: new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(value),
          weekday: new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(value),
          slots: daySlots.sort((a, b) => a.slot_time.localeCompare(b.slot_time)),
        };
      });
    };
    const formatWindowCount = (count) => {
      const lastTwo = count % 100;
      const last = count % 10;
      const word = lastTwo >= 11 && lastTwo <= 14
        ? "окон"
        : last === 1
          ? "окно"
          : last >= 2 && last <= 4
            ? "окна"
            : "окон";
      return `${count} ${word}`;
    };
    const updateSummary = () => {
      if (summary) summary.textContent = selectedDay && selectedSlot
        ? `${selectedDay.weekday}, ${selectedDay.label}, ${selectedSlot.slot_time}`
        : "Сначала выберите свободное окно";
      if (submit) submit.disabled = !consent?.checked || !selectedSlot;
    };
    const renderTimes = () => {
      let heading = page.querySelector(".time-heading");
      if (!heading && times) {
        heading = document.createElement("p"); heading.className = "time-heading"; times.before(heading);
      }
      if (heading) heading.textContent = selectedDay ? `Свободное время · ${selectedDay.label}` : "";
      times?.replaceChildren(...(selectedDay?.slots || []).map((slot) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `time-button${slot.id === selectedSlot?.id ? " selected" : ""}`;
        button.textContent = slot.slot_time;
        button.setAttribute("aria-pressed", String(slot.id === selectedSlot?.id));
        button.addEventListener("click", () => { selectedSlot = slot; renderTimes(); updateSummary(); });
        return button;
      }));
      updateSummary();
    };
    const renderDays = () => {
      dateList?.replaceChildren(...days.map((day, index) => {
        const button = document.createElement("button"); button.type = "button";
        button.className = day.date === selectedDay?.date ? "selected" : "";
        button.setAttribute("aria-pressed", String(day.date === selectedDay?.date));
        button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><b>${escapeHtml(day.weekday)}</b><small>${escapeHtml(day.label)} · ${formatWindowCount(day.slots.length)}</small><i>→</i>`;
        button.addEventListener("click", () => { selectedDay = day; selectedSlot = day.slots[0]; renderDays(); renderTimes(); });
        return button;
      }));
    };

    try {
      const response = await fetch("/api/schedule.php", { headers: { Accept: "application/json" } });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Не удалось загрузить расписание");
      slots = result.slots.map((slot) => ({ id: Number(slot.id), slot_date: String(slot.slot_date), slot_time: String(slot.slot_time) }));
      groupSlots(); selectedDay = days[0] || null; selectedSlot = selectedDay?.slots[0] || null;
      state.textContent = days.length ? "" : "Свободных окон пока нет. Новые даты появятся после обновления расписания.";
      state.hidden = days.length > 0; renderDays(); renderTimes();
    } catch (caught) {
      state.classList.add("form-error"); state.textContent = caught instanceof Error ? caught.message : "Не удалось загрузить расписание";
    }

    consent?.addEventListener("change", updateSummary);
    form?.addEventListener("submit", async (event) => {
      event.preventDefault(); form.querySelector(".form-error")?.remove();
      if (!selectedSlot) return;
      submit.disabled = true; submit.innerHTML = "Отправляем… <span>↗</span>";
      const data = new FormData(form);
      try {
        const response = await fetch("/api/submit.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          slot_id: selectedSlot.id, name: data.get("name"), phone: data.get("phone"), email: data.get("email"),
          grade: data.get("grade"), subject: data.get("subject"), lesson_format: data.get("lesson_format"),
          goal: data.get("goal"), website: data.get("website"), consent: Boolean(consent?.checked),
        }) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) throw new Error(result.message || "Не удалось отправить заявку");
        formSide.innerHTML = '<div class="success-card" role="status"><div class="success-icon">✓</div><h2>Время зарезервировано</h2><p>Заявка принята. Елизавета получила письмо и свяжется с вами для подтверждения занятия.</p><button type="button">Выбрать другое время</button></div>';
        formSide.querySelector("button")?.addEventListener("click", () => location.reload());
      } catch (caught) {
        const error = document.createElement("p"); error.className = "form-error"; error.setAttribute("role", "alert");
        error.textContent = caught instanceof Error ? caught.message : "Не получилось отправить заявку";
        submit.before(error); submit.innerHTML = 'Забронировать окно <span>↗</span>'; updateSummary();
      }
    });
  }

  const adminPage = document.querySelector(".admin-page");
  if (adminPage) initAdmin(adminPage);

  async function initAdmin(page) {
    let csrf = "";
    const request = async (url, options = {}) => {
      const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(csrf ? { "X-CSRF-Token": csrf } : {}), ...(options.headers || {}) } });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Не удалось выполнить действие");
      return result;
    };
    let root = page.querySelector(".admin-shell");
    if (!root) { root = document.createElement("section"); root.className = "admin-shell shell"; page.append(root); }
    const showError = (message) => { const target = root.querySelector(".admin-feedback"); if (target) { target.className = "admin-feedback form-error"; target.textContent = message; } };
    const showMessage = (message) => { const target = root.querySelector(".admin-feedback"); if (target) { target.className = "admin-feedback admin-message"; target.textContent = message; } };

    const renderLogin = (configured) => {
      root.className = "admin-login shell";
      root.innerHTML = `<p class="eyebrow"><span></span> Закрытый раздел</p><div class="admin-login-card"><h1>Вход для Елизаветы</h1>${configured ? "" : '<p class="form-error">Пароль администратора ещё не настроен на сервере.</p>'}<form><label>Логин<input name="username" autocomplete="username" value="elizaveta" required></label><label>Пароль<input type="password" name="password" autocomplete="current-password" required></label><p class="admin-feedback"></p><button class="button button-dark" ${configured ? "" : "disabled"}>Войти</button></form></div>`;
      root.querySelector("form")?.addEventListener("submit", async (event) => {
        event.preventDefault(); const data = new FormData(event.currentTarget);
        try { const result = await request("/api/admin/login.php", { method: "POST", body: JSON.stringify({ username: data.get("username"), password: data.get("password") }) }); csrf = result.csrf_token; await renderDashboard(); }
        catch (caught) { showError(caught instanceof Error ? caught.message : "Не удалось войти"); }
      });
    };

    const renderDashboard = async () => {
      root.className = "admin-shell shell";
      root.innerHTML = `<div class="admin-top"><div><p class="eyebrow"><span></span> Управление записью</p><h1>Расписание и заявки</h1></div><div class="admin-top-actions"><a class="button button-light" href="/api/admin/backup.php">Скачать резервную копию</a><button data-action="logout">Выйти</button></div></div><p class="admin-feedback"></p><div class="admin-grid"><section class="admin-card"><h2>Добавить одно окно</h2><form data-form="single" class="admin-inline-form"><label>Дата<input type="date" name="date" required></label><label>Время<input type="time" name="time" required></label><button class="button button-dark">Добавить</button></form></section><section class="admin-card"><h2>Повторяющееся расписание</h2><form data-form="generate" class="admin-generate-form"><div class="form-row"><label>С даты<input type="date" name="from_date" required></label><label>По дату<input type="date" name="to_date" required></label></div><fieldset><legend>Дни недели</legend>${["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((day,index)=>`<label><input type="checkbox" name="weekdays" value="${index+1}">${day}</label>`).join("")}</fieldset><label>Время через пробел или запятую<input name="times" placeholder="17:00 18:00 19:00" required></label><button class="button button-dark">Создать окна</button></form></section></div><section class="admin-section"><div class="admin-section-head"><h2>Временные окна</h2><span data-count="slots"></span></div><div class="admin-slot-list"></div></section><section class="admin-section"><div class="admin-section-head"><h2>Заявки</h2><span data-count="bookings"></span></div><div class="admin-bookings"></div></section>`;
      root.querySelector('[data-action="logout"]')?.addEventListener("click", async () => { await request("/api/admin/logout.php", { method: "POST", body: "{}" }); location.reload(); });
      root.querySelector('[data-form="single"]')?.addEventListener("submit", async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); await mutateSlots({ action: "create", date: data.get("date"), time: data.get("time") }, "Окно добавлено"); });
      root.querySelector('[data-form="generate"]')?.addEventListener("submit", async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); await mutateSlots({ action: "generate", from_date: data.get("from_date"), to_date: data.get("to_date"), weekdays: data.getAll("weekdays").map(Number), times: String(data.get("times") || "").split(/[,\s]+/).filter(Boolean) }, "Расписание создано"); });
      await loadDashboard();
    };
    const mutateSlots = async (body, success) => { try { await request("/api/admin/slots.php", { method: "POST", body: JSON.stringify(body) }); showMessage(success); await loadDashboard(); } catch (caught) { showError(caught instanceof Error ? caught.message : "Ошибка"); } };
    const mutateBooking = async (body, success) => { try { await request("/api/admin/bookings.php", { method: "POST", body: JSON.stringify(body) }); showMessage(success); await loadDashboard(); } catch (caught) { showError(caught instanceof Error ? caught.message : "Ошибка"); } };
    const loadDashboard = async () => {
      const [slotResult, bookingResult] = await Promise.all([request("/api/admin/slots.php"), request("/api/admin/bookings.php")]);
      root.querySelector('[data-count="slots"]').textContent = slotResult.slots.length;
      root.querySelector('[data-count="bookings"]').textContent = bookingResult.bookings.length;
      const slotList = root.querySelector(".admin-slot-list");
      slotList.innerHTML = slotResult.slots.map((slot) => `<article class="admin-slot status-${escapeHtml(slot.status)}"><div><b>${escapeHtml(slot.slot_date)}</b><strong>${escapeHtml(slot.slot_time)}</strong></div><span>${escapeHtml(({available:"Свободно",blocked:"Закрыто",pending:"Ожидает",booked:"Занято"})[slot.status] || slot.status)}${slot.booking_name ? ` · ${escapeHtml(slot.booking_name)}` : ""}</span>${["available","blocked"].includes(slot.status) ? `<button data-slot="${Number(slot.id)}" data-status="${slot.status === "available" ? "blocked" : "available"}">${slot.status === "available" ? "Закрыть" : "Открыть"}</button>` : ""}</article>`).join("");
      slotList.querySelectorAll("button[data-slot]").forEach((button) => button.addEventListener("click", () => mutateSlots({ action: "set_status", slot_id: Number(button.dataset.slot), status: button.dataset.status }, button.dataset.status === "blocked" ? "Окно закрыто" : "Окно открыто")));
      const bookingList = root.querySelector(".admin-bookings");
      const names = {pending:"Ожидает",confirmed:"Подтверждено",completed:"Проведено",cancelled:"Отменено",rejected:"Отклонено"};
      bookingList.innerHTML = bookingResult.bookings.map((item) => `<article class="admin-booking status-${escapeHtml(item.status)}"><header><div><small>#${Number(item.id)} · ${escapeHtml(names[item.status] || item.status)}</small><h3>${escapeHtml(item.slot_date)}, ${escapeHtml(item.slot_time)}</h3></div><b>${escapeHtml(item.name)}</b></header><div class="admin-booking-details"><p><strong>Связь:</strong> ${escapeHtml([item.phone,item.email].filter(Boolean).join(", "))}</p><p><strong>Ученик:</strong> ${escapeHtml(item.student_grade)}, ${escapeHtml(item.subject)}, ${escapeHtml(item.lesson_format)}</p><p><strong>Запрос:</strong> ${escapeHtml(item.goal)}</p></div><label>Внутренняя заметка<textarea>${escapeHtml(item.admin_note || "")}</textarea></label><footer>${item.status === "pending" ? '<button class="confirm" data-booking-action="confirm">Подтвердить</button><button data-booking-action="reject">Отклонить</button>' : ""}${item.status === "confirmed" ? '<button class="confirm" data-booking-action="complete">Проведено</button><button data-booking-action="cancel">Отменить</button>' : ""}<button data-booking-action="note">Сохранить заметку</button></footer></article>`).join("");
      bookingList.querySelectorAll(".admin-booking").forEach((card, index) => card.querySelectorAll("[data-booking-action]").forEach((button) => button.addEventListener("click", () => mutateBooking({ action: button.dataset.bookingAction, booking_id: Number(bookingResult.bookings[index].id), admin_note: card.querySelector("textarea")?.value || "" }, "Заявка обновлена"))));
    };

    try {
      const session = await request("/api/admin/session.php");
      if (session.authenticated) { csrf = session.csrf_token; await renderDashboard(); } else renderLogin(session.configured);
    } catch (caught) { root.innerHTML = `<p class="form-error">${escapeHtml(caught instanceof Error ? caught.message : "Не удалось открыть админ-панель")}</p>`; }
  }
})();
