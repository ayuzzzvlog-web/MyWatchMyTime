/**
 * Headless smoke test — renders the real app bundle inside jsdom against a
 * running API and fails if the page throws or a content check is missing.
 *
 *   npm run smoke                       # homepage
 *   ROUTE=/collection npm run smoke
 *   ROUTE=/watch/any-slug CHECK="Price|Specifications" npm run smoke
 *   TOKEN=<admin jwt> ROUTE=/admin npm run smoke
 *
 * Requires the API to be running (npm run dev:api or npm start).
 */
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const API = process.env.SMOKE_API || 'http://127.0.0.1:4000';
const ROUTE = process.env.ROUTE || '/';
const bundlePath = path.join(os.tmpdir(), `unique-trendz-smoke-${process.pid}.js`);

await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: bundlePath,
  loader: { '.css': 'empty', '.woff': 'empty', '.woff2': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'error',
});

const code = fs.readFileSync(bundlePath, 'utf8');
fs.rmSync(bundlePath, { force: true });

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: `http://localhost:5173${ROUTE}`,
  pretendToBeVisual: true,
  runScripts: 'outside-only',
});

const { window } = dom;
const errors = [];
window.addEventListener('error', (event) => errors.push(`window.error: ${event.message}`));
window.addEventListener('unhandledrejection', (event) => errors.push(`unhandled rejection: ${event.reason}`));
console.error = (...args) => {
  const text = args.map((arg) => (arg instanceof Error ? arg.stack : String(arg))).join(' ');
  if (!/not implemented/i.test(text)) errors.push(`console.error: ${text.slice(0, 500)}`);
};

window.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input.url;
  return fetch(url.startsWith('http') ? url : API + url, init);
};
window.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
});
class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
window.IntersectionObserver = Observer;
window.ResizeObserver = Observer;
window.scrollTo = () => {};
window.HTMLCanvasElement.prototype.getContext = () => null;
if (process.env.TOKEN) window.localStorage.setItem('ut_admin_token', process.env.TOKEN);

try {
  window.eval(code);
} catch (error) {
  errors.push(`eval: ${error.stack}`);
}

await new Promise((resolve) => setTimeout(resolve, 2500));

const root = window.document.getElementById('root');
const html = root?.innerHTML || '';
let failed = false;

console.log(`\nRoute ${ROUTE} → ${html.length} characters of HTML`);
if (html.length < 500) {
  console.log('✗ Nothing rendered');
  failed = true;
}
if (process.env.CHECK) {
  for (const needle of process.env.CHECK.split('|')) {
    const found = html.includes(needle);
    if (!found) failed = true;
    console.log(`${found ? '✓' : '✗'} contains “${needle}”`);
  }
}
if (errors.length) {
  failed = true;
  console.log('\nRuntime errors:');
  errors.slice(0, 10).forEach((error) => console.log('  •', error.slice(0, 700)));
} else {
  console.log('✓ no runtime errors');
}

dom.window.close();
process.exit(failed ? 1 : 0);
