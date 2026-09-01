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
  const start = m.index;
  let brace = source.indexOf('{', start), depth = 0, quote = null, escaped = false, lineComment = false, blockComment = false;
  for (; brace < source.length; brace++) {
    const c = source[brace], n = source[brace + 1];
    if (lineComment) { if (c === '\\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && n === '/') { blockComment = false; brace++; } continue; }
    if (quote) { if (escaped) { escaped = false; continue; } if (c === '\\\\') { escaped = true; continue; } if (c === quote) quote = null; continue; }
    if (c === '/' && n === '/') { lineComment = true; brace++; continue; }
    if (c === '/' && n === '*') { blockComment = true; brace++; continue; }
    if (c === '\"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return { start, end: brace + 1, text: source.slice(start, brace + 1) };
  }
  throw new Error(`Unbalanced function: ${name}`);
}

const all = [...shared, ...Object.values(groups).flat()];
const extracted = new Map(all.map(name => [name, findFunction(core, name)]));
function indent(text) { return text.split('\n').map(line => '  ' + line).join('\n'); }
function moduleText(file, names) {
  return `/* GAMA Stock Manager V10 — ${file.replace('.js','')} bounded context */\n(function(){\n  'use strict';\n\n${names.map(n => indent(extracted.get(n).text)).join('\n\n')}\n\n  Object.assign(window, { ${names.join(', ')} });\n  window.${file.replace('.js','')}Ready = true;\n})();\n`;
}
for (const [file, names] of Object.entries(groups)) fs.writeFileSync(file, moduleText(file, names));

const runtime = fs.readFileSync(runtimePath, 'utf8');
if (!runtime.includes('GamaLegacyServicesReady')) {
  const addition = `\n\n// Shared legacy services extracted from gama-legacy-core.js.\n(function(){\n  'use strict';\n${shared.map(n => indent(extracted.get(n).text)).join('\n\n')}\n  Object.assign(window, { ${shared.join(', ')} });\n  window.GamaLegacyServicesReady = true;\n})();\n`;
  fs.writeFileSync(runtimePath, runtime + addition);
}

let remaining = core;
for (const { start, end } of [...extracted.values()].sort((a,b) => b.start - a.start)) remaining = remaining.slice(0, start) + remaining.slice(end);
remaining = remaining.replace(/\n{3,}/g, '\n\n').trim();
if (remaining && !/^\/\*[\s\S]*?\*\/$/.test(remaining)) throw new Error('Unexpected legacy core remainder; refusing destructive migration.');
fs.writeFileSync(corePath, remaining ? remaining + '\n' : '');
console.log(`Split ${all.length} functions into runtime + ${Object.keys(groups).length} bounded contexts.`);
