// ═══════════════════════════════════════
// ЧТО СТРАННИК НОСИТ ПРИ СЕБЕ (weave/SCENE_STAGE_2026-11-22.md §2.4 «Мысли», шаг 3).
// Шёпоты мест, которые он слышал, и надписи стен, проступавшие при нём. Ни в журнал, ни в
// опись это не попадает; поднимается мыслями из-под капюшона, когда он сидит на сцене театра.
// Запись — ключ (шёпот места 'w:<id>', стена 'i:<id>'), кольцо, где услышано, и порядок: от
// давно услышанного к недавнему. Сыгранная мысль не поднимается, пока не сыграны все прочие,
// потом круг идёт сначала (как повторный осмотр, world/relook.js).
// Строки на «ты» и «вы» сюда не идут: на сцене на тебя и так смотрят. Знаки без слов — тоже.
// Стена — одна запись: в каждый свой черёд она отдаёт следующую годную фразу (фраза, разбитая на
// несколько строк стены, идёт целиком). То, что место уже шепчет, со стены второй раз не идёт.
// Ловушки ставит main.js: whisper.js (шёпот начался рядом), inscriptions.js (надпись проступила),
// mossway.js (ночной шёпот пифоса).
// ═══════════════════════════════════════
import { WHISPERS } from './whisper.js';
import { hiddenInscriptions } from './inscriptions.js';
import { MOSS_WHISPER } from './mossway.js';

const MAX = 300;                                   // столько записей держит память; старшие уходят
const entries = [];                                // [{ k, r, li }] — в порядке услышанного
const played = new Set();                          // сыгранные ключи этого круга

// обращено к тому, кто читает: «ты», «вы» во всех падежах, со своими
const ADDR = /(^|[^а-яёa-z])(ты|тебя|тебе|тобой|тобою|твой|твоя|твоё|твое|твои|твоего|твоей|твоих|твоим|вы|вас|вам|вами|ваш|ваша|ваше|ваши|вашего|вашей|ваших|вашим)(?=[^а-яёa-z]|$)/iu;
const count = (s, ch) => s.split(ch).length - 1;
// годна ли строка в мысль: мысль короткая — не длиннее самого длинного шёпота места
export const THOUGHT_MAX = 46;
export function thoughtOk(line) {
  const s = String(line || '').trim();
  if (!s || !/\p{L}/u.test(s) || s.includes('█')) return false;          // знаки без слов
  if (Array.from(s).length > THOUGHT_MAX) return false;                   // целое письмо — не мысль
  if (ADDR.test(s)) return false;                                         // на «ты» и «вы»
  if (count(s, '«') !== count(s, '»') || /,$/.test(s)) return false;     // обрывок цитаты
  return true;
}
// Стена — это строки; фраза бывает разбита на несколько. Сами собой склеиваются строки после
// запятой в конце и внутри незакрытых «кавычек»; где фраза разбита без знаков, она записана здесь
// руками: номера строк одной фразы (что не названо — отдельной строкой). Всю стену одной фразой — 'all'
const GROUPS = {
  tent: [[0, 1, 2], [3]], posterwall: [[0], [1], [2], [3], [4], [5], [6, 7, 8], [9, 10], [11], [12]],
  ar_40: 'all', ar_43: 'all',
  ar_2: 'all', ar_12: 'all', ar_16: 'all', ar_18: 'all', ar_21: [[0], [1, 2]], ar_25: 'all', ar_27: 'all', ar_30: [[0], [1, 2]],
  ar_31: 'all', ar_41: 'all', ar_50: 'all', ar_63: 'all', ar_66: [[0, 1], [2]], ar_67: 'all', ar_68: 'all', ar_69: [[0], [1, 2]],
  ar_70: 'all', ar_73: 'all', ar_78: 'all', ar_79: [[0], [1, 2]], ar_84: 'all', ar_85: [[0, 1], [2]],
  ar_107: 'all', ar_109: 'all', ar_117: 'all', ar_118: 'all', ar_159: 'all',
};
// не мыслями: строки Беккета (охраняются до конца 2059 года — weave/VOICES.md; сцена построена на его
// пьесах без слов, его слов на ней нет) и обращение к тому, кто стоит у стены, на других языках (как
// «ты» и «вы» по-русски). Приветствие терминала «...how can I help you today?...» — исключение: его
// мыслью называет сам документ сцены (§2.4)
const DENY = new Set(['не могу продолжать', 'продолжаю', 'HOSPES, HIC BENE MANEBIS', 'GYDA SEGIR AT THU GAKK HEIM',
  'QUAN JUN GENG JIN YI BEI JIU', 'ADMIROR, PARIES, TE NON CECIDISSE RUINIS', 'CACATOR CAVE MALUM']);
