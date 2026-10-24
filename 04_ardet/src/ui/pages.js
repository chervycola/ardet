// ═══════════════════════════════════════
// СТРАНИЦЫ ОСМОТРА — длинный текст режется на страницы окна (#look).
// Мера — знаки; перенос строки стоит полстроки этого окна: абзац съедает
// место. Режем по абзацу, иначе по пробелу — слово не рвётся.
// ═══════════════════════════════════════
export const NL_COST = 30;

export function paginate(text, budget = 600, nl = NL_COST) {
  const costOf = s => s.length + (s.match(/\n/g) || []).length * nl;
  if (costOf(text) <= budget) return [text];
  const pages = [];
  let rest = text;
  while (rest.length) {
    if (costOf(rest) <= budget) { pages.push(rest); break; }
    let c = 0, cut = 0;
    while (cut < rest.length && (c += rest[cut] === '\n' ? nl + 1 : 1) <= budget) cut++;
    // разрыв — целиком в мере: абзац (два переноса) или пробел до границы
    const par = rest.lastIndexOf('\n\n', cut - 2);
    const sp = rest.lastIndexOf(' ', cut - 1);
    if (par > cut * 0.4) cut = par + 2;
    else if (sp > cut * 0.6) cut = sp + 1;
    cut = Math.max(1, cut);
    pages.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  return pages;
}

// мера страницы по окну (style.css: #look и #lb; режим стрима — ui/stream.js):
// ширина строки и кегль дают знаков в строку, высота экрана — строк в окне
export function pageMeasure(w, h, coarse = false, stream = false) {
  const mob = w <= 768 || coarse;
  const box = mob ? Math.min(w * 0.92, 480) - 32 : stream ? Math.min(860, w * 0.94) - 68 : Math.min(720, w * 0.92) - 68;
  const font = mob ? 17 : stream ? 24 : 20, lh = font * (mob ? 1.5 : 1.6);
  const perLine = Math.max(20, Math.floor(box / (font * 0.55)));
  const vh = mob ? (w <= 768 && h <= 500 ? 0.85 : 0.75) : 0.84;      // max-height окна — те же медиа-правила
  const lines = Math.floor((vh * h - (mob ? 130 : stream ? 170 : 140)) / lh);
  return { budget: Math.max(mob ? 240 : 600, Math.min(1500, lines * perLine)), nl: Math.round(perLine / 2) };
}
