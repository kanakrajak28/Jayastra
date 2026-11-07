/* Build-time only, run by build.py: renders each route of the site with React in Node and prints
   {"pages": {path: html}, "data": {...}} as JSON. Browser globals are stubbed just enough for the
   components to render; effects never run on the server, so nothing else is needed.
   usage: node prerender.js <vendor dir> <ssr bundle> <routes.json> <out.json> */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const [vendor, bundle, routesFile, outFile] = process.argv.slice(2);

const g = globalThis;
const noop = () => {};
const el = () => ({
  style: {},
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  appendChild: noop,
  setAttribute: noop,
  getAttribute: () => null,
  addEventListener: noop,
  removeEventListener: noop,
});
g.window = g;
g.self = g;
Object.assign(g, {
  __ROUTING: 'path',
  __ASSET_BASE: '/',
  __LOGO_LIGHT: '/logo-sm.png',
  __LOGO_DARK: '/logo-dark-sm.png',
  location: { pathname: '/', hash: '', search: '', href: '' },
  history: { pushState: noop, replaceState: noop },
  // report reduced motion: counters then show their final numbers, and the intro and fade-in styles are left out
  matchMedia: (q) => ({ matches: /prefers-reduced-motion: reduce/.test(q), addListener: noop, removeListener: noop, addEventListener: noop, removeEventListener: noop }),
  innerWidth: 1280,
  innerHeight: 800,
  devicePixelRatio: 1,
  document: {
    documentElement: el(),
    body: el(),
    head: el(),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: el,
    addEventListener: noop,
    removeEventListener: noop,
  },
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: noop,
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: noop,
  getComputedStyle: () => ({}),
});
// Framer Motion checks elements against these browser classes
['Element', 'HTMLElement', 'SVGElement', 'Node', 'HTMLCanvasElement', 'HTMLImageElement'].forEach((n) => {
  if (!g[n]) g[n] = class {};
});
// no IntersectionObserver here, so every lazily built home section renders in full

const run = (file) => vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
['react.production.min.js', 'react-dom-server-legacy.browser.production.min.js', 'framer-motion.js'].forEach((f) => run(path.join(vendor, f)));
run(bundle);

const routes = JSON.parse(fs.readFileSync(routesFile, 'utf8'));
const pages = {};
for (const r of routes) {
  g.location.pathname = r === '/' ? '/' : r;
  pages[r] = g.__renderPage();
}
fs.writeFileSync(outFile, JSON.stringify({ pages, data: g.__siteData }));
