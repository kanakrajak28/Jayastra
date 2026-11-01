import { useEffect, useRef, useState } from '../lib/react';
import { EASE, TAU, clamp } from '../lib/utils';
import { AnimatePresence, motion, useReducedMotion } from '../lib/motion';
import { Arrow, Reveal, SectionHead } from './shared';

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
export const isLand = (lat, lng) => {
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

export function Testimonials() {
  return (
    <section id="clients" className="band line-top">
      <div className="wrap">
        <SectionHead eyebrow="Worldwide" title="Based in Jabalpur. Working across time zones." aside="Every project runs on one shared thread, recorded walkthroughs and a call slot that suits your hours." />
        <Reveal amount={0.1}><GlobeQuotes /></Reveal>
      </div>
    </section>
  );
}
