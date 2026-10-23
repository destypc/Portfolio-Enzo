/* ======================================================
   wave-bg.js — Fundo animado (ondas pontilhadas)
   Usado no hero e no contato: cada .wave-bg da página
   ganha o seu canvas. Um shader WebGL desenha ondas com
   ruído Perlin "ridged" (|ruído| cria os vincos escuros) e
   domain warping (o ruído distorce a si mesmo), derivando
   na diagonal. O resultado é posterizado em 4 tons com
   pontilhado Bayer 8×8 — o visual retrô da referência — e
   recebe uma vinheta radial centrada no elemento em foco
   (a foto no hero, os canais no contato). As ondas se
   apagam perto do cursor. Cores vêm do tema (--bg /
   --text): preto e branco.
   Configuração no HTML de cada .wave-bg:
     data-focus="seletor"   elemento da seção que recebe a luz
     data-focus-lift="0.08" luz um pouco acima dele (fração da altura)
     data-fade-top / data-fade-bottom  dissolve nas bordas (idem)
   Leve por design: 1 pixel do canvas = 1 célula do
   pontilhado (ampliado sem suavizar), ~30 FPS, pausa fora
   da tela/aba e vira um quadro estático com reduced-motion.
   Sem WebGL, o fallback em CSS (style.css) continua ativo.
   ====================================================== */

const root = document.documentElement;

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/** Dispositivo com cursor real (as ondas reagem ao mouse). */
const hasHover = window.matchMedia("(hover: hover)").matches;

const QUALITY = {
  cell: 2.35, // tamanho da célula do pontilhado, em pixels físicos
  maxDpr: 1.5, // telas de alta densidade não precisam de células menores
  maxPixels: 450_000, // teto para monitores enormes (células crescem um pouco)
  fps: 30, // movimento lento: 30 FPS é imperceptível e custa metade
};

/* Intensidade das ondas por tema (fração da cor do texto). No escuro,
   0.42 dá ~40% de cinza: a mesma luminância do roxo da referência. */
const LOOK = {
  dark: { intensity: 0.42 },
  light: { intensity: 0.32 },
};

/* Dissolve padrão nas bordas (fração da altura): só embaixo, como no hero. */
const DEFAULT_FADE = { top: 0, bottom: 0.22 };

/* Cores de segurança caso os tokens não sejam hex. */
const FALLBACK_RGB = {
  dark: { base: [0.024, 0.024, 0.031], ink: [0.96, 0.965, 0.976] },
  light: { base: [0.961, 0.965, 0.98], ink: [0.071, 0.078, 0.106] },
};

/* ── Shaders ──────────────────────────────────────── */

// Triângulo que cobre a tela inteira (mais barato que um quad).
const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uUnit; // pixels do canvas por unidade do ruído (mesma escala em toda seção)
uniform float uTime;
uniform vec2 uFocus;
uniform vec2 uMouse;
uniform vec2 uFade; // dissolve nas bordas: x = base, y = topo
uniform vec3 uBase;
uniform vec3 uInk;
uniform float uIntensity;

// Perlin clássico 2D — Stefan Gustavson (licença MIT)
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 p) {
  vec4 pi = floor(p.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 pf = fract(p.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  pi = mod289(pi);
  vec4 ix = pi.xzxz;
  vec4 iy = pi.yyww;
  vec4 fx = pf.xzxz;
  vec4 fy = pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 f = fade(pf.xy);
  return 2.3 * mix(mix(n00, n10, f.x), mix(n01, n11, f.x), f.y);
}

// fBm "ridged" (|ruído|): os vincos escuros entre as ondas
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * abs(cnoise(p));
    p *= 2.65;
    amplitude *= 0.34;
  }
  return value;
}

