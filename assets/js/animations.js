/* ======================================================
   animations.js — Animações de entrada
   IntersectionObserver para revelar elementos ao rolar
   (fade + translate + blur, com stagger via classes CSS)
   e o efeito de digitação do hero.
   ====================================================== */

import { getRoles } from "./i18n.js";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* ── Revela elementos .reveal ao entrarem na viewport ── */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  // Sem observer (ou sem movimento): mostra tudo direto.
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target); // anima uma vez só
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ── Efeito de digitação no hero ──────────────────── */
function initTyping() {
  const el = document.getElementById("typed");
  if (!el) return;

  // Sem movimento: mostra só o primeiro cargo e reage à troca de idioma.
  if (prefersReducedMotion) {
    const showFirst = () => {
      el.textContent = getRoles()[0] || "";
    };
    showFirst();
    document.addEventListener("languagechange", showFirst);
    return;
  }

  let roles = getRoles();
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let timer = null;

  const loop = () => {
    const current = roles[roleIndex] || "";
    el.textContent = current.slice(0, charIndex);

    if (!deleting && charIndex < current.length) {
      charIndex++;
      timer = setTimeout(loop, 80);
    } else if (deleting && charIndex > 0) {
      charIndex--;
      timer = setTimeout(loop, 40);
    } else {
      deleting = !deleting;
      if (!deleting) roleIndex = (roleIndex + 1) % roles.length;
      timer = setTimeout(loop, deleting ? 1600 : 400);
    }
  };

  // Reinicia a digitação com os cargos do novo idioma.
  document.addEventListener("languagechange", () => {
    clearTimeout(timer);
    roles = getRoles();
    roleIndex = 0;
    charIndex = 0;
    deleting = false;
    loop();
  });

  loop();
}

export function initAnimations() {
  initScrollReveal();
  initTyping();
}
