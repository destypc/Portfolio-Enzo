/* ======================================================
   include.js — Monta a página a partir dos pedaços de HTML
   Cada <div data-include="caminho.html"> do index.html é
   substituído pelo conteúdo do arquivo indicado
   (components/ e sections/).
   ====================================================== */

/** Busca um pedaço de HTML e coloca no lugar do elemento. */
async function include(slot) {
  const url = slot.getAttribute("data-include");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    slot.outerHTML = await res.text();
  } catch (err) {
    console.error(
      `[include] Não foi possível carregar "${url}". ` +
        "Abra o site por um servidor local (ex.: Live Server), não pelo arquivo direto.",
      err
    );
  }
}

/** Carrega todos os pedaços em paralelo. */
export function loadPartials(root = document) {
  return Promise.all([...root.querySelectorAll("[data-include]")].map(include));
}
