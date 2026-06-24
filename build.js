#!/usr/bin/env node
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const TEMPLATE = fs.readFileSync('src/template.html', 'utf8');

// Copy src/assets/** → build/assets/** recursively, skipping the
// manifest/loader source files (they're already bundled into the HTML).
// PNGs/JPGs/etc. need to ship as separate files so the loader can
// fetch them at runtime.
function copyAssets(srcDir, dstDir) {
  if (!fs.existsSync(srcDir)) return 0;
  let copied = 0;
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, ent.name);
    const d = path.join(dstDir, ent.name);
    if (ent.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copied += copyAssets(s, d);
    } else if (/\.(png|jpe?g|webp|gif|svg|wav|mp3|ogg)$/i.test(ent.name)) {
      fs.mkdirSync(dstDir, { recursive: true });
      fs.copyFileSync(s, d);
      copied++;
    }
  }
  return copied;
}

esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: process.argv.includes('--prod'),
  format: 'iife',
  target: 'es2020',
  write: false,
  loader: { '.css': 'text' },
}).then(result => {
  const js = result.outputFiles[0].text;
  const css = fs.readFileSync('src/style.css', 'utf8');
  const html = TEMPLATE
    .replace('/* __CSS__ */', css)
    .replace('/* __JS__ */', js);
  fs.writeFileSync('build/ardet.html', html);
  const kb = Math.round(Buffer.byteLength(html) / 1024);
  const assetCount = copyAssets('src/assets', 'build/assets');
  const tail = assetCount ? ` · ${assetCount} asset${assetCount === 1 ? '' : 's'}` : '';
  console.log(`✓ build/ardet.html (${kb} KB)${tail}`);
}).catch(() => process.exit(1));
