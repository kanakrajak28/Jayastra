/* Jayastra — studio site
   React 18 + Framer Motion 12, loaded as UMD globals (React, ReactDOM, Motion).
   Authored in JSX and compiled to plain React.createElement calls for the page. */

const { useState, useEffect, useRef, useCallback, useMemo } = React;
const TAU = Math.PI * 2;
/* Logos are embedded in the page so they always load; the files are a fallback. */
const LOGO_LIGHT = (typeof window !== 'undefined' && window.__LOGO_LIGHT) || 'logo.png';
const LOGO_DARK = (typeof window !== 'undefined' && window.__LOGO_DARK) || 'logo-dark.png';
const ASSET = (typeof window !== 'undefined' && window.__ASSET_BASE) || '';
const ROUTING = (typeof window !== 'undefined' && window.__ROUTING) || 'hash';
const to = (p) => (ROUTING === 'path' ? p : '#' + p);
/* Extra photos served by Unsplash's image CDN on the live site; each falls back to a local photo if blocked. */
const REMOTE = { re1: '1738168246881-40f35f8aba0a', re2: '1675754965318-5d31291657d4', re3: '1580587771525-78b9dba3b914', re4: '1616594039964-ae9021a400a0', re5: '1479839672679-a46483c0e7c8',
  mf1: '1717386255773-1e3037c81788', mf2: '1647427060118-4911c9821b82', mf3: '1578776349090-de61da00ff1a', mf4: '1606337321936-02d1b1a4d5ef', mf5: '1631270314738-e6f6827f8d9f',
  jw1: '1622398925373-3f91b1e275f5', jw2: '1611107683227-e9060eccd846', jw3: '1640292343595-889db1c8262e', jw4: '1573612664822-d7d347da7b80', jw5: '1557777586-f6682739fcf3',
  tr1: '1671683886944-6478e6c84cbc', tr2: '1577971132997-c10be9372519', tr3: '1537616930345-1d330ad3e0a9', tr4: '1618773928121-c32242e63f39',
  ev1: '1516617442634-75371039cb3a', ev2: '1540575467063-178a50c2df87', ev3: '1712903276879-9de15f1b9e81', ev4: '1610173827043-9db50e0d8ef9',
  fd1: '1608198093002-ad4e005484ec', fd2: '1524350876685-274059332603', hc1: '1704455306251-b4634215d98f', hc2: '1514733670139-4d87a1941d55',
  ed1: '1571260899304-425eee4c7efc', ed2: '1501504905252-473c47e087f8', st1: '1531403009284-440f080d1e12', gm1: '1612287230202-1ff1d85d1bdf', gm2: '1657208431551-cbf415b8ef26', br1: '1602678460152-719a9af1fb6c' };
const REMOTE_FB = { re: 's_realestate', mf: 's_industrial', jw: 's_jewellery', tr: 's_tourism', ev: 's_events', fd: 's_food', hc: 's_health', ed: 's_edu', st: 's_startup', gm: 's_gaming', br: 'brand' };
/* Higher-resolution originals of local photos, for full-width heroes. */
const HI = { s_realestate: '1602872029708-84d970d3382b', s_industrial: '1735494033576-9c882e80504c', s_jewellery: '1722410180687-b05b50922362', s_food: '1747160262337-68a64efb183c', s_health: '1666887360388-93e684b6474a',
  s_edu: '1638957835514-224c57ffe617', s_startup: '1521737711867-e3b97375f902', s_tourism: '1647250945832-5b5aa0f6366e', s_gaming: '1608403890614-ec62cb35b46e', s_events: '1769812343353-ae6ca1250bc2',
  i0a: '1617825295690-28ae56c56135', i1b: '1460925895917-afdab827c52f', i2b: '1760386128692-81476422e599', i3a: '1567880905822-56f8e06fe630' };
const FB_BY_ID = {};
Object.keys(REMOTE).forEach((k) => { FB_BY_ID[REMOTE[k]] = REMOTE_FB[k.replace(/\d+$/, '')]; });
Object.keys(HI).forEach((k) => { FB_BY_ID[HI[k]] = k; });
const unsplash = (id, w, h) => 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + w + '&h=' + h + '&q=70';
const localImg = (k) => ASSET + 'img/' + k + '.webp';
const img = (k) => (REMOTE[k] ? unsplash(REMOTE[k], 900, 675) : localImg(k));
const imgHi = (k) => (ROUTING === 'path' && HI[k] ? unsplash(HI[k], 1920, 1200) : (REMOTE[k] ? unsplash(REMOTE[k], 1600, 1000) : localImg(k)));
const EASE = [0.2, 0.75, 0.15, 1];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mq = (q) => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(q).matches;
const isFine = () => mq('(hover: hover) and (pointer: fine)');
const reducedNow = () => mq('(prefers-reduced-motion: reduce)');

/* ======================================================================
   Motion layer. Uses Framer Motion when it loads; otherwise a small static
   stand-in keeps every section rendering (no animation, same layout).
   ====================================================================== */
const FM = window.Motion && window.Motion.motion ? window.Motion : null;
if (!FM) console.warn('[Jayastra] Framer Motion did not load; rendering without animation.');

const isMV = (x) => !!x && typeof x === 'object' && typeof x.get === 'function' && typeof x.on === 'function';
function makeMV(init) {
  let v = init;
  const subs = new Set();
  return { get: () => v, set: (n) => { v = n; subs.forEach((f) => f(n)); }, on: (_e, f) => { subs.add(f); return () => subs.delete(f); }, stop() {} };
}
function hex(s) {
  if (typeof s !== 'string' || s[0] !== '#' || s.length !== 7) return null;
  return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
}
function interp(v, inR, outR) {
  const n = inR.length;
  if (n < 2) return outR[0];
  const asc = inR[n - 1] >= inR[0];
  let seg = n - 2;
  for (let k = 0; k < n - 1; k++) { if (asc ? v <= inR[k + 1] : v >= inR[k + 1]) { seg = k; break; } }
  const a = inR[seg], b = inR[seg + 1];
  const p = clamp(b === a ? 1 : (v - a) / (b - a), 0, 1);
  const A = outR[seg], B = outR[seg + 1];
  if (typeof A === 'number') return A + (B - A) * p;
  const ca = hex(A), cb = hex(B);
  if (ca && cb) return '#' + ca.map((c, j) => Math.round(c + (cb[j] - c) * p).toString(16).padStart(2, '0')).join('');
  const na = parseFloat(A), nb = parseFloat(B);
  if (!isNaN(na) && !isNaN(nb)) return na + (nb - na) * p + String(A).replace(/^[-\d.]+/, '');
  return p < 0.5 ? A : B;
}
const MOTION_KEYS = new Set(['initial', 'animate', 'exit', 'whileHover', 'whileTap', 'whileInView', 'whileFocus', 'whileDrag', 'viewport', 'transition', 'variants', 'layout', 'layoutId', 'drag', 'dragConstraints', 'dragElastic', 'dragMomentum', 'onAnimationComplete', 'onAnimationStart', 'onHoverStart', 'onHoverEnd', 'onViewportEnter', 'onViewportLeave', 'custom', 'transformTemplate']);
const TF = ['x', 'y', 'z', 'scale', 'scaleX', 'scaleY', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY', 'transformPerspective'];
function staticStyle(style, target) {
  const out = {}, t = {};
  const merged = Object.assign({}, style || {}, target && typeof target === 'object' && !Array.isArray(target) ? target : {});
  Object.keys(merged).forEach((k) => {
    let v = merged[k];
    if (isMV(v)) v = v.get();
    if (Array.isArray(v)) v = v[v.length - 1];
    if (TF.indexOf(k) >= 0) t[k] = v; else out[k] = v;
  });
  const px = (v) => (typeof v === 'number' ? v + 'px' : v);
  const deg = (v) => (typeof v === 'number' ? v + 'deg' : v);
  const parts = [];
  if (t.transformPerspective != null) parts.push('perspective(' + px(t.transformPerspective) + ')');
  if (t.x != null || t.y != null || t.z != null) parts.push('translate3d(' + px(t.x || 0) + ',' + px(t.y || 0) + ',' + px(t.z || 0) + ')');
  if (t.scale != null) parts.push('scale(' + t.scale + ')');
  if (t.scaleX != null) parts.push('scaleX(' + t.scaleX + ')');
  if (t.scaleY != null) parts.push('scaleY(' + t.scaleY + ')');
  ['rotate', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY'].forEach((k) => { if (t[k] != null) parts.push(k + '(' + deg(t[k]) + ')'); });
  if (parts.length) out.transform = parts.join(' ');
  return out;
}
const fbCache = {};
function fbMotion(tag) {
  if (fbCache[tag]) return fbCache[tag];
  const C = React.forwardRef(function StaticMotion(props, ref) {
    const [, force] = useState(0);
    const style = props.style || {};
    useEffect(() => {
      const offs = Object.keys(style).map((k) => style[k]).filter(isMV).map((m) => m.on('change', () => force((n) => n + 1)));
      return () => offs.forEach((o) => o && o());
    });
    const rest = {};
    Object.keys(props).forEach((k) => { if (!MOTION_KEYS.has(k)) rest[k] = props[k]; });
    const target = typeof props.animate === 'object' ? props.animate : typeof props.whileInView === 'object' ? props.whileInView : null;
    rest.style = staticStyle(style, target);
    rest.ref = ref;
    return React.createElement(tag, rest);
  });
  fbCache[tag] = C;
  return C;
}
function fbUseMotionValue(v) { const r = useRef(null); if (!r.current) r.current = makeMV(v); return r.current; }
const FB = {
  motion: new Proxy({}, { get: (_t, tag) => fbMotion(tag) }),
  AnimatePresence: ({ children }) => children,
  useMotionValue: fbUseMotionValue,
  useSpring: (src) => {
    const own = fbUseMotionValue(isMV(src) ? src.get() : src);
    useEffect(() => (isMV(src) ? src.on('change', (v) => own.set(v)) : undefined), [src]);
    return own;
  },
  useTransform: (input, a, b) => {
    const compute = (v) => (typeof a === 'function' ? a(v) : interp(v, a, b));
    const out = fbUseMotionValue(compute(input.get()));
    useEffect(() => input.on('change', (v) => out.set(compute(v))), [input]);
    return out;
  },
  useScroll: (opts) => {
    const o = opts || {};
    const prog = fbUseMotionValue(0);
    const sy = fbUseMotionValue(0);
    useEffect(() => {
      const edge = (s) => { const [te, ve] = String(s).split(' '); const m = (x) => (x === 'start' ? 0 : x === 'center' ? 0.5 : x === 'end' ? 1 : parseFloat(x)); return [m(te), m(ve)]; };
      const offs = (o.offset || ['start end', 'end start']).map(edge);
      const on = () => {
        sy.set(window.scrollY);
        const el = o.target && o.target.current;
        if (!el) { const max = document.documentElement.scrollHeight - window.innerHeight; prog.set(max > 0 ? window.scrollY / max : 0); return; }
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY, vh = window.innerHeight;
        const s0 = top + offs[0][0] * r.height - offs[0][1] * vh;
        const s1 = top + offs[1][0] * r.height - offs[1][1] * vh;
        prog.set(clamp((window.scrollY - s0) / (s1 - s0 || 1), 0, 1));
      };
      on();
      window.addEventListener('scroll', on, { passive: true });
      window.addEventListener('resize', on);
      return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
    }, []);
    return { scrollYProgress: prog, scrollY: sy };
  },
  useInView: (ref, opts) => {
    const o = opts || {};
    const [v, setV] = useState(false);
    useEffect(() => {
      const el = ref.current;
      if (!el || !('IntersectionObserver' in window)) { setV(true); return undefined; }
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { setV(true); if (o.once) io.disconnect(); } else if (!o.once) setV(false);
      }, { threshold: typeof o.amount === 'number' ? o.amount : 0 });
      io.observe(el);
      return () => io.disconnect();
    }, []);
    return v;
  },
  animate: (target, to, opts) => {
    const o = opts || {};
    const fin = Array.isArray(to) ? to[to.length - 1] : to;
    if (isMV(target)) target.set(fin); else if (typeof target === 'number' && o.onUpdate) o.onUpdate(fin);
    if (o.onComplete) o.onComplete();
    return { stop() {}, then(f) { if (f) f(); return Promise.resolve(); } };
  },
  useAnimationFrame: (cb) => {
    const ref = useRef(cb);
    ref.current = cb;
    useEffect(() => {
      let id = 0; const start = performance.now(); let last = start;
      const loop = (now) => { ref.current(now - start, now - last); last = now; id = requestAnimationFrame(loop); };
      id = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(id);
    }, []);
  },
  useReducedMotion: () => reducedNow(),
};
const M = FM || FB;
const motion = M.motion;
const AnimatePresence = M.AnimatePresence;
const useMotionValue = M.useMotionValue;
const useSpring = M.useSpring;
const useTransform = M.useTransform;
const useScroll = M.useScroll;
const useInView = M.useInView;
const animate = M.animate;
const useAnimationFrame = M.useAnimationFrame;
const useReducedMotion = M.useReducedMotion;

/* ======================================================================
   Shared bits
   ====================================================================== */
function Arrow({ dir = 'ne', className = 'arr' }) {
  const rot = { ne: 0, e: 45, se: 90, s: 135, sw: 180, w: 225, nw: 270, n: -45 }[dir] || 0;
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" style={{ transform: 'rotate(' + rot + 'deg)' }}>
      <path d="M4 12L12 4M12 4H6M12 4v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Spark() {
  return (
    <svg className="spark" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 0c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10C5.4 9.4 9.4 5.4 10 0z" fill="currentColor" />
    </svg>
  );
}
function Reveal({ as = 'div', children, delay = 0, y = 36, amount = 0.2, ...rest }) {
  const reduce = useReducedMotion();
  if (reduce) return React.createElement(as, rest, children);
  const Tag = motion[as];
  return (
    <Tag initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }} {...rest}>
      {children}
    </Tag>
  );
}
const dot = (t) => t;
function SectionHead({ eyebrow, title, aside }) {
  return (
    <div className="shead">
      <div className="shead-main">
        <Reveal as="p" className="eyebrow">{eyebrow}</Reveal>
        <Reveal as="h2" className="h2" delay={0.06}>{dot(title)}</Reveal>
      </div>
      {aside ? <Reveal as="p" className="shead-aside" delay={0.12}>{aside}</Reveal> : null}
    </div>
  );
}
function MagLink({ href, className, children, strength = 0.28, ...rest }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.6 });
  const onMove = (e) => {
    if (!isFine() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength * 1.2);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.a ref={ref} href={href} className={className} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave} whileTap={{ scale: 0.97 }} {...rest}>
      {children}
    </motion.a>
  );
}
function useOnScreen(ref, margin) {
  const flag = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { flag.current = true; return undefined; }
    const io = new IntersectionObserver(([e]) => { flag.current = e.isIntersecting; }, { rootMargin: margin || '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return flag;
}

/* Eye-follow button: two pupils track the pointer, with a slow blink. */
function EyeButton({ href, children, dark }) {
  const eyesRef = useRef(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 320, damping: 24 });
  const sy = useSpring(py, { stiffness: 320, damping: 24 });
  useEffect(() => {
    const move = (e) => {
      const el = eyesRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const a = Math.atan2(dy, dx);
      const d = Math.min(1, Math.hypot(dx, dy) / 220);
      px.set(Math.cos(a) * 3.6 * d);
      py.set(Math.sin(a) * 3.6 * d);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  const blink = reduce ? {} : { scaleY: [1, 1, 0.12, 1] };
  const blinkT = { duration: 4.4, times: [0, 0.93, 0.965, 1], repeat: Infinity, ease: 'easeInOut' };
  return (
    <a href={href} className={'eyebtn' + (dark ? ' dark' : '')}>
      <span className="eyes" ref={eyesRef} aria-hidden="true">
        <motion.span className="eye" animate={blink} transition={blinkT}><motion.i style={{ x: sx, y: sy }} /></motion.span>
        <motion.span className="eye" animate={blink} transition={blinkT}><motion.i style={{ x: sx, y: sy }} /></motion.span>
      </span>
      <span>{children}</span>
    </a>
  );
}

/* ======================================================================
   Preloader — "hello" in eleven languages, about three seconds.
   ====================================================================== */
const HELLOS = [
  ['Hello', 'en'], ['नमस्ते', 'hi'], ['ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'pa'], ['Bonjour', 'fr'], ['Hola', 'es'], ['Ciao', 'it'],
  ['こんにちは', 'ja'], ['Olá', 'pt'], ['Hallo', 'de'], ['مرحبا', 'ar'], ['안녕하세요', 'ko'],
];
function Preloader({ onReveal, onDone }) {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [vp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const left = useRef(false);
  const leave = useCallback(() => {
    if (left.current) return;
    left.current = true;
    setLeaving(true);
    setTimeout(onReveal, 240);
    setTimeout(onDone, 1150);
  }, [onReveal, onDone]);
  useEffect(() => {
    const timers = [];
    let t = 280;
    for (let k = 1; k < HELLOS.length; k++) { const n = k; timers.push(setTimeout(() => setI(n), t)); t += 125; }
    timers.push(setTimeout(leave, t + 20));
    const onKey = () => leave();
    window.addEventListener('keydown', onKey);
    return () => { timers.forEach(clearTimeout); window.removeEventListener('keydown', onKey); };
  }, [leave]);
  const curve = Math.min(240, vp.h * 0.28);
  const from = 'M0 0 L' + vp.w + ' 0 L' + vp.w + ' ' + vp.h + ' Q' + vp.w / 2 + ' ' + (vp.h + curve) + ' 0 ' + vp.h + ' L0 0Z';
  const to = 'M0 0 L' + vp.w + ' 0 L' + vp.w + ' ' + vp.h + ' Q' + vp.w / 2 + ' ' + vp.h + ' 0 ' + vp.h + ' L0 0Z';
  const ease = [0.76, 0, 0.24, 1];
  const [word, lang] = HELLOS[i];
  return (
    <motion.div className="loader" onClick={leave} role="status" aria-label="Loading Jayastra"
      initial={{ y: 0 }} animate={leaving ? { y: -(vp.h + curve) } : { y: 0 }} transition={{ duration: 0.82, ease }}
      onAnimationComplete={() => { if (left.current) onDone(); }}>
      <svg width={vp.w} height={vp.h + curve} aria-hidden="true">
        <motion.path fill="#09090B" d={leaving ? to : from} initial={{ d: from }} animate={{ d: leaving ? to : from }} transition={{ duration: 0.82, ease }} />
      </svg>
      <div className="loader-words" aria-hidden="true">
        <div className="hello-mask">
          <AnimatePresence initial={false}>
            <motion.span key={i} className="hello" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}
              initial={{ y: '75%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-75%', opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.3, 0, 0.2, 1] }}>
              <i className="hello-dot" />{word}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <motion.span className="loader-skip" animate={{ opacity: leaving ? 0 : 1 }}>Click to skip</motion.span>
    </motion.div>
  );
}

/* ======================================================================
   Header
   ====================================================================== */
const NAV = [['Work', '#work'], ['Services', '#services'], ['Industries', '#industries'], ['Case studies', '#case-studies'], ['Process', '#process'], ['Pricing', '#pricing'], ['FAQ', '#faq']];
function Header({ ready }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => {
      const hero = document.querySelector('#top, .ip-hero');
      const past = hero ? window.scrollY > hero.offsetHeight - 80 : true;
      let dark = false;
      document.querySelectorAll('.inds-dark').forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < 60 && r.bottom > 40) dark = true; });
      setSolid(past && !dark);
    };
    on();
    const onHash = () => setTimeout(on, 120);
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    window.addEventListener('hashchange', onHash);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); window.removeEventListener('hashchange', onHash); };
  }, []);
  return (
    <motion.header className={'hdr' + (solid || open ? ' solid' : '') + (solid || open ? '' : ' on-dark')}
      initial={{ y: -20, opacity: 0 }} animate={ready ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}>
      <div className="wrap hdr-in">
        <a href="#top" className="brand" aria-label="Jayastra, back to top">
          <img className="light" src={LOGO_LIGHT} alt="" />
          <img className="dark" src={LOGO_DARK} alt="" />
        </a>
        <nav className="nav" aria-label="Main">
          {NAV.map(([l, h]) => <a key={h} href={h}>{l}</a>)}
        </nav>
        <MagLink href="#contact" className="btn btn-brand hdr-cta">Let's talk</MagLink>
        <button className="menu-btn" aria-expanded={open} aria-controls="mmenu" onClick={() => setOpen((o) => !o)}>
          <span /><span /><span className="sr">Menu</span>
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav id="mmenu" className="mmenu" aria-label="Mobile" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
            {NAV.concat([['Contact', '#contact']]).map(([l, h], k) => (
              <motion.a key={h} href={h} onClick={() => setOpen(false)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * k, duration: 0.4, ease: EASE }}>{l}</motion.a>
            ))}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

/* ======================================================================
   Hero — ember light shader (WebGL) behind the headline
   ====================================================================== */
const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = [
  'precision highp float;',
  'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;',
  'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
  'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
  ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
  'float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}',
  'void main(){',
  ' vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;',
  ' vec2 p=vec2((uv.x-.5)*asp,uv.y-.5);float t=uTime;',
  ' vec2 src=vec2((.22+(uMouse.x-.5)*.35)*asp,.78+(uMouse.y-.5)*.08);',
  ' vec2 d=p-src;float ang=atan(d.x,-d.y);float dist=length(d);',
  ' float shafts=fbm(vec2(ang*7.+3.,t*.09));',
  ' shafts=smoothstep(.38,.9,shafts)*.9+.1*fbm(vec2(ang*22.,t*.2));',
  ' float cone=smoothstep(1.25,.05,abs(ang+.18));',
  ' float fall=exp(-dist*1.05);',
  ' float beam=shafts*cone*fall;',
  ' vec2 cp=p*2.8+vec2(t*.035,-t*.05);',
  ' cp+=vec2(fbm(p*1.5+t*.04),fbm(p*1.5-t*.03))*.8;',
  ' float rid=1.-abs(fbm(cp)*2.-1.);',
  ' float shim=pow(rid,16.)*(.25+.75*cone)*fall;',
  ' float w=fbm(p*1.4+vec2(t*.02,-t*.015)+fbm(p*2.1-t*.02)*1.3);',
  ' vec3 base=vec3(.030,.029,.036);vec3 deep=vec3(.17,.052,.018);',
  ' vec3 ember=vec3(.86,.31,.02);vec3 hi=vec3(1.,.76,.52);',
  ' vec3 col=base;',
  ' col=mix(col,deep,smoothstep(.32,.86,w)*(.35+.65*fall));',
  ' col+=ember*beam*.95;',
  ' col+=hi*pow(beam,2.6)*.7;',
  ' col+=mix(ember,hi,.4)*shim*.42;',
  ' float vig=smoothstep(1.5,.25,length(p*vec2(.75,1.)));',
  ' col*=.45+.55*vig;',
  ' col+=(hash(gl_FragCoord.xy+fract(t)*91.7)-.5)*.028;',
  ' gl_FragColor=vec4(max(col,0.),1.);',
  '}',
].join('\n');

