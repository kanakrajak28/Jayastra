import { useCallback, useEffect, useRef, useState } from './lib/react';
import { FB_BY_ID, ROUTING, localImg, reducedNow } from './lib/utils';
import { Preloader } from './components/Preloader';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Statement } from './components/Statement';
import { Work } from './components/Work';
import { Services } from './components/Services';
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
import { ServicePage } from './pages/ServicePage';
import { serviceBySlug } from './components/Services';
import { CasePage } from './pages/CasePage';
import { WorkIndex } from './pages/WorkIndex';
import { NotFound } from './pages/NotFound';
import { PrivacyPage, TermsPage } from './pages/Legal';

/* ======================================================================
   App
   ====================================================================== */
const routeOf = () => {
  if (ROUTING === 'path')
    return {
      path: window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, ''),
      anchor: window.location.hash || null,
    };
  const h = window.location.hash || '';
  if (h.indexOf('#/') === 0) return { path: h.slice(1).replace(/\/+$/, ''), anchor: null };
  return { path: '', anchor: h && h !== '#top' ? h : null };
};
const parseRoute = ({ path, anchor }) => {
  if (!path) return { page: 'home', anchor };
  let m = path.match(/^\/industries(?:\/([\w-]+))?$/);
  if (m) return m[1] ? { page: 'sector', slug: m[1] } : { page: 'work' };
  m = path.match(/^\/services(?:\/([\w-]+))?$/);
  if (m) return m[1] ? { page: 'service', slug: m[1] } : { page: 'home', anchor: '#services' };
  m = path.match(/^\/work(?:\/([\w-]+))?$/);
  if (m) return m[1] ? { page: 'case', slug: m[1] } : { page: 'work' };
  if (path === '/privacy') return { page: 'privacy' };
  if (path === '/terms') return { page: 'terms' };
  return { page: '404' };
};
const SITE_DESC =
  'Jayastra is an independent design studio in Jabalpur, India, for brand identity, websites, UI/UX, packaging and 3D product visuals, working with clients worldwide.';
const routeMeta = (r) => {
  if (r.page === 'sector') {
    const sec = sectorBySlug(r.slug);
    if (sec) return [sec.name + ' design & 3D | Jayastra', sec.text];
  }
  if (r.page === 'service') {
    const s = serviceBySlug(r.slug);
    if (s) return [s.name + ' services | Jayastra', s.text];
  }
  if (r.page === 'case') {
    const c = caseBySlug(r.slug);
    if (c) return [c.name + ' · ' + c.services + ' | Jayastra', c.summary];
  }
  if (r.page === 'work')
    return [
      'Case studies | Jayastra',
      'Concept projects across 14 sectors, from brand identity and packaging to product UI and 3D renders.',
    ];
  if (r.page === 'privacy')
    return [
      'Privacy Policy | Jayastra',
      'How Jayastra collects, uses and protects your personal information.',
    ];
  if (r.page === 'terms')
    return [
      'Terms of Use | Jayastra',
      'The terms for using jayastra.com and working with Jayastra.',
    ];
  if (r.page === '404') return ['Page not found | Jayastra', SITE_DESC];
  return ['Jayastra | Brand, digital & 3D design studio in Jabalpur, India', SITE_DESC];
};

// Sections below the hero are built when they come within about 1.5 screens of view, not all at once on
// load, which keeps the first render short on phones. A click on an in-page link (#pricing, #contact, ...)
// or an address with an anchor builds every section first, so the link lands in the right place.
let buildAll = false;
function Later({ children }) {
  const ref = useRef(null);
  const [show, setShow] = useState(
    () => buildAll || !!window.location.hash || !('IntersectionObserver' in window),
  );
  useEffect(() => {
    if (show) return undefined;
    const go = () => setShow(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) go();
      },
      { rootMargin: '150% 0px' },
    );
    io.observe(ref.current);
    window.addEventListener('jy:build-all', go);
    return () => {
      io.disconnect();
      window.removeEventListener('jy:build-all', go);
    };
  }, [show]);
  return show ? children : <div ref={ref} className="later" data-later="" aria-hidden="true" />;
}

