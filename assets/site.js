(function () {
  const box = document.querySelector("#lightbox");
  if (!box) return;
  const img = box.querySelector("img");
  const cap = box.querySelector(".lb-cap");
  const count = box.querySelector(".lb-count");
  let items = [];
  let index = 0;

  function show(next) {
    if (!items.length) return;
    index = (next + items.length) % items.length;
    const item = items[index];
    img.src = item.src;
    img.alt = item.cap;
    cap.textContent = item.cap;
    count.textContent = (index + 1) + " / " + items.length;
  }

  function open(buttons, start) {
    items = buttons.map((button) => ({
      src: button.dataset.src,
      cap: button.dataset.cap || ""
    }));
    box.hidden = false;
    document.body.classList.add("lock");
    show(start);
  }

  function close() {
    box.hidden = true;
    document.body.classList.remove("lock");
    img.removeAttribute("src");
  }

  document.addEventListener("click", (event) => {
    const shot = event.target.closest(".shot");
    if (shot && !shot.classList.contains("broken")) {
      const grid = shot.closest(".year-grid");
      const buttons = [...grid.querySelectorAll(".shot:not(.broken)")];
      open(buttons, buttons.indexOf(shot));
      return;
    }
    if (event.target.closest("[data-lb='close']") || event.target === box) close();
    if (event.target.closest("[data-lb='next']")) show(index + 1);
    if (event.target.closest("[data-lb='prev']")) show(index - 1);
  });

  document.addEventListener("keydown", (event) => {
    if (box.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowRight") show(index + 1);
    if (event.key === "ArrowLeft") show(index - 1);
  });

  let startX = null;
  box.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
  }, { passive: true });
  box.addEventListener("touchend", (event) => {
    if (startX == null) return;
    const delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 40) show(delta < 0 ? index + 1 : index - 1);
    startX = null;
  }, { passive: true });

  document.querySelectorAll(".shot img").forEach((image) => {
    image.addEventListener("error", () => {
      image.closest(".shot").classList.add("broken");
    });
  });
})();

(function () {
  const form = document.querySelector("#calc");
  if (!form) return;
  const out = document.querySelector("#calc-out");
  const cars = JSON.parse(document.querySelector("#calc-data").textContent);
  const select = form.querySelector("[name=car]");
  select.innerHTML = cars.map((car) => `<option value="${car.id}">${car.name} · ${car.tank} л</option>`).join("");
  select.value = "caravelle";

  function money(n) { return Math.round(n).toLocaleString("ru-RU"); }

  function run() {
    const car = cars.find((item) => item.id === select.value);
    const km = Number(form.km.value) || 0;
    const trips = Number(form.trips.value) || 0;
    const city = Number(form.city.value) || 0;
    const idle = Number(form.idle.value) || 0;
    const l100 = Number(form.l100.value) || car.use;
    const by = Number(form.by.value) || 0;
    const pl = Number(form.pl.value) || 0;
    const liters = ((km * 2 * trips + city) / 100) * l100 + idle;
    const polish = Math.max(0, liters - car.tank);
    const home = Math.min(liters, car.tank);
    const cost = home * by + polish * pl;
    const saved = liters * pl - cost;
    const fit = polish === 0
      ? "Бак закрывает этот день заправкой в Гродно."
      : "Не хватает " + Math.round(polish) + " л. Их придётся купить в Польше.";
    out.innerHTML = `
      <div class="stat"><b>${Math.round(liters)} л</b><span>уйдёт за такой день</span></div>
      <div class="stat"><b>${car.tank} л</b><span>бак</span></div>
      <div class="stat"><b>${money(cost)} Br</b><span>если бак залит дома</span></div>
      <div class="stat"><b>${money(saved)} Br</b><span>дешевле, чем вся Польша</span></div>
      <p class="note" style="grid-column:1/-1;margin:0">${fit}</p>`;
  }

  form.addEventListener("input", run);
  select.addEventListener("change", () => {
    const car = cars.find((item) => item.id === select.value);
    form.l100.value = car.use;
    run();
  });
  run();
})();
