/* ======================================================
   i18n.js — Troca de idioma (PT / EN / ES)
   Aplica as traduções em qualquer elemento marcado com
   data-i18n (texto), data-i18n-html (HTML), data-i18n-tooltip
   e data-i18n-aria. Persiste a escolha no LocalStorage e
   dispara o evento "languagechange" para módulos que
   dependem do idioma (ex.: o efeito de digitação do hero).
   ====================================================== */

const STORAGE_KEY = "lang";
const root = document.documentElement;

/** Idiomas suportados e o valor correspondente do atributo lang. */
const LOCALES = { pt: "pt-BR", en: "en", es: "es" };
const DEFAULT_LANG = "pt";

/* ── Dicionário de traduções ─────────────────────── */
export const translations = {
  /* -------------------------------------------------- PT */
  pt: {
    "meta.title": "Enzo Nascimento — Desenvolvedor Web Front-End & Back-End",

    "skip": "Pular para o conteúdo",
    "preloader.aria": "Carregando",

    "nav.home": "Início",
    "nav.about": "Sobre",
    "nav.journey": "Jornada",
    "nav.projects": "Projetos",
    "nav.skills": "Skills",
    "nav.contact": "Contato",

    "tt.color": "Cor principal",
    "tt.theme": "Tema claro/escuro",
    "tt.lang": "Idioma",
    "aria.color": "Escolher cor principal",
    "aria.theme": "Alternar tema claro e escuro",
    "aria.lang": "Escolher idioma",
    "color.title": "Cor de destaque",
    "lang.title": "Idioma",

    // Hero
    "hero.title": 'Olá, sou <span class="hero__name">Enzo</span>',
    "hero.desc":
      "Desenvolvedor web júnior de 15 anos apaixonado por transformar ideias em experiências digitais. Construo interfaces limpas e responsivas — uma linha de código por vez.",
    "hero.btnProjects": "Ver Projetos",
    "hero.btnContact": "Contato",
    "hero.photoAlt": "Retrato de Enzo Nascimento",
    "hero.scrollCue": "Rolar para a próxima seção",
    "roles": [
      "Front-End Developer",
      "Web Developer",
      "PHP Developer",
      "Full Stack em evolução",
    ],

    // Sobre
    "about.eyebrow": "Sobre mim",
    "about.title": 'Iniciante em dev &amp; <span>cheio de vontade</span>',
    "about.photoAlt": "Enzo programando no computador",
    "about.badge": "anos de<br />idade",
    "about.p1":
      "Comecei a programar quando entrei como <strong>Jovem Aprendiz</strong> na área de T.I. da <strong>Gazin Tech</strong>. Foi lá que descobri que gostava mesmo disso — e desde então não parei mais de aprender.",
    "about.p2":
      "Hoje divido meu tempo entre estudar, praticar e construir projetos reais. Cada linha de código é uma chance de melhorar um pouco mais.",
    "about.quote":
      "“Programar é a arte de resolver problemas — e eu curto cada <strong>desafio</strong>.”",
    "about.card1t": "Paraná",
    "about.card1s": "Brasil",
    "about.card2t": "Jovem Aprendiz",
    "about.card2s": "Área de T.I.",
    "about.card3t": "Gazin Tech",
    "about.card3s": "Onde tudo começou",
    "about.card4t": "Dev Web",
    "about.card4s": "Front &amp; Back",

    // Jornada
    "journey.eyebrow": "Evolução",
    "journey.title": "Minha <span>jornada</span>",
    "journey.subtitle":
      "A trilha que venho seguindo como desenvolvedor — do primeiro <code>&lt;html&gt;</code> até os projetos que construo hoje. Arraste para o lado para explorar.",
    "journey.prev": "Etapa anterior",
    "journey.next": "Próxima etapa",
    "j1t": "Entrei na Gazin",
    "j1d": "Entrei como jovem aprendiz na Gazin Tech.",
    "j2t": "O início",
    "j2d": "Dei os primeiros passos no mundo da programação.",
    "j3t": "Comecei com HTML",
    "j3d": "Aprendi a estruturar páginas com HTML semântico.",
    "j4t": "Aprendi CSS",
    "j4d": "Comecei a estilizar e a deixar tudo responsivo.",
    "j5t": "JavaScript",
    "j5d": "Dei vida às páginas com interatividade e lógica.",
    "j6t": "Bootstrap",
    "j6d": "Agilizei layouts com um framework CSS consagrado.",
    "j7t": "Tailwind CSS",
    "j7d": "Adotei o utility-first para estilizar mais rápido.",
    "j8t": "PHP",
    "j8d": "Comecei no back-end e na lógica do lado servidor.",
    "j9t": "SQL",
    "j9d": "Aprendi a modelar e consultar bancos de dados.",
    "j10t": "Primeiro CRUD",
    "j10d": "Uni PHP e SQL para criar, ler, editar e excluir dados.",
    "j11t": "React",
    "j11d": "Passei a criar interfaces com componentes reutilizáveis.",
    "j12t": "Laravel",
    "j12d": "Evoluí no back-end com um framework PHP robusto.",
    "j13t": "Docker",
    "j13d": "Aprendi a containerizar aplicações e padronizar ambientes.",
    "j14year": "Hoje",
    "j14t": "Continuo evoluindo",
    "j14d": "Estudando e construindo novos projetos todos os dias.",

    // Projetos
    "projects.eyebrow": "Portfólio",
    "projects.title": "Meus <span>projetos</span>",
    "projects.subtitle":
      "Cada projeto abaixo me ensinou algo novo e me ajudou a evoluir um pouco mais como desenvolvedor.",
    "status.done": "Concluído",
    "status.dev": "Em desenvolvimento",
    "proj.time.desc":
      "Global-Time é uma aplicação web para consultar horários, utilizar cronômetro e temporizador, com uma interface moderna, responsiva e intuitiva.",
    "proj.max.desc":
      "Sistema de vendas com CRUD completo: cadastro de produtos, categorias e um painel administrativo em PHP e SQL.",
    "proj.soon.name": "Novo projeto chegando…",
    "proj.soon.desc":
      "Estou construindo algo novo agora mesmo. Em breve mais um projeto aparece por aqui — fica de olho! 🚀",
    "tag.soon": "Em breve",
    "btn.viewProject": "Ver Projeto",
    "btn.soon": "Em breve",

    // Skills
    "skills.eyebrow": "Habilidades",
    "skills.title": "Minhas <span>tecnologias</span>",
    "skills.subtitle":
      "Organizadas pelo papel que cada uma cumpre no meu trabalho — com destaque para as que já usei em projetos publicados.",
    "skills.coreT": "Stack principal",
    "skills.coreS": "Tecnologias que já usei nos projetos publicados.",
    "skills.coreLink": "Ver projetos",
    "skills.langsT": "Linguagens",
    "skills.langsS": "A base de tudo que construo",
    "skills.feT": "Front-end",
    "skills.feS": "Interfaces e estilização",
    "skills.beT": "Back-end",
    "skills.beS": "Lógica do lado do servidor",
    "skills.dbT": "Banco de dados",
    "skills.dbS": "Onde os dados vivem",
    "skills.toolsT": "Ferramentas",
    "skills.toolsS": "Meu dia a dia de trabalho",

    // Contato
    "contact.eyebrow": "Contato",
    "contact.title": "Vamos <span>conversar</span>",
    "contact.subtitle":
      "Quer falar comigo? Escolha o canal que preferir — costumo responder bem rápido!",
    "contact.location": "Paraná, Brasil",
    "contact.waDesc": "Conversa rápida e direta",
    "contact.ghDesc": "Código dos meus projetos",
    "contact.mailDesc": "Propostas e oportunidades",
    "contact.waCta": "Chamar agora",
    "contact.ghCta": "Ver perfil",
    "contact.mailCta": "Enviar e-mail",

    // Footer
    "footer.copy": "Todos os direitos reservados.",
  },

  /* -------------------------------------------------- EN */
  en: {
    "meta.title": "Enzo Nascimento — Front-End & Back-End Web Developer",

    "skip": "Skip to content",
    "preloader.aria": "Loading",

    "nav.home": "Home",
    "nav.about": "About",
    "nav.journey": "Journey",
    "nav.projects": "Projects",
    "nav.skills": "Skills",
    "nav.contact": "Contact",

    "tt.color": "Accent color",
    "tt.theme": "Light/dark theme",
    "tt.lang": "Language",
    "aria.color": "Choose accent color",
    "aria.theme": "Toggle light and dark theme",
    "aria.lang": "Choose language",
    "color.title": "Accent color",
    "lang.title": "Language",

    // Hero
    "hero.title": "Hi, I'm <span class=\"hero__name\">Enzo</span>",
    "hero.desc":
      "A 15-year-old junior web developer passionate about turning ideas into digital experiences. I build clean, responsive interfaces — one line of code at a time.",
    "hero.btnProjects": "View Projects",
    "hero.btnContact": "Contact",
    "hero.photoAlt": "Portrait of Enzo Nascimento",
    "hero.scrollCue": "Scroll to the next section",
    "roles": [
      "Front-End Developer",
      "Web Developer",
      "PHP Developer",
      "Full Stack in progress",
    ],

    // About
    "about.eyebrow": "About me",
    "about.title": "New to dev &amp; <span>full of drive</span>",
    "about.photoAlt": "Enzo coding at the computer",
    "about.badge": "years<br />old",
    "about.p1":
      "I started coding when I joined the IT team at <strong>Gazin Tech</strong> as a <strong>Young Apprentice</strong>. That's where I found out I really enjoyed it — and I haven't stopped learning since.",
    "about.p2":
      "Today I split my time between studying, practicing and building real projects. Every line of code is a chance to get a little bit better.",
    "about.quote":
      "“Programming is the art of solving problems — and I enjoy every <strong>challenge</strong>.”",
    "about.card1t": "Paraná",
    "about.card1s": "Brazil",
    "about.card2t": "Young Apprentice",
    "about.card2s": "IT department",
    "about.card3t": "Gazin Tech",
    "about.card3s": "Where it all began",
    "about.card4t": "Web Dev",
    "about.card4s": "Front &amp; Back",

    // Journey
    "journey.eyebrow": "Evolution",
    "journey.title": "My <span>journey</span>",
    "journey.subtitle":
      "The path I've been following as a developer — from my first <code>&lt;html&gt;</code> to the projects I build today. Drag sideways to explore.",
    "journey.prev": "Previous step",
    "journey.next": "Next step",
    "j1t": "Joined Gazin",
    "j1d": "Joined Gazin Tech as a young apprentice.",
    "j2t": "The beginning",
    "j2d": "Took my first steps into the world of programming.",
    "j3t": "Started with HTML",
    "j3d": "Learned to structure pages with semantic HTML.",
    "j4t": "Learned CSS",
    "j4d": "Started styling and making everything responsive.",
    "j5t": "JavaScript",
    "j5d": "Brought pages to life with interactivity and logic.",
    "j6t": "Bootstrap",
    "j6d": "Sped up layouts with a well-established CSS framework.",
    "j7t": "Tailwind CSS",
    "j7d": "Adopted utility-first to style faster.",
    "j8t": "PHP",
    "j8d": "Got into the back-end and server-side logic.",
    "j9t": "SQL",
    "j9d": "Learned to model and query databases.",
    "j10t": "First CRUD",
    "j10d": "Combined PHP and SQL to create, read, update and delete data.",
    "j11t": "React",
    "j11d": "Started building interfaces with reusable components.",
    "j12t": "Laravel",
    "j12d": "Leveled up on the back-end with a robust PHP framework.",
    "j13t": "Docker",
    "j13d": "Learned to containerize apps and standardize environments.",
    "j14year": "Today",
    "j14t": "Still evolving",
    "j14d": "Studying and building new projects every single day.",

    // Projects
    "projects.eyebrow": "Portfolio",
    "projects.title": "My <span>projects</span>",
    "projects.subtitle":
      "Each project below taught me something new and helped me grow a little more as a developer.",
    "status.done": "Completed",
    "status.dev": "In development",
    "proj.time.desc":
      "Global-Time is a web app to check the time and use a stopwatch and timer, with a modern, responsive and intuitive interface.",
    "proj.max.desc":
      "Sales system with a full CRUD: product and category management plus an admin dashboard in PHP and SQL.",
    "proj.soon.name": "New project coming soon…",
    "proj.soon.desc":
      "I'm building something new right now. Another project will show up here soon — stay tuned! 🚀",
    "tag.soon": "Soon",
    "btn.viewProject": "View Project",
    "btn.soon": "Soon",

    // Skills
    "skills.eyebrow": "Skills",
    "skills.title": "My <span>technologies</span>",
    "skills.subtitle":
      "Organized by the role each one plays in my work — highlighting the ones I've already used in published projects.",
    "skills.coreT": "Core stack",
    "skills.coreS": "Technologies I've used in my published projects.",
    "skills.coreLink": "See projects",
    "skills.langsT": "Languages",
    "skills.langsS": "The foundation of everything I build",
    "skills.feT": "Front-end",
    "skills.feS": "Interfaces and styling",
    "skills.beT": "Back-end",
    "skills.beS": "Server-side logic",
    "skills.dbT": "Databases",
    "skills.dbS": "Where the data lives",
    "skills.toolsT": "Tools",
    "skills.toolsS": "My everyday workflow",

    // Contact
    "contact.eyebrow": "Contact",
    "contact.title": "Let's <span>talk</span>",
    "contact.subtitle":
      "Want to reach out? Pick whichever channel you prefer — I usually reply pretty fast!",
    "contact.location": "Paraná, Brazil",
    "contact.waDesc": "Quick, direct chat",
    "contact.ghDesc": "Code for my projects",
    "contact.mailDesc": "Proposals and opportunities",
    "contact.waCta": "Message now",
    "contact.ghCta": "View profile",
    "contact.mailCta": "Send email",

    // Footer
    "footer.copy": "All rights reserved.",
  },

  /* -------------------------------------------------- ES */
  es: {
    "meta.title": "Enzo Nascimento — Desarrollador Web Front-End & Back-End",

    "skip": "Saltar al contenido",
    "preloader.aria": "Cargando",

    "nav.home": "Inicio",
    "nav.about": "Sobre mí",
    "nav.journey": "Trayectoria",
    "nav.projects": "Proyectos",
    "nav.skills": "Skills",
    "nav.contact": "Contacto",

    "tt.color": "Color principal",
    "tt.theme": "Tema claro/oscuro",
    "tt.lang": "Idioma",
    "aria.color": "Elegir color principal",
    "aria.theme": "Alternar tema claro y oscuro",
    "aria.lang": "Elegir idioma",
    "color.title": "Color de acento",
    "lang.title": "Idioma",

    // Hero
    "hero.title": "Hola, soy <span class=\"hero__name\">Enzo</span>",
    "hero.desc":
      "Desarrollador web júnior de 15 años apasionado por convertir ideas en experiencias digitales. Construyo interfaces limpias y responsivas — una línea de código a la vez.",
    "hero.btnProjects": "Ver Proyectos",
    "hero.btnContact": "Contacto",
    "hero.photoAlt": "Retrato de Enzo Nascimento",
    "hero.scrollCue": "Desplazarse a la siguiente sección",
    "roles": [
      "Front-End Developer",
      "Web Developer",
      "PHP Developer",
      "Full Stack en evolución",
    ],

    // Sobre
    "about.eyebrow": "Sobre mí",
    "about.title": "Principiante en dev &amp; <span>con muchas ganas</span>",
    "about.photoAlt": "Enzo programando en la computadora",
    "about.badge": "años de<br />edad",
    "about.p1":
      "Empecé a programar cuando entré como <strong>Joven Aprendiz</strong> en el área de T.I. de <strong>Gazin Tech</strong>. Fue ahí donde descubrí que de verdad me gustaba — y desde entonces no paré de aprender.",
    "about.p2":
      "Hoy reparto mi tiempo entre estudiar, practicar y construir proyectos reales. Cada línea de código es una oportunidad para mejorar un poco más.",
    "about.quote":
      "“Programar es el arte de resolver problemas — y disfruto cada <strong>desafío</strong>.”",
    "about.card1t": "Paraná",
    "about.card1s": "Brasil",
    "about.card2t": "Joven Aprendiz",
    "about.card2s": "Área de T.I.",
    "about.card3t": "Gazin Tech",
    "about.card3s": "Donde todo empezó",
    "about.card4t": "Dev Web",
    "about.card4s": "Front &amp; Back",

    // Trayectoria
    "journey.eyebrow": "Evolución",
    "journey.title": "Mi <span>trayectoria</span>",
    "journey.subtitle":
      "El camino que vengo siguiendo como desarrollador — desde mi primer <code>&lt;html&gt;</code> hasta los proyectos que construyo hoy. Arrastra hacia el lado para explorar.",
    "journey.prev": "Etapa anterior",
    "journey.next": "Siguiente etapa",
    "j1t": "Entré en Gazin",
    "j1d": "Entré como joven aprendiz en Gazin Tech.",
    "j2t": "El comienzo",
    "j2d": "Di mis primeros pasos en el mundo de la programación.",
    "j3t": "Empecé con HTML",
    "j3d": "Aprendí a estructurar páginas con HTML semántico.",
    "j4t": "Aprendí CSS",
    "j4d": "Empecé a estilizar y a hacer todo responsivo.",
    "j5t": "JavaScript",
    "j5d": "Di vida a las páginas con interactividad y lógica.",
    "j6t": "Bootstrap",
    "j6d": "Agilicé maquetados con un framework CSS consagrado.",
    "j7t": "Tailwind CSS",
    "j7d": "Adopté el utility-first para estilizar más rápido.",
    "j8t": "PHP",
    "j8d": "Empecé en el back-end y en la lógica del lado del servidor.",
    "j9t": "SQL",
    "j9d": "Aprendí a modelar y consultar bases de datos.",
    "j10t": "Primer CRUD",
    "j10d": "Uní PHP y SQL para crear, leer, editar y eliminar datos.",
    "j11t": "React",
    "j11d": "Empecé a crear interfaces con componentes reutilizables.",
    "j12t": "Laravel",
    "j12d": "Evolucioné en el back-end con un framework PHP robusto.",
    "j13t": "Docker",
    "j13d": "Aprendí a contenerizar aplicaciones y estandarizar entornos.",
    "j14year": "Hoy",
    "j14t": "Sigo evolucionando",
    "j14d": "Estudiando y construyendo nuevos proyectos todos los días.",

    // Proyectos
    "projects.eyebrow": "Portafolio",
    "projects.title": "Mis <span>proyectos</span>",
    "projects.subtitle":
      "Cada proyecto de abajo me enseñó algo nuevo y me ayudó a crecer un poco más como desarrollador.",
    "status.done": "Concluido",
    "status.dev": "En desarrollo",
    "proj.time.desc":
      "Global-Time es una aplicación web para consultar la hora y usar cronómetro y temporizador, con una interfaz moderna, responsiva e intuitiva.",
    "proj.max.desc":
      "Sistema de ventas con CRUD completo: registro de productos, categorías y un panel administrativo en PHP y SQL.",
    "proj.soon.name": "Nuevo proyecto en camino…",
    "proj.soon.desc":
      "Estoy construyendo algo nuevo ahora mismo. Pronto aparecerá otro proyecto por aquí — ¡mantente atento! 🚀",
    "tag.soon": "Pronto",
    "btn.viewProject": "Ver Proyecto",
    "btn.soon": "Pronto",

    // Skills
    "skills.eyebrow": "Habilidades",
    "skills.title": "Mis <span>tecnologías</span>",
    "skills.subtitle":
      "Organizadas según el papel que cumple cada una en mi trabajo — destacando las que ya usé en proyectos publicados.",
    "skills.coreT": "Stack principal",
    "skills.coreS": "Tecnologías que ya usé en mis proyectos publicados.",
    "skills.coreLink": "Ver proyectos",
    "skills.langsT": "Lenguajes",
    "skills.langsS": "La base de todo lo que construyo",
    "skills.feT": "Front-end",
    "skills.feS": "Interfaces y estilos",
    "skills.beT": "Back-end",
    "skills.beS": "Lógica del lado del servidor",
    "skills.dbT": "Bases de datos",
    "skills.dbS": "Donde viven los datos",
    "skills.toolsT": "Herramientas",
    "skills.toolsS": "Mi día a día de trabajo",

    // Contacto
    "contact.eyebrow": "Contacto",
    "contact.title": "Vamos a <span>hablar</span>",
    "contact.subtitle":
      "¿Quieres hablar conmigo? Elige el canal que prefieras — ¡suelo responder bastante rápido!",
    "contact.location": "Paraná, Brasil",
    "contact.waDesc": "Conversación rápida y directa",
    "contact.ghDesc": "Código de mis proyectos",
    "contact.mailDesc": "Propuestas y oportunidades",
    "contact.waCta": "Escribir ahora",
    "contact.ghCta": "Ver perfil",
    "contact.mailCta": "Enviar correo",

    // Footer
    "footer.copy": "Todos los derechos reservados.",
  },
};

