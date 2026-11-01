import { useCallback, useEffect, useState } from './lib/react';
import { FB_BY_ID, ROUTING, localImg, reducedNow } from './lib/utils';
import { Preloader } from './components/Preloader';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Statement } from './components/Statement';
import { Work } from './components/Work';
import { Services } from './components/Services';
import { Industries } from './components/Industries';
import { Process } from './components/Process';
import { Mark3D } from './components/Mark3D';
import { Stats } from './components/Stats';
import { Advantage } from './components/Advantage';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { CaseStudies, caseBySlug, sectorBySlug } from './components/CaseStudies';
import { SectorPage } from './pages/SectorPage';
import { CasePage } from './pages/CasePage';
import { WorkIndex } from './pages/WorkIndex';
import { NotFound } from './pages/NotFound';
import { PrivacyPage, TermsPage } from './pages/Legal';

/* ======================================================================
   App
   ====================================================================== */
const routeOf = () => {
  if (ROUTING === 'path') return { path: window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, ''), anchor: window.location.hash || null };
  const h = window.location.hash || '';
  if (h.indexOf('#/') === 0) return { path: h.slice(1).replace(/\/+$/, ''), anchor: null };
  return { path: '', anchor: h && h !== '#top' ? h : null };
};
const parseRoute = ({ path, anchor }) => {
  if (!path) return { page: 'home', anchor };
  let m = path.match(/^\/industries(?:\/([\w-]+))?$/);
  if (m) return m[1] ? { page: 'sector', slug: m[1] } : { page: 'home', anchor: '#industries' };
  m = path.match(/^\/work(?:\/([\w-]+))?$/);
  if (m) return m[1] ? { page: 'case', slug: m[1] } : { page: 'work' };
  if (path === '/privacy') return { page: 'privacy' };
  if (path === '/terms') return { page: 'terms' };
  return { page: '404' };
};
const SITE_DESC = 'Jayastra is an independent design studio in Jabalpur, India, for brand identity, websites, UI/UX, packaging and 3D product visuals, working with clients worldwide.';
const routeMeta = (r) => {
  if (r.page === 'sector') { const sec = sectorBySlug(r.slug); if (sec) return [sec.name + ' design & 3D | Jayastra', sec.text]; }
  if (r.page === 'case') { const c = caseBySlug(r.slug); if (c) return [c.name + ' · ' + c.services + ' | Jayastra', c.summary]; }
  if (r.page === 'work') return ['Case studies | Jayastra', 'Concept projects across 14 sectors, from brand identity and packaging to product UI and 3D renders.'];
  if (r.page === 'privacy') return ['Privacy Policy | Jayastra', 'How Jayastra collects, uses and protects your personal information.'];
  if (r.page === 'terms') return ['Terms of Use | Jayastra', 'The terms for using jayastra.com and working with Jayastra.'];
  if (r.page === '404') return ['Page not found | Jayastra', SITE_DESC];
  return ['Jayastra | Brand, digital & 3D design studio in Jabalpur, India', SITE_DESC];
};