function HeroLight() {
  const ref = useRef(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    let gl = null;
    try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false }); } catch (e) { gl = null; }
    if (!gl) { setFallback(true); return undefined; }
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setFallback(true); return undefined; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFallback(true); return undefined; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');
    const reduce = reducedNow();
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let raf = 0, visible = true;
    const start = performance.now();
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * (r.width < 760 ? 0.6 : 0.75);
      canvas.width = Math.max(2, Math.round(r.width * scale));
      canvas.height = Math.max(2, Math.round(r.height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (reduce) draw(performance.now());
    };
    const draw = (now) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduce ? 14 : (now - start) / 1000 + 6);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now) => { raf = requestAnimationFrame(loop); if (visible) draw(now); };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = clamp((e.clientX - r.left) / r.width, 0, 1);
      mouse.ty = clamp(1 - (e.clientY - r.top) / r.height, 0, 1);
    };
    const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(canvas); else window.addEventListener('resize', resize);
    resize();
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }) : null;
    if (io) io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    if (reduce) draw(performance.now()); else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
      if (io) io.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, []);
  return fallback ? <div className="hero-fallback" aria-hidden="true" /> : <canvas ref={ref} className="hero-gl" aria-hidden="true" />;
}

function Hero({ ready }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const lines = [<>Design that earns</>, <>attention, in</>, <>2D and <em>3D</em>.</>];
  const show = (d) => ({ initial: { opacity: 0, y: 16 }, animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }, transition: { duration: 0.9, ease: EASE, delay: d } });
  return (
    <section id="top" className="hero on-dark" ref={ref}>
      <HeroLight />
      <div className="hero-veil" />
      <motion.div className="wrap hero-inner" style={{ y: yText, opacity: fade }}>
        <div className="hero-top">
          <motion.p className="eyebrow light" {...show(0.1)}>Independent design studio, Jabalpur</motion.p>
          <motion.p className="hero-slot" {...show(0.18)}><span className="pulse" />Now taking on new projects</motion.p>
        </div>
        <h1 className="hero-h1">
          {lines.map((l, k) => (
            <span className="line" key={k}>
              <motion.span initial={{ y: '112%' }} animate={ready ? { y: '0%' } : { y: '112%' }} transition={{ duration: 1.1, ease: EASE, delay: 0.08 + k * 0.09 }}>{l}</motion.span>
            </span>
          ))}
        </h1>
        <div className="hero-foot">
          <motion.p className="hero-lede" {...show(0.5)}>
            Jayastra is an independent studio for brand identity, digital product and 3D visuals. Five years of craft, one accountable team, and no hand-offs between agencies.
          </motion.p>
          <motion.div className="hero-ctas" {...show(0.62)}>
            <MagLink href="#contact" className="btn btn-brand btn-lg">Start a project <Arrow /></MagLink>
            <a href="#work" className="hero-link">See the work <Arrow /></a>
          </motion.div>
        </div>
      </motion.div>
      <motion.div className="hero-base" {...show(0.8)}>
        <div className="wrap">
          <span className="hero-disc"><span>Brand identity</span><span>Product &amp; web</span><span>3D &amp; motion</span></span>
          <span className="scrollcue">Scroll<i /></span>
        </div>
      </motion.div>
    </section>
  );
}

/* ======================================================================
   Marquee + statement
   ====================================================================== */
const MARQUEE = ['Brand identity', '3D product rendering', 'UI / UX', 'Packaging', 'Motion design', 'Websites', 'Pitch decks', 'Social systems'];
function Marquee() {
  const reduce = useReducedMotion();
  const row = MARQUEE.concat(MARQUEE);
  return (
    <div className="marq" aria-hidden="true">
      <motion.div className="marq-row" animate={reduce ? { x: '0%' } : { x: ['0%', '-50%'] }} transition={{ duration: 42, ease: 'linear', repeat: Infinity }}>
        {row.map((w, i) => <span className="marq-item" key={i}>{w}<Spark /></span>)}
      </motion.div>
    </div>
  );
}

const STATEMENT = 'Jayastra is a small studio with senior hands. We design the brand, build the interface and render the product in-house, so everything you launch looks like it came from *one *mind. Because it did.';
function Word({ children, progress, range, em }) {
  const o = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity: o }}>{em ? <em>{children}</em> : children} </motion.span>;
}
function Statement() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.82', 'end 0.42'] });
  const words = STATEMENT.split(' ');
  return (
    <section className="band" aria-labelledby="stmt-h">
      <div className="wrap stmt">
        <div className="stmt-side">
          <Reveal as="p" className="eyebrow" id="stmt-h">The studio</Reveal>
          <Reveal as="ul" className="facts" delay={0.08}>
            <li><span>Practice</span><b>5+ years</b></li>
            <li><span>Base</span><b>Jabalpur, Madhya Pradesh</b></li>
            <li><span>Clients</span><b>India and abroad</b></li>
            <li><span>Tools</span><b>Figma · Blender · Adobe</b></li>
          </Reveal>
        </div>
        <p className="stmt-text" ref={ref}>
          {words.map((w, i) => {
            const em = w.charAt(0) === '*';
            return <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} em={em}>{em ? w.slice(1) : w}</Word>;
          })}
        </p>
      </div>
    </section>
  );
}

/* ======================================================================
   Work — 3D memory album (page-turning photo book)
   ====================================================================== */
function ArtSaffron() {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <rect width="300" height="300" fill="#EDE3D2" />
      <rect y="196" width="300" height="104" fill="#E2D5C0" />
      <ellipse cx="150" cy="238" rx="122" ry="12" fill="#BFAF95" opacity=".6" />
      <rect x="66" y="96" width="76" height="140" rx="10" fill="#B9531C" />
      <rect x="66" y="132" width="76" height="52" fill="#F4ECDD" />
      <text x="104" y="163" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="700" fontSize="15" fill="#B9531C">{'S&Co'}</text>
      <rect x="76" y="82" width="56" height="18" rx="5" fill="#8A3B12" />
      <rect x="156" y="128" width="64" height="108" rx="9" fill="#2F3A33" />
      <rect x="156" y="156" width="64" height="38" fill="#EDE3D2" />
      <rect x="166" y="118" width="44" height="14" rx="4" fill="#1C241F" />
      <circle cx="246" cy="214" r="26" fill="#D9C7A6" />
      <circle cx="246" cy="214" r="13" fill="#B9531C" opacity=".55" />
    </svg>
  );
}
function ArtNorthbrook() {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <rect width="300" height="300" fill="#E8EDF6" />
      <rect x="30" y="44" width="240" height="212" rx="12" fill="#fff" />
      <path d="M42 44h216a12 12 0 0 1 12 12v16H30V56a12 12 0 0 1 12-12z" fill="#D6DDEC" />
      <circle cx="46" cy="58" r="4" fill="#A9B3CC" /><circle cx="60" cy="58" r="4" fill="#A9B3CC" /><circle cx="74" cy="58" r="4" fill="#A9B3CC" />
      <rect x="44" y="86" width="62" height="156" rx="8" fill="#F1F4FA" />
      <rect x="54" y="100" width="42" height="7" rx="3.5" fill="#C3CBDF" /><rect x="54" y="116" width="32" height="7" rx="3.5" fill="#C3CBDF" /><rect x="54" y="132" width="38" height="7" rx="3.5" fill="#C3CBDF" />
      <rect x="116" y="86" width="70" height="56" rx="8" fill="#C94B00" />
      <rect x="126" y="100" width="34" height="6" rx="3" fill="#fff" opacity=".7" /><rect x="126" y="114" width="46" height="14" rx="4" fill="#fff" />
      <rect x="194" y="86" width="62" height="56" rx="8" fill="#DDE3F2" />
      <rect x="116" y="152" width="140" height="90" rx="8" fill="#F1F4FA" />
      <polyline points="128,224 154,202 176,212 202,180 228,192 246,168" fill="none" stroke="#1F2533" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="246" cy="168" r="5" fill="#C94B00" />
    </svg>
  );
}
function ArtLumen() {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <defs>
        <radialGradient id="lumenCup" cx="36%" cy="30%" r="76%"><stop offset="0" stopColor="#7A808C" /><stop offset="1" stopColor="#1C1F25" /></radialGradient>
        <radialGradient id="lumenBg" cx="50%" cy="36%" r="72%"><stop offset="0" stopColor="#2C2E35" /><stop offset="1" stopColor="#111216" /></radialGradient>
      </defs>
      <rect width="300" height="300" fill="url(#lumenBg)" />
      <ellipse cx="150" cy="246" rx="104" ry="14" fill="#000" opacity=".55" />
      <path d="M78 170 A72 72 0 0 1 222 170" fill="none" stroke="#454A55" strokeWidth="16" strokeLinecap="round" />
      <path d="M80 164 A70 70 0 0 1 220 164" fill="none" stroke="#9BA1AE" strokeWidth="4" strokeLinecap="round" opacity=".55" />
      <rect x="56" y="158" width="50" height="80" rx="22" fill="url(#lumenCup)" />
      <rect x="194" y="158" width="50" height="80" rx="22" fill="url(#lumenCup)" />
      <ellipse cx="81" cy="198" rx="13" ry="25" fill="#24272E" /><ellipse cx="219" cy="198" rx="13" ry="25" fill="#24272E" />
      <circle cx="219" cy="198" r="5.5" fill="#EE6A14" />
    </svg>
  );
}
function ArtVeda() {
  const T = 72, G = 9, O = 34;
  const at = (c, r) => ({ x: O + c * (T + G), y: O + r * (T + G) });
  const fills = [['#2F6B4F', 'w1', '#B8CFC2'], ['w2', '#9CBDA9', 'w3'], ['#C94B00', '#2F6B4F', '#E9F0EB']];
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <rect width="300" height="300" fill="#E3ECE6" />
      {fills.map((row, r) => row.map((f, c) => {
        const p = at(c, r);
        const fill = f.charAt(0) === '#' ? f : '#FFFFFF';
        return <rect key={r + '-' + c} x={p.x} y={p.y} width={T} height={T} rx="9" fill={fill} />;
      }))}
      <circle cx={at(1, 0).x + 36} cy={at(1, 0).y + 36} r="20" fill="#CFE2D7" />
      <rect x={at(0, 1).x + 12} y={at(0, 1).y + 16} width="44" height="7" rx="3.5" fill="#BBCFC4" />
      <rect x={at(0, 1).x + 12} y={at(0, 1).y + 30} width="32" height="7" rx="3.5" fill="#BBCFC4" />
      <rect x={at(0, 1).x + 12} y={at(0, 1).y + 48} width="48" height="14" rx="7" fill="#2F6B4F" />
      <path d={'M' + (at(2, 1).x + 14) + ' ' + (at(2, 1).y + 60) + ' l18 -28 l14 18 l10 -12 l14 22 z'} fill="#CFE2D7" />
      <rect x={at(0, 2).x + 12} y={at(0, 2).y + 46} width="40" height="8" rx="4" fill="#fff" />
      <circle cx={at(1, 2).x + 36} cy={at(1, 2).y + 36} r="14" fill="#9CBDA9" />
    </svg>
  );
}
function ArtOrbit() {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <rect width="300" height="300" fill="#141519" />
      <rect y="238" width="300" height="62" fill="#1C1E24" />
      <circle cx="80" cy="138" r="40" fill="none" stroke="#30333B" strokeWidth="2" />
      <circle cx="150" cy="138" r="40" fill="none" stroke="#454955" strokeWidth="2" />
      <circle cx="220" cy="138" r="40" fill="none" stroke="#666B78" strokeWidth="2" />
      <path d="M80 106 L106 158 L54 158Z" fill="#2A2D35" />
      <path d="M150 108 L174 156 L126 156Z" fill="#444956" />
      <path d="M220 110 L242 154 L198 154Z" fill="#EE6A14" />
      <text x="34" y="258" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7C8190">00:04:12</text>
      <rect x="34" y="268" width="96" height="5" rx="2.5" fill="#EE6A14" />
      <rect x="130" y="268" width="136" height="5" rx="2.5" fill="#2E3139" />
      <circle cx="130" cy="270.5" r="7" fill="#F3F2EF" />
    </svg>
  );
}
function ArtTilt() {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <rect width="300" height="300" fill="#EFEDE7" />
      <rect x="24" y="58" width="190" height="136" rx="8" fill="#fff" />
      <rect x="40" y="76" width="96" height="11" rx="5.5" fill="#161616" />
      <rect x="40" y="96" width="138" height="6" rx="3" fill="#D6D3CB" /><rect x="40" y="110" width="112" height="6" rx="3" fill="#D6D3CB" />
      <rect x="40" y="148" width="20" height="32" fill="#C9C6BE" /><rect x="68" y="136" width="20" height="44" fill="#C9C6BE" />
      <rect x="96" y="156" width="20" height="24" fill="#C9C6BE" /><rect x="124" y="120" width="20" height="60" fill="#C94B00" />
      <rect x="152" y="140" width="20" height="40" fill="#C9C6BE" />
      <rect x="92" y="114" width="186" height="136" rx="8" fill="#161616" />
      <rect x="110" y="134" width="110" height="11" rx="5.5" fill="#fff" />
      <rect x="110" y="156" width="138" height="6" rx="3" fill="#4A4A47" /><rect x="110" y="170" width="108" height="6" rx="3" fill="#4A4A47" />
      <rect x="110" y="206" width="84" height="26" rx="13" fill="#C94B00" />
    </svg>
  );
}
const PROJECTS = [
  { id: 'saffron', alt: 'Shelves of glass spice jars', name: 'Saffron & Co', services: 'Identity · Packaging', sector: 'Concept brief · Specialty foods', Art: ArtSaffron, tilt: '-1.4deg' },
  { id: 'northbrook', alt: 'An analytics dashboard on a dark screen', name: 'Northbrook', services: 'Product UI · Website', sector: 'Concept brief · Fintech SaaS', Art: ArtNorthbrook, tilt: '1deg' },
  { id: 'lumen', alt: 'Black headphones on a yellow background', name: 'Lumen Audio', services: '3D product rendering', sector: 'Concept brief · Consumer electronics', Art: ArtLumen, tilt: '0.8deg' },
  { id: 'veda', alt: 'An amber dropper bottle on a wooden stand', name: 'Veda Wellness', services: 'Packaging · Social system', sector: 'Concept brief · D2C skincare', Art: ArtVeda, tilt: '-1deg' },
  { id: 'orbit', alt: 'An electric car plugged into a charger', name: 'Orbit Mobility', services: '3D modelling · Animation', sector: 'Concept brief · EV startup', Art: ArtOrbit, tilt: '-0.6deg' },
  { id: 'tilt', alt: 'A team meeting around a long table', name: 'Tilt Capital', services: 'Pitch deck', sector: 'Concept brief · Venture fund', Art: ArtTilt, tilt: '1.2deg' },
];
function PageCover() {
  return (
    <div className="pg pg-cover">
      <div className="pg-cover-frame">
        <span className="pg-k">Vol. 01</span>
        <img className="pg-cover-logo" src={LOGO_LIGHT} alt="Jayastra" draggable="false" />
        <div>
          <p className="pg-cover-t">Selected work</p>
          <span className="pg-k">Tap or drag to open</span>
        </div>
      </div>
    </div>
  );
}
function PageIndex() {
  return (
    <div className="pg pg-index">
      <span className="pg-k">Contents</span>
      <h4>Six projects</h4>
      <ol>
        {PROJECTS.map((p, k) => <li key={p.id}><span>{p.name}</span><i /><span className="pg-k">{String(k + 1).padStart(2, '0')}</span></li>)}
      </ol>
      <p>Brand, product and 3D concept briefs.</p>
    </div>
  );
}
function PageProject({ p, k }) {
  const Art = p.Art;
  const [failed, setFailed] = useState(false);
  return (
    <div className="pg">
      <div className="pg-photo" style={{ '--tilt': p.tilt }}>
        <div className="pg-photo-in">
          <Art />
          {!failed ? (
            <img src={img(p.id)} alt={p.alt}
              loading="lazy" decoding="async" draggable="false" onError={() => setFailed(true)} />
          ) : null}
        </div>
        <span className="corner tl" /><span className="corner br" />
      </div>
      <div className="pg-cap">
        <div>
          <p className="pg-name">{p.name}</p>
          <p className="pg-meta">{p.services}<br />{p.sector}</p>
        </div>
        <span className="pg-k">{String(k + 1).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
function PageCTA() {
  return (
    <div className="pg pg-cta">
      <span className="pg-k">07</span>
      <p className="pg-cta-t">Page seven is yours.</p>
      <a className="pg-cta-a" href="#contact">Start a project <Arrow /></a>
    </div>
  );
}
function PageEnd() {
  return <div className="pg pg-end"><span className="pg-k">Jayastra · Jabalpur</span></div>;
}
const LEAVES = [
  { front: <PageCover />, back: <PageIndex /> },
  { front: <PageProject p={PROJECTS[0]} k={0} />, back: <PageProject p={PROJECTS[1]} k={1} /> },
  { front: <PageProject p={PROJECTS[2]} k={2} />, back: <PageProject p={PROJECTS[3]} k={3} /> },
  { front: <PageProject p={PROJECTS[4]} k={4} />, back: <PageProject p={PROJECTS[5]} k={5} /> },
  { front: <PageCTA />, back: <PageEnd /> },
];
const SPREADS = [
  'Cover. Selected work, volume one.',
  'Contents, and 01 Saffron & Co: identity and packaging concept.',
  '02 Northbrook: product UI concept. 03 Lumen Audio: 3D product render.',
  '04 Veda Wellness: packaging concept. 05 Orbit Mobility: 3D model.',
  '06 Tilt Capital: pitch deck concept. Page seven is yours.',
];

function Leaf({ i, n, isFlipped, delay, front, back }) {
  const reduce = useReducedMotion();
  const rot = useMotionValue(isFlipped ? -180 : 0);
  useEffect(() => {
    const target = isFlipped ? -180 : 0;
    if (reduce) { rot.set(target); return undefined; }
    const c = animate(rot, target, { type: 'spring', stiffness: 58, damping: 15, mass: 1.05, delay });
    return () => { if (c && c.stop) c.stop(); };
  }, [isFlipped]);
  const zIndex = useTransform(rot, (v) => (v < -90 ? 10 + i : 10 + n - i));
  const lift = useTransform(rot, [0, -90, -180], [0, 70, 0]);
  const shadeF = useTransform(rot, [0, -90], [0, 0.45]);
  const shadeB = useTransform(rot, [-90, -180], [0.45, 0]);
  const sheenO = useTransform(rot, [0, -30, -90], [0, 1, 0]);
  const sheenX = useTransform(rot, [0, -90], ['-60%', '160%']);
  return (
    <motion.div className="leaf" style={{ rotateY: rot, zIndex, z: lift }}>
      <div className="face front">
        {front}
        <span className="gutter" />
        <motion.span className="sheen" style={{ opacity: sheenO, x: sheenX }} />
        <motion.span className="shade" style={{ opacity: shadeF }} />
      </div>
      <div className="face back">
        {back}
        <span className="gutter" />
        <motion.span className="shade" style={{ opacity: shadeB }} />
      </div>
    </motion.div>
  );
}

function MemoryAlbum() {
  const n = LEAVES.length;
  const maxFlip = n - 1;
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(0);
  const [playing, setPlaying] = useState(!reducedNow());
  const [hover, setHover] = useState(false);
  const cur = useRef(0);
  const prev = useRef(0);
  const hold = useRef(0);
  const stageRef = useRef(null);
  const bookRef = useRef(null);
  const down = useRef(null);
  const inView = useInView(stageRef, { amount: 0.35 });
  const rx = useSpring(0, { stiffness: 110, damping: 18 });
  const ry = useSpring(0, { stiffness: 110, damping: 18 });

  const go = useCallback((v, user) => {
    const nv = clamp(v, 0, maxFlip);
    if (nv === cur.current) return;
    prev.current = cur.current;
    cur.current = nv;
    setFlipped(nv);
    if (user) hold.current = Date.now() + 8000;
  }, [maxFlip]);

  useEffect(() => {
    if (!inView || reduce || cur.current !== 0) return undefined;
    const t = setTimeout(() => { if (playing && cur.current === 0) go(1); }, 1100);
    return () => clearTimeout(t);
  }, [inView]);

  useEffect(() => {
    if (!playing || !inView || hover) return undefined;
    const id = setInterval(() => {
      if (Date.now() < hold.current) return;
      if (cur.current >= maxFlip) { go(0); hold.current = Date.now() + 2400; } else go(cur.current + 1);
    }, 3400);
    return () => clearInterval(id);
  }, [playing, inView, hover]);

  const delayFor = (i) => {
    const p = prev.current;
    if (flipped > p) return Math.max(0, i - p) * 0.12;
    if (flipped < p) return Math.max(0, p - 1 - i) * 0.1;
    return 0;
  };
  const onDown = (e) => { down.current = { x: e.clientX, y: e.clientY }; };
  const onUp = (e) => {
    const d = down.current;
    down.current = null;
    if (!d || (e.target.closest && e.target.closest('a,button'))) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - d.y)) { go(cur.current + (dx < 0 ? 1 : -1), true); return; }
    const r = bookRef.current.getBoundingClientRect();
    go(cur.current + (e.clientX >= r.left + r.width / 2 ? 1 : -1), true);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur.current + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur.current - 1, true); }
  };
  const tilt = (e) => {
    if (!isFine() || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 7);
  };
  const untilt = () => { rx.set(0); ry.set(0); };

  return (
    <div className="album">
      <div className="album-stage" ref={stageRef} onPointerMove={tilt} onPointerLeave={untilt} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <motion.div style={{ rotateX: rx, rotateY: ry }}>
          <motion.div className="book" ref={bookRef} tabIndex={0} role="group" aria-roledescription="flip book" aria-label="Selected work album. Use the arrow keys to turn pages."
            animate={{ x: flipped === 0 ? '-25%' : '0%' }} transition={{ type: 'spring', stiffness: 70, damping: 18 }}
            onPointerDown={onDown} onPointerUp={onUp} onKeyDown={onKey}>
            <span className="book-floor" />
            {LEAVES.map((lf, i) => (
              <Leaf key={i} i={i} n={n} isFlipped={i < flipped} delay={delayFor(i)} front={lf.front} back={lf.back} />
            ))}
          </motion.div>
        </motion.div>
      </div>
      <div className="album-ctrl">
        <button className="icon-btn" onClick={() => go(cur.current - 1, true)} disabled={flipped === 0} aria-label="Previous page"><Arrow dir="w" /></button>
        <div className="dots">
          {LEAVES.map((_, k) => (
            <button key={k} className={'dot' + (k === flipped ? ' on' : '')} aria-label={'Go to spread ' + (k + 1)} aria-current={k === flipped ? 'true' : undefined} onClick={() => go(k, true)}><i /></button>
          ))}
        </div>
        <button className="icon-btn" onClick={() => go(cur.current + 1, true)} disabled={flipped === maxFlip} aria-label="Next page"><Arrow dir="e" /></button>
        <button className="play-btn" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>{playing ? 'Pause autoplay' : 'Play autoplay'}</button>
      </div>
      <p className="album-cap" aria-live="polite">{SPREADS[flipped]}</p>
    </div>
  );
}