/** Rótulos curtos exibidos no botão da navbar. */
const LANG_LABEL = { pt: "PT", en: "EN", es: "ES" };

/** Bandeira (imagem) de cada idioma, exibida no botão da navbar.
   Usamos imagens locais em vez de emoji porque o Windows não renderiza
   as bandeiras de emoji (mostra apenas as letras do país). */
const LANG_FLAG = {
  pt: '<img src="assets/images/flags/br.png" srcset="assets/images/flags/br@2x.png 2x" alt="" width="20" height="14" />',
  en: '<img src="assets/images/flags/us.png" srcset="assets/images/flags/us@2x.png 2x" alt="" width="20" height="14" />',
  es: '<img src="assets/images/flags/es.png" srcset="assets/images/flags/es@2x.png 2x" alt="" width="20" height="14" />',
};

let currentLang = DEFAULT_LANG;

/** Lê o idioma salvo (ou o padrão). */
function readSavedLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
  } catch {
    /* ignora */
  }
  return DEFAULT_LANG;
}

/** Idioma ativo no momento. */
export function getLang() {
  return currentLang;
}

/** Lista de "roles" (efeito de digitação) do idioma atual. */
export function getRoles() {
  return translations[currentLang]?.roles || translations[DEFAULT_LANG].roles;
}

