/* ======================================================
   theme.js — Tema (claro/escuro) e cor de destaque
   A troca de tema nasce no botão e revela o novo tema com
   um círculo que cresce (View Transitions API). Sem suporte,
   um fallback anima um círculo equivalente via Web Animations.
   Persistência via LocalStorage.
   ====================================================== */

const STORAGE = { theme: "theme", accent: "accent" };
const root = document.documentElement;

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/** Cor de fundo de cada tema (para o círculo do fallback e a meta). */
const THEME_BG = { dark: "#060608", light: "#f5f6fa" };

/* Revelação premium: rápida, mas com desaceleração suave (easeOutQuint). */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const REVEAL_MS = 420;

/** Salva um valor ignorando erros de armazenamento indisponível. */
const save = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignora */
  }
};

/* ── Aparência: aplica atributo + persiste + atualiza UI ── */
function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  save(STORAGE.theme, theme);
  updateThemeIcon(theme);
  updateMetaColor(theme);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector("#themeBtn i");
  if (!icon) return;
  const dark = theme === "dark";
  icon.classList.toggle("fa-moon", dark);
  icon.classList.toggle("fa-sun", !dark);
}

function updateMetaColor(theme) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_BG[theme] || THEME_BG.dark);
}

/* ── Troca de tema com revelação circular a partir do (x, y) ── */
function toggleTheme(x, y) {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

  // Sem animação: aplica direto (respeita reduced-motion).
  if (prefersReducedMotion) {
    setTheme(next);
    return;
  }

  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // Caminho ideal: View Transitions API anima o novo tema crescendo.
  if (document.startViewTransition) {
    const transition = document.startViewTransition(() => setTheme(next));
    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: REVEAL_MS,
          easing: EASE,
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
    return;
  }

  // Fallback: um disco com a cor do novo tema cresce e revela a troca.
  rippleFallback(next, x, y, endRadius);
}

function rippleFallback(next, x, y, endRadius) {
  const ripple = document.createElement("div");
  ripple.className = "theme-ripple";
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = ripple.style.height = `${endRadius * 2}px`;
  ripple.style.background = THEME_BG[next];
  document.body.appendChild(ripple);

  const anim = ripple.animate(
    [
      { transform: "translate(-50%, -50%) scale(0)" },
      { transform: "translate(-50%, -50%) scale(1)" },
    ],
    { duration: REVEAL_MS, easing: EASE }
  );

  anim.onfinish = () => {
    setTheme(next); // aplica sob o disco, então remove revelando o tema
    requestAnimationFrame(() => ripple.remove());
  };
}

/* ── Cor de destaque ────────────────────────────── */
function applyAccent(accent) {
  root.setAttribute("data-accent", accent);
  save(STORAGE.accent, accent);
  markActiveSwatch(accent);
}

function markActiveSwatch(accent) {
  document.querySelectorAll(".swatch").forEach((sw) => {
    sw.classList.toggle("is-active", sw.dataset.accent === accent);
  });
}

/* ── Inicialização + eventos ────────────────────── */
export function initTheme() {
  const currentTheme = root.getAttribute("data-theme") || "dark";
  const currentAccent = root.getAttribute("data-accent") || "mono";
  updateThemeIcon(currentTheme);
  updateMetaColor(currentTheme);
  markActiveSwatch(currentAccent);

  document.getElementById("themeBtn")?.addEventListener("click", (e) => {
    // Coordenadas do clique (ou centro do botão em navegação por teclado)
    const btn = e.currentTarget;
    let x = e.clientX;
    let y = e.clientY;
    if (!x && !y) {
      const rect = btn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    toggleTheme(x, y);
  });

  document.querySelectorAll(".swatch").forEach((sw) => {
    sw.addEventListener("click", () => applyAccent(sw.dataset.accent));
  });

  initColorPopover();
}

/* Popover de cores: abre/fecha e fecha ao clicar fora ou com Esc. */
function initColorPopover() {
  const wrap = document.querySelector(".color-switch");
  const btn = document.getElementById("paletteBtn");
  if (!wrap || !btn) return;

  const close = () => {
    wrap.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = wrap.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}
