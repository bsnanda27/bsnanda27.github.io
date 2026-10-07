const root = document.documentElement;
const year = document.getElementById("year");
const clock = document.getElementById("clock");
const themeToggle = document.getElementById("theme-toggle");
const menuToggle = document.getElementById("menu-toggle");
const navigation = document.getElementById("primary-nav");
const chipToggle = document.getElementById("chip-toggle");

if (year) year.textContent = String(new Date().getFullYear());

function updateClock() {
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}
updateClock();
window.setInterval(updateClock, 60000);

themeToggle?.addEventListener("click", () => {
  const isDark = root.dataset.theme !== "dark";
  root.dataset.theme = isDark ? "dark" : "light";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
  themeToggle.textContent = isDark ? "☼" : "◐";
});

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  navigation?.classList.toggle("is-open", open);
});
navigation?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navigation.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
  });
});

const chipHint = document.getElementById("chip-hint");
const chipState = document.getElementById("chip-state");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let chipExpanded = false;
let chipFrame = 0;
const layerButtons = Array.from(document.querySelectorAll("[data-layer]"));
const layerDescription = document.getElementById("chip-description");
let selectedLayer = "";
const layerCopy = {
  die: "Silicon — where transistors form logic and memory.",
  routing: "Routing — connections carry signals between structures.",
  package: "Package — support and connections to the outside world."
};
layerButtons.forEach(button => button.addEventListener("click", () => {
  selectedLayer = button.dataset.layer;
  chipExpanded = true;
  renderChip();
}));
function renderChip() {
  if (!chipExpanded) selectedLayer = "";
  if (chipToggle) chipToggle.dataset.layer = selectedLayer;
  layerButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.layer === selectedLayer)));
  if (layerDescription) layerDescription.textContent = layerCopy[selectedLayer] || (chipExpanded ? "Three connected layers. Select one to explore." : "A small structure. A connected system.");
  chipToggle?.classList.toggle("is-expanded", chipExpanded);
  chipToggle?.setAttribute("aria-pressed", String(chipExpanded));
  chipToggle?.setAttribute("aria-label", chipExpanded ? "Assemble the chip layers" : "Expand the chip layers");
  if (chipHint) chipHint.textContent = chipExpanded ? "Bring it together" : "Explore the layers";
  if (chipState) chipState.textContent = chipExpanded ? "EXPLODED VIEW / 02" : "ASSEMBLED / 01";
}
function resetChipTilt() {
  cancelAnimationFrame(chipFrame);
  chipToggle?.style.setProperty("--scene-x", "0deg");
  chipToggle?.style.setProperty("--scene-y", "0deg");
}
chipToggle?.addEventListener("click", () => { chipExpanded = !chipExpanded; renderChip(); });
chipToggle?.addEventListener("keydown", event => {
  if (event.key === "Escape") { chipExpanded = false; resetChipTilt(); renderChip(); }
});
chipToggle?.addEventListener("pointerleave", resetChipTilt);
chipToggle?.addEventListener("blur", resetChipTilt);
chipToggle?.addEventListener("pointermove", event => {
  if (event.pointerType !== "mouse" || motionPreference.matches) return;
  cancelAnimationFrame(chipFrame);
  chipFrame = requestAnimationFrame(() => {
    const bounds = chipToggle.getBoundingClientRect();
    const x = Math.max(-.5, Math.min(.5, (event.clientX - bounds.left) / bounds.width - .5));
    const y = Math.max(-.5, Math.min(.5, (event.clientY - bounds.top) / bounds.height - .5));
    chipToggle.style.setProperty("--scene-x", (-y * 5).toFixed(2) + "deg");
    chipToggle.style.setProperty("--scene-y", (x * 5).toFixed(2) + "deg");
  });
});
motionPreference.addEventListener("change", resetChipTilt);
renderChip();

const dialogs = Array.from(document.querySelectorAll(".project-dialog"));
const canShowDialog = typeof HTMLDialogElement !== "undefined"
  && typeof HTMLDialogElement.prototype.showModal === "function";
if (canShowDialog) {
  root.classList.add("has-dialogs");
  dialogs.forEach(dialog => dialog.removeAttribute("open"));
  const triggers = new Map();
  document.querySelectorAll("[data-dialog]").forEach(trigger => {
    trigger.addEventListener("click", () => {
      const dialog = document.getElementById(trigger.dataset.dialog);
      if (!dialog || dialog.open) return;
      triggers.set(dialog, trigger);
      dialog.showModal();
      dialog.querySelector("h2")?.focus({ preventScroll: true });
    });
  });
  dialogs.forEach(dialog => {
    dialog.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener("close", () => triggers.get(dialog)?.focus({ preventScroll: true }));
  });
}

document.querySelectorAll("[data-project-card]").forEach(card => {
  card.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") card.classList.add("is-active");
  });
  card.addEventListener("pointerleave", () => card.classList.remove("is-active"));
  card.addEventListener("focusin", () => card.classList.add("is-active"));
  card.addEventListener("focusout", event => {
    if (!card.contains(event.relatedTarget)) card.classList.remove("is-active");
  });
});

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  root.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(item => revealObserver.observe(item));

  const navLinks = Array.from(document.querySelectorAll(".primary-nav a"));
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-18% 0px -68% 0px" });
  document.querySelectorAll("main section[id]").forEach(section => sectionObserver.observe(section));
}