// Bayer 8×8 aritmético (WebGL1 não garante índice dinâmico em arrays)
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 point = (gl_FragCoord.xy - 0.5 * uRes) / uUnit;

  // Ondas: o ruído distorce a si mesmo enquanto deriva na diagonal
  vec2 drift = point + vec2(uTime * -0.035, uTime * -0.026);
  float field = fbm(point * 2.2 + fbm(drift * 2.4));

  // Cursor: as ondas se apagam suavemente ao redor do ponteiro
  vec2 mouse = (uMouse - 0.5) * uRes / uUnit;
  field -= (1.0 - smoothstep(0.0, 0.52, distance(point, mouse))) * 0.22;

  // Pontilhado Bayer + posterização em 4 tons (1 pixel = 1 célula)
  float threshold = bayer8(gl_FragCoord.yx) - 0.25;
  float level = floor(clamp(field + threshold * 0.28, 0.0, 1.0) * 3.0 + 0.5) / 3.0;
  vec3 col = mix(uBase, uInk, level * uIntensity);

  // Vinheta radial até o canto mais distante: limpa no foco, escura nas bordas
  vec2 center = uFocus * uRes;
  float g = distance(gl_FragCoord.xy, center) / length(max(center, uRes - center));
  float shade = g < 0.32 ? g / 0.32 * 0.18 : mix(0.18, 0.88, clamp((g - 0.32) / 0.5, 0.0, 1.0));
  col = mix(col, uBase, shade);
  col = mix(uBase, col, 0.8); // camada a 80% sobre o fundo da página

  // Dissolve nas seções vizinhas (max: smoothstep com bordas iguais é indefinido)
  vec2 fade = max(uFade, 0.0001);
  float alpha = smoothstep(0.0, fade.x, uv.y) * (1.0 - smoothstep(1.0 - fade.y, 1.0, uv.y));
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

const UNIFORMS = [
  "uRes", "uUnit", "uTime", "uFocus", "uMouse", "uFade", "uBase", "uInk", "uIntensity",
];

/* ── Helpers WebGL ────────────────────────────────── */
function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.warn("[wave-bg]", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPos");
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.warn("[wave-bg]", gl.getProgramInfoLog(program));
  return null;
}

/** Centro de el dentro do fundo em 0–1 [x, y], origem embaixo.
    Usa offsets (ignoram transforms) para não pegar animações de entrada/tilt. */
function centerWithin(host, el) {
  let x = 0;
  let y = 0;
  for (let node = el; node && node !== host.offsetParent; node = node.offsetParent) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  const w = host.clientWidth || 1;
  const h = host.clientHeight || 1;
  return [(x + el.offsetWidth / 2) / w, 1 - (y + el.offsetHeight / 2) / h];
}

