// Copies the curl2vro browser engine (bundle + wasm) into public/engine so the site can be
// served by Express or by any static host (Vercel, Render static, GitHub Pages).
const fs = require('fs');
const path = require('path');

const src = path.join(path.dirname(require.resolve('curl2vro/package.json')), 'dist');
const dest = path.join(__dirname, '..', 'public', 'engine');
fs.mkdirSync(dest, { recursive: true });
['curl2vro.browser.mjs', 'tree-sitter.wasm', 'tree-sitter-bash.wasm'].forEach(function (f) {
    fs.copyFileSync(path.join(src, f), path.join(dest, f));
});
console.log('curl2vro engine copied to public/engine');
