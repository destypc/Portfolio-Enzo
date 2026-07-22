/* ======================================================
   main.js — Ponto de entrada
   Orquestra os módulos e cuida do comportamento de UI:
   navbar, menu mobile, scroll suave preciso, voltar ao
   topo, seção ativa, barra de progresso e footer.
   ====================================================== */

import { initTheme } from "./theme.js";
import { initI18n } from "./i18n.js";
import { initAnimations } from "./animations.js";
import { initInteractions } from "./interactions.js";

const navbar = document.getElementById("navbar");

/** Altura real da navbar fixa (inclui borda) — usada como offset. */
const navHeight = () => navbar?.offsetHeight ?? 0;

/** Dispara fn no máx. 1x por frame durante o scroll. */
function onScrollThrottled(fn) {
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn();
        ticking = false;
      });
    },
    { passive: true }
  );
}

/* ── Scroll suave e preciso (corrige offset da navbar) ─── */
function scrollToTarget(target) {
  const top = target.getBoundingClientRect().top + window.scrollY - navHeight();
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      scrollToTarget(target);
      // Atualiza a URL sem provocar novo salto
      history.pushState(null, "", id);
    });
  });
}

/* ── Navbar (sombra) + barra de progresso + voltar ao topo ─ */
function initScrollUI() {
  const progress = document.getElementById("scrollProgress");
  const scrollTop = document.getElementById("scrollTop");

  const update = () => {
    const y = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;

    navbar?.classList.toggle("is-scrolled", y > 8);
    scrollTop?.classList.toggle("is-visible", y > 500);
    if (progress) progress.style.width = `${height > 0 ? (y / height) * 100 : 0}%`;
  };

  update();
  onScrollThrottled(update);

  scrollTop?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
}

/* ── Menu mobile ────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("navMenu");
  if (!hamburger || !nav) return;

  const setOpen = (open) => {
    hamburger.classList.toggle("is-open", open);
    nav.classList.toggle("is-open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };

  hamburger.addEventListener("click", () =>
    setOpen(!nav.classList.contains("is-open"))
  );
  nav
    .querySelectorAll(".nav__link")
    .forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

/* ── Destaque da seção atual (scrollspy) ──────────── */
function initScrollSpy() {
  const links = [...document.querySelectorAll(".nav__link")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      link.toggleAttribute("aria-current", active);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ── Rodapé: ano atual ────────────────────────────── */
function initFooterYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

/* ── Tela de carregamento: some após o load (com tempo mínimo) ─── */
function initPreloader() {
  const el = document.getElementById("preloader");
  const root = document.documentElement;
  if (!el) {
    root.classList.remove("is-loading");
    return;
  }

  const MIN_MS = 600; // evita "piscar" em carregamentos rápidos
  const start = performance.now();
  let hidden = false;

  const hide = () => {
    if (hidden) return;
    hidden = true;
    const wait = Math.max(0, MIN_MS - (performance.now() - start));
    setTimeout(() => {
      el.classList.add("is-done");
      root.classList.remove("is-loading");
      el.addEventListener("transitionend", () => el.remove(), { once: true });
    }, wait);
  };

  if (document.readyState === "complete") {
    hide();
  } else {
    window.addEventListener("load", hide, { once: true });
    // Rede de segurança: nunca deixa o preloader preso.
    setTimeout(hide, 5000);
  }
}

/* ── Bootstrap ────────────────────────────────────── */
function init() {
  initI18n();
  initTheme();
  initAnimations();
  initInteractions();
  initSmoothScroll();
  initScrollUI();
  initMobileMenu();
  initScrollSpy();
  initFooterYear();
  initPreloader();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