function Work() {
  return (
    <section id="work" className="band line-top">
      <div className="wrap">
        <SectionHead eyebrow="Selected work" title="A few pages from the album." aside="Concept briefs from the studio. Flip through, drag the pages, or let it play." />
        <Reveal amount={0.1}><MemoryAlbum /></Reveal>
      </div>
    </section>
  );
}

/* ======================================================================
   Services — interactive box grid with a cursor-lit hairline
   ====================================================================== */
const DISCIPLINES = [
  { name: 'Research', note: 'Know the user before you design', items: [
    ['UX research', 'Interviews, surveys and analytics reviews that show what users actually need.'],
    ['Usability testing', 'Moderated and remote sessions on real tasks, with clear findings and fixes.'],
    ['Heuristic analysis', 'An expert review of your product against proven usability principles.'],
    ['Design audit', 'A full check of brand and UI consistency, accessibility and quality, with priorities.'],
    ['Ethnographic research', 'Time with users in their own context, to understand habits and workarounds.'],
    ['Emerging trends', 'Market and competitor scans so your product and brand stay ahead, not behind.'],
  ] },
  { name: 'Brand', note: 'Who you are and how you look', items: [
    ['Brand identity', 'Logo suite, type, colour and a guideline book that holds every touchpoint together.'],
    ['Strategy & positioning', 'Research, naming, messaging and tone, so the design has something true to say.'],
    ['Rebranding', 'A full brand overhaul for businesses that have outgrown their look, with a rollout plan for every touchpoint.'],
    ['Logo refresh', 'Modernise an existing logo without losing the recognition you have already built.'],
    ['Packaging', 'Structure, labels and print-ready dielines built for the shelf and the print run.'],
    ['Packaging redesign', 'Refresh tired packs to stand out on the shelf again, while staying recognisable to loyal buyers.'],
    ['Print & collateral', 'Brochures, catalogues, stationery and business cards, set up properly for print.'],
    ['Photography', 'Product, food and lifestyle shoots, art-directed to match the brand and ready for web, social and print.'],
    ['Illustrations & iconography', 'Custom illustration styles and icon sets drawn to match the brand.'],
  ] },
  { name: 'Digital', note: 'Interfaces people get through', items: [
    ['UI / UX design', 'Flows, wireframes and clickable prototypes for apps, SaaS and dashboards.'],
    ['Websites', 'Responsive, conversion-focused sites, designed and shipped in Webflow, Framer or WordPress.'],
    ['Website redesign', 'Rebuild an outdated site around a clearer structure, faster pages and a stronger brand.'],
    ['App & product redesign', 'UX audit and redesign of an existing app or SaaS product, fixing what users struggle with.'],
    ['Pitch decks', 'Investor and sales decks that carry one clear argument from the first slide to the ask.'],
    ['E-commerce design', 'Shopify and custom storefronts, product pages and checkout flows built to convert.'],
    ['Design systems', 'Figma component libraries, tokens and documentation so every new screen stays consistent.'],
    ['Interaction design', 'Micro-interactions, states and transitions that make an interface feel responsive.'],
    ['Digital prototyping', 'High-fidelity clickable prototypes to test ideas before a line of code is written.'],
    ['AI design solutions', 'Interfaces for AI products, and AI-assisted workflows that speed up design delivery.'],
  ] },
  { name: 'Build', note: 'From Figma to a working product', items: [
    ['Front-end development', 'Pixel-accurate, responsive front ends in React and modern frameworks.'],
    ['Web application development', 'Dashboards, portals and web apps built to scale with your users.'],
    ['Mobile application development', 'iOS and Android apps that match the design down to the detail.'],
    ['Custom application development', 'Software shaped around your business processes, not the other way round.'],
    ['AI solution development', 'Chat assistants, automations and AI features integrated into your product.'],
    ['SaaS implementation', 'Setup, integration and launch of SaaS platforms, configured to your workflow.'],
  ] },
  { name: '3D & motion', edge: true, note: 'Built in Blender, in-house', items: [
    ['3D modelling', 'Accurate models, materials and lighting for products, spaces and concepts.'],
    ['Product rendering', 'Studio-grade visuals for listings, ads and launches, without a shoot day.'],
    ['3D animation', 'Logo reveals, product explainers and short-form motion for reels and ads.'],
    ['Motion graphics', '2D animated explainers, UI animations and kinetic type for launches and socials.'],
    ['Interior & architectural visuals', 'Photoreal renders and walkthroughs of spaces before they are built.'],
  ] },
  { name: 'Growth', note: 'Design that ships every week', items: [
    ['Social design', 'Post systems, story sets, reel covers and campaign creative built to a template.'],
    ['Ad creative', 'Performance ads, banners, posters and brochures, with variants tested.'],
    ['Design retainer', 'A dedicated designer at a fixed monthly fee. Queue work, get it back fast.'],
    ['Reels & video editing', 'Short-form edits, captions and cover frames, cut for Instagram, YouTube and LinkedIn.'],
    ['Email & newsletter design', 'Templates and campaigns that look right in every inbox and stay on-brand.'],
  ] },
];
const DISC_INFO = [
  { photo: 'i1a', alt: 'A hand holding a phone showing an app', bg: 'linear-gradient(160deg,#1C2233,#0E0E10)', text: 'Research that turns what users do and say into decisions your team can act on.' },
  { photo: 'i0a', alt: 'Pink and green branded soap packaging', bg: 'linear-gradient(160deg,#3A1A0C,#0E0E10)', text: 'Strategy, identity and packaging that give your business a clear point of view and a look people remember.' },
  { photo: 'digital', alt: 'A designer working at a computer in a dim studio', bg: 'linear-gradient(160deg,#1C2233,#0E0E10)', text: 'Interfaces, websites and decks designed around how people actually read, click and decide.' },
  { photo: 'northbrook', alt: 'An analytics dashboard on a dark screen', bg: 'linear-gradient(160deg,#1C2233,#0E0E10)', text: 'We build what we design, so the product that ships looks exactly like the one you approved.' },
  { photo: 'three', alt: 'Abstract orange and white rendered ribbons', bg: 'linear-gradient(160deg,#C94B00,#3A1406)', text: 'Models, product renders and animation built in Blender, in-house. Show the product before it exists.' },
  { photo: 'growth', alt: 'A hand holding a phone with social media apps', bg: 'linear-gradient(160deg,#2F3A33,#0E0E10)', text: 'Social, ads and an ongoing retainer, built to a system so the work stays on-brand week after week.' },
];
function Services() {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState({});
  return (
    <section id="services" className="band line-top">
      <div className="wrap">
        <SectionHead eyebrow="Services" title="Forty-one services. Six disciplines. One studio." aside="Take one line item or hand us the whole thing, from strategy to the final render." />
        <Reveal amount={0.08} className="svc">
          <div className="svc-media">
            {DISCIPLINES.map((d, k) => (
              <motion.div key={d.name} className="svc-layer" style={{ background: DISC_INFO[k].bg }}
                initial={false} animate={{ opacity: k === active ? 1 : 0, scale: k === active ? 1 : 1.06 }} transition={{ duration: 0.7, ease: EASE }} aria-hidden={k !== active}>
                <span className="svc-ghost">{d.name}</span>
                {!failed[k] ? (
                  <img src={img(DISC_INFO[k].photo)} alt={DISC_INFO[k].alt}
                    loading="lazy" decoding="async" onError={() => setFailed((f) => Object.assign({}, f, { [k]: true }))} />
                ) : null}
              </motion.div>
            ))}
            <div className="svc-cap">
              <span>{String(active + 1).padStart(2, '0')} / {String(DISCIPLINES.length).padStart(2, '0')}</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.b key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>{DISCIPLINES[active].name}</motion.b>
              </AnimatePresence>
            </div>
          </div>
          <ol className="svc-list">
            {DISCIPLINES.map((d, k) => {
              const on = k === active;
              return (
                <li key={d.name} className={'svc-row' + (on ? ' on' : '')} onMouseEnter={() => { if (isFine()) setActive(k); }}>
                  <button className="svc-head" aria-expanded={on} aria-controls={'svc-' + k} onClick={() => setActive(k)} onFocus={() => setActive(k)}>
                    <span className="svc-n">{String(k + 1).padStart(2, '0')}</span>
                    <span className="svc-name">{d.name}{d.edge ? <em>Our edge</em> : null}</span>
                    <span className="svc-arrow" aria-hidden="true"><Arrow /></span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on ? (
                      <motion.div id={'svc-' + k} className="svc-body" key="b" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                        <p>{DISC_INFO[k].text}</p>
                        <ul>
                          {d.items.map(([t, desc]) => <li key={t}><b>{t}</b><span>{desc}</span></li>)}
                        </ul>
                        <a className="svc-link" href="#contact">Enquire about {d.name.toLowerCase()} <Arrow /></a>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ======================================================================
   Industries — editorial sector index with cursor preview
   ====================================================================== */
const INDUSTRIES = [
  { name: 'Consumer & D2C', photo: 'i0a', text: 'Packaging that earns its place on the shelf, and social that keeps the brand recognisable at thumb speed.', names: ['Packaging', 'Labels', 'Social kits', 'Product renders'] },
  { name: 'Real estate & architecture', photo: 's_realestate', text: 'Show buyers the project before the first brick: photoreal renders, walkthroughs and launch branding.', names: ['3D walkthroughs', 'Interior renders', 'Brochures', 'Hoardings'] },
  { name: 'Manufacturing & industrial', photo: 's_industrial', text: 'Machines and parts rendered without a shoot, and catalogues and websites that win B2B buyers.', names: ['Product renders', 'Catalogues', 'Exhibition stalls', 'Website redesign'] },
  { name: 'Jewellery & fashion', photo: 's_jewellery', text: 'Photoreal jewellery renders, lookbooks and storefronts that make every piece feel precious.', names: ['3D jewellery renders', 'Lookbooks', 'E-commerce', 'Packaging'] },
  { name: 'SaaS & Fintech', photo: 'i1b', text: 'Interfaces that make money and data feel simple, and websites that explain the product in one scroll.', names: ['Product UI', 'Dashboards', 'Websites', 'Pitch decks'] },
  { name: 'Food & beverage', photo: 's_food', text: 'Packs, labels and social content that make people want to taste it, from cafés to FMCG brands.', names: ['Packaging', 'Labels', 'Social media', 'Ad creative'] },
  { name: 'Healthcare & wellness', photo: 's_health', text: 'Calm, trustworthy branding and patient-friendly websites and apps for clinics, pharma and wellness brands.', names: ['Branding', 'Websites', 'App UI', 'Packaging'] },
  { name: 'Education & EdTech', photo: 's_edu', text: 'Brands, platforms and explainers for institutes and course creators that make learning look worth it.', names: ['Branding', 'Websites', 'App UI', 'Explainer animation'] },
  { name: 'Startups', photo: 's_startup', text: 'From zero to launch: brand, pitch deck, MVP design and build, and a retainer once you are moving.', names: ['Pitch decks', 'Brand from zero', 'MVP design', 'Design retainer'] },
  { name: 'Hardware & Mobility', photo: 'i2b', text: 'Show the product before the factory does: models, renders and launch films from our in-house Blender studio.', names: ['3D models', 'Product renders', 'Launch films', 'Spec sheets'] },
  { name: 'Hospitality & Retail', photo: 'i3a', text: 'Identity, signage and menus that hold together on a storefront, a table and a phone screen.', names: ['Identity', 'Signage', 'Menus', 'Print'] },
  { name: 'Tourism & heritage', photo: 's_tourism', text: 'Branding, websites and motion content for hotels, resorts and destinations worth the journey.', names: ['Destination branding', 'Websites', 'Motion content', 'Print'] },
  { name: 'Gaming & entertainment', photo: 's_gaming', text: '3D assets, motion graphics and key art that look right on a poster, a stream and a store page.', names: ['3D assets', 'Motion graphics', 'Key art', 'Social content'] },
  { name: 'Weddings & events', photo: 's_events', text: 'Invitations, event identities and 3D venue previews that set the tone before guests arrive.', names: ['Invitations', 'Event branding', '3D venue previews', 'Signage'] },
];
function Industries() {
  const [active, setActive] = useState(0);
  const ind = INDUSTRIES[active];
  return (
    <section id="industries" className="band inds-dark">
      <div className="wrap">
        <SectionHead eyebrow="Industries" title="Sectors we know from the inside." aside="The patterns repeat, so we start faster. Open a sector to see what we usually make for it." />
        <div className="idk">
          <div className="idk-panel">
            <a className="idk-media" href={to('/industries/' + SECTOR_SLUGS[active])} aria-label={'Open ' + ind.name}>
              {INDUSTRIES.map((s2, k) => (s2.photo ? <img key={s2.name} src={img(s2.photo)} alt="" className={k === active ? 'on' : ''} loading="lazy" decoding="async" /> : null))}
              <span className={'idk-blank' + (ind.photo ? '' : ' on')} aria-hidden="true"><b>{String(active + 1).padStart(2, '0')}</b></span>
              <span className="idk-shade" aria-hidden="true" />
              <div className="idk-cap">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>
                    <h3>{ind.name}</h3>
                    <p>{ind.text}</p>
                    <ul>{ind.names.map((nm) => <li key={nm}>{nm}</li>)}</ul>
                  </motion.div>
                </AnimatePresence>
              </div>
            </a>
            <div className="idk-links"><a className="idk-cta" href={to('/industries/' + SECTOR_SLUGS[active])}>View sector &amp; projects <Arrow /></a><a className="idk-sub" href="#contact">Start a project</a></div>
          </div>
          <ol className="idk-list">
            {INDUSTRIES.map((s2, k) => (
              <li key={s2.name}>
                <a className={'idk-name' + (k === active ? ' on' : '')} href={to('/industries/' + SECTOR_SLUGS[k])}
                  onMouseEnter={() => { if (isFine()) setActive(k); }} onFocus={() => setActive(k)}>
                  <span className="idk-n">{String(k + 1).padStart(2, '0')}</span>{s2.name}<span className="idk-go" aria-hidden="true"><Arrow /></span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ======================================================================
   Process — scroll-linked timeline
   ====================================================================== */
const STEPS = [
  ['Discover', 'A call, a questionnaire and a look at your market. We learn the business before the brief.', 'Brief and market notes'],
  ['Define', 'Scope, deliverables, timeline and price in one document. You approve before work starts.', 'A signed proposal'],
  ['Design', 'Two directions, presented with reasoning. You pick one and we go deep instead of wide.', 'Two design directions'],
  ['Refine', 'Two structured revision rounds, with every comment collected in one place.', 'Two revision rounds'],
  ['Deliver', 'Source files, exports and guidelines handed over, plus a walkthrough for your team.', 'Files and a handover call'],
];
function TimelineStep({ s, i, last }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.62', 'start 0.48'] });
  const on = useSpring(scrollYProgress, { stiffness: 140, damping: 24 });
  const bg = useTransform(on, [0, 1], ['#FFFFFF', '#D24E01']);
  const bc = useTransform(on, [0, 1], ['#D4D1C9', '#D24E01']);
  const fg = useTransform(on, [0, 1], ['#8E8B84', '#FFFFFF']);
  const halo = useTransform(on, [0, 1], ['0 0 0 0px rgba(210,78,1,0)', '0 0 0 9px rgba(210,78,1,.14)']);
  const title = useTransform(on, [0, 1], ['#B3B0A8', '#0E0E10']);
  const body = useTransform(on, [0, 1], [0.55, 1]);
  return (
    <li className={'tl-step' + (last ? ' last' : '')} ref={ref}>
      <motion.span className="tl-knob" style={{ backgroundColor: bg, borderColor: bc, color: fg, boxShadow: halo }} aria-hidden="true">{i + 1}</motion.span>
      <div className="tl-body">
        <span className="sr">Step {i + 1}: </span>
        <motion.h3 style={{ color: title }}>{s[0]}</motion.h3>
        <motion.div style={{ opacity: body }}>
          <p>{s[1]}</p>
          <p className="tl-get"><span>You get</span>{s[2]}</p>
        </motion.div>
      </div>
    </li>
  );
}
function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.55', 'end 0.55'] });
  const fill = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4 });
  return (
    <section id="process" className="band line-top">
      <div className="wrap tl">
        <div className="tl-head">
          <Reveal as="p" className="eyebrow">How we work</Reveal>
          <Reveal as="h2" className="h2" delay={0.06}>{dot('A process you can actually follow.')}</Reveal>
          <Reveal as="p" className="shead-aside" delay={0.12} style={{ marginTop: 24 }}>Five steps, each with something you can hold at the end of it.</Reveal>
        </div>
        <div className="tl-list-wrap" ref={ref}>
          <div className="tl-track" aria-hidden="true"><motion.div className="tl-fill" style={{ scaleY: fill }} /></div>
          <ol className="tl-list">
            {STEPS.map((st, i) => <TimelineStep key={st[0]} s={st} i={i} last={i === STEPS.length - 1} />)}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ======================================================================
   Mark3D — the spear from the logo "t", extruded in 3D, drag to spin
   ====================================================================== */
const loadThree = () => {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (window.__loadThree) return window.__loadThree();
  if (window.__threeP) return window.__threeP;
  window.__threeP = new Promise((res, rej) => {
    const sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    sc.async = true; sc.onload = () => res(window.THREE); sc.onerror = rej;
    document.head.appendChild(sc);
  });
  return window.__threeP;
};
function Mark3D() {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const [state, setState] = useState('idle');
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let cleanup = null, started = false;
    const start = () => {
      if (started) return; started = true; setState('loading');
      loadThree().then((THREE) => { if (!hostRef.current) return; cleanup = initMark(THREE, host, apiRef); setState(cleanup ? 'ready' : 'fail'); }).catch(() => setState('fail'));
    };
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); }, { rootMargin: '600px 0px' }) : null;
    if (io) io.observe(host); else start();
    return () => { if (io) io.disconnect(); if (cleanup) cleanup(); };
  }, []);
  return (
    <section className="m3d" aria-labelledby="m3d-h">
      <div className="m3d-stage" ref={hostRef} />
      {state === 'fail' ? <div className="m3d-fallback" aria-hidden="true"><svg viewBox="4 1 117 251"><path fill="#D24E01" fillRule="evenodd" d={SPEAR_PATH} /></svg></div> : null}
      <div className="wrap m3d-top">
        <Reveal as="p" className="eyebrow light">3D studio</Reveal>
        <Reveal as="h2" className="m3d-h" id="m3d-h" delay={0.06}>The Jayastra mark, in 3D.</Reveal>
      </div>
      <div className="m3d-ui">
        <p className="m3d-hint">Drag to turn it.</p>
      </div>
    </section>
  );
}
function initMark(THREE, host, apiRef) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
  const reduce = reducedNow();
  renderer.setPixelRatio(Math.min(window.innerWidth < 760 ? 1.5 : 2, window.devicePixelRatio || 1));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  // studio environment: soft boxes around a dark room
  const pm = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x111114);
  const box = (w, h, x, y, z, c, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); if (ry) m.rotation.z = ry; envScene.add(m); };
  box(8, 3, 0, 7, 3, 0x9a9a9a); box(3, 9, -8, 1, 2, 0x8a8278); box(3, 9, 8, 0, -1, 0x7c8494); box(10, 2, 0, -6, 4, 0x2a1a12); box(4, 4, 3, 2, -8, 0x8a3a10);
  const env = pm.fromScene(envScene, 0.035).texture;
  scene.environment = env;
  // lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xffffff, 0.62); key.position.set(4, 6, 8); scene.add(key);
  const rim = new THREE.PointLight(0xffffff, 0.9, 30); rim.position.set(-5, 2, -4); scene.add(rim);
  // geometry from the logo path (SVG y-down -> flip)
  const shapes = [];
  SPEAR_PATH.split('Z').map((sp) => sp.trim()).filter(Boolean).forEach((sp) => {
    const pts = sp.replace(/[ML]/g, ' ').trim().split(/\s+/).map(Number);
    const sh = new THREE.Shape();
    for (let i = 0; i < pts.length; i += 2) { const x = pts[i], y = -pts[i + 1]; if (i === 0) sh.moveTo(x, y); else sh.lineTo(x, y); }
    shapes.push(sh);
  });
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 22, bevelEnabled: true, bevelThickness: 3.2, bevelSize: 2.2, bevelSegments: 5, curveSegments: 1 });
  geo.computeBoundingBox();
  const bb = geo.boundingBox, c = new THREE.Vector3(); bb.getCenter(c);
  geo.translate(-c.x, -c.y, -c.z);
  const s = 3.7 / (bb.max.y - bb.min.y);
  geo.scale(s, s, s);
  geo.computeVertexNormals();
  const logo = new THREE.Color('#D24E01').convertSRGBToLinear();
  const mats = [new THREE.MeshPhysicalMaterial({ color: logo, emissive: logo, emissiveIntensity: 0.42, metalness: 0, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.12, envMapIntensity: 0.35 })];
  const mesh = new THREE.Mesh(geo, mats[0]);
  const group = new THREE.Group(); group.add(mesh); scene.add(group);
  // soft floor shadow
  const sc = document.createElement('canvas'); sc.width = sc.height = 128;
  const sx = sc.getContext('2d'); const sg = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
  sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -2.75; scene.add(shadow);
  // interaction
  let rx = 0.12, ry = -0.5, vx = 0, vy = 0, drag = null, hover = [0, 0], lastT = performance.now();
  const el = renderer.domElement;
  el.style.touchAction = 'pan-y';
  const down = (e) => { drag = { x: e.clientX, y: e.clientY }; vx = vy = 0; try { el.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } host.classList.add('grab'); };
  const move = (e) => {
    const r = el.getBoundingClientRect();
    hover = [((e.clientX - r.left) / r.width - 0.5), ((e.clientY - r.top) / r.height - 0.5)];
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
    ry += dx * 0.01; rx += dy * 0.006; rx = Math.max(-0.7, Math.min(0.7, rx));
    vy = dx * 0.01; vx = dy * 0.006;
  };
  const up = () => { drag = null; host.classList.remove('grab'); };
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  const size = () => {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w / h < 0.8 ? 15 : 11;
    camera.updateProjectionMatrix();
  };
  size();
  const ro = 'ResizeObserver' in window ? new ResizeObserver(size) : null; if (ro) ro.observe(host);
  let visible = true, raf = 0; const t0 = performance.now();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }) : null; if (io) io.observe(host);
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    const t = (now - t0) / 1000;
    if (!drag) {
      ry += vy; rx += vx; vy *= 0.94; vx *= 0.9;
      if (!reduce && Math.abs(vy) < 0.002) ry += dt * 0.35;
      rx += (0.12 - rx) * dt * 0.8;
    }
    group.rotation.set(rx + hover[1] * 0.12, ry + hover[0] * 0.2, 0);
    group.position.y = -0.55 + (reduce ? 0 : Math.sin(t * 1.1) * 0.12);
    const lift = group.position.y + 0.55;
    shadow.scale.setScalar(1 - lift * 0.25);
    shadow.material.opacity = 0.9 - lift * 0.6;
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect();
    el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    apiRef.current = null; renderer.dispose(); pm.dispose(); if (el.parentNode) el.parentNode.removeChild(el);
  };
}

