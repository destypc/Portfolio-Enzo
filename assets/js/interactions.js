/* ======================================================
   interactions.js — Microinterações e componentes vivos
   • Inclinação 3D (tilt) + spotlight discreto nos cards
   • Parallax leve no scroll
   • Carrossel da jornada + slider interativo (clique/drag)
   • Cards de projeto clicáveis com ripple discreto
   Tudo em transform/opacity + requestAnimationFrame para
   manter 60 FPS e respeita "prefers-reduced-motion".
   ====================================================== */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/** Dispositivo com cursor real (evita efeitos inúteis no toque). */
const hasHover = window.matchMedia("(hover: hover)").matches;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/* ── Tilt 3D + spotlight nos cards ───────────────────
   Elementos [data-tilt] inclinam conforme o mouse; os
   que também têm .spotlight recebem o brilho que segue
   o ponteiro (variáveis --mx/--my). */
function initCards() {
  if (!hasHover || prefersReducedMotion) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const max = Number(card.dataset.tiltMax) || 8;
    const hasSpot = card.classList.contains("spotlight");
    let raf = null;

    const move = (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0 → 1
      const py = (e.clientY - rect.top) / rect.height; // 0 → 1

      if (hasSpot) {
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }

      const ry = clamp((px - 0.5) * 2 * max, -max, max);
      const rx = clamp((0.5 - py) * 2 * max, -max, max);

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
    };

    card.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch") return;
      card.style.transition = "transform 0.12s ease-out";
      if (hasSpot) card.classList.add("is-hovering");
    });
    card.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      move(e);
    });
    card.addEventListener("pointerleave", () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transition = "transform 0.5s var(--ease-out)";
      card.style.transform = "";
      if (hasSpot) card.classList.remove("is-hovering");
      const clear = () => {
        card.style.transition = "";
        card.removeEventListener("transitionend", clear);
      };
      card.addEventListener("transitionend", clear);
    });
  });
}

/* ── Parallax discreto (data-parallax="0.05") ───────── */
function initParallax() {
  if (!hasHover || prefersReducedMotion) return;

  const items = [...document.querySelectorAll("[data-parallax]")];
  if (!items.length) return;

  let ticking = false;

  const update = () => {
    const mid = window.innerHeight / 2;
    items.forEach((el) => {
      const speed = Number(el.dataset.parallax) || 0.05;
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - mid) * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
}

/* ── Cards de projeto clicáveis (todo o card) + ripple ─
   O card inteiro leva ao projeto; cliques em links/botões
   internos seguem seu próprio destino. Ripple discreto no
   ponto do clique (transform/opacity apenas). */
function initClickableCards() {
  document.querySelectorAll(".card-project--link").forEach((card) => {
    const href = card.dataset.cardHref;
    if (!href) return;

    card.addEventListener("click", (e) => {
      // Deixa links/botões internos agirem sozinhos.
      if (e.target.closest("a, button")) return;
      spawnRipple(card, e);
      window.open(href, "_blank", "noopener,noreferrer");
    });
  });
}

function spawnRipple(card, e) {
  if (prefersReducedMotion) return;
  const rect = card.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "card-ripple";
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left}px`;
  ripple.style.top = `${e.clientY - rect.top}px`;
  card.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

/* ── Carrossel da jornada + slider interativo ────────
   O trilho rola horizontalmente; a barra inferior é um
   slider real: clique salta, arrasto arrasta, tudo
   sincronizado com o scroll e com a etapa ativa. */
function initJourney() {
  const track = document.getElementById("journeyTrack");
  if (!track) return;

  const prevBtn = document.querySelector('[data-journey="prev"]');
  const nextBtn = document.querySelector('[data-journey="next"]');
  const bar = document.getElementById("journeyBar");
  const fill = document.getElementById("journeyProgress");
  const thumb = document.getElementById("journeyThumb");
  const current = document.getElementById("journeyCurrent");
  const total = document.getElementById("journeyTotal");
  const cards = [...track.querySelectorAll(".journey-card")];

  const pad = (n) => String(n).padStart(2, "0");
  if (total) total.textContent = pad(cards.length);

  /** Distância de um "passo" = largura de um card + o gap. */
  const step = () => {
    const card = cards[0];
    if (!card) return track.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const maxScroll = () => track.scrollWidth - track.clientWidth;

  /** Marca a etapa ativa proporcionalmente ao progresso do trilho:
      começa na 1ª, termina na última e fica sempre entre os cards
      visíveis (mesmo quando vários cabem na tela). */
  const setActiveCard = (ratio) => {
    const index = clamp(Math.round(ratio * (cards.length - 1)), 0, cards.length - 1);
    cards.forEach((card, i) => card.classList.toggle("is-active", i === index));
    if (current) current.textContent = pad(index + 1);
  };

  const sync = () => {
    const max = maxScroll();
    const ratio = max > 0 ? clamp(track.scrollLeft / max, 0, 1) : 0;
    const pct = ratio * 100;

    if (fill) fill.style.width = `${pct}%`;
    if (thumb) thumb.style.left = `${pct}%`;
    if (bar) bar.setAttribute("aria-valuenow", Math.round(pct));
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= max - 2;
    setActiveCard(ratio);
  };

  const scrollByStep = (dir) =>
    track.scrollBy({
      left: dir * step(),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

  prevBtn?.addEventListener("click", () => scrollByStep(-1));
  nextBtn?.addEventListener("click", () => scrollByStep(1));

  /* ── Slider: clique e arrasto na barra ── */
  const seekTo = (clientX, smooth) => {
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    track.scrollTo({
      left: ratio * maxScroll(),
      behavior: smooth && !prefersReducedMotion ? "smooth" : "auto",
    });
  };

  if (bar) {
    let scrubbing = false;

    bar.addEventListener("pointerdown", (e) => {
      scrubbing = true;
      bar.classList.add("is-scrubbing");
      bar.setPointerCapture(e.pointerId);
      seekTo(e.clientX, false);
    });
    bar.addEventListener("pointermove", (e) => {
      if (scrubbing) seekTo(e.clientX, false);
    });
    const endScrub = () => {
      scrubbing = false;
      bar.classList.remove("is-scrubbing");
    };
    bar.addEventListener("pointerup", endScrub);
    bar.addEventListener("pointercancel", endScrub);

    // Acessibilidade: setas do teclado no slider
    bar.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        scrollByStep(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        scrollByStep(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        track.scrollTo({ left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      } else if (e.key === "End") {
        e.preventDefault();
        track.scrollTo({ left: maxScroll(), behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    });
  }

  // Setas do teclado quando o trilho está focado
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByStep(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByStep(-1);
    }
  });

  // Arrastar o próprio trilho com o mouse
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return; // o toque já rola nativamente
    moved = false;
    // Links dos cards (perfil do professor): a captura do ponteiro
    // desviaria o clique para o trilho.
    if (e.target.closest("a")) return;
    dragging = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
    track.classList.add("is-dragging");
  });
  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 4) moved = true;
    track.scrollLeft = startScroll - delta;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
  };
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  // Impede que um arrasto seja interpretado como clique acidental
  track.addEventListener(
    "click",
    (e) => {
      if (moved) e.preventDefault();
    },
    true
  );

  track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
  window.addEventListener("resize", sync);
  sync();
}

export function initInteractions() {
  initCards();
  initParallax();
  initClickableCards();
  initJourney();
}
