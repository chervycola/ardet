#!/usr/bin/env node
// Один шаг охотника: отправить действие харнессу (--serve) и напечатать наблюдение.
//   node hunt/act.mjs '{"do":"walk","dir":"up","ms":800}'
//   node hunt/act.mjs observe
// Порт — ARDET_PORT (по умолчанию 8790).
const port = process.env.ARDET_PORT || 8790;
const a = process.argv[2] || 'observe';
const body = a.trim().startsWith('{') ? a : JSON.stringify({ do: a });
const r = await fetch(`http://127.0.0.1:${port}/`, { method: 'POST', body });
console.log(JSON.stringify(await r.json(), null, 1));