/* ======================================================================
   Stats + The Jayastra advantage
   ====================================================================== */
const STATS = [
  { n: 5, s: '+', l: 'Years in design', d: 'Brand, product and 3D work since 2021.', viz: 'years' },
  { n: 41, s: '', l: 'Services in-house', d: 'Six disciplines under one roof, no outsourcing.', viz: 'grid' },
  { n: 48, s: 'h', l: 'Average turnaround', d: 'For retainer requests, from brief to first draft.', viz: 'ticks' },
  { n: 2, s: '', l: 'Revision rounds', d: 'Included in every project, structured and on time.', viz: 'rounds' },
];
function Counter({ to, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [v, setV] = useState(() => (reducedNow() ? to : 0));
  useEffect(() => {
    if (!inView || reducedNow()) return undefined;
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => { if (c && c.stop) c.stop(); };
  }, [inView]);
  return <b ref={ref} className="stat-num">{v}{suffix ? <em>{suffix}</em> : null}</b>;
}
function StatViz({ kind }) {
  if (kind === 'years') {
    return (
      <div className="sv sv-years" aria-hidden="true">
        {['21', '22', '23', '24', '25', '26'].map((y, i) => <span key={y} style={{ '--i': i }}><i />{"'" + y}</span>)}
      </div>
    );
  }
  if (kind === 'grid') {
    return (
      <div className="sv sv-grid" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => <i key={i} className={i >= 6 && i < 9 ? 'o' : ''} style={{ '--i': i }} />)}
      </div>
    );
  }
  if (kind === 'ticks') {
    return (
      <div className="sv sv-ticks" aria-hidden="true">
        <div className="sv-tick-row">{Array.from({ length: 24 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}</div>
        <div className="sv-tick-cap"><span>Brief</span><span>Draft</span></div>
      </div>
    );
  }
  return (
    <div className="sv sv-rounds" aria-hidden="true">
      {['Round 1', 'Round 2'].map((r, i) => (
        <span key={r} style={{ '--i': i }}><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>{r}</span>
      ))}
    </div>
  );
}
function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  return (
    <section className="band line-top stats-band" aria-label="Studio in numbers">
      <div className="wrap">
        <div className="stats-head">
          <Reveal as="p" className="eyebrow">In numbers</Reveal>
          <Reveal as="h2" className="h2" delay={0.06}>{dot('Small studio. Clear numbers.')}</Reveal>
        </div>
        <div ref={ref} className={'stats' + (inView ? ' in' : '')}>
          {STATS.map((st, k) => (
            <Reveal className="stat" key={st.l} delay={k * 0.08}>
              <span className="stat-k">{String(k + 1).padStart(2, '0')}</span>
              <Counter to={st.n} suffix={st.s} />
              <h3 className="stat-l">{st.l}</h3>
              <p className="stat-d">{st.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Dot grid background: dots swell and warm toward the cursor. */
function DotGrid() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const host = cv.parentElement;
    const ctx = cv.getContext('2d');
    if (!ctx) return undefined;
    const GAP = 26, RAD = 170;
    let W = 0, H = 0, dots = [], raf = 0, visible = false, mx = -9999, my = -9999, live = false;
    const base = [216, 213, 205], warm = [210, 78, 1];
    const build = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = GAP / 2; y < H; y += GAP) for (let x = GAP / 2; x < W; x += GAP) dots.push({ x, y, s: 0 });
      draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      let moving = false;
      ctx.fillStyle = 'rgb(' + base.join(',') + ')';
      ctx.beginPath();
      const hot = [];
      for (let k = 0; k < dots.length; k++) {
        const d = dots[k];
        const dx = d.x - mx, dy = d.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const target = dist < RAD ? 1 - dist / RAD : 0;
        d.s += (target - d.s) * 0.12;
        if (Math.abs(target - d.s) > 0.003) moving = true;
        if (d.s < 0.03) { ctx.moveTo(d.x + 1.1, d.y); ctx.arc(d.x, d.y, 1.1, 0, TAU); } else hot.push([d, dx, dy, dist]);
      }
      ctx.fill();
      for (let k = 0; k < hot.length; k++) {
        const [d, dx, dy, dist] = hot[k];
        const s = d.s, push = s * 7 / (dist || 1);
        const c = base.map((b, j) => Math.round(b + (warm[j] - b) * s));
        ctx.fillStyle = 'rgb(' + c.join(',') + ')';
        ctx.beginPath();
        ctx.arc(d.x + dx * push, d.y + dy * push, 1.1 + s * 2.4, 0, TAU);
        ctx.fill();
      }
      return moving;
    };
    const loop = () => { raf = 0; const moving = draw(); if (visible && (moving || live)) raf = requestAnimationFrame(loop); };
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(loop); };
    const onMove = (e) => { if (!isFine()) return; const r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; live = true; kick(); };
    const onLeave = () => { mx = -9999; my = -9999; live = false; kick(); };
    const ro = 'ResizeObserver' in window ? new ResizeObserver(build) : null;
    if (ro) ro.observe(host);
    build();
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }) : null;
    if (io) io.observe(host); else visible = true;
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    return () => { cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave); };
  }, []);
  return <canvas ref={ref} className="adv-dots" aria-hidden="true" />;
}

