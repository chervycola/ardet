import { createServer } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const lang = process.argv[2] || 'ru';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
const { ProductPage } = await vite.ssrLoadModule('/src/module-page.tsx');
const { LangContext } = await vite.ssrLoadModule('/src/i18n.tsx');

const css = readFileSync(new URL('./src/styles.css', import.meta.url), 'utf8');

// Force a fixed language by providing the context value directly (no effects/localStorage in SSR).
const withLang = (node) =>
  h(LangContext.Provider, { value: { lang, setLang: () => {} } }, node);

function page(title, bodyMarkup) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo+Narrow:wght@400;500;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet" />
<style>
${css}
</style>
</head>
<body>
<div id="root">${bodyMarkup}</div>
</body>
</html>
`;
}

const home = renderToStaticMarkup(withLang(h(App)));
writeFileSync('system_suicide_index.html', page('SYSTEM — physical synthesis', home));

const ln = renderToStaticMarkup(withLang(h(ProductPage, { slug: 'last-night' })));
writeFileSync('system_suicide_last-night.html', page('SYSTEM — Last Night', ln));

await vite.close();
console.log('wrote system_suicide_index.html + system_suicide_last-night.html');