export function App() {
  const reduce = reducedNow();
  const [loc, setLoc] = useState(routeOf);
  const route = parseRoute(loc);
  const hash = loc.anchor;
  const [loading, setLoading] = useState(() => {
    if (reduce || route.page !== 'home') return false;
    // a refresh plays it again; coming back to home from another page of the site skips it
    let reload = false;
    try { const nav = performance.getEntriesByType('navigation')[0]; reload = !!nav && nav.type === 'reload'; } catch (e) { /* ignore */ }
    try { if (!reload && sessionStorage.getItem('jy-seen')) return false; } catch (e) { /* ignore */ }
    return true;
  });
  // no preloader means nothing will call done(), so the hero must be shown straight away
  const [ready, setReady] = useState(!loading);
  useEffect(() => {
    const on = () => setLoc(routeOf());
    window.addEventListener('hashchange', on);
    window.addEventListener('popstate', on);
    window.addEventListener('jy:route', on);
    // internal navigation: real URLs (path mode) and section links from inner pages
    const onNav = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      const isHome = !!document.getElementById('top');
      if (ROUTING === 'path' && href.charAt(0) === '/' && href.charAt(1) !== '/') {
        e.preventDefault();
        if (href !== window.location.pathname + window.location.hash) window.history.pushState({}, '', href);
        window.dispatchEvent(new Event('jy:route'));
        return;
      }
      if (href.charAt(0) === '#' && href.charAt(1) !== '/' && !isHome) {
        let el = null; try { el = href === '#top' ? null : document.querySelector(href); } catch (er) { el = null; }
        if (el) return;
        e.preventDefault();
        if (ROUTING === 'path') { window.history.pushState({}, '', '/' + (href === '#top' ? '' : href)); window.dispatchEvent(new Event('jy:route')); } else { window.location.hash = href === '#top' ? '' : href; }
      }
    };
    document.addEventListener('click', onNav);
    // swap blocked remote photos for local ones
    const onErr = (e) => {
      const t = e.target;
      if (!t || t.tagName !== 'IMG' || t.dataset.fb || t.src.indexOf('images.unsplash.com') < 0) return;
      t.dataset.fb = '1';
      const m = t.src.match(/photo-([\w-]+)/);
      const k = m && FB_BY_ID[m[1]];
      if (k) t.src = localImg(k);
    };
    document.addEventListener('error', onErr, true);
    return () => { window.removeEventListener('hashchange', on); window.removeEventListener('popstate', on); window.removeEventListener('jy:route', on); document.removeEventListener('click', onNav); document.removeEventListener('error', onErr, true); };
  }, []);
  const pageKey = route.page + (route.slug || '') + '|' + (route.anchor || '');
  useEffect(() => {
    const [t, d] = routeMeta(route);
    document.title = t;
    const md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', d);
  }, [pageKey]);
  useEffect(() => {
    const l = window.__lenis;
    const anchor = route.anchor || null;
    if (route.page !== 'home' || !anchor) { if (l) l.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0); }
    if (anchor) {
      // the home page is still laying out (images, lazy sections), so keep correcting until it settles
      let stop = false;
      const halt = () => { stop = true; };
      window.addEventListener('wheel', halt, { passive: true });
      window.addEventListener('touchstart', halt, { passive: true });
      window.addEventListener('keydown', halt);
      const go = () => {
        if (stop) return;
        let el = null; try { el = document.querySelector(anchor); } catch (e) { el = null; }
        if (!el) return;
        const off = el.getBoundingClientRect().top - 72;
        if (Math.abs(off) < 3) return;
        const y = window.scrollY + off;
        if (l) l.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
      };
      const ts = [60, 250, 600, 1100, 1800, 2600].map((ms) => setTimeout(go, ms));
      return () => { ts.forEach(clearTimeout); window.removeEventListener('wheel', halt); window.removeEventListener('touchstart', halt); window.removeEventListener('keydown', halt); };
    }
    return undefined;
  }, [pageKey]);
  useEffect(() => { const b = document.getElementById('boot'); if (b) b.remove(); }, []);
  useEffect(() => {
    const L = window.Lenis;
    if (!L || reducedNow()) return undefined;
    const lenis = new L({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    window.__lenis = lenis;
    let id = requestAnimationFrame(function loop(t) { lenis.raf(t); id = requestAnimationFrame(loop); });
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href.indexOf('#/') === 0) return;
      if (!document.getElementById('top') && href.length > 1) { let ok = null; try { ok = document.querySelector(href); } catch (er) { return; } if (!ok) return; }
      let target = null;
      try { target = href === '#top' ? (document.getElementById('top') ? 0 : null) : document.querySelector(href); } catch (er) { return; }
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: href === '#top' ? 0 : -72, duration: 1.4 });
    };
    document.addEventListener('click', onClick);
    return () => { cancelAnimationFrame(id); document.removeEventListener('click', onClick); lenis.destroy(); window.__lenis = null; };
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', loading);
    const l = window.__lenis;
    if (l) { if (loading) l.stop(); else l.start(); }
  }, [loading]);
  const reveal = useCallback(() => setReady(true), []);
  const done = useCallback(() => { setReady(true); setLoading(false); try { sessionStorage.setItem('jy-seen', '1'); } catch (e) { /* ignore */ } }, []);
  return (
    <>
      {loading ? <Preloader onReveal={reveal} onDone={done} /> : null}
      <Header ready={ready} />
      {route.page === 'sector' ? <SectorPage key={pageKey} slug={route.slug} /> : null}
      {route.page === 'case' ? <CasePage key={pageKey} slug={route.slug} /> : null}
      {route.page === 'work' ? <WorkIndex /> : null}
      {route.page === 'privacy' ? <PrivacyPage /> : null}
      {route.page === 'terms' ? <TermsPage /> : null}
      {route.page === '404' ? <NotFound /> : null}
      {route.page === 'home' ? <main id="main">
        <Hero ready={ready} />
        <Statement />
        <Work />
        <Services />
        <Industries />
        <CaseStudies />
        <Process />
        <Mark3D />
        <Stats />
        <Advantage />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Contact />
      </main> : (route.page === 'privacy' || route.page === 'terms' || route.page === '404' ? null : <Contact />)}
      <Footer />
    </>
  );
}
