const root = document.documentElement;
const themeButton = document.querySelector("#theme");
const menu = document.querySelector("#menu");
const links = document.querySelector("#site-links");

function updateThemeButton() {
  const dark = getComputedStyle(root).colorScheme === "dark";
  themeButton.setAttribute("aria-pressed", String(dark));
}

try {
  const theme = localStorage.getItem("th");
  if (theme === "light" || theme === "dark") root.dataset.theme = theme;
} catch {}
updateThemeButton();
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateThemeButton);

themeButton.addEventListener("click", () => {
  const theme = themeButton.getAttribute("aria-pressed") === "true" ? "light" : "dark";
  root.dataset.theme = theme;
  updateThemeButton();
  try { localStorage.setItem("th", theme); } catch {}
});

function setMenu(open) {
  menu.setAttribute("aria-expanded", String(open));
  links.classList.toggle("open", open);
}

menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") === "false"));
menu.closest("nav").addEventListener("keydown", event => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menu.focus();
  }
});
links.addEventListener("click", event => {
  if (event.target.closest("a")) setMenu(false);
});
matchMedia("(max-width: 820px)").addEventListener("change", () => setMenu(false));

const filters = [...document.querySelectorAll("[data-f]")];
const projects = [...document.querySelectorAll("[data-cat]")];
const filterStatus = document.querySelector("#filter-status");
filters.forEach(button => button.addEventListener("click", () => {
  filters.forEach(filter => filter.setAttribute("aria-pressed", String(filter === button)));
  projects.forEach(project => {
    project.hidden = button.dataset.f !== "all" && project.dataset.cat !== button.dataset.f;
  });
  const count = projects.filter(project => !project.hidden).length;
  filterStatus.textContent = `${count} ${count === 1 ? "project" : "projects"} shown`;
}));

const canvas = document.querySelector("#net");
if (canvas) {
  const context = canvas.getContext("2d");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let width, height, particles, frame;
  let inView = false;

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.min(64, Math.ceil(width * height / 16000)) }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
    }));
  }

  function draw() {
    const dark = themeButton.getAttribute("aria-pressed") === "true";
    context.clearRect(0, 0, width, height);
    context.fillStyle = dark ? "#38e1ff" : "#0a7fa6";
    context.strokeStyle = dark ? "#9b6bff" : "#6d3df2";
    particles.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;
      context.globalAlpha = .48;
      context.beginPath();
      context.arc(point.x, point.y, 1.5, 0, 2 * Math.PI);
      context.fill();
      for (let next = index + 1; next < particles.length; next++) {
        const other = particles[next];
        const distanceSquared = (point.x - other.x) ** 2 + (point.y - other.y) ** 2;
        if (distanceSquared >= 13000) continue;
        context.globalAlpha = .24 * (1 - distanceSquared / 13000);
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    });
    frame = requestAnimationFrame(draw);
  }

  function syncMotion() {
    cancelAnimationFrame(frame);
    if (inView && !document.hidden && !motion.matches) frame = requestAnimationFrame(draw);
  }

  if (context && "IntersectionObserver" in window && "ResizeObserver" in window) {
    resize();
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncMotion();
    }).observe(canvas);
    document.addEventListener("visibilitychange", syncMotion);
    motion.addEventListener("change", syncMotion);
  }
}

document.querySelector("#print-resume")?.addEventListener("click", () => window.print());