/* Advantage visual 1 — rotating cubes: sketch, model, render */
function Cubes() {
  const reduce = useReducedMotion();
  const kinds = [['wire', 'Sketch'], ['solid', 'Model'], ['ember', 'Render']];
  return (
    <div className="cubes" aria-hidden="true">
      {kinds.map(([k, label], i) => (
        <div className="cube-col" key={k}>
          <motion.div className={'cube ' + k}
            animate={reduce ? { rotateX: -24, rotateY: 38 } : { rotateX: [-24, 336], rotateY: [38 + i * 20, 398 + i * 20] }}
            transition={{ duration: 16 + i * 4, repeat: Infinity, ease: 'linear' }}>
            {['f', 'b', 'r', 'l', 't', 'd'].map((f) => <i key={f} className={'cf ' + f} />)}
          </motion.div>
          <span className="cube-l">{label}</span>
        </div>
      ))}
    </div>
  );
}
/* Advantage visual 2 — confidential folder: proposal papers slide out */
function Folder({ open }) {
  const papers = ['Scope of work', 'Timeline · 4 weeks', 'Price · fixed, in writing'];
  return (
    <div className="folder" aria-hidden="true">
      <div className="f-back" />
      {papers.map((t, i) => (
        <motion.div key={t} className="f-paper" style={{ zIndex: 2 + i }}
          animate={open ? { y: -(70 - i * 24), rotate: [-3, 2, -1][i] } : { y: 0, rotate: [-1.5, 1, 0][i] }}
          transition={{ type: 'spring', stiffness: 150, damping: 17, delay: open ? i * 0.07 : (2 - i) * 0.04 }}>
          <b>{t}</b><i /><i /><i className="s" />
        </motion.div>
      ))}
      <motion.div className="f-front" style={{ zIndex: 6 }} animate={open ? { rotateX: -32 } : { rotateX: 0 }} transition={{ type: 'spring', stiffness: 130, damping: 15 }}>
        <span className="f-label">Proposal · Jayastra</span>
        <span className="stamp">Confidential</span>
      </motion.div>
    </div>
  );
}
/* Advantage visual 3 — zip open: the source files come out */
const FILES = [['.fig', '#A259FF'], ['.ai', '#FF9A00'], ['.blend', '#E87D0D'], ['.psd', '#31A8FF'], ['.mp4', '#0E0E10'], ['fonts/', '#5E5E63']];
function Zip({ open }) {
  return (
    <div className="zip" aria-hidden="true">
      <div className="zchips">
        {FILES.map(([f, c], i) => (
          <motion.span key={f} className="zchip"
            animate={open ? { y: 0, opacity: 1, rotate: [-5, 4, -3, 5, -4, 3][i] } : { y: 80, opacity: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 170, damping: 16, delay: open ? 0.38 + i * 0.06 : 0 }}>
            <i style={{ background: c }} />{f}
          </motion.span>
        ))}
      </div>
      <div className="pouch">
        <div className="ztrack">
          <motion.div className="zprog" animate={{ width: open ? '100%' : '0%' }} transition={{ duration: open ? 0.6 : 0.45, ease: EASE, delay: open ? 0 : 0.2 }}>
            <span className="zgap" /><span className="zpull"><i /></span>
          </motion.div>
        </div>
        <span className="pouch-tag">source_files.zip</span>
      </div>
    </div>
  );
}
/* Advantage visual 4 — atomic globe: orbits around a wireframe earth */
const ORBITS = [{ rx: 132, ry: 30, a: -16, sp: 0.55, ph: 0 }, { rx: 118, ry: 26, a: 36, sp: -0.42, ph: 2.1 }, { rx: 100, ry: 22, a: 92, sp: 0.36, ph: 4.2 }];
function Globe() {
  const mer = useRef([]);
  const dots = useRef([]);
  const host = useRef(null);
  const onScreen = useOnScreen(host);
  const reduce = useReducedMotion();
  const R = 76, CX = 170, CY = 124;
  const frame = (s) => {
    mer.current.forEach((el, k) => { if (el) el.setAttribute('rx', (Math.abs(Math.cos(s * 0.32 + k * (Math.PI / 4))) * R).toFixed(2)); });
    dots.current.forEach((el, k) => {
      if (!el) return;
      const o = ORBITS[k];
      const th = s * o.sp + o.ph;
      const ex = o.rx * Math.cos(th), ey = o.ry * Math.sin(th);
      const ar = (o.a * Math.PI) / 180;
      const x = CX + ex * Math.cos(ar) - ey * Math.sin(ar);
      const y = CY + ex * Math.sin(ar) + ey * Math.cos(ar);
      el.setAttribute('cx', x.toFixed(2));
      el.setAttribute('cy', y.toFixed(2));
      el.setAttribute('opacity', Math.sin(th) < 0 && Math.hypot(x - CX, y - CY) < R ? '0.22' : '1');
    });
  };
  useEffect(() => { frame(3); }, []);
  useAnimationFrame((t) => { if (!reduce && onScreen.current) frame(t / 1000 + 3); });
  return (
    <div className="globe-wrap" ref={host} aria-hidden="true">
      <svg className="globe" viewBox="0 0 340 250">
        <defs>
          <radialGradient id="globeFill" cx="38%" cy="30%" r="78%"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E9E6DF" /></radialGradient>
        </defs>
        {ORBITS.map((o, k) => <ellipse key={'o' + k} cx={CX} cy={CY} rx={o.rx} ry={o.ry} transform={'rotate(' + o.a + ' ' + CX + ' ' + CY + ')'} fill="none" stroke="#C9C5BC" strokeWidth="1" strokeDasharray="2 5" />)}
        <circle cx={CX} cy={CY} r={R} fill="url(#globeFill)" stroke="#0E0E10" strokeWidth="1.3" />
        {[-52, -26, 0, 26, 52].map((lat) => {
          const y = CY - Math.sin((lat * Math.PI) / 180) * R;
          const rx = Math.cos((lat * Math.PI) / 180) * R;
          return <ellipse key={lat} cx={CX} cy={y} rx={rx} ry={rx * 0.13} fill="none" stroke="#0E0E10" strokeOpacity=".2" strokeWidth="1" />;
        })}
        {[0, 1, 2, 3].map((k) => <ellipse key={'m' + k} ref={(el) => { mer.current[k] = el; }} cx={CX} cy={CY} rx={R} ry={R} fill="none" stroke="#0E0E10" strokeOpacity=".26" strokeWidth="1" />)}
        <circle cx={CX + 20} cy={CY - 20} r="5" fill="#D24E01" />
        <circle cx={CX + 20} cy={CY - 20} r="5" fill="none" stroke="#D24E01" strokeWidth="1.2">
          <animate attributeName="r" values="5;18" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values=".9;0" dur="2.4s" repeatCount="indefinite" />
        </circle>
        {ORBITS.map((o, k) => <circle key={'d' + k} ref={(el) => { dots.current[k] = el; }} r={k === 0 ? 5 : 4} fill={k === 0 ? '#D24E01' : '#0E0E10'} cx={CX} cy={CY} />)}
      </svg>
      <motion.span className="tz home" style={{ left: '52%', top: '6%' }} animate={reduce ? {} : { y: [0, -5, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}><i />IST · Jabalpur</motion.span>
      <motion.span className="tz" style={{ left: '0%', top: '40%' }} animate={reduce ? {} : { y: [0, 5, 0] }} transition={{ duration: 3.9, repeat: Infinity, ease: 'easeInOut' }}>GMT</motion.span>
      <motion.span className="tz" style={{ right: '0%', top: '58%' }} animate={reduce ? {} : { y: [0, -4, 0] }} transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut' }}>GST</motion.span>
      <motion.span className="tz" style={{ left: '14%', bottom: '2%' }} animate={reduce ? {} : { y: [0, 4, 0] }} transition={{ duration: 4.3, repeat: Infinity, ease: 'easeInOut' }}>ET</motion.span>
    </div>
  );
}

/* Node-editor graphs for the advantage cards: nodes, sockets and wires with flowing pulses. */
const NG_HEAD = 30, NG_ROW = 19;
const ngH = (n) => NG_HEAD + (n.r ? n.r.length * NG_ROW + 8 : 0);
function NodeGraph({ w, h, nodes, edges }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const by = {};
  nodes.forEach((n) => { by[n.id] = n; });
  const nw = (n) => n.w || 128;
  const out = (n) => [n.x + nw(n), n.y + ngH(n) / 2];
  const inp = (n) => [n.x, n.y + ngH(n) / 2];
  const wire = (a, b) => {
    const p = out(by[a]), q = inp(by[b]);
    const dx = Math.max(40, (q[0] - p[0]) * 0.5);
    return 'M' + p[0] + ' ' + p[1] + ' C' + (p[0] + dx) + ' ' + p[1] + ' ' + (q[0] - dx) + ' ' + q[1] + ' ' + q[0] + ' ' + q[1];
  };
  const pid = 'ngdots' + w + h + nodes.length;
  return (
    <svg ref={ref} className={'ng' + (inView ? ' run' : '')} viewBox={'0 0 ' + w + ' ' + h} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <pattern id={pid} width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(14,14,16,.09)" /></pattern>
      </defs>
      <rect width={w} height={h} fill={'url(#' + pid + ')'} />
      {edges.map(([a, b], i) => (
        <g key={a + b}>
          <path className="ng-wire" d={wire(a, b)} />
          <path className="ng-flow" d={wire(a, b)} style={{ animationDelay: (i * 0.22) + 's' }} />
        </g>
      ))}
      {nodes.map((n, i) => {
        const H = ngH(n), W = nw(n);
        return (
          <g key={n.id} className={'ng-node' + (n.o ? ' o' : '')} style={{ '--d': (i * 0.08) + 's' }} transform={'translate(' + n.x + ' ' + n.y + ')'}>
            <rect className="ng-shadow" x="0" y="4" width={W} height={H} rx="10" />
            <rect className={'ng-box' + (n.r ? '' : ' solo')} width={W} height={H} rx="10" />
            {n.r ? <path className="ng-head" d={'M0 10a10 10 0 0 1 10-10h' + (W - 20) + 'a10 10 0 0 1 10 10v' + (NG_HEAD - 10) + 'h-' + W + 'z'} /> : null}
            <text className="ng-t" x="12" y="19.5">{n.t}</text>
            {(n.r || []).map((r, k) => (
              <g key={r}>
                <circle className="ng-pip" cx="15" cy={NG_HEAD + 12 + k * NG_ROW} r="2.2" />
                <text className="ng-r" x="24" y={NG_HEAD + 15.5 + k * NG_ROW}>{r}</text>
              </g>
            ))}
            {edges.some((e) => e[1] === n.id) ? <circle className="ng-sock" cx="0" cy={H / 2} r="4.5" /> : null}
            {edges.some((e) => e[0] === n.id) ? <circle className="ng-sock out" cx={W} cy={H / 2} r="4.5" /> : null}
          </g>
        );
      })}
    </svg>
  );
}
const NG_TEAM = { w: 700, h: 300, nodes: [
  { id: 'brief', x: 44, y: 112, t: 'Brief', r: ['Goals', 'Audience'] },
  { id: 'brand', x: 270, y: 34, t: 'Brand · 2D', r: ['Identity', 'Packaging'] },
  { id: 'scene', x: 270, y: 178, t: '3D scene', r: ['Model', 'Lighting'] },
  { id: 'launch', x: 500, y: 96, w: 150, t: 'Launch', o: 1, r: ['Pack', 'Ad render', 'Listing'] },
], edges: [['brief', 'brand'], ['brief', 'scene'], ['brand', 'launch'], ['scene', 'launch']] };
const NG_SCOPE = { w: 500, h: 300, nodes: [
  { id: 'scope', x: 34, y: 28, t: 'Scope', r: ['Deliverables'] },
  { id: 'time', x: 34, y: 122, t: 'Timeline', r: ['4 weeks'] },
  { id: 'price', x: 34, y: 216, t: 'Price', r: ['Fixed'] },
  { id: 'prop', x: 296, y: 104, w: 150, t: 'Proposal', o: 1, r: ['In writing', 'Signed day one'] },
], edges: [['scope', 'prop'], ['time', 'prop'], ['price', 'prop']] };
const NG_FILES = { w: 500, h: 300, nodes: [
  { id: 'final', x: 34, y: 112, w: 140, t: 'Final files', o: 1, r: ['Approved', 'Full rights'] },
  { id: 'fig', x: 316, y: 22, w: 120, t: '.fig' },
  { id: 'ai', x: 316, y: 87, w: 120, t: '.ai' },
  { id: 'blend', x: 316, y: 152, w: 120, t: '.blend' },
  { id: 'mp4', x: 316, y: 217, w: 120, t: '.mp4' },
], edges: [['final', 'fig'], ['final', 'ai'], ['final', 'blend'], ['final', 'mp4']] };
const NG_WORLD = { w: 700, h: 300, nodes: [
  { id: 'jbp', x: 40, y: 112, w: 140, t: 'Jabalpur · IST', o: 1, r: ['Studio'] },
  { id: 'call', x: 262, y: 112, w: 136, t: 'Weekly call', r: ['Your time zone'] },
  { id: 'dxb', x: 500, y: 20, w: 150, t: 'Dubai · GST' },
  { id: 'lon', x: 500, y: 88, w: 150, t: 'London · GMT' },
  { id: 'nyc', x: 500, y: 156, w: 150, t: 'New York · ET' },
  { id: 'sin', x: 500, y: 224, w: 150, t: 'Singapore · SGT' },
], edges: [['jbp', 'call'], ['call', 'dxb'], ['call', 'lon'], ['call', 'nyc'], ['call', 'sin']] };

function AdvCard({ size, title, text, proof, visual, interactive, delay }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  const [demo, setDemo] = useState(false);
  const [cycle, setCycle] = useState(false);
  const seen = useInView(ref, { once: true, amount: 0.55 });
  const inView = useInView(ref, { amount: 0.4 });
  useEffect(() => {
    if (!seen || !interactive || reducedNow()) return undefined;
    setDemo(true);
    const t = setTimeout(() => setDemo(false), 2200);
    return () => clearTimeout(t);
  }, [seen]);
  useEffect(() => {
    if (!interactive || isFine() || !inView || reducedNow()) { setCycle(false); return undefined; }
    const id = setInterval(() => setCycle((c) => !c), 2800);
    return () => clearInterval(id);
  }, [inView]);
  const open = hover || demo || cycle;
  return (
    <Reveal className={'acard ' + size} delay={delay} amount={0.15}>
      <div className="astage" ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {visual(open)}
      </div>
      <div className="abody">
        <h3>{title}</h3>
        <p>{text}</p>
        <span className="aproof">{proof}</span>
      </div>
    </Reveal>
  );
}
/* Halftone advantage cards: each artwork is a grayscale source sampled into a dot grid, drawn live. */
function Halftone({ kind, ink }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    const reduce = reducedNow();
    let W = 0, H = 0, dpr = 1, raf = 0, visible = false, src = null, step = 6;
    let mouse = null;
    const t0 = performance.now();
    const buildSource = () => {
      const oc = document.createElement('canvas'); oc.width = Math.max(1, Math.round(W)); oc.height = Math.max(1, Math.round(H));
      const o = oc.getContext('2d');
      o.fillStyle = '#fff'; o.fillRect(0, 0, W, H);
      if (kind === 'team') {
        // two dotted streams converging on the spear
        const cy = H * 0.3;
        [[0, 1], [W, -1]].forEach(([x0, dir]) => {
          const gl = o.createLinearGradient(x0, 0, W / 2, 0);
          gl.addColorStop(0, 'rgba(0,0,0,.05)'); gl.addColorStop(0.55, 'rgba(0,0,0,.55)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
          o.fillStyle = gl;
          for (let k = 0; k < 6; k++) {
            const yy = cy - H * 0.05 + k * H * 0.018 + (dir > 0 ? 0 : H * 0.02);
            o.fillRect(dir > 0 ? 0 : W * 0.6, yy, W * 0.4, H * 0.012 + (k % 2) * H * 0.005);
          }
        });
        const p = new Path2D(SPEAR_PATH);
        const sh = H * 0.36, sc = sh / 251;
        o.save(); o.translate(W / 2 - 62 * sc, cy - sh * 0.42); o.scale(sc, sc);
        o.fillStyle = '#000'; o.fill(p, 'evenodd'); o.restore();
      } else if (kind === 'scope') {
        const cx = W / 2, cy = H * 0.7, r = Math.min(W, H) * 0.3;
        const g = o.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
        g.addColorStop(0, 'rgba(0,0,0,.08)'); g.addColorStop(0.7, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,.9)');
        o.fillStyle = g; o.beginPath(); o.arc(cx, cy, r, 0, Math.PI * 2); o.fill();
        o.strokeStyle = '#fff'; o.lineWidth = r * 0.2; o.lineCap = 'round'; o.lineJoin = 'round';
        o.beginPath(); o.moveTo(cx - r * 0.42, cy + r * 0.02); o.lineTo(cx - r * 0.1, cy + r * 0.33); o.lineTo(cx + r * 0.45, cy - r * 0.3); o.stroke();
        o.strokeStyle = 'rgba(0,0,0,.35)'; o.lineWidth = r * 0.04; o.beginPath(); o.arc(cx, cy, r * 1.2, 0, Math.PI * 2); o.stroke();
      } else if (kind === 'files') {
        const cx = W / 2, cy = H * 0.33, r = Math.min(W, H) * 0.36;
        const g = o.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, 'rgba(0,0,0,.18)'); g.addColorStop(1, 'rgba(0,0,0,.08)');
        o.fillStyle = g; o.beginPath(); o.arc(cx, cy, r, 0, Math.PI * 2); o.fill();
        const fw = r * 1.15, fh = r * 0.82, fx = cx - fw / 2, fy = cy - fh / 2 + r * 0.06;
        const fg = o.createLinearGradient(0, fy, 0, fy + fh); fg.addColorStop(0, 'rgba(0,0,0,.95)'); fg.addColorStop(1, 'rgba(0,0,0,.55)');
        o.fillStyle = fg;
        o.beginPath(); o.moveTo(fx, fy + fh * 0.12); o.lineTo(fx + fw * 0.36, fy + fh * 0.12); o.lineTo(fx + fw * 0.44, fy); o.lineTo(fx + fw, fy); o.lineTo(fx + fw, fy + fh); o.lineTo(fx, fy + fh); o.closePath(); o.fill();
        o.fillStyle = 'rgba(255,255,255,.75)'; o.fillRect(fx + fw * 0.12, fy + fh * 0.42, fw * 0.76, fh * 0.07); o.fillRect(fx + fw * 0.12, fy + fh * 0.6, fw * 0.5, fh * 0.07);
      }
      src = o.getImageData(0, 0, oc.width, oc.height).data;
    };
    const size = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      step = Math.max(5, Math.round(W / 62));
      if (kind !== 'world') buildSource();
    };
    const draw = (now) => {
      const t = reduce ? 0 : (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = ink;
      const path = new Path2D();
      const reach = Math.min(W, H) * 0.22;
      if (kind === 'world') {
        const R = W * 0.8, cx = W * 0.78, cy = H * 1.02, rot = t * 0.12 + 1.2, tilt = 0.35;
        for (let y = step / 2; y < H; y += step) {
          for (let x = step / 2; x < W; x += step) {
            const nx = (x - cx) / R, ny = (cy - y) / R, d2 = nx * nx + ny * ny;
            if (d2 > 1) continue;
            const nz = Math.sqrt(1 - d2);
            // undo tilt then rotation to get lat/lng
            const y1 = ny * Math.cos(tilt) + nz * Math.sin(tilt), z1 = -ny * Math.sin(tilt) + nz * Math.cos(tilt);
            const x2 = nx * Math.cos(rot) - z1 * Math.sin(rot), z2 = nx * Math.sin(rot) + z1 * Math.cos(rot);
            const lat = Math.asin(Math.max(-1, Math.min(1, y1))) * 180 / Math.PI, lng = Math.atan2(x2, z2) * 180 / Math.PI;
            const light = Math.max(0, nx * -0.5 + ny * 0.45 + nz * 0.74);
            let v = isLand(lat, lng) ? 0.35 + 0.55 * (1 - light) : 0.06 + 0.12 * (1 - light);
            v *= 0.55 + 0.45 * nz;
            if (mouse) { const dx = x - mouse[0], dy = y - mouse[1], dd = Math.sqrt(dx * dx + dy * dy); if (dd < reach) v = Math.min(1, v + (1 - dd / reach) * 0.35); }
            const rr = step * 0.5 * Math.sqrt(v);
            if (rr > 0.35) { path.moveTo(x + rr, y); path.arc(x, y, rr, 0, Math.PI * 2); }
          }
        }
      } else if (src) {
        const iw = Math.round(W);
        for (let y = step / 2; y < H; y += step) {
          for (let x = step / 2; x < W; x += step) {
            const i = (Math.min(Math.round(H) - 1, Math.round(y)) * iw + Math.min(iw - 1, Math.round(x))) * 4;
            let v = 1 - src[i] / 255;
            if (v < 0.03 && !mouse) continue;
            if (kind === 'team') v *= 0.85 + 0.15 * Math.sin(x * 0.045 - t * 1.6);
            if (kind === 'files') v *= 0.9 + 0.1 * Math.sin(t * 1.4 + y * 0.03);
            if (kind === 'scope') v *= 0.9 + 0.1 * Math.sin(t * 1.1 + (x + y) * 0.03);
            if (mouse) { const dx = x - mouse[0], dy = y - mouse[1], dd = Math.sqrt(dx * dx + dy * dy); if (dd < reach) v = Math.min(1, v * (1 + (1 - dd / reach) * 0.9)); }
            const rr = step * 0.52 * Math.sqrt(Math.max(0, v));
            if (rr > 0.35) { path.moveTo(x + rr, y); path.arc(x, y, rr, 0, Math.PI * 2); }
          }
        }
      }
      ctx.fill(path);
    };
    const loop = (now) => { raf = requestAnimationFrame(loop); if (visible) draw(now); };
    size(); draw(performance.now());
    const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { size(); draw(performance.now()); }) : null;
    if (ro) ro.observe(cv);
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }) : null;
    if (io) io.observe(cv); else visible = true;
    const card = cv.closest('.ac') || cv;
    const onMove = (e) => { const r = cv.getBoundingClientRect(); mouse = [e.clientX - r.left, e.clientY - r.top]; };
    const onLeave = () => { mouse = null; };
    card.addEventListener('pointermove', onMove); card.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); card.removeEventListener('pointermove', onMove); card.removeEventListener('pointerleave', onLeave); };
  }, [kind, ink]);
  return <canvas ref={ref} className="ac-art" aria-hidden="true" />;
}
const ADV = [
  { kind: 'team', tone: 'paper', pos: 'bottom', title: 'Two studios, one team.', text: 'Your brand designer and your 3D artist sit at the same desk. The pack design and the render for the ad come out of one brief, so nothing gets lost between agencies.', proof: '2D + 3D in-house' },
  { kind: 'scope', tone: 'grey', pos: 'top', title: 'Fixed scope. Fixed price.', text: 'You see the deliverables, the timeline and the cost in writing before we start. No surprise line items, no hourly creep.', proof: 'Signed proposal before day one' },
  { kind: 'files', tone: 'black', pos: 'bottom', title: 'Every source file is yours.', text: 'Figma files, Illustrator artwork, Blender scenes and render passes, handed over with full rights on final payment.', proof: '.fig  .ai  .blend  .psd  .mp4' },
  { kind: 'world', tone: 'grey', pos: 'top', title: 'Based in Jabalpur. Working worldwide.', text: 'We keep a fixed weekly call in your time zone, share work in one feedback board, and invoice in INR or USD.', proof: 'IST · GST · GMT · ET' },
];
function Advantage() {
  return (
    <section id="advantage" className="band adv line-top">
      <div className="wrap">
        <SectionHead eyebrow="Why Jayastra" title="The Jayastra advantage" aside="Four things that are hard to find in one studio, and that set the studio apart." />
        <div className="adv4">
          {ADV.map((a, k) => (
            <Reveal key={a.kind} className={'ac ac-' + a.tone + ' ac-' + a.pos} delay={k * 0.08} amount={0.15}>
              <Halftone kind={a.kind} ink={a.tone === 'black' ? '#F2F2F2' : '#0E0E10'} />
              <span className="ac-mark" aria-hidden="true" />
              <div className="ac-body">
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <span className="ac-proof">{a.proof}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================================
   Testimonials — cards riding a slow wave
   ====================================================================== */
const TESTIMONIALS = [
  { q: 'Home base. The studio works from Jabalpur, Madhya Pradesh, with teams across India over calls, or in person when the project needs it.', who: 'IST · UTC+5:30', tag: 'Studio', city: 'Jabalpur', lat: 23.18, lng: 79.99, ini: 'JBP' },
  { q: 'Nearly the same working day. Calls, reviews and quick fixes happen in real time.', who: '1\u00BD hours behind IST', tag: 'Real-time', city: 'Dubai', lat: 25.2, lng: 55.27, ini: 'DXB' },
  { q: 'Your morning overlaps our afternoon. Send feedback by lunch and see it revised the next morning.', who: '4\u00BD\u20135\u00BD hours behind IST', tag: 'Overlap', city: 'London', lat: 51.5, lng: -0.12, ini: 'LON' },
  { q: 'We work while you sleep. Brief us in the evening and wake up to progress, with one shared call slot each week.', who: '9\u00BD\u201310\u00BD hours behind IST', tag: 'Overnight', city: 'New York', lat: 40.71, lng: -74.0, ini: 'NYC' },
  { q: 'Async by default: recorded walkthroughs, written notes in one thread, and an early call when a decision needs one.', who: '12\u00BD\u201313\u00BD hours behind IST', tag: 'Async', city: 'San Francisco', lat: 37.77, lng: -122.42, ini: 'SFO' },
  { q: 'Most of the day overlaps. Your lunch is our morning, so the whole afternoon is shared.', who: '2\u00BD hours ahead of IST', tag: 'Overlap', city: 'Singapore', lat: 1.35, lng: 103.82, ini: 'SIN' },
];
/* 3D dot globe: land-only dots from a 2-degree world mask (Natural Earth 110m via world-atlas). */
const LAND_ROWS = '000000000000000000000000000000000000000000000 000000000000000000000000000000000000000000000 000000000000000000000000000000000000000000000 0000000000007fe01ff80000000000000000000000000 00000000001fffffffffe000000000000060000000000 00000000015ff5ffffff8000f8000000007c000000000 000000020033e1ffffff0000400000100007000000000 00000000f9afc00fffff00000000030003ffc001c0000 0000001fd9f7e003fffe000000000c043fffffc080000 001c0009fe77fe01fffe000003800c1fffffffffffc00 81fffffffc7ddf01fff800001ff804fffffffffffffff f8ffffffffff87e1ff8000007ffcfffffffffffffffff 33ffffffffff9fc0fc01e001fbf7fffffffffffffffff 00fffffffff00380f8000003efffffffffffffffffffe 01ffffffffe01e007800000fe7ffffffffffffffff7f0 007c0fffffe01f6000000007e3ffffffffffffffd6300 003801fffffc1fe000000182cfffffffffffffff00e00 008000ffffff9ff8000003c20ffffffffffffffc00e00 0000007fffffbffc000006efffffffffffffffffc0c00 0000003ffffffffc000000dfffffffffffffffffc0000 0000000fffffffae000000ffffffffffffffffff40000 0000000fffffffc1000000ffffffffffffffffff00000 0000000fffffffe00000007fff97fffffffffffe40000 0000000ffffffe00000007f9bf03fffffffffff8c0000 0000000ffffffc00000007e2cf7fffffffffffe080000 0000000ffffff800000007c00dfffffffffff8c080000 00000007fffff0000000038e84fffffffffffe6180000 00000007fffff000000001ff000ffffffffffc4f00000 00000001ffffc000000007ff801ffffffffffe1000000 00000000ffffc000000007ffeffffffffffffe0000000 00000000ffe8c000000007ffffffdffffffffe0000000 000000003fc0400000001fffffefeffffffffc0000000 000000003fc0000000003ffffffff4dffffffc0000000 000000000780600000003ffffff7ff0ffffff00000000 000000000784380000003ffffffbff07fcff400000000 0000000007ec070000003ffffffbfe03f87e400000000 0000000001fc000000003ffffff9f801e07f020000000 00000000001f000000007fffffffe001c01f020000000 000000000007000000003fffffff8001c01f810000000 000000000001070000003fffffff7000c013010000000 000000000000fff000001fffffffe000a010018000000 0000000000001ff800000fffffffe0002008008000000 0000000000001fff00000787ffffc000002c180000000 0000000000001fff80000001ffffc0000034380000000 0000000000003fff80000001ffff0000001cf80000000 0000000000007ffff0000003fffe0000000c7a0800000 0000000000003ffffe000001fffc00000006720fc0000 0000000000007fffff000000fffc000000060203e4000 0000000000003fffff800000fffc000000016001f0000 0000000000001fffff800000fffc00000000008098000 0000000000001fffff0000007ffc00000000000800000 0000000000000ffffe000000fffc00000000001e40000 0000000000000ffffe000000fffc6000000000fc60000 00000000000007fffe000000fff8e000000001ffe0000 00000000000001fffc000000fff0e000000003fff0000 00000000000001fffc0000007ff0c00000000ffff8000 00000000000001fff80000007ff0c00000001ffff8000 00000000000001ffc00000007fe0800000001ffffc000 00000000000003ffc00000003fe0000000001ffffe000 00000000000003ffc00000003fc0000000001ffffe000 00000000000003ff800000001f80000000000ffffe000 00000000000003ff000000001f00000000001f07fc000 00000000000003fc000000001000000000000801fc000 00000000000007fc000000000000000000000000f8000 00000000000007f000000000000000000000000000006 00000000000007c000000000000000000000000010008 00000000000007c000000000000000000000000010018 000000000000078000000000000000000000000000070 0000000000000f8000000000000000000000000000000 0000000000000f8000000000000000000000000000000 0000000000000f0000000000000000000000000000000 000000000000070000000000000000000000000000000 000000000000038000000000000000000000000000000 000000000000000000000000000000000000000000000 000000000000000000000000000000000000000000000 000000000000000000000000000000000000000000000 000000000000000000000000000000000000000000000 000000000000002000000000000000000000000000000 00000000000000c00000000000001f0007dfffffe0000 00000000000000e000000000003bfff87fffffffff800 00000000000007e00000015ffffffff3fffffffffffe0 0000000001c703f000001ffffffffffffffffffffffe0 00001fffffffffc000007ffffffffffffffffffffff80 001dfffffffff800001ffffffffffffffffffffffff00 004ffffffffff00070fffffffffffffffffffffffff80 0007ffffffffff51e0ffffffffffffffffffffffffe00 0007fffffffffffffffffffffffffffffffffffffffe0 0033c0000000000000000000000000000000000000000 000000000000000000000000000000000000000000000 000000000000000000000000000000000000000000000'.split(' ');
const isLand = (lat, lng) => {
  const y = Math.min(89, Math.max(0, Math.floor((90 - lat) / 2)));
  const x = Math.min(179, Math.max(0, Math.floor((((lng + 180) % 360) + 360) % 360 / 2)));
  const v = parseInt(LAND_ROWS[y][x >> 2], 16);
  return (v & (8 >> (x & 3))) !== 0;
};
const toVec = (lat, lng) => {
  const a = (lat * Math.PI) / 180, b = (lng * Math.PI) / 180;
  return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)];
};
const rotT = (v, ay, tilt) => {
  const x = v[0] * Math.cos(ay) + v[2] * Math.sin(ay);
  const z1 = -v[0] * Math.sin(ay) + v[2] * Math.cos(ay);
  const y = v[1] * Math.cos(tilt) - z1 * Math.sin(tilt);
  const z = v[1] * Math.sin(tilt) + z1 * Math.cos(tilt);
  return [x, y, z];
};
const GLOBE_DOTS = (() => {
  const out = [], N = 16000, ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
    const v = [Math.cos(th) * r, y, Math.sin(th) * r];
    const lat = (Math.asin(v[1]) * 180) / Math.PI;
    if (lat < -58) continue;
    const lng = (Math.atan2(v[0], v[2]) * 180) / Math.PI;
    if (!isLand(lat, lng)) continue;
    const coast = !isLand(lat + 2, lng) || !isLand(lat - 2, lng) || !isLand(lat, lng + 2.4) || !isLand(lat, lng - 2.4);
    out.push([v[0], v[1], v[2], coast ? 1 : 0]);
  }
  return out;
})();

function GlobeQuotes() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const [tick, setTick] = useState(0);
  const cvRef = useRef(null);
  const boxRef = useRef(null);
  const pins = useRef([]);
  const st = useRef({ a: 0, tilt: 0.38, target: null, vel: 0, drag: null, mouse: null, ripple: null });
  const n = TESTIMONIALS.length;
  const go = (k) => { setIdx(((k % n) + n) % n); setTick((t) => t + 1); };
  useEffect(() => {
    const t = TESTIMONIALS[idx];
    st.current.target = -((t.lng * Math.PI) / 180) + 0.3;
    st.current.ripple = { k: idx, t0: performance.now() };
  }, [idx]);
  useEffect(() => {
    if (reduce || hover) return undefined;
    const id = setTimeout(() => go(idx + 1), 6500);
    return () => clearTimeout(id);
  }, [idx, hover, tick]);
  useEffect(() => {
    const cv = cvRef.current, box = boxRef.current;
    if (!cv || !box) return undefined;
    const ctx = cv.getContext('2d');
    const vecs = TESTIMONIALS.map((t) => toVec(t.lat, t.lng));
    const L = [-0.55, 0.5, 0.67];
    let W = 0, raf = 0, visible = false, last = performance.now();
    const size = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      cv.width = Math.round(W * dpr); cv.height = Math.round(W * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const s = st.current;
    const local = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const onDown = (e) => { s.drag = { x: e.clientX, y: e.clientY, a: s.a, tilt: s.tilt, lx: e.clientX, lt: performance.now() }; s.target = null; s.vel = 0; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } box.classList.add('grabbing'); };
    const onMove = (e) => {
      s.mouse = local(e);
      if (!s.drag) return;
      const k = 2.6 / Math.max(1, W);
      s.a = s.drag.a + (e.clientX - s.drag.x) * k;
      s.tilt = clamp(s.drag.tilt + (e.clientY - s.drag.y) * k * 0.6, -0.1, 0.8);
      const now = performance.now(), dt = Math.max(1, now - s.drag.lt);
      s.vel = ((e.clientX - s.drag.lx) * k) / (dt / 1000) * 0.9;
      s.drag.lx = e.clientX; s.drag.lt = now;
    };
    const onUp = () => { s.drag = null; box.classList.remove('grabbing'); };
    const onLeave = () => { s.mouse = null; };
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp);
    cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('pointerleave', onLeave);
    const draw = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!s.drag) {
        if (Math.abs(s.vel) > 0.01) { s.a += s.vel * dt; s.vel *= Math.pow(0.12, dt); }
        else if (s.target != null) {
          let d = s.target - s.a; d = Math.atan2(Math.sin(d), Math.cos(d));
          s.a += d * Math.min(1, dt * 3.0);
          if (Math.abs(d) < 0.003) s.target = null;
        } else if (!reduce) s.a += 0.05 * dt;
        s.tilt += (0.38 - s.tilt) * Math.min(1, dt * 0.8);
      }
      const c = W / 2, R = W * 0.4;
      ctx.clearRect(0, 0, W, W);
      // atmosphere
      const glow = ctx.createRadialGradient(c, c, R * 0.92, c, c, R * 1.22);
      glow.addColorStop(0, 'rgba(210,78,1,0.16)'); glow.addColorStop(0.45, 'rgba(210,78,1,0.06)'); glow.addColorStop(1, 'rgba(210,78,1,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(c, c, R * 1.22, 0, TAU); ctx.fill();
      // body
      const g = ctx.createRadialGradient(c - R * 0.38, c - R * 0.42, R * 0.05, c, c, R);
      g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.7, '#F6F1EB'); g.addColorStop(1, '#E9E1D7');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(14,14,16,.07)'; ctx.lineWidth = 1; ctx.stroke();
      // dots
      const m = s.mouse, reach = R * 0.24;
      const rip = s.ripple, ripAge = rip ? (now - rip.t0) / 1000 : 9;
      const rv = rip && ripAge < 1.6 ? rotT(vecs[rip.k], s.a, s.tilt) : null;
      const groups = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      const hot = new Path2D();
      const base = Math.max(0.9, W / 420);
      for (let i = 0; i < GLOBE_DOTS.length; i++) {
        const p = GLOBE_DOTS[i];
        const v = rotT(p, s.a, s.tilt);
        if (v[2] < -0.02) continue;
        let x = c + v[0] * R, y = c - v[1] * R;
        const lit = v[0] * L[0] + v[1] * L[1] + v[2] * L[2];
        let r = (p[3] ? 0.75 : 1.05) * base * (0.55 + 0.6 * v[2]);
        let isHot = false;
        if (m) {
          const dx = x - m[0], dy = y - m[1], d = Math.sqrt(dx * dx + dy * dy);
          if (d < reach) { const f = 1 - d / reach; r *= 1 + f * 1.3; x += (dx / (d || 1)) * f * 5; y += (dy / (d || 1)) * f * 5; isHot = f > 0.35; }
        }
        if (rv) {
          const dd = Math.sqrt((v[0] - rv[0]) ** 2 + (v[1] - rv[1]) ** 2) * R;
          const front = ripAge * R * 0.55;
          const w = Math.abs(dd - front);
          if (w < 12) { const f = (1 - w / 12) * (1 - ripAge / 1.6); r *= 1 + f * 0.9; if (f > 0.3) isHot = true; }
        }
        const band = lit > 0.55 ? 0 : lit > 0.2 ? 1 : lit > -0.2 ? 2 : 3;
        const path = isHot ? hot : groups[band];
        path.moveTo(x + r, y); path.arc(x, y, r, 0, TAU);
      }
      const tones = ['rgba(14,14,16,.82)', 'rgba(14,14,16,.62)', 'rgba(14,14,16,.42)', 'rgba(14,14,16,.24)'];
      groups.forEach((pth, k) => { ctx.fillStyle = tones[k]; ctx.fill(pth); });
      ctx.fillStyle = '#D24E01'; ctx.fill(hot);
      // rim light
      const rim = ctx.createRadialGradient(c, c, R * 0.8, c, c, R);
      rim.addColorStop(0, 'rgba(255,255,255,0)'); rim.addColorStop(1, 'rgba(255,255,255,0.55)');
      ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.fill();
      vecs.forEach((v0, k) => {
        const el = pins.current[k];
        if (!el) return;
        const v = rotT(v0, s.a, s.tilt);
        const vis = clamp((v[2] + 0.05) / 0.25, 0, 1);
        el.style.transform = 'translate(' + (c + v[0] * R).toFixed(1) + 'px,' + (c - v[1] * R).toFixed(1) + 'px)';
        el.classList.toggle('flip', v[0] > 0.12);
        el.style.opacity = vis.toFixed(3);
        el.style.pointerEvents = vis > 0.4 ? 'auto' : 'none';
        el.tabIndex = vis > 0.4 ? 0 : -1;
      });
    };
    const loop = (now) => { raf = requestAnimationFrame(loop); if (visible) draw(now); };
    size(); draw(performance.now());
    const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { size(); draw(performance.now()); }) : null;
    if (ro) ro.observe(box);
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }) : null;
    if (io) io.observe(box); else visible = true;
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect();
      cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerup', onUp); cv.removeEventListener('pointercancel', onUp); cv.removeEventListener('pointerleave', onLeave);
    };
  }, []);
  const t = TESTIMONIALS[idx];
  return (
    <div className="gq" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="gq-text">
        <p className="gq-hint">Drag the globe, or pick a pin to see how a project runs from that time zone.</p>
        <div className="gq-quote" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure key={idx} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: EASE }}>
              <span className="tcard-tag">{t.tag}</span>
              <blockquote>{t.q}</blockquote>
              <figcaption>
                <span className="av" aria-hidden="true">{t.ini}</span>
                <span><b>{t.city}</b>{t.who}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <div className="gq-ctrl">
          <button className="icon-btn" onClick={() => go(idx - 1)} aria-label="Previous time zone"><Arrow dir="w" /></button>
          <button className="icon-btn" onClick={() => go(idx + 1)} aria-label="Next time zone"><Arrow dir="e" /></button>
          <span className="gq-bar" aria-hidden="true">
            <motion.i key={idx + '-' + tick + (hover ? 'h' : '')} initial={{ scaleX: 0 }} animate={{ scaleX: hover || reduce ? 0 : 1 }} transition={{ duration: hover || reduce ? 0 : 6.5, ease: 'linear' }} />
          </span>
          <span className="gq-count">{String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        </div>
      </div>
      <div className="gq-globe" ref={boxRef}>
        <canvas ref={cvRef} aria-hidden="true" />
        {TESTIMONIALS.map((q, k) => (
          <button key={q.city} ref={(el) => { pins.current[k] = el; }} className={'gq-pin' + (k === idx ? ' on' : '')} onClick={() => go(k)} aria-label={'Show working hours for ' + q.city} aria-pressed={k === idx}>
            <i className="gq-dot" aria-hidden="true" />
            <span className="gq-label"><b>{q.city}</b><small>{q.who}</small></span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <section id="clients" className="band line-top">
      <div className="wrap">
        <SectionHead eyebrow="Worldwide" title="Based in Jabalpur. Working across time zones." aside="Every project runs on one shared thread, recorded walkthroughs and a call slot that suits your hours." />
        <Reveal amount={0.1}><GlobeQuotes /></Reveal>
      </div>
    </section>
  );
}

/* ======================================================================
   Pricing — floating cards that tilt toward the cursor
   ====================================================================== */
const Check = () => (
  <svg className="chk" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const RETAINER = ['No long contracts', 'Pause or cancel anytime', 'Unlimited requests, one at a time', 'Brand, web and 3D work', '48-hour average turnaround', 'Weekly check-in call'];
const PROJECT = ['Clearly defined scope', 'Fixed timeline', 'Two revision rounds', 'Milestone updates'];

/* Pricing in the "floating card" layout: a dark card drifts over the corner of the intro card. */
function Pricing() {
  const reduce = useReducedMotion();
  const zoneRef = useRef(null);
  const rx = useSpring(0, { stiffness: 120, damping: 16 });
  const ry = useSpring(0, { stiffness: 120, damping: 16 });
  const onMove = (e) => {
    if (!isFine() || !zoneRef.current) return;
    const r = zoneRef.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return (
    <section id="pricing" className="band line-top">
      <div className="wrap">
        <SectionHead eyebrow="Engagements" title="Work with us monthly, or by the project." aside="Every quote is scoped to the work. Rates below are starting points; the final price follows the scope." />
        <Reveal className="pframe" amount={0.1}>
          <div className="ptop">
            <div className="pcard-intro" ref={zoneRef} onMouseMove={onMove} onMouseLeave={onLeave}>
              <div className="float-wrap">
                <motion.div className="float-card" style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
                  animate={reduce ? { rotate: -4 } : { y: [0, -10, 0], rotate: [-4, -2.6, -4] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                  <span className="float-pill">Pause or cancel anytime</span>
                  <svg className="float-spear" viewBox="4 1 117 251" aria-hidden="true">
                    <defs><linearGradient id="spearGloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFB27A" /><stop offset=".45" stopColor="#E8620F" /><stop offset="1" stopColor="#7E2F00" /></linearGradient></defs>
                    <path fill="url(#spearGloss)" fillRule="evenodd" d={SPEAR_PATH} />
                  </svg>
                  <p className="float-t">Design and 3D on retainer<br /><b>for brands that ship every week.</b></p>
                </motion.div>
              </div>
              <span className="slots"><i />Taking on new work</span>
              <h3>Work with us</h3>
              <p>Skip the agency layers and work directly with the designer who does the work.</p>
            </div>
            <div className="pcard-main">
              <h3>Monthly retainer</h3>
              <p className="sub">One flat monthly fee for ongoing design. Ideal for teams that ship every week.</p>
              <hr />
              <p className="price">₹60,000 <small>/ month</small></p>
              <ul className="feat">{RETAINER.map((t) => <li key={t}><Check />{t}</li>)}</ul>
              <div className="pmain-cta">
                <MagLink href="#contact" className="btn btn-ink" strength={0.18}>Get started <Arrow /></MagLink>
                <span className="pnote">Billed monthly in advance</span>
              </div>
            </div>
          </div>
          <div className="pbar">
            <div className="pbar-head">
              <h3>Single project</h3>
              <p>One-off work with a defined start and finish. Sprints from ₹25,000, full projects from ₹1,20,000.</p>
            </div>
            <ul className="feat dark">{PROJECT.map((t) => <li key={t}><Check />{t}</li>)}</ul>
            <MagLink href="#contact" className="btn btn-white" strength={0.18}>Get a quote <Arrow /></MagLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ======================================================================
   FAQ
   ====================================================================== */
const FAQS = [
  ['How long does a typical project take?', 'A brand identity runs 3–5 weeks, a website 4–8 weeks and a 3D render set 1–2 weeks. You get an exact timeline in the proposal before we start.'],
  ['Do you work with clients outside India?', 'Yes. We work remotely across time zones, keep a fixed weekly call slot that suits yours, and invoice in INR or USD.'],
  ['What do you need from us to start?', 'A short brief, any existing brand material and one decision-maker who can approve work. We send the questionnaire.'],
  ['How many revisions are included?', 'Two structured rounds per deliverable. Beyond that we bill hourly, which rarely happens because feedback is collected in one place.'],
  ["Can you render a product that doesn't exist yet?", 'Yes, that is what 3D is for. Send CAD files, technical drawings or dimensioned sketches and we build it in Blender.'],
  ['What are your payment terms?', '50% to book the slot and 50% on delivery. Retainers are billed monthly in advance.'],
];
function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="band line-top">
      <div className="wrap faq-wrap">
        <div className="faq-side">
          <Reveal as="p" className="eyebrow">FAQ</Reveal>
          <Reveal as="h2" className="h2" delay={0.06} style={{ maxWidth: '12ch' }}>{dot('Questions we get asked a lot.')}</Reveal>
        </div>
        <Reveal className="faq-list" delay={0.1} amount={0.1}>
          {FAQS.map(([q, a], k) => {
            const on = open === k;
            return (
              <div className="faq-item" key={q}>
                <h3 style={{ margin: 0 }}>
                  <button className="faq-q" aria-expanded={on} aria-controls={'faq-' + k} id={'faq-q-' + k} onClick={() => setOpen(on ? -1 : k)}>
                    <span>{q}</span><span className={'plus' + (on ? ' on' : '')} aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on ? (
                    <motion.div className="faq-a" id={'faq-' + k} role="region" aria-labelledby={'faq-q-' + k} key="a"
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                      <p>{a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

/* ======================================================================
   The mark — the logo drawn in glyphs, on for five seconds, off for five
   ====================================================================== */
function GlyphMark() {
  const cvRef = useRef(null);
  const [fine] = useState(() => isFine());
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    if (!ctx) return undefined;
    const reduce = reducedNow();
    let W = 0, H = 0, cs = 9, cols = 0, rows = 0, N = 0;
    let lvl = null, hue = null, delay = null, seed = null, trail = null, logoIdx = [];
    let raf = 0, visible = false, seen = false, last = performance.now(), trailOn = false;
    let mode = 'on', modeAt = performance.now();
    let lastPt = null;
    const img = new Image();
    let imgOk = false;

    const build = () => {
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cs = W < 640 ? 6 : W < 1100 ? 8 : 9;
      cols = Math.floor(W / cs); rows = Math.floor(H / cs); N = cols * rows;
      lvl = new Float32Array(N); hue = new Uint8Array(N); delay = new Float32Array(N); seed = new Float32Array(N); trail = new Float32Array(N);
      const aspect = 1022 / 281;
      let lw = Math.floor(cols * (W < 640 ? 0.94 : 0.8));
      let lh = Math.round(lw / aspect);
      if (lh > rows * 0.82) { lh = Math.floor(rows * 0.82); lw = Math.round(lh * aspect); }
      const ox = Math.floor((cols - lw) / 2), oy = Math.floor((rows - lh) / 2);
      const sample = (useImg) => {
        const off = document.createElement('canvas');
        off.width = lw; off.height = lh;
        const o = off.getContext('2d');
        if (useImg) { o.imageSmoothingQuality = 'high'; o.drawImage(img, 0, 0, lw, lh); }
        else {
          o.font = '600 ' + Math.round(lh * 0.82) + 'px Archivo, sans-serif';
          o.textBaseline = 'middle';
          const tw = o.measureText('Jayastra').width;
          o.fillStyle = '#ffffff';
          o.fillText('Jayastra', Math.max(0, (lw - tw) / 2), lh / 2);
        }
        return o.getImageData(0, 0, lw, lh).data;
      };
      let data = null;
      try { data = sample(imgOk); } catch (e) { try { data = sample(false); } catch (e2) { data = null; } }
      logoIdx = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const k = y * cols + x;
          seed[k] = Math.random();
          delay[k] = (x / cols) * 0.95 + seed[k] * 0.4;
          const lx = x - ox, ly = y - oy;
          if (data && lx >= 0 && ly >= 0 && lx < lw && ly < lh) {
            const p = (ly * lw + lx) * 4;
            const a = data[p + 3] / 255;
            if (a > 0.16) {
              lvl[k] = a;
              hue[k] = data[p] > 150 && data[p + 1] < 150 && data[p + 2] < 100 ? 1 : 0;
              logoIdx.push(k);
            }
          }
        }
      }
      if (reduce) draw(performance.now());
    };
    const glyph = (sp, fp, g, cx, cy, s) => {
      if (g === 1) { const r = s * 0.17; fp.moveTo(cx + r, cy); fp.arc(cx, cy, r, 0, TAU); }
      else if (g === 2) { const a = s * 0.34; sp.moveTo(cx - a, cy); sp.lineTo(cx + a, cy); sp.moveTo(cx, cy - a); sp.lineTo(cx, cy + a); }
      else if (g === 3) { const a = s * 0.27; sp.moveTo(cx - a, cy - a); sp.lineTo(cx + a, cy + a); sp.moveTo(cx + a, cy - a); sp.lineTo(cx - a, cy + a); }
      else if (g === 4) { const r = s * 0.3; sp.moveTo(cx + r, cy); sp.arc(cx, cy, r, 0, TAU); }
      else if (g === 5) { const a = s * 0.44; fp.moveTo(cx, cy - a); fp.lineTo(cx + a, cy); fp.lineTo(cx, cy + a); fp.lineTo(cx - a, cy); fp.closePath(); }
      else if (g === 6) { const a = s * 0.35; fp.rect(cx - a, cy - a, a * 2, a * 2); }
    };
    const pick = (l, s) => (l < 0.4 ? 1 : l < 0.6 ? 2 : l < 0.8 ? 3 : s < 0.18 ? 4 : s < 0.55 ? 5 : 6);
    const draw = (now) => {
      if (!N) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce && now - modeAt > 5000) { mode = mode === 'on' ? 'off' : 'on'; modeAt = now; }
      const el = (now - modeAt) / 1000;
      const t = reduce ? 2 : now / 1000;
      ctx.clearRect(0, 0, W, H);
      const amb = new Path2D();
      for (let y = 0; y < rows; y++) {
        const cy = y * cs + cs / 2;
        for (let x = 0; x < cols; x++) {
          const a = 0.5 + 0.5 * Math.sin(x * 0.075 + t * 0.5 + Math.sin(y * 0.12 - t * 0.35) * 1.7);
          if (a < 0.6) continue;
          const r = cs * (0.06 + (a - 0.6) * 0.3);
          const cx = x * cs + cs / 2;
          amb.moveTo(cx + r, cy);
          amb.arc(cx, cy, r, 0, TAU);
        }
      }
      ctx.fillStyle = '#E1DED7';
      ctx.fill(amb);
      ctx.lineWidth = Math.max(1, cs * 0.15);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let h = 0; h < 2; h++) {
        const sp = new Path2D(), fp = new Path2D();
        for (let j = 0; j < logoIdx.length; j++) {
          const k = logoIdx[j];
          if (hue[k] !== h) continue;
          let v;
          if (reduce) v = 1;
          else if (mode === 'on') v = clamp((el - delay[k]) / 0.45, 0, 1);
          else v = 1 - clamp((el - delay[k] * 0.85) / 0.4, 0, 1);
          if (v <= 0.02) continue;
          const x = k % cols, y = (k / cols) | 0;
          const g = v < 1 ? 1 + ((((seed[k] * 97) | 0) + ((t * 16) | 0)) % 6) : pick(lvl[k], seed[k]);
          glyph(sp, fp, g, x * cs + cs / 2, y * cs + cs / 2, cs * (0.45 + 0.55 * v));
        }
        const col = h ? '#D24E01' : '#0E0E10';
        ctx.strokeStyle = col;
        ctx.fillStyle = col;
        ctx.stroke(sp);
        ctx.fill(fp);
      }
      if (trailOn) {
        let any = false;
        const keep = Math.exp(-dt / 0.6);
        const sp = new Path2D();
        for (let k = 0; k < N; k++) {
          const v = trail[k];
          if (v < 0.03) { trail[k] = 0; continue; }
          any = true;
          trail[k] = v * keep;
          const x = k % cols, y = (k / cols) | 0;
          const cx = x * cs + cs / 2, cy = y * cs + cs / 2, s = cs * (0.4 + 0.8 * v);
          const a = s * 0.42, b = s * 0.2;
          sp.moveTo(cx - a, cy); sp.lineTo(cx + a, cy); sp.moveTo(cx, cy - a); sp.lineTo(cx, cy + a);
          sp.moveTo(cx - b, cy - b); sp.lineTo(cx + b, cy + b); sp.moveTo(cx + b, cy - b); sp.lineTo(cx - b, cy + b);
        }
        ctx.strokeStyle = 'rgba(210,78,1,.9)';
        ctx.stroke(sp);
        trailOn = any;
      }
    };
    const loop = (now) => { raf = 0; if (!visible) return; draw(now); raf = requestAnimationFrame(loop); };
    const stamp = (px, py) => {
      const cx = px / cs, cy = py / cs, R = W < 640 ? 4 : 6;
      for (let y = Math.max(0, Math.floor(cy - R)); y <= Math.min(rows - 1, Math.ceil(cy + R)); y++) {
        for (let x = Math.max(0, Math.floor(cx - R)); x <= Math.min(cols - 1, Math.ceil(cx + R)); x++) {
          const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
          if (d > R) continue;
          const k = y * cols + x, v = 1 - d / R;
          if (v > trail[k]) trail[k] = v;
        }
      }
      trailOn = true;
    };
    const onMove = (e) => {
      if (reduce || !isFine() || !N) return;
      const r = cv.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      if (lastPt) {
        const dx = px - lastPt[0], dy = py - lastPt[1];
        const steps = Math.min(14, Math.ceil(Math.hypot(dx, dy) / (cs * 2)));
        for (let s = 1; s <= steps; s++) stamp(lastPt[0] + (dx * s) / steps, lastPt[1] + (dy * s) / steps);
      } else stamp(px, py);
      lastPt = [px, py];
    };
    const onLeave = () => { lastPt = null; };
    img.onload = () => { imgOk = true; build(); };
    img.onerror = () => { build(); };
    img.src = LOGO_LIGHT;
    const ro = 'ResizeObserver' in window ? new ResizeObserver(build) : null;
    if (ro) ro.observe(cv); else window.addEventListener('resize', build);
    build();
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !seen) { seen = true; mode = 'on'; modeAt = performance.now(); }
      if (visible && !reduce && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
      if (visible && reduce) draw(performance.now());
    }, { rootMargin: '60px' }) : null;
    if (io) io.observe(cv); else { visible = true; raf = requestAnimationFrame(loop); }
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', build);
      if (io) io.disconnect();
      cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerleave', onLeave);
    };
  }, []);
  return (
    <section id="mark" className="mark" aria-labelledby="mark-h">
      <div className="wrap">
        <Reveal as="p" className="eyebrow" id="mark-h">The mark</Reveal>
      </div>
      <canvas ref={cvRef} className="mark-canvas" role="img" aria-label="The Jayastra logo drawn in small glyphs. It assembles for five seconds, then dissolves for five." />
      <div className="wrap mark-foot">
        <Reveal as="dl" className="mark-def">
          <div><dt>Jaya<span lang="sa">जय</span></dt><dd>victory</dd></div>
          <div><dt>Astra<span lang="sa">अस्त्र</span></dt><dd>the weapon that wins it</dd></div>
        </Reveal>
        <Reveal as="p" className="mark-note" delay={0.08}>
          The t in our name is a spear. We aim every project the same way.
          {fine ? <small>Move your cursor through the field</small> : null}
        </Reveal>
      </div>
    </section>
  );
}

/* ======================================================================
   Contact
   ====================================================================== */
/* Tile field behind the contact section: soft raised tiles lift around the cursor
   and settle back behind it, leaving a short trail. */
function TileField() {
  const ref = useRef(null);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const size = () => {
      const r = el.getBoundingClientRect();
      const cell = r.width < 640 ? 52 : 70;
      setGrid({ cols: Math.ceil(r.width / cell) + 1, rows: Math.ceil(r.height / cell) + 1 });
    };
    size();
    const ro = 'ResizeObserver' in window ? new ResizeObserver(size) : null;
    if (ro) ro.observe(el); else window.addEventListener('resize', size);
    return () => { if (ro) ro.disconnect(); else window.removeEventListener('resize', size); };
  }, []);
  useEffect(() => {
    const el = ref.current;
    const host = el && el.parentElement;
    if (!el || !host || !grid.cols) return undefined;
    const tiles = Array.prototype.slice.call(el.children);
    const n = tiles.length;
    const val = new Float32Array(n), shown = new Float32Array(n).fill(-1);
    const reduce = reducedNow();
    let mx = null, my = null, raf = 0, visible = false, last = performance.now();
    const centers = () => tiles.map((t) => [t.offsetLeft + t.offsetWidth / 2, t.offsetTop + t.offsetHeight / 2]);
    let pts = centers();
    const onMove = (e) => {
      if (!isFine()) return;
      const r = el.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };
    const onLeave = () => { mx = null; };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const keep = Math.exp(-dt / 0.45);
      const R = el.clientWidth < 640 ? 110 : 170;
      for (let k = 0; k < n; k++) {
        let target = 0;
        const [x, y] = pts[k];
        if (mx != null) {
          const d = Math.hypot(x - mx, y - my);
          if (d < R) target = 1 - d / R;
        } else if (!reduce) {
          target = Math.max(0, Math.sin(x * 0.006 + y * 0.004 - now / 1400)) * 0.28;
        }
        const v = Math.max(val[k] * keep, target);
        val[k] = v;
        if (Math.abs(v - shown[k]) > 0.008) { shown[k] = v; tiles[k].style.setProperty('--v', v.toFixed(3)); }
      }
    };
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }) : null;
    if (io) io.observe(el); else visible = true;
    const onResize = () => { pts = centers(); };
    window.addEventListener('resize', onResize);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    if (!reduce) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); if (io) io.disconnect(); window.removeEventListener('resize', onResize); host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave); };
  }, [grid]);
  const cells = [];
  for (let k = 0; k < grid.cols * grid.rows; k++) cells.push(<span key={k} className="tile" />);
  return <div className="tiles" ref={ref} aria-hidden="true" style={{ gridTemplateColumns: 'repeat(' + grid.cols + ', var(--cell))' }}>{cells}</div>;
}