/* ── Aplica as traduções no DOM ──────────────────── */
function applyLang(lang) {
  const dict = translations[lang] || translations[DEFAULT_LANG];
  currentLang = lang;

  root.setAttribute("lang", LOCALES[lang] || "pt-BR");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const v = dict[el.dataset.i18nHtml];
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll("[data-i18n-tooltip]").forEach((el) => {
    const v = dict[el.dataset.i18nTooltip];
    if (v != null) el.setAttribute("data-tooltip", v);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const v = dict[el.dataset.i18nAria];
    if (v != null) el.setAttribute("aria-label", v);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const v = dict[el.dataset.i18nAlt];
    if (v != null) el.setAttribute("alt", v);
  });

  // Título da aba (SEO)
  const metaTitle = dict["meta.title"];
  if (metaTitle) document.title = metaTitle;

  updateLangUI(lang);

  // Avisa outros módulos (ex.: o efeito de digitação do hero).
  document.dispatchEvent(
    new CustomEvent("languagechange", { detail: { lang } })
  );
}

/** Persiste a escolha (tolerante a storage indisponível). */
function save(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignora */
  }
}

/** Troca de idioma (aplica + persiste). */
export function setLang(lang) {
  if (!translations[lang] || lang === currentLang) {
    if (translations[lang]) applyLang(lang); // reaplica se for o mesmo
    return;
  }
  applyLang(lang);
  save(lang);
}

/* ── Estado visual do seletor ────────────────────── */
function updateLangUI(lang) {
  const current = document.getElementById("langCurrent");
  if (current) current.textContent = LANG_LABEL[lang] || "PT";

  const flag = document.getElementById("langFlag");
  if (flag) flag.innerHTML = LANG_FLAG[lang] || LANG_FLAG.pt;

  document.querySelectorAll(".lang-option").forEach((opt) => {
    const active = opt.dataset.lang === lang;
    opt.classList.toggle("is-active", active);
    opt.setAttribute("aria-checked", String(active));
  });
}

/* ── Popover do seletor (abre/fecha) ─────────────── */
function initLangPopover() {
  const wrap = document.querySelector(".lang-switch");
  const btn = document.getElementById("langBtn");
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

  wrap.querySelectorAll(".lang-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      setLang(opt.dataset.lang);
      close();
    });
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ── Inicialização ───────────────────────────────── */
export function initI18n() {
  currentLang = readSavedLang();
  applyLang(currentLang);
  initLangPopover();
}
