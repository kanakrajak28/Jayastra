import { useEffect, useRef } from '../lib/react';
import { isFine } from '../lib/utils';
import { motion, useMotionValue, useReducedMotion, useSpring } from '../lib/motion';

/* ======================================================================
   Shared bits
   ====================================================================== */
export function Arrow({ dir = 'ne', className = 'arr' }) {
  const rot = { ne: 0, e: 45, se: 90, s: 135, sw: 180, w: 225, nw: 270, n: -45 }[dir] || 0;
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" style={{ transform: 'rotate(' + rot + 'deg)' }}>
      <path d="M4 12L12 4M12 4H6M12 4v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function Spark() {
  return (
    <svg className="spark" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 0c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10C5.4 9.4 9.4 5.4 10 0z" fill="currentColor" />
    </svg>
  );
}
export function Reveal({ as = 'div', children, delay = 0, y = 36, amount = 0.2, ...rest }) {
  const reduce = useReducedMotion();
  if (reduce) return React.createElement(as, rest, children);
  const Tag = motion[as];
  return (
    <Tag initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }} {...rest}>
      {children}
    </Tag>
  );
}
export const dot = (t) => t;
export function SectionHead({ eyebrow, title, aside }) {
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
export function MagLink({ href, className, children, strength = 0.28, ...rest }) {
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
export function useOnScreen(ref, margin) {
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