const NEEDS = ['UX research', 'Brand identity', 'Rebrand or redesign', 'Website or app', 'App development', '3D rendering', '3D animation', 'Social and ads', 'Monthly retainer'];
const BUDGETS = ['Under ₹1 lakh', '₹1–3 lakh', '₹3–6 lakh', '₹6 lakh +'];
const WHEN = ['This month', 'Next 1–3 months', 'Just exploring'];
const NEXT = [
  ['We reply within a working day', 'A real reply from the designer, with any questions we need answered first.'],
  ['A 20-minute call', 'We talk through the work, the timeline and roughly what it costs. No pitch deck.'],
  ['A written proposal in 48 hours', 'Scope, deliverables, dates and a fixed price. Nothing starts until you sign it.'],
];
function ChipGroup({ label, id, options, value, onChange, multi, error }) {
  const isOn = (o) => (multi ? value.indexOf(o) >= 0 : value === o);
  const pick = (o) => {
    if (multi) onChange(isOn(o) ? value.filter((x) => x !== o) : value.concat([o]));
    else onChange(o);
  };
  return (
    <div className="field">
      <span className="flabel" id={id}>{label}{multi ? <small>Pick any</small> : null}</span>
      <div className="chips" role="group" aria-labelledby={id}>
        {options.map((o) => <button type="button" key={o} className="chip" aria-pressed={isOn(o)} onClick={() => pick(o)}>{o}</button>)}
      </div>
      {error ? <p className="ferr" role="alert">{error}</p> : null}
    </div>
  );
}
/* ======================================================================
   Booker — cal.com-style call scheduler (studio hours in IST)
   ====================================================================== */