const norm = s => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
// фразы стены: по ручной разметке или по запятым и кавычкам
function wallPhrases(id) {
  const lines = hiddenInscriptions[id] || [];
  const g = GROUPS[id];
  if (g === 'all') return lines.length ? [lines.join(' ')] : [];
  if (Array.isArray(g)) return g.map(ix => ix.map(i => lines[i]).filter(Boolean).join(' ')).filter(Boolean);
  const out = [];
  let cur = null;
  for (const l of lines) {
    if (cur !== null) cur += ' ' + l; else cur = l;
    const open = count(cur, '«') > count(cur, '»');
    if (!open && !/,$/.test(String(l).trim())) { out.push(cur); cur = null; }
  }
  if (cur !== null) out.push(cur);
  return out;
}
// годные фразы стены: без «ты», без обрывков, без запретного и без того, что место уже шептало ему
// (если шёпот этого места слышан — его фраза со стены второй раз не идёт)
const wallLinesOk = id => {
  const w = entries.some(e => e.k === 'w:' + id) ? norm(WHISPERS[id]) : '';
  return wallPhrases(id).filter(p => thoughtOk(p) && !DENY.has(p) && !(w && norm(p) && w.includes(norm(p))));
};
// текст записи сейчас (стена — её строка по счёту li)
function textOf(e) {
  const [kind, id] = [e.k[0], e.k.slice(2)];
  if (kind === 'w') { const s = id === 'pithos_night' ? MOSS_WHISPER : WHISPERS[id]; return thoughtOk(s) ? s : null; }
  const ok = wallLinesOk(id);
  return ok.length ? ok[(e.li || 0) % ok.length] : null;
}
const ringOk = r => (Number.isFinite(r) ? Math.max(0, Math.min(9, r | 0)) : 0);

// услышал шёпот места (id места; 'pithos_night' — ночной шёпот пифоса) / при нём проступила стена
export function noteHeard(kind, id, ring = 0) {
  if ((kind !== 'w' && kind !== 'i') || !id) return;
  const k = kind + ':' + id;
  if (entries.some(e => e.k === k)) return;                               // помнит с первого раза
  entries.push({ k, r: ringOk(ring), li: 0 });
  if (entries.length > MAX) entries.splice(0, entries.length - MAX);
}
export const heardCount = () => entries.filter(e => textOf(e)).length;

// m мыслей на этот приход: { text, ring } по порядку услышанного; сыгранное помечается
export function takeThoughts(m) {
  const live = entries.filter(e => textOf(e));
  const out = [], said = new Set();
  if (!live.length) return out;
  if (live.every(e => played.has(e.k))) played.clear();                    // круг сыгран — сначала
  for (const e of live) {
    if (out.length >= m) break;
    if (played.has(e.k) || said.has(norm(textOf(e)))) continue;            // одна фраза дважды за приход — нет
    said.add(norm(textOf(e)));
    out.push({ text: textOf(e), ring: e.r });
    played.add(e.k);
    if (e.k[0] === 'i') e.li = (e.li || 0) + 1;                            // стена в следующий раз — следующей строкой
  }
  return out;
}

export const saveHeard = () => ({ e: entries.map(e => [e.k, e.r, e.li || 0]), p: [...played] });
export function loadHeard(d) {
  _resetHeard();
  if (!d || !Array.isArray(d.e)) return;
  for (const row of d.e.slice(-MAX)) {
    if (!Array.isArray(row) || typeof row[0] !== 'string' || !/^[wi]:./.test(row[0]) || entries.some(e => e.k === row[0])) continue;
    entries.push({ k: row[0].slice(0, 80), r: ringOk(row[1]), li: Number.isFinite(row[2]) ? Math.max(0, row[2] | 0) % 1000 : 0 });
  }
  if (Array.isArray(d.p)) for (const k of d.p) if (typeof k === 'string' && entries.some(e => e.k === k)) played.add(k);
}
export function _resetHeard() { entries.length = 0; played.clear(); }
