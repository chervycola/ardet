#!/usr/bin/env node
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const TEMPLATE = fs.readFileSync('src/template.html', 'utf8');

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
  console.log(`✓ build/ardet.html (${kb} KB)`);
}).catch(() => process.exit(1));