const BK_HOURS = [10, 19];           // studio hours, IST
const BK_DAYS = [1, 2, 3, 4, 5, 6];  // Mon–Sat
const BK_LEN = 20;                   // minutes
const BK_ZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney'];
const BK_CODES = [['IN', '+91'], ['AE', '+971'], ['GB', '+44'], ['US', '+1'], ['SG', '+65'], ['AU', '+61'], ['DE', '+49']];
const flag = (cc) => cc.replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
const dkey = (d, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
function bkSlots(tz) {
  const out = {};
  const now = Date.now() + 2 * 3600e3;
  const ist = new Date(Date.now() + 5.5 * 3600e3);
  for (let i = 0; i < 45; i++) {
    const y = ist.getUTCFullYear(), m = ist.getUTCMonth(), d = ist.getUTCDate() + i;
    const dow = new Date(Date.UTC(y, m, d)).getUTCDay();
    if (BK_DAYS.indexOf(dow) < 0) continue;
    for (let mins = BK_HOURS[0] * 60; mins + BK_LEN <= BK_HOURS[1] * 60; mins += 30) {
      const t = Date.UTC(y, m, d, 0, mins) - 5.5 * 3600e3;
      if (t < now) continue;
      const k = dkey(new Date(t), tz);
      (out[k] = out[k] || []).push(t);
    }
  }
  return out;
}
function Booker() {
  const guessTz = (() => { try { const z = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'; return z === 'Asia/Calcutta' ? 'Asia/Kolkata' : z; } catch (e) { return 'Asia/Kolkata'; } })();
  const [tz, setTz] = useState(guessTz);
  const zones = BK_ZONES.indexOf(guessTz) >= 0 ? BK_ZONES : [guessTz].concat(BK_ZONES);
  const slots = useMemo(() => bkSlots(tz), [tz]);
  const firstKey = Object.keys(slots).sort()[0];
  const today = dkey(new Date(), tz);
  const [view, setView] = useState(() => { const k = (firstKey || today).split('-'); return [+k[0], +k[1] - 1]; });
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [h12, setH12] = useState(true);
  const [step, setStep] = useState('pick');
  const [f, setF] = useState({ name: '', email: '', about: '', budget: '', cc: 'IN', phone: '', notes: '' });
  const [guests, setGuests] = useState(null);
  const [err, setErr] = useState({});
  const set = (k) => (e) => { const v = e.target.value; setF((o) => Object.assign({}, o, { [k]: v })); setErr((o) => Object.assign({}, o, { [k]: null })); };
  const fmtT = (t) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: h12 ? 'numeric' : '2-digit', minute: '2-digit', hour12: h12 }).format(new Date(t)).replace(' am', 'am').replace(' pm', 'pm');
  const fmtD = (t, o) => new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: tz }, o)).format(new Date(t));
  const [vy, vm] = view;
  const first = new Date(Date.UTC(vy, vm, 1)).getUTCDay();
  const dim = new Date(Date.UTC(vy, vm + 1, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(vy + '-' + String(vm + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'));
  const isNowMonth = vy + '-' + String(vm + 1).padStart(2, '0') === today.slice(0, 7);
  const spill = [];
  if (isNowMonth && dim - (+today.slice(8)) < 10) {
    const nd = new Date(Date.UTC(vy, vm + 1, 1)); const ny = nd.getUTCFullYear(), nm = nd.getUTCMonth();
    const need = (7 - (cells.length % 7)) % 7 + 7;
    for (let d = 1; d <= need; d++) spill.push(ny + '-' + String(nm + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'));
  }
  const spillMon = spill.length ? new Date(spill[0] + 'T12:00:00Z').toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }).toUpperCase() : '';
  const monthName = new Date(Date.UTC(vy, vm, 1)).toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
  const shift = (n) => setView(([y, m]) => { const d = new Date(Date.UTC(y, m + n, 1)); return [d.getUTCFullYear(), d.getUTCMonth()]; });
  const canPrev = (vy * 12 + vm) > (+today.slice(0, 4) * 12 + (+today.slice(5, 7) - 1));
  const daySlots = day ? (slots[day] || []) : [];
  const confirm = (e) => {
    e.preventDefault();
    const n = {};
    if (!f.name.trim()) n.name = 'Please add your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) n.email = 'Please add a valid email.';
    if (!f.about.trim()) n.about = 'Tell us what the call is about.';
    if (!f.budget) n.budget = 'Pick a budget range.';
    setErr(n);
    if (Object.keys(n).length) return;
    const when = fmtD(slot, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + fmtT(slot) + ' (' + tz + ')';
    const istWhen = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(slot)) + ' IST';
    const cc = (BK_CODES.find((c) => c[0] === f.cc) || BK_CODES[0])[1];
    const body = ['Call request: 20-minute intro call', 'When: ' + when, 'Studio time: ' + istWhen, '', 'Name: ' + f.name.trim(), 'Email: ' + f.email.trim(), f.phone.trim() ? 'Phone: ' + cc + ' ' + f.phone.trim() : null,
      'About: ' + f.about.trim(), 'Budget: ' + f.budget, guests && guests.filter(Boolean).length ? 'Guests: ' + guests.filter(Boolean).join(', ') : null, f.notes.trim() ? '\nNotes: ' + f.notes.trim() : null].filter((x) => x !== null).join('\n');
    try { window.location.href = 'mailto:hello@jayastra.com?subject=' + encodeURIComponent('Call request: ' + istWhen + ' (' + f.name.trim() + ')') + '&body=' + encodeURIComponent(body); } catch (er) { /* ignore */ }
    setStep('done');
  };
  const ics = () => {
    const z = (t) => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Jayastra//Booking//EN', 'BEGIN:VEVENT', 'UID:' + slot + '@jayastra.com', 'DTSTAMP:' + z(Date.now()), 'DTSTART:' + z(slot), 'DTEND:' + z(slot + BK_LEN * 60e3),
      'SUMMARY:Intro call with Jayastra', 'DESCRIPTION:20-minute intro call. We will email you the meeting link.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(txt);
  };
  return (
    <div className={'bk is-' + step}>
      <div className="bk-info">
        <img className="bk-avatar" src={LOGO_DARK} alt="" />
        <h3>20-minute intro call</h3>
        <ul>
          <li><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M8 4.6V8l2.3 1.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>{BK_LEN} min</li>
          <li><svg viewBox="0 0 16 16"><rect x="1.5" y="4" width="9" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M10.5 7l4-2.2v6.4l-4-2.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>Google Meet</li>
          <li className="bk-tz"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M1.8 8h12.4M8 1.8c2 2.2 2 10.2 0 12.4M8 1.8c-2 2.2-2 10.2 0 12.4" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
            <select value={tz} onChange={(e) => { setTz(e.target.value); setSlot(null); }} aria-label="Time zone">{zones.map((z) => <option key={z} value={z}>{z.replace('_', ' ')}</option>)}</select>
          </li>
        </ul>
        <p className="bk-hours"><span className="pulse" />Mon–Sat · 10:00–19:00 IST</p>
        {slot && step !== 'pick' ? <p className="bk-when"><b>{fmtD(slot, { weekday: 'long', day: 'numeric', month: 'long' })}</b><span>{fmtT(slot)} – {fmtT(slot + BK_LEN * 60e3)}</span></p> : <p className="bk-note">A real call with the designer. We'll talk through the work, the timeline and roughly what it costs.</p>}
      </div>

      {step === 'pick' ? (
        <>
          <div className="bk-cal">
            <div className="bk-mhead">
              <p><b>{monthName}</b> {vy}</p>
              <div>
                <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month">‹</button>
                <button type="button" onClick={() => shift(1)} aria-label="Next month">›</button>
              </div>
            </div>
            <div className="bk-grid" role="grid">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((w) => <span key={w} className="bk-wd">{w}</span>)}
              {cells.concat(spill).map((k, i) => {
                if (!k) return <span key={'e' + i} />;
                const avail = !!slots[k];
                return (
                  <button type="button" key={k} disabled={!avail} className={'bk-day' + (avail ? ' av' : '') + (k === day ? ' on' : '') + (k === today ? ' today' : '')}
                    onClick={() => { setDay(k); setSlot(null); }} aria-pressed={k === day} aria-label={k + (avail ? ', available' : ', unavailable')}>
                    {k === spill[0] ? <small className="bk-mon">{spillMon}</small> : null}{+k.slice(8)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="bk-slots">
            {day ? (
              <>
                <div className="bk-shead">
                  <p><b>{new Date(day + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })}</b> {+day.slice(8)}</p>
                  <div className="bk-fmt" role="group" aria-label="Time format">
                    <button type="button" className={h12 ? 'on' : ''} onClick={() => setH12(true)}>12h</button>
                    <button type="button" className={!h12 ? 'on' : ''} onClick={() => setH12(false)}>24h</button>
                  </div>
                </div>
                <div className="bk-list" data-lenis-prevent>
                  {daySlots.map((t) => (
                    <button type="button" key={t} className="bk-slot" onClick={() => { setSlot(t); setStep('form'); }}><i />{fmtT(t)}</button>
                  ))}
                </div>
              </>
            ) : <p className="bk-empty">Pick a day to see open times.</p>}
          </div>
        </>
      ) : null}

      {step === 'form' ? (
        <form className="bk-form" onSubmit={confirm} noValidate>
          <label>Your name *<input value={f.name} onChange={set('name')} autoComplete="name" aria-invalid={!!err.name} />{err.name ? <em>{err.name}</em> : null}</label>
          <label>Email address *<input type="email" value={f.email} onChange={set('email')} autoComplete="email" aria-invalid={!!err.email} />{err.email ? <em>{err.email}</em> : null}</label>
          <label>What is this meeting about? *<input value={f.about} onChange={set('about')} placeholder="A rebrand, a website, 3D renders…" aria-invalid={!!err.about} />{err.about ? <em>{err.about}</em> : null}</label>
          <label>Budget range *
            <select value={f.budget} onChange={set('budget')} aria-invalid={!!err.budget}><option value="">Select a range</option>{BUDGETS.map((b) => <option key={b}>{b}</option>)}<option>Not sure yet</option></select>
            {err.budget ? <em>{err.budget}</em> : null}
          </label>
          <label>Phone number
            <span className="bk-phone">
              <select value={f.cc} onChange={set('cc')} aria-label="Country code">{BK_CODES.map(([c, p]) => <option key={c} value={c}>{flag(c)} {p}</option>)}</select>
              <input type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel-national" placeholder="98765 43210" />
            </span>
          </label>
          <label>Additional notes<textarea rows="3" value={f.notes} onChange={set('notes')} placeholder="Please share anything that will help prepare for our meeting." /></label>
          {guests ? (
            <div className="bk-guests">
              <span>Add guests</span>
              {guests.map((g, i) => (
                <span className="bk-gin" key={i}>
                  <input type="email" placeholder="Email" value={g} onChange={(e) => { const v = e.target.value; setGuests((gs) => gs.map((x, j) => (j === i ? v : x))); }} />
                  <button type="button" aria-label="Remove guest" onClick={() => setGuests((gs) => (gs.length > 1 ? gs.filter((_, j) => j !== i) : null))}>×</button>
                </span>
              ))}
              <button type="button" className="bk-addg" onClick={() => setGuests((gs) => gs.concat(['']))}>+ Add another</button>
            </div>
          ) : <button type="button" className="bk-addg" onClick={() => setGuests([''])}>+ Add guests</button>}
          <p className="bk-legal">Your request goes to hello@jayastra.com. We confirm every booking by email within one working day. See our <a href={to('/privacy')}>Privacy Policy</a>.</p>
          <div className="bk-actions">
            <button type="button" className="bk-back" onClick={() => setStep('pick')}>Back</button>
            <button type="submit" className="bk-confirm">Confirm</button>
          </div>
        </form>
      ) : null}

      {step === 'done' ? (
        <div className="bk-done" role="status">
          <span className="bk-check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <h3>Request sent, {f.name.trim().split(' ')[0]}.</h3>
          <p>Your email app should have opened with the booking details. Press send there, and we'll confirm the slot and share the meeting link within one working day.</p>
          <dl>
            <div><dt>What</dt><dd>20-minute intro call</dd></div>
            <div><dt>When</dt><dd>{fmtD(slot, { weekday: 'long', day: 'numeric', month: 'long' })}, {fmtT(slot)}</dd></div>
            <div><dt>Time zone</dt><dd>{tz.replace('_', ' ')}</dd></div>
          </dl>
          <div className="bk-actions left">
            <a className="bk-confirm" href={ics()} download="jayastra-call.ics">Add to calendar</a>
            <button type="button" className="bk-back" onClick={() => { setStep('pick'); setSlot(null); }}>Book another time</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Contact() {
  const email = 'hello@jayastra.com';
  const [copied, setCopied] = useState(false);
  const [f, setF] = useState({ name: '', email: '', company: '', needs: ['Brand identity'], budget: '₹1–3 lakh', when: 'Next 1–3 months', brief: '' });
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (v) => { setF((cur) => Object.assign({}, cur, { [k]: v })); setErr((e) => Object.assign({}, e, { [k]: null })); };
  const copy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
    const select = () => {
      const el = document.getElementById('c-email');
      if (!el) return;
      const r = document.createRange(); r.selectNodeContents(el);
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    };
    try { navigator.clipboard.writeText(email).then(done, select); } catch (e) { select(); }
  };
  const submit = (e) => {
    e.preventDefault();
    const n = {};
    if (!f.name.trim()) n.name = 'Add your name so we know who to reply to.';
    if (!f.email.trim()) n.email = 'Add an email address for the reply.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) n.email = 'That email looks incomplete. Check it and try again.';
    if (!f.needs.length) n.needs = 'Pick at least one thing you need.';
    setErr(n);
    if (Object.keys(n).length) {
      const first = document.querySelector('[data-f="' + Object.keys(n)[0] + '"]');
      if (first && first.focus) first.focus();
      return;
    }
    const body = ['Name: ' + f.name.trim(), 'Email: ' + f.email.trim(), f.company ? 'Company: ' + f.company.trim() : null,
      'Needs: ' + f.needs.join(', '), '', f.brief.trim()].filter((x) => x !== null).join('\n');
    const subject = 'Project enquiry' + (f.company.trim() ? ' from ' + f.company.trim() : ' from ' + f.name.trim());
    try { window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); } catch (e2) { /* ignore */ }
    setSent(true);
  };
  return (
    <section id="contact" className="band line-top contact contact-s">
      <div className="wrap contact-grid">
        <div className="contact-main">
          <Reveal as="p" className="eyebrow">Contact</Reveal>
          <Reveal as="h2" className="contact-h" delay={0.06}>Tell us what<br />you're <em>building</em>.</Reveal>
          <Reveal as="p" className="contact-lede" delay={0.12}>A 20-minute call, no pitch deck. We'll tell you what the work needs, roughly what it costs, and whether we're the right studio for it.</Reveal>
          <Reveal className="reach" delay={0.16}>
            <div className="reach-card">
              <span className="k">Email</span>
              <span className="v" id="c-email">{email}</span>
              <button className="copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
            <div className="reach-card">
              <span className="k">Reply time</span>
              <span className="v">Within one working day</span>
              <span className="reach-tag">Mon–Sat</span>
            </div>
            <div className="reach-card">
              <span className="k">Studio</span>
              <span className="v">Jabalpur, Madhya Pradesh</span>
              <Clock />
            </div>
          </Reveal>
        </div>

        <Reveal className="bk-wrap" delay={0.1} amount={0.08}><Booker /></Reveal>
      </div>
    </section>
  );
}

/* ======================================================================
   Footer — the wordmark reacts to the cursor (variable width and weight)
   ====================================================================== */
function Clock() {
  const fmt = () => {
    try { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date()); } catch (e) { return ''; }
  };
  const [t, setT] = useState(fmt);
  useEffect(() => { const id = setInterval(() => setT(fmt()), 20000); return () => clearInterval(id); }, []);
  return <span className="clock"><span className="pulse" />Jabalpur {t} IST</span>;
}
/* The spear from the logo, traced from logo.png; it replaces the t like it does in the mark. */
const SPEAR = 5;
const SPEAR_PATH = 'M119.0 84.6 L65.8 67.0 L66.0 1.3 L82.4 55.0 L119.0 83.7 L119.0 84.6Z M64.0 251.3 L39.3 85.0 L38.0 83.8 L4.1 71.0 L5.0 69.6 L52.0 47.6 L53.1 48.0 L40.5 69.0 L41.0 70.0 L81.0 88.7 L82.3 90.0 L64.0 251.3Z';
function BigWord() {
  const word = 'Jayastra'.split('');
  const host = useRef(null);
  const refs = useRef([]);
  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;
    const reduce = reducedNow();
    const cur = word.map((_, k) => (k === SPEAR ? { w: 0, d: 0 } : { w: 640, d: 100 }));
    let mx = null, raf = 0, visible = false;
    const measure = el.querySelector('.bw-measure');
    const fit = () => {
      if (!measure) return;
      const w = measure.getBoundingClientRect().width;
      if (!w) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = ((fs * el.clientWidth) / w) * 0.9 + 'px';
      try {
        const c = document.createElement('canvas').getContext('2d');
        c.font = '640 100px Archivo, sans-serif';
        const cap = c.measureText('H').actualBoundingBoxAscent / 100;
        if (cap > 0.5 && cap < 0.9) el.style.setProperty('--cap', cap.toFixed(3));
      } catch (e) { /* keep the CSS default */ }
    };
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
    const onMove = (e) => { if (isFine()) mx = e.clientX; };
    const onLeave = () => { mx = null; };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      refs.current.forEach((sp, k) => {
        if (!sp) return;
        const r = sp.getBoundingClientRect();
        let tw, td, f = 0;
        if (mx != null) {
          f = Math.max(0, 1 - Math.abs(mx - (r.left + r.width / 2)) / (r.width * 2.2));
          tw = 280 + f * 620; td = 78 + f * 46;
        } else if (!reduce) {
          f = 0.5 + 0.5 * Math.sin(now / 950 - k * 0.7);
          tw = 520 + f * 260; td = 92 + f * 18;
          f *= 0.35;
        } else { tw = 640; td = 100; }
        if (k === SPEAR) {
          cur[k].w += (f - cur[k].w) * 0.12;
          sp.style.transform = 'translateY(' + (-cur[k].w * 0.07).toFixed(3) + 'em) rotate(' + (cur[k].w * 5).toFixed(2) + 'deg)';
          return;
        }
        cur[k].w += (tw - cur[k].w) * 0.12;
        cur[k].d += (td - cur[k].d) * 0.12;
        sp.style.fontVariationSettings = "'wght' " + cur[k].w.toFixed(0) + ", 'wdth' " + cur[k].d.toFixed(1);
      });
    };
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }) : null;
    if (io) io.observe(el); else visible = true;
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    if (!reduce) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); if (io) io.disconnect(); window.removeEventListener('resize', fit); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); };
  }, []);
  return (
    <div className="bigword" ref={host} aria-hidden="true">
      {word.map((ch, k) => (k === SPEAR ? (
        <span key={k} className="spear" ref={(n) => { refs.current[k] = n; }}>
          <svg viewBox="4 1 117 251"><path fill="#D24E01" fillRule="evenodd" d={SPEAR_PATH} /></svg>
        </span>
      ) : <span key={k} ref={(n) => { refs.current[k] = n; }}>{ch}</span>))}
      <span className="bw-measure">Jayastra</span>
    </div>
  );
}
function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <img src={LOGO_DARK} alt="Jayastra" />
            <p>An independent design studio for brands, interfaces and 3D visuals. Jabalpur, India, working worldwide.</p>
            <Clock />
          </div>
          <div className="foot-col"><h4>Services</h4><ul>
            <li><a href="#services">Brand identity</a></li><li><a href="#services">UI/UX design</a></li><li><a href="#services">Websites</a></li><li><a href="#services">3D and motion</a></li><li><a href="#services">Retainers</a></li>
          </ul></div>
          <div className="foot-col"><h4>Studio</h4><ul>
            <li><a href="#work">Work</a></li><li><a href="#advantage">Advantage</a></li><li><a href="#process">Process</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#faq">FAQ</a></li>
          </ul></div>
          <div className="foot-col"><h4>Contact</h4><ul>
            <li><a href="mailto:hello@jayastra.com">hello@jayastra.com</a></li><li><a href="#contact">Start a project</a></li><li><a href="#clients">Time zones</a></li><li><span>Jabalpur, MP</span></li>
          </ul></div>
        </div>
        <BigWord />
        <div className="foot-bar">
          <span>© 2026 Jayastra. All rights reserved.</span>
          <nav className="foot-legal" aria-label="Legal"><a href={to('/privacy')}>Privacy Policy</a><a href={to('/terms')}>Terms of Use</a></nav>
          <a className="totop" href="#top">Back to top <Arrow dir="n" /></a>
        </div>
      </div>
    </footer>
  );
}

/* ======================================================================
   App
   ====================================================================== */
/* ======================================================================
   Case studies + sector pages (hash routes: #/industries/:slug, #/work/:slug, #/work)
   ====================================================================== */
