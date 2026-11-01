import { useEffect, useRef, useState } from './react';
import { clamp, reducedNow } from './utils';

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
export const motion = M.motion;
export const AnimatePresence = M.AnimatePresence;
export const useMotionValue = M.useMotionValue;
export const useSpring = M.useSpring;
export const useTransform = M.useTransform;
export const useScroll = M.useScroll;
export const useInView = M.useInView;
export const animate = M.animate;
export const useAnimationFrame = M.useAnimationFrame;
export const useReducedMotion = M.useReducedMotion;
