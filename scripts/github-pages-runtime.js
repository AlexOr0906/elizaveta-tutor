(() => {
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
      resultProgram.textContent = grade === 9
        ? "Школьная программа / подготовка к ОГЭ"
        : "Школьная программа / ВПР";
      programDescription.textContent = grade <= 4
        ? "Заполнение пробелов, помощь с домашними заданиями, интерес к предмету и развитие усидчивости."
        : grade <= 8
          ? "Разбор сложных тем, повышение успеваемости, подготовка к контрольным и ВПР, обучение самопроверке."
          : "Школьная программа или системная подготовка к ОГЭ: разбор тем и заданий, отработка типовых ошибок и уверенная подготовка к экзамену.";
    };

    gradeSelect.addEventListener("change", updatePrice);
    subjectButtons.forEach((button) => {
      button.addEventListener("click", () => {
        subjectButtons.forEach((item) => {
          item.classList.remove("selected");
          item.setAttribute("aria-pressed", "false");
        });
        button.classList.add("selected");
        button.setAttribute("aria-pressed", "true");
        subject = button.querySelector("b").textContent;
        updatePrice();
      });
    });
  }

  const bookingPage = document.querySelector(".booking-page");
  if (bookingPage) {
    const schedule = [
      { day: "Понедельник", slots: ["17:00", "18:00", "19:00", "20:00", "21:00"] },
      { day: "Вторник", slots: ["17:00", "18:00", "19:00", "20:00", "21:00"] },
      { day: "Среда", slots: ["20:00"] },
      { day: "Четверг", slots: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"] },
      { day: "Пятница", slots: ["09:00"] },
      { day: "Суббота", slots: [] },
      { day: "Воскресенье", slots: [] },
    ];
    const dayButtons = [...bookingPage.querySelectorAll(".availability-list button")];
    const times = bookingPage.querySelector(".times");
    const timeHeading = bookingPage.querySelector(".time-heading");
    const summary = bookingPage.querySelector(".choice-summary p");
    const form = bookingPage.querySelector(".booking-form");
    const formSide = bookingPage.querySelector(".form-side");
    const consent = form?.querySelector('.privacy-check input[type="checkbox"]');
    const submit = form?.querySelector(".form-submit");
    let selectedDay = schedule[0];
    let selectedTime = selectedDay.slots[0];

    const updateSummary = () => {
      summary.textContent = `${selectedDay.day}, ${selectedTime}`;
    };
    const renderTimes = () => {
      timeHeading.textContent = `Свободное время · ${selectedDay.day}`;
      times.replaceChildren(...selectedDay.slots.map((time) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `time-button${time === selectedTime ? " selected" : ""}`;
        button.textContent = time;
        button.setAttribute("aria-pressed", String(time === selectedTime));
        button.addEventListener("click", () => {
          selectedTime = time;
          renderTimes();
          updateSummary();
        });
        return button;
      }));
    };

    dayButtons.forEach((button, index) => {
      if (!schedule[index].slots.length) return;
      button.addEventListener("click", () => {
        dayButtons.forEach((item) => {
          item.classList.remove("selected");
          item.setAttribute("aria-pressed", "false");
        });
        button.classList.add("selected");
        button.setAttribute("aria-pressed", "true");
        selectedDay = schedule[index];
        selectedTime = selectedDay.slots[0];
        renderTimes();
        updateSummary();
      });
    });

    consent?.addEventListener("change", () => { submit.disabled = !consent.checked; });
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      formSide.innerHTML = `<div class="success-card" role="status"><div class="success-icon">✓</div><h2>Форма заполнена</h2><p>Вы выбрали <b>${selectedDay.day}, ${selectedTime}</b>. Елизавета свяжется с вами для подтверждения занятия.</p><button type="button">Изменить данные</button></div>`;
      formSide.querySelector("button")?.addEventListener("click", () => location.reload());
    });
  }
})();