const SECTOR_SLUGS = ['consumer', 'real-estate', 'manufacturing', 'jewellery', 'saas', 'food', 'healthcare', 'education', 'startups', 'hardware', 'hospitality', 'tourism', 'gaming', 'events'];
const sectorBySlug = (slug) => { const k = SECTOR_SLUGS.indexOf(slug); return k < 0 ? null : Object.assign({ slug, k }, INDUSTRIES[k]); };
const sectorSlugOf = (ind) => SECTOR_SLUGS[INDUSTRIES.indexOf(ind)];
// c = [slug, name, sector, services, year, summary, challenge, approach, outcome, images]
const CASES = [
  ['saffron-and-co', 'Saffron & Co', 'consumer', 'Identity · Packaging', '2026', 'A spice brand that looked like every other jar on the shelf, rebuilt as a premium pantry name.', 'Twelve SKUs, three different label styles and no recognisable colour. Retail buyers could not tell the range apart.', 'One mark, a warm saffron palette and a label system where colour codes the heat level. Every jar reads as a family from two metres away.', 'A full identity, a 12-SKU label system with print-ready dielines, and photoreal pack renders for the online store.', ['saffron', 'i0c', 'i0a']],
  ['veda-wellness', 'Veda Wellness', 'consumer', 'Packaging · Social system', '2025', 'Calm, clinical packaging and a social grid for a D2C skincare launch.', 'A new brand entering a crowded category with a small budget and no product photos yet.', 'Amber glass, generous white space and a modular label. We rendered the range in 3D so the launch did not wait for a shoot.', 'Packaging for five products, 3D renders for the store and ads, and a 30-post launch grid on a reusable template.', ['veda', 'i0b', 'i0a']],
  ['skyline-residences', 'Skyline Residences', 'real-estate', '3D walkthroughs · Brochure', '2026', 'Selling a 120-unit tower before the foundation was poured.', 'Buyers had only a floor plan and a hoarding to go on. Site visits showed a construction pit.', 'Photoreal interiors for three apartment types, a 90-second walkthrough and a brochure that leads with the view, not the specs.', 'Twelve interior renders, a walkthrough film, a 24-page brochure and site hoardings.', ['re2', 're1', 're4']],
  ['courtyard-villas', 'Courtyard Villas', 'real-estate', 'Project branding · Renders', '2025', 'A villa project in a tier-2 city positioned as a quiet luxury address.', 'Competing launches all used the same gold logo and stock family photos.', 'A restrained name, a terracotta palette taken from the site soil and dusk renders that show light, not furniture.', 'Project identity, eight exterior and interior renders, signage and a one-page website.', ['re3', 're5', 's_realestate']],
  ['ferro-machines', 'Ferro Machines', 'manufacturing', 'Product renders · Catalogue', '2026', 'A 40-year-old machine maker with a catalogue still built from factory-floor photos.', 'Heavy machines are hard to photograph well, and every model change meant a new shoot.', 'Accurate 3D models of the range, rendered in a consistent studio look. One model now serves the catalogue, the website and the trade-show screen.', 'Twenty machine models, a 48-page catalogue and an exhibition stall design.', ['mf1', 'mf2', 'mf5']],
  ['volta-components', 'Volta Components', 'manufacturing', 'Website redesign · Identity refresh', '2025', 'A B2B component supplier whose website was losing enquiries to newer competitors.', 'A dated site with 300 products and no clear way to find the right part.', 'A refreshed logo, a product finder organised by application and spec sheets generated from one template.', 'A refreshed identity, a new website and a spec-sheet system for the full range.', ['mf4', 'mf3', 's_industrial']],
  ['kesari-jewels', 'Kesari Jewels', 'jewellery', '3D jewellery renders · E-commerce', '2026', 'Bridal jewellery shown online the way it looks in the hand.', 'Phone photos made 22-carat pieces look flat and yellow, and returns were rising.', 'CAD files turned into photoreal renders with true gold tones, 360° spins for the bestsellers and a calm storefront that lets the pieces lead.', 'Sixty product renders, ten 360° spins and a Shopify storefront redesign.', ['s_jewellery', 'jw2', 'jw1']],
  ['loom-and-thread', 'Loom & Thread', 'jewellery', 'Lookbook · Packaging', '2025', 'A handloom label moving from exhibitions to its own online store.', 'Beautiful fabric, but no consistent visual identity across tags, bags and social.', 'A woven-pattern identity, kraft packaging with a single colour accent and a seasonal lookbook layout.', 'Identity, swing tags, carry bags, gift boxes and a 40-page lookbook.', ['jw3', 'jw4', 'jw5']],
  ['northbrook', 'Northbrook', 'saas', 'Product UI · Website', '2026', 'Turning a dense finance dashboard into something a founder can read in ten seconds.', 'Forty metrics on one screen and a churn problem among non-finance users.', 'We grouped the dashboard around three questions, designed a clear chart system and rebuilt the marketing site around the same story.', 'Dashboard redesign, a Figma design system and a new marketing website.', ['northbrook', 'i1b', 'digital']],
  ['ledgerly', 'Ledgerly', 'saas', 'App UI · Pitch deck', '2025', 'A mobile-first invoicing app for freelancers, from idea to investor meeting.', 'The founders had a working prototype but nothing that looked ready to show investors.', 'A friendly visual language, twenty core screens designed and prototyped, and a deck that tells one clear story.', 'App UI, a clickable prototype and a 14-slide investor deck.', ['i1a', 'i1c', 'digital']],
  ['dough-and-co', 'Dough & Co', 'food', 'Packaging · Social media', '2026', 'An artisan bakery taking its breads into supermarket shelves.', 'Paper bags that worked in the shop disappeared on a busy retail shelf.', 'A bold wordmark, a colour per bread type and a window on every bag so the crust does the selling.', 'Packaging for eight products, shelf strips and a monthly social content plan.', ['fd1', 's_food', 'i3c']],
  ['third-wave-coffee', 'Third Wave Coffee', 'food', 'Identity · Ad creative', '2025', 'A specialty coffee roaster launching retail beans and subscription boxes.', 'Strong reputation in the café, no brand outside it.', 'An identity built around roast origin, labels that map flavour notes and a set of launch ads tested in two variants.', 'Identity, bean packaging, subscription box and a launch ad set.', ['fd2', 's_food', 'i3a']],
  ['careplus-clinics', 'CarePlus Clinics', 'healthcare', 'Branding · Website', '2026', 'A chain of neighbourhood clinics that wanted to feel as trusted as a hospital.', 'Each clinic had its own signboard and patients did not know they were connected.', 'A calm teal-and-white identity, clear wayfinding and a website where booking takes two taps.', 'Identity, clinic signage, a patient-friendly website and appointment flow.', ['hc1', 's_health', 'i1a']],
  ['ayur-roots', 'Ayur Roots', 'healthcare', 'Packaging · App UI', '2025', 'Ayurvedic wellness products redesigned for a younger online audience.', 'Traditional packaging was trusted by parents but ignored by their children.', 'Botanical illustration, modern type and a simple app that tracks daily routines.', 'Packaging for ten products, an illustration set and wellness app UI.', ['hc2', 'veda', 'i0b']],
  ['brightpath-academy', 'Brightpath Academy', 'education', 'Branding · Website', '2026', 'A coaching institute growing from one centre to five.', 'Every centre made its own posters and the brand looked different in each city.', 'A confident identity, a poster and social template kit for centre managers, and a website with course finder and results.', 'Identity, a template kit, a website and admission brochures.', ['ed1', 's_edu', 'tilt']],
  ['learnloop', 'LearnLoop', 'education', 'App UI · Explainer animation', '2025', 'A course platform that needed to explain itself in under a minute.', 'Visitors left the landing page before understanding how the platform worked.', 'A 45-second explainer animation and a redesigned learning app with clear progress tracking.', 'An explainer film, app UI for twenty screens and landing page design.', ['ed2', 'i1c', 'digital']],
  ['parcel', 'Parcel', 'startups', 'Brand from zero · MVP design', '2026', 'A logistics startup, from a name on a napkin to a working MVP.', 'Two founders, a deadline for their first pilot customer and no design.', 'Name check, identity, MVP flows for drivers and dispatchers and a pitch deck in six weeks.', 'Identity, MVP app design, a landing page and an investor deck.', ['st1', 's_startup', 'i1a']],
  ['tilt-capital', 'Tilt Capital', 'startups', 'Pitch deck · Design retainer', '2025', 'An early-stage fund that wanted its decks to look as sharp as its thesis.', 'Partner presentations were built from scratch every time, in different styles.', 'A deck system with master layouts, chart styles and a monthly retainer for new portfolio material.', 'A deck system, twelve portfolio decks and ongoing design support.', ['tilt', 's_startup', 'northbrook']],
  ['lumen-audio', 'Lumen Audio', 'hardware', '3D product rendering', '2026', 'Launching a headphone line without a single studio photo shoot.', 'Samples arrived two weeks before launch, too late for a shoot and retouching.', 'Accurate 3D models from CAD, a studio lighting setup and renders in every colourway, ready for listings and ads.', 'Thirty product renders, colourway variants and a 15-second launch spin.', ['lumen', 'i2a', 'i2c']],
  ['orbit-mobility', 'Orbit Mobility', 'hardware', '3D modelling · Launch film', '2025', 'An electric scooter brand showing the product before the factory finished it.', 'Pre-orders needed to open months before production units existed.', 'A detailed 3D model, a launch film showing the scooter in the city and spec sheets built from the same model.', 'A 3D model, a 60-second launch film and spec sheets.', ['i2b', 'orbit', 'i2c']],
  ['clay-house-cafe', 'Clay House Café', 'hospitality', 'Identity · Menus · Signage', '2026', 'A neighbourhood café with a cult following and no brand to match.', 'Great coffee, handwritten menus and a sign customers could not find from the street.', 'A warm clay-toned identity, a menu system that updates easily and a shopfront that works day and night.', 'Identity, menus, signage, cups and bags.', ['i3a', 'i3c', 'i3b']],
  ['fig-and-co', 'Fig & Co', 'hospitality', 'Retail identity · Print', '2025', 'A concept store bringing local makers under one roof.', 'Forty brands in one space made the store feel like a market stall.', 'A quiet identity that frames the makers, consistent shelf talkers and a printed store guide.', 'Identity, in-store signage, shelf talkers and a printed guide.', ['i3b', 'i3a', 'i0c']],
  ['marble-palace-stays', 'Marble Palace Stays', 'tourism', 'Destination branding · Website', '2026', 'A heritage hotel near Bhedaghat positioned for international travellers.', 'Beautiful property, but online it looked like any other guesthouse.', 'An identity drawn from the marble rocks, a website that sells the experience and a short motion piece for social.', 'Identity, a booking-ready website and motion content.', ['tr1', 'tr4', 's_tourism']],
  ['kanha-trails', 'Kanha Trails', 'tourism', 'Motion content · Print', '2025', 'A safari lodge telling its story beyond the brochure.', 'Guests loved the stay, but the lodge had no content to share before they arrived.', 'An illustrated map, a set of short animated reels and a welcome booklet.', 'An illustrated map, six motion reels and a printed guest booklet.', ['tr3', 'tr2', 's_tourism']],
  ['pixel-forge', 'Pixel Forge', 'gaming', '3D assets · Key art', '2026', 'Store-page key art and 3D assets for an indie studio’s first release.', 'A small team with a great game and no time for marketing art.', 'Hero key art, a set of 3D props and character turnarounds the team could reuse for trailers.', 'Key art, twenty 3D assets and store-page visuals.', ['gm1', 's_gaming', 'three']],
  ['stagecraft-live', 'Stagecraft Live', 'gaming', 'Motion graphics · Social', '2025', 'Motion graphics for a live music and streaming event series.', 'Each event used different graphics and the series never built recognition.', 'A motion toolkit with stings, lower thirds and social templates that scale from a stream to a stage screen.', 'A motion graphics toolkit and a social template set.', ['gm2', 'three', 'growth']],
  ['the-rao-wedding', 'The Rao Wedding', 'events', 'Invitations · Event branding', '2026', 'A three-day wedding with one visual story from invitation to farewell.', 'Many vendors, many styles and a family who wanted it all to feel connected.', 'A monogram, a palette taken from the bride’s lehenga and a suite of invitations, signage and favours.', 'Invitation suite, signage, menus and favour packaging.', ['ev4', 'ev1', 's_events']],
  ['summit-26', 'Summit ’26', 'events', 'Event branding · 3D venue preview', '2025', 'A business summit that needed sponsors before the venue was dressed.', 'Sponsors wanted to see where their logos would appear.', 'Event identity and a 3D model of the venue showing stage, booths and branding positions.', 'Event identity, a 3D venue preview and on-site signage.', ['ev2', 'ev3', 's_events']],
].map(([slug, name, sector, services, year, summary, challenge, approach, outcome, images]) => ({ slug, name, sector, services, year, summary, challenge, approach, outcome, images }));
const FEATURED = ['skyline-residences', 'lumen-audio', 'kesari-jewels', 'northbrook'];
const caseBySlug = (s) => CASES.find((c) => c.slug === s);
const casesFor = (sector) => CASES.filter((c) => c.sector === sector);

function CaseCard({ c, big }) {
  const sec = sectorBySlug(c.sector);
  return (
    <a className={'cc' + (big ? ' big' : '')} href={to('/work/' + c.slug)}>
      <div className="cc-img"><img src={img(c.images[0])} alt="" loading="lazy" decoding="async" /><span className="cc-tag">Concept project</span></div>
      <div className="cc-meta">
        <div>
          <h3>{c.name}</h3>
          <p>{c.summary}</p>
        </div>
        <span className="cc-arrow" aria-hidden="true"><Arrow /></span>
      </div>
      <div className="cc-foot"><span>{sec ? sec.name : ''}</span><span>{c.services}</span></div>
    </a>
  );
}

function CaseStudies() {
  return (
    <section id="case-studies" className="band line-top">
      <div className="wrap">
        <SectionHead eyebrow="Case studies" title="Work, start to finish." aside="How a brief becomes a brand, a product or a render. Concept projects that show how we work." />
        <div className="cs-grid">
          {FEATURED.map((s, k) => <Reveal key={s} delay={(k % 2) * 0.08}><CaseCard c={caseBySlug(s)} big={k === 0 || k === 3} /></Reveal>)}
        </div>
        <Reveal className="cs-more"><a className="cs-all" href={to('/work')}>See all {CASES.length} case studies <Arrow /></a></Reveal>
      </div>
    </section>
  );
}

function PageShell({ children }) {
  return <main id="main" className="pg-inner">{children}</main>;
}

function SectorPage({ slug }) {
  const sec = sectorBySlug(slug);
  if (!sec) return <NotFound />;
  const list = casesFor(slug);
  const next = sectorBySlug(SECTOR_SLUGS[(sec.k + 1) % SECTOR_SLUGS.length]);
  return (
    <PageShell>
      <section className="ip-hero">
        <img className="ip-bg" src={imgHi(sec.photo)} alt="" fetchpriority="high" />
        <div className="ip-shade" />
        <div className="wrap ip-in">
          <nav className="ip-crumb" aria-label="Breadcrumb"><a href="#industries">Industries</a><span>/</span><span>{sec.name}</span></nav>
          <h1>{sec.name}</h1>
          <p>{sec.text}</p>
          <ul className="ip-chips">{sec.names.map((n) => <li key={n}>{n}</li>)}</ul>
          <a className="ip-cta" href="#contact">Start a project <Arrow /></a>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <div className="ip-head">
            <p className="eyebrow">Projects</p>
            <h2 className="h2">{list.length} {list.length === 1 ? "project" : "projects"} in {sec.name}</h2>
          </div>
          <div className="cs-grid two">
            {list.map((c, k) => <Reveal key={c.slug} delay={k * 0.08}><CaseCard c={c} /></Reveal>)}
          </div>
          <div className="ip-help">
            <div>
              <h3>What we usually make for {sec.name.toLowerCase()}</h3>
              <p>{sec.text}</p>
            </div>
            <ul>{sec.names.map((n) => <li key={n}><Check />{n}</li>)}</ul>
          </div>
          <a className="ip-next" href={to('/industries/' + next.slug)}><span>Next sector</span><b>{next.name}</b><Arrow /></a>
        </div>
      </section>
    </PageShell>
  );
}

function CasePage({ slug }) {
  const c = caseBySlug(slug);
  if (!c) return <NotFound />;
  const sec = sectorBySlug(c.sector);
  const i = CASES.indexOf(c);
  const next = CASES[(i + 1) % CASES.length];
  return (
    <PageShell>
      <section className="cp-hero">
        <div className="wrap">
          <nav className="ip-crumb dark" aria-label="Breadcrumb"><a href={to('/work')}>Case studies</a><span>/</span><a href={to('/industries/' + c.sector)}>{sec.name}</a></nav>
          <span className="cc-tag static">Concept project</span>
          <h1>{c.name}</h1>
          <p className="cp-sum">{c.summary}</p>
          <dl className="cp-meta">
            <div><dt>Sector</dt><dd><a href={to('/industries/' + c.sector)}>{sec.name}</a></dd></div>
            <div><dt>Services</dt><dd>{c.services}</dd></div>
            <div><dt>Year</dt><dd>{c.year}</dd></div>
          </dl>
        </div>
        <div className="wrap"><div className="cp-cover"><img src={imgHi(c.images[0])} alt={c.name} fetchpriority="high" /></div></div>
      </section>
      <section className="band cp-body">
        <div className="wrap cp-cols">
          {[['The challenge', c.challenge], ['Our approach', c.approach], ['The outcome', c.outcome]].map(([h, t], k) => (
            <Reveal key={h} className="cp-block" delay={k * 0.06}><span className="cp-n">{String(k + 1).padStart(2, '0')}</span><h2>{h}</h2><p>{t}</p></Reveal>
          ))}
        </div>
        <div className="wrap cp-gallery">
          {c.images.slice(1).map((im) => <Reveal key={im} className="cp-shot"><img src={img(im)} alt="" loading="lazy" /></Reveal>)}
        </div>
        <div className="wrap">
          <a className="cp-next" href={to('/work/' + next.slug)}>
            <span>Next project</span>
            <b>{next.name}</b>
            <img src={img(next.images[0])} alt="" loading="lazy" />
          </a>
        </div>
      </section>
    </PageShell>
  );
}

function WorkIndex() {
  const [f, setF] = useState('all');
  const list = f === 'all' ? CASES : casesFor(f);
  return (
    <PageShell>
      <section className="band wi-head">
        <div className="wrap">
          <p className="eyebrow">Case studies</p>
          <h1 className="wi-h">All case studies</h1>
          <p className="wi-sub">Concept projects across {SECTOR_SLUGS.length} sectors. Filter by the one closest to yours.</p>
          <div className="wi-filters" role="group" aria-label="Filter by sector">
            <button type="button" className={f === 'all' ? 'on' : ''} onClick={() => setF('all')}>All <small>{CASES.length}</small></button>
            {SECTOR_SLUGS.map((s, k) => <button type="button" key={s} className={f === s ? 'on' : ''} onClick={() => setF(s)}>{INDUSTRIES[k].name}</button>)}
          </div>
          <div className="cs-grid two">
            {list.map((c) => <CaseCard key={c.slug} c={c} />)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function NotFound() {
  return (
    <PageShell>
      <section className="band nf">
        <div className="wrap"><p className="eyebrow">404</p><h1 className="wi-h">This page moved or never existed.</h1><a className="cs-all" href="#top">Back to the homepage <Arrow /></a></div>
      </section>
    </PageShell>
  );
}

/* ======================================================================
   Legal pages
   ====================================================================== */
const LEGAL_UPDATED = '1 November 2026';
function LegalPage({ title, intro, sections }) {
  return (
    <PageShell>
      <section className="band lg">
        <div className="wrap lg-wrap">
          <p className="eyebrow">Legal</p>
          <h1 className="wi-h">{title}</h1>
          <p className="lg-meta">Last updated {LEGAL_UPDATED}</p>
          <p className="lg-intro">{intro}</p>
          <div className="lg-body">
            {sections.map(([h, ps]) => (
              <section key={h}>
                <h2>{h}</h2>
                {ps.map((p, i) => (Array.isArray(p) ? <ul key={i}>{p.map((li) => <li key={li}>{li}</li>)}</ul> : <p key={i}>{p}</p>))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
const PRIVACY = [
  ['Who we are', ['Jayastra is an independent design studio based in Jabalpur, Madhya Pradesh, India. In this policy, “we” and “us” mean Jayastra. You can reach us at hello@jayastra.com.']],
  ['What we collect', ['We only collect information you choose to give us, and a small amount of technical data needed to run the website.', [
    'Booking and enquiry details: your name, email address, phone number (optional), what your project is about, budget range, notes and any guest emails you add.',
    'Emails you send us, and anything you share during a call or project.',
    'Technical data: like every website, our hosting provider receives your IP address, browser type and the pages you request, in order to deliver the site and keep it secure.',
  ]]],
  ['How we use it', [[
    'To reply to your enquiry, confirm a call and send the meeting link.',
    'To prepare proposals, deliver projects and send invoices.',
    'To keep the website working, secure and fast.',
  ], 'We do not sell your data, and we do not use it for advertising.']],
  ['Cookies and tracking', ['This website does not set advertising or tracking cookies. If we turn on privacy-friendly visitor analytics (such as Vercel Analytics), it counts page views without cookies and without identifying you personally. We will update this page if that changes.']],
  ['Services we rely on', ['We use a few trusted providers to run the site and our studio. Each receives only what it needs:', [
    'Vercel: website hosting.',
    'Hostinger: domain and business email.',
    'Google Fonts, cdnjs and jsDelivr: fonts and code libraries loaded by your browser.',
    'Unsplash: some photographs are served from Unsplash’s image service.',
    'Cal.com and Google Meet: call scheduling and video calls, once connected.',
  ], 'These providers may process data outside India under their own privacy policies.']],
  ['How long we keep it', ['Enquiries that do not lead to a project are deleted within 12 months. Client project records are kept for as long as needed for the work and for accounting and tax requirements under Indian law, typically up to 8 years.']],
  ['Your rights', ['You can ask us to see, correct or delete the personal data we hold about you, or to stop contacting you. Write to hello@jayastra.com and we will respond within 30 days. If you are in the EU or UK, you also have rights under the GDPR, including the right to complain to your local data protection authority. In India, you have rights under the Digital Personal Data Protection Act, 2023.']],
  ['Security', ['We use reputable providers, secure connections (HTTPS) and access controls to protect your data. No system is perfectly secure, but we take reasonable care and will tell you promptly if a breach affects you.']],
  ['Changes', ['We may update this policy from time to time. The date at the top shows the latest version.']],
  ['Contact', ['Questions about privacy: hello@jayastra.com · Jayastra, Jabalpur, Madhya Pradesh, India.']],
];
const TERMS = [
  ['About these terms', ['These terms cover your use of jayastra.com and the general basis on which Jayastra provides design services. Every project also has its own written proposal; where the proposal and these terms differ, the proposal applies.']],
  ['Using this website', ['You may browse and share this website for personal and business research. Please do not copy, scrape or republish its content, design or code without our written permission.']],
  ['Our work on this site', ['Projects marked “Concept project” are studio concepts created to show our approach and capabilities; they are not presented as client commissions. Some photographs are licensed from Unsplash. All other content, including text, layouts, illustrations and the Jayastra name and mark, belongs to Jayastra.']],
  ['Proposals and pricing', ['Prices shown on this site are starting points. Your price, scope, deliverables and timeline are set out in a written proposal, and work begins once you accept it. Prices are in Indian rupees unless the proposal says otherwise, and taxes such as GST apply where required.']],
  ['Payments', ['Projects are usually billed in milestones, with an advance before work starts. Retainers are billed monthly in advance and can be paused or cancelled with notice as stated in your proposal. Late payments may pause work.']],
  ['Revisions and feedback', ['Each project includes the number of revision rounds stated in the proposal. Extra rounds or changes in scope are quoted separately before we start them.']],
  ['Files and ownership', ['When the final invoice is paid, you own the final approved deliverables and receive the source files listed in your proposal. Until then, all work remains Jayastra’s property. We may show completed work in our portfolio unless we agree otherwise in writing.']],
  ['Your materials', ['You confirm that anything you give us to use (logos, photos, text, CAD files) is yours or licensed to you, and that using it in your project will not break anyone else’s rights.']],
  ['Liability', ['We take care with everything we make, but we are not liable for indirect losses such as lost profits. Our total liability for any project is limited to the fees you paid for that project.']],
  ['Bookings', ['Call requests made through this website are confirmed by email. A request is not a booking until we confirm it.']],
  ['Governing law', ['These terms are governed by the laws of India. Any disputes will be handled by the courts of Jabalpur, Madhya Pradesh.']],
  ['Contact', ['hello@jayastra.com · Jayastra, Jabalpur, Madhya Pradesh, India.']],
];
const PrivacyPage = () => <LegalPage title="Privacy Policy" intro="How Jayastra collects, uses and protects your personal information when you visit this website, book a call or work with us." sections={PRIVACY} />;
const TermsPage = () => <LegalPage title="Terms of Use" intro="The terms for using jayastra.com and the general basis on which we take on design work." sections={TERMS} />;

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

function App() {
  const reduce = reducedNow();
  const [loc, setLoc] = useState(routeOf);
  const route = parseRoute(loc);
  const hash = loc.anchor;
  const [loading, setLoading] = useState(() => {
    if (reduce || route.page !== 'home') return false;
    try { if (sessionStorage.getItem('jy-seen')) return false; } catch (e) { /* ignore */ }
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

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