/** "#rgb" / "#rrggbb" → [r, g, b] em 0–1 (null se não reconhecer). */
function hexToRgb(value) {
  let hex = value.trim().replace("#", "");
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  const n = parseInt(hex, 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* ── Inicialização ────────────────────────────────── */
/** Liga um .wave-bg: canvas próprio, loop, tema, foco e mouse. */
function initWave(host) {
  const canvas = host.querySelector(".wave-bg__canvas");
  if (!canvas) return;

  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return; // sem WebGL: fica o fallback CSS

  // Sem highp no fragment shader o ruído serrilha: melhor o fallback.
  const highp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  if (!highp || highp.precision === 0) return;

  // Configuração do HTML (ver o cabeçalho do arquivo)
  const { focus: focusSelector, focusLift, fadeTop, fadeBottom } = host.dataset;
  const target = focusSelector ? host.parentElement?.querySelector(focusSelector) : null;
  const lift = Number(focusLift) || 0;
  const fade = [
    Number(fadeBottom ?? DEFAULT_FADE.bottom),
    Number(fadeTop ?? DEFAULT_FADE.top),
  ];

  let u = null; // locations dos uniforms
  let time = 0;
  const focus = [0.5, 0.5]; // recalculado pela posição do alvo
  const mouse = [...focus];
  const pointer = { x: 0, y: 0, moved: false };

  const draw = () => {
    if (!u || gl.isContextLost()) return;
    gl.uniform1f(u.uTime, time);
    gl.uniform2f(u.uMouse, mouse[0], mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /* Cores e intensidade do tema atual. */
  const applyTheme = () => {
    if (!u) return;
    const theme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const styles = getComputedStyle(root);
    const base = hexToRgb(styles.getPropertyValue("--bg")) ?? FALLBACK_RGB[theme].base;
    const ink = hexToRgb(styles.getPropertyValue("--text")) ?? FALLBACK_RGB[theme].ink;
    gl.uniform3fv(u.uBase, base);
    gl.uniform3fv(u.uInk, ink);
    gl.uniform1f(u.uIntensity, LOOK[theme].intensity);
  };

  /* Foco da luz: centro do alvo, deslocado para cima por data-focus-lift
     (no hero, a foto: direita no desktop, topo no mobile). */
  const measure = () => {
    if (!u) return;
    if (target) {
      const [x, y] = centerWithin(host, target);
      focus[0] = x;
      focus[1] = Math.min(y + lift, 1);
    }
    gl.uniform2f(u.uFocus, focus[0], focus[1]);
    // Sem mouse ainda: as ondas se apagam no foco, como na referência.
    if (!pointer.moved) [mouse[0], mouse[1]] = focus;
  };

  /* Buffer com 1 pixel por célula do pontilhado (com teto). */
  const resize = () => {
    if (!u) return;
    const w = host.clientWidth;
    const h = host.clientHeight;
    let scale = Math.min(window.devicePixelRatio || 1, QUALITY.maxDpr) / QUALITY.cell;
    if (w * h * scale * scale > QUALITY.maxPixels) {
      scale = Math.sqrt(QUALITY.maxPixels / (w * h));
    }
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    // Seções mais baixas que a tela medem o ruído pela altura da tela:
    // as ondas ficam do mesmo tamanho das do hero.
    gl.uniform1f(u.uUnit, Math.max(h, root.clientHeight) * scale);
    measure();
    draw(); // redimensionar limpa o canvas
  };

  /** (Re)cria programa e geometria — também após perda de contexto. */
  const setup = () => {
    const program = createProgram(gl);
    if (!program) return false;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    u = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)]));
    gl.uniform2fv(u.uFade, fade);
    applyTheme();
    resize();
    host.classList.add("is-webgl");
    return true;
  };

  if (!setup()) return;

  /* Mouse: segue o ponteiro com suavização (independe do FPS). */
  const followPointer = (dt) => {
    if (!pointer.moved) return;
    const rect = host.getBoundingClientRect();
    const x = (pointer.x - rect.left) / rect.width;
    const y = 1 - (pointer.y - rect.top) / rect.height;
    const k = Math.min(1, dt * 4);
    mouse[0] += (x - mouse[0]) * k;
    mouse[1] += (y - mouse[1]) * k;
  };

  /* ── Loop (limitado a QUALITY.fps) ── */
  const interval = 1000 / QUALITY.fps;
  let raf = 0;
  let last = 0;
  let running = false;

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const elapsed = now - last;
    if (elapsed < interval - 2) return;
    last = now;
    // Pausa durante a revelação do tema (theme.js) para não competir com ela.
    if (root.classList.contains("theme-switching")) return;

    const dt = Math.min(elapsed / 1000, 0.1); // sem saltos ao voltar de uma pausa
    time += dt;
    followPointer(dt);
    draw();
  };

  const start = () => {
    if (running || prefersReducedMotion) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  // Só anima com a seção visível e a aba ativa.
  let inView = true;
  const sync = () => (inView && !document.hidden ? start() : stop());

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  }).observe(host);
  document.addEventListener("visibilitychange", sync);

  new ResizeObserver(resize).observe(host);

  // Outro idioma pode mudar a altura do texto (e a posição do alvo).
  document.addEventListener("languagechange", () => {
    measure();
    draw();
  });

  // Troca de tema: novas cores na hora (inclusive com o loop pausado).
  new MutationObserver(() => {
    applyTheme();
    draw();
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  if (hasHover && !prefersReducedMotion) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.moved = true;
      },
      { passive: true }
    );
  }

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault(); // permite restaurar
    stop();
    u = null;
    host.classList.remove("is-webgl");
  });
  canvas.addEventListener("webglcontextrestored", () => {
    if (setup()) sync();
  });

  sync();
}

export function initWaveBackgrounds() {
  document.querySelectorAll(".wave-bg").forEach(initWave);
}
