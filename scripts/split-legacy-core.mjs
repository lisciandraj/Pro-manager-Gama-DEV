import fs from 'node:fs';

const corePath = 'gama-legacy-core.js';
const runtimePath = 'gama-legacy-runtime.js';
const core = fs.readFileSync(corePath, 'utf8');

const groups = {
  'gama-products.js': ['createProduct','editProduct','clearProductForm','deleteProduct','renderProducts'],
  'gama-clients.js': ['saveClient','editClient','clearClientForm','deleteClient','renderClients','populateClientSelect','selectClientForInvoice'],
  'gama-inventory.js': ['auditMovement','registerMovement','searchProduct'],
  'gama-billing.js': ['addInvoiceItem','renderInvoiceItems','removeInvoiceItem','generateInvoice','invoiceHTML','printInvoice'],
  'gama-audit.js': ['renderAudit','createCorrection'],
  'gama-dashboard.js': ['renderDonut','dashMoney','dashMonths','renderDashboard','renderAll']
};
const shared = ['product','uid','save','showTab','openMovement','compressPhoto'];

function findFunction(source, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{', 'm');
  const m = re.exec(source);
  if (!m) throw new Error(`Function not found: ${name}`);
  let i = m.index;
  let brace = source.indexOf('{', i);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (; brace < source.length; brace++) {
    const c = source[brace], n = source[brace + 1];
    if (lineComment) { if (c === '\\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && n === '/') { blockComment = false; brace++; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (c === '\\\\') { escaped = true; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && n === '/') { lineComment = true; brace++; continue; }
    if (c === '/' && n === '*') { blockComment = true; brace++; continue; }
    if (c === '\"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return { start: i, end: brace + 1, text: source.slice(i, brace + 1) };
  }
  throw new Error(`Unbalanced function: ${name}`);
}

const all = [...shared, ...Object.values(groups).flat()];
const extracted = new Map();
for (const name of all) extracted.set(name, findFunction(core, name));

function moduleText(file, names) {
  return `/* GAMA Stock Manager V10 — ${file.replace('.js','')} bounded context */\n(function(){\n  'use strict';\n\n${names.map(n => extracted.get(n).text.split('\\n').map(line => '  ' + line).join('\\n')).join('\\n\\n')}\n\n  Object.assign(window, { ${names.join(', ')} });\n  window.${file.replace('.js','')}Ready = true;\n})();\n`;
}

for (const [file, names] of Object.entries(groups)) fs.writeFileSync(file, moduleText(file, names));

const runtime = fs.readFileSync(runtimePath, 'utf8');
const runtimeNames = shared;
const runtimeAddition = `\n\n// Shared legacy services extracted from gama-legacy-core.js.\n(function(){\n  'use strict';\n${runtimeNames.map(n => extracted.get(n).text.split('\\n').map(line => '  ' + line).join('\\n')).join('\\n\\n')}\n  Object.assign(window, { ${runtimeNames.join(', ')} });\n  window.GamaLegacyServicesReady = true;\n})();\n`;
if (!runtime.includes('GamaLegacyServicesReady')) fs.writeFileSync(runtimePath, runtime + runtimeAddition);

let remaining = core;
for (const { start, end } of [...extracted.values()].sort((a,b) => b.start - a.start)) remaining = remaining.slice(0, start) + remaining.slice(end);
remaining = remaining.replace(/\\n{3,}/g, '\\n\\n').trim();
if (remaining && !/^\/\*[\\s\\S]*?\*\/$/.test(remaining)) throw new Error('Unexpected legacy core remainder; refusing destructive migration.');
fs.writeFileSync(corePath, remaining ? remaining + '\\n' : '');
console.log(`Split ${all.length} functions into runtime + ${Object.keys(groups).length} bounded contexts.`);
