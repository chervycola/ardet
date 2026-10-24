#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// Сборка ardet: src/** → build/index.html (+ build/mobile.html).
// Бандлер: esbuild, если установлен; иначе tsc (--module system)
// + вшитый SystemJS-загрузчик из src/vendor (11 КБ).
// ═══════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const TEMPLATE = fs.readFileSync('src/template.html', 'utf8');
const PROD = process.argv.includes('--prod');

// Copy src/assets/** → build/assets/** recursively (media only).
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

async function bundleWithEsbuild() {
  const esbuild = require('esbuild');
  const result = await esbuild.build({
    entryPoints: ['src/main.js'],
    bundle: true,
    minify: PROD,
    format: 'iife',
    target: 'es2020',
    write: false,
    loader: { '.css': 'text' },
  });
  return result.outputFiles[0].text;
}

function bundleWithTsc() {
  const out = path.join(os.tmpdir(), 'ardet-system-bundle.js');
  const args = [
    '--allowJs', '--checkJs', 'false',
    '--module', 'system', '--target', 'es2020',
    '--moduleResolution', 'node', '--skipLibCheck',
    '--outFile', out, 'src/main.js',
  ];
  const candidates = [
    path.join(__dirname, 'node_modules', 'typescript', 'bin', 'tsc'),
    '/opt/node22/lib/node_modules/typescript/bin/tsc',
  ];
  const tsc = candidates.find(fs.existsSync);
  if (!tsc) throw new Error('нет ни esbuild, ни typescript');
  try {
    execFileSync(process.execPath, [tsc, ...args], { stdio: 'pipe' });
  } catch (e) {
    // tsc может выйти с ненулевым кодом из-за deprecation-ворнингов,
    // при этом файл собран; настоящая ошибка — если файла нет/пустой.
    if (!fs.existsSync(out) || fs.statSync(out).size === 0) {
      console.error(String(e.stdout || e.message));
      throw e;
    }
  }
  const sys = fs.readFileSync('src/vendor/systemjs.min.js', 'utf8');
  const named = fs.readFileSync('src/vendor/named-register.min.js', 'utf8');
  const bundle = fs.readFileSync(out, 'utf8');
  fs.unlinkSync(out);
  return `${sys}\n${named}\n${bundle}\nSystem.import("main");`;
}

function buildStamp() {
  try {
    const h = require('child_process').execSync('git rev-parse --short HEAD').toString().trim();
    const d = new Date().toISOString().slice(0, 10);
    return `${h} · ${d}`;
  } catch (e) { return 'без оттиска'; }
}

function renderHtml(js, flags) {
  const stamp = buildStamp();
  flags = `window.ARDET_BUILD='${stamp}';console.log('[оттиск]', '${stamp}');` + flags;
  const css = fs.readFileSync('src/style.css', 'utf8');
  const audio = fs.readFileSync('src/audio/ardet-tracks.js', 'utf8')
    .replace(/<\/script>/gi, '<\\/script>');
  return TEMPLATE
    .replace('/* __CSS__ */', () => css)
    .replace('/* __FLAGS__ */', () => flags)
    .replace('/* __AUDIO__ */', () => audio)
    .replace('/* __JS__ */', () => js);
}

(async () => {
  let js, bundler;
  try {
    js = await bundleWithEsbuild();
    bundler = 'esbuild';
  } catch (e) {
    js = bundleWithTsc();
    bundler = 'tsc+systemjs';
  }
  fs.mkdirSync('build', { recursive: true });
  const desktop = renderHtml(js, '');
  const mobile = renderHtml(js, 'window.ARDET_MOBILE=1;');
  fs.writeFileSync('build/index.html', desktop);
  fs.writeFileSync('build/ardet.html', desktop); // историческое имя
  fs.writeFileSync('build/mobile.html', mobile);
  const kb = Math.round(Buffer.byteLength(desktop) / 1024);
  const assetCount = copyAssets('src/assets', 'build/assets');
  const tail = assetCount ? ` · ${assetCount} asset${assetCount === 1 ? '' : 's'}` : '';
  console.log(`✓ build/index.html + mobile.html (${kb} KB, ${bundler})${tail}`);
})().catch(e => { console.error(e.message || e); process.exit(1); });