export function App() {
  const reduce = reducedNow();
  const [loc, setLoc] = useState(routeOf);
  const route = parseRoute(loc);
  const hash = loc.anchor;
  // the intro plays on every load of the home page; moving to home from another page of the site doesn't reload, so it doesn't replay
  const [loading, setLoading] = useState(() => !reduce && route.page === 'home');
  // no preloader means nothing will call done(), so the hero must be shown straight away
  const [ready, setReady] = useState(!loading);
  useEffect(() => {
    const on = () => setLoc(routeOf());
    window.addEventListener('hashchange', on);
    window.addEventListener('popstate', on);
    window.addEventListener('jy:route', on);
    // internal navigation: real URLs (path mode) and section links from inner pages
    const onNav = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      const isHome = !!document.getElementById('top');
      if (ROUTING === 'path' && href.charAt(0) === '/' && href.charAt(1) !== '/') {
        e.preventDefault();
        if (href !== window.location.pathname + window.location.hash)
          window.history.pushState({}, '', href);
        window.dispatchEvent(new Event('jy:route'));
        return;
      }
      if (href.charAt(0) === '#' && href.charAt(1) !== '/' && !isHome) {
        let el = null;
        try {
          el = href === '#top' ? null : document.querySelector(href);
        } catch (er) {
          el = null;
        }
        if (el) return;
        e.preventDefault();
        if (ROUTING === 'path') {
          window.history.pushState({}, '', '/' + (href === '#top' ? '' : href));
          window.dispatchEvent(new Event('jy:route'));
        } else {
          window.location.hash = href === '#top' ? '' : href;
        }
      }
    };
    document.addEventListener('click', onNav);
    // build the sections that are still placeholders before an in-page link scrolls to its target
    const buildFirst = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').indexOf('#/') === 0) return;
      if (!document.querySelector('[data-later]')) return;
      buildAll = true;
      ReactDOM.flushSync(() => window.dispatchEvent(new Event('jy:build-all')));
      // the smooth scroller still has the old, shorter page height; measure again before it scrolls
      if (window.__lenis) window.__lenis.resize();
    };
    document.addEventListener('click', buildFirst, true);
    // swap blocked remote photos for local ones
    const onErr = (e) => {
      const t = e.target;
      if (!t || t.tagName !== 'IMG' || t.dataset.fb || t.src.indexOf('images.unsplash.com') < 0)
        return;
      t.dataset.fb = '1';
      const m = t.src.match(/photo-([\w-]+)/);
      const k = m && FB_BY_ID[m[1]];
      if (k) t.src = localImg(k);
    };
    document.addEventListener('error', onErr, true);
    return () => {
      window.removeEventListener('hashchange', on);
      window.removeEventListener('popstate', on);
      window.removeEventListener('jy:route', on);
      document.removeEventListener('click', onNav);
      document.removeEventListener('click', buildFirst, true);
      document.removeEventListener('error', onErr, true);
    };
  }, []);
  const pageKey = route.page + (route.slug || '') + '|' + (route.anchor || '');
  useEffect(() => {
    const [t, d] = routeMeta(route);
    document.title = t;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', d);
  }, [pageKey]);
  useEffect(() => {
    const l = window.__lenis;
    const anchor = route.anchor || null;
    if (route.page !== 'home' || !anchor) {
      if (l) l.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    }
    if (anchor) {
      // the home page is still laying out (images, lazy sections), so keep correcting until it settles
      let stop = false;
      const halt = () => {
        stop = true;
      };
      window.addEventListener('wheel', halt, { passive: true });
      window.addEventListener('touchstart', halt, { passive: true });
      window.addEventListener('keydown', halt);
      const go = () => {
        if (stop) return;
        let el = null;
        try {
          el = document.querySelector(anchor);
        } catch (e) {
          el = null;
        }
        if (!el) return;
        const off = el.getBoundingClientRect().top - 72;
        if (Math.abs(off) < 3) return;
        const y = window.scrollY + off;
        if (l) l.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
      };
      const ts = [60, 250, 600, 1100, 1800, 2600].map((ms) => setTimeout(go, ms));
      return () => {
        ts.forEach(clearTimeout);
        window.removeEventListener('wheel', halt);
        window.removeEventListener('touchstart', halt);
        window.removeEventListener('keydown', halt);
      };
    }
    return undefined;
  }, [pageKey]);
  useEffect(() => {
    const b = document.getElementById('boot');
    if (b) b.remove();
  }, []);
  useEffect(() => {
    const L = window.Lenis;
    if (!L || reducedNow()) return undefined;
    const lenis = new L({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    window.__lenis = lenis;
    let id = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      id = requestAnimationFrame(loop);
    });
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href.indexOf('#/') === 0) return;
      if (!document.getElementById('top') && href.length > 1) {
        let ok = null;
        try {
          ok = document.querySelector(href);
        } catch (er) {
          return;
        }
        if (!ok) return;
      }
      let target = null;
      try {
        target =
          href === '#top'
            ? document.getElementById('top')
              ? 0
              : null
            : document.querySelector(href);
      } catch (er) {
        return;
      }
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: href === '#top' ? 0 : -72, duration: 1.4 });
    };
    document.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('click', onClick);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', loading);
    const l = window.__lenis;
    if (l) {
      if (loading) l.stop();
      else l.start();
    }
  }, [loading]);
  const reveal = useCallback(() => setReady(true), []);
  const done = useCallback(() => {
    setReady(true);
    setLoading(false);
  }, []);
  return (
    <>
      {loading ? <Preloader onReveal={reveal} onDone={done} /> : null}
      <Header ready={ready} />
      {route.page === 'sector' ? <SectorPage key={pageKey} slug={route.slug} /> : null}
      {route.page === 'service' ? <ServicePage key={pageKey} slug={route.slug} /> : null}
      {route.page === 'case' ? <CasePage key={pageKey} slug={route.slug} /> : null}
      {route.page === 'work' ? <WorkIndex /> : null}
      {route.page === 'privacy' ? <PrivacyPage /> : null}
      {route.page === 'terms' ? <TermsPage /> : null}
      {route.page === '404' ? <NotFound /> : null}
      {route.page === 'home' ? (
        <main id="main">
          <Hero ready={ready} />
          <Later>
            <Statement />
          </Later>
          <Later>
            <Work />
          </Later>
          <Later>
            <Services />
          </Later>
          <Later>
            <CaseStudies />
          </Later>
          <Later>
            <Process />
          </Later>
          <Later>
            <Mark3D />
          </Later>
          <Later>
            <Stats />
          </Later>
          <Later>
            <Advantage />
          </Later>
          <Later>
            <Testimonials />
          </Later>
          <Later>
            <Pricing />
          </Later>
          <Later>
            <FAQ />
          </Later>
          <Later>
            <Contact />
          </Later>
        </main>
      ) : route.page === 'privacy' || route.page === 'terms' || route.page === '404' ? null : (
        <Later>
          <Contact />
        </Later>
      )}
      <Later>
        <Footer />
      </Later>
    </>
  );
}
