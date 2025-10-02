#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const src = 'build/client/assets';
if (!fs.existsSync(src)) {
  console.warn('[postbuild] No build/client/assets to copy');
  process.exit(0);
}

const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), {recursive: true});
  fs.cpSync(from, to, {recursive: true, force: true});
};

const publicAssets = path.join('public', 'assets');
try {
  fs.rmSync(publicAssets, {recursive: true, force: true});
} catch {}
fs.mkdirSync(publicAssets, {recursive: true});
copy(src, publicAssets);
console.log('[postbuild] Copied assets to public/assets');

const vercelOutput = '.vercel/output';
try {
  fs.rmSync(vercelOutput, {recursive: true, force: true});
} catch {}
fs.mkdirSync(path.join(vercelOutput, 'static', 'assets'), {recursive: true});
copy(src, path.join(vercelOutput, 'static', 'assets'));
fs.writeFileSync(path.join(vercelOutput, 'config.json'), JSON.stringify({version: 3}, null, 2));
console.log('[postbuild] Created Vercel Build Output');
