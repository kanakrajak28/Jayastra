import { useEffect, useRef, useState } from '../lib/react';
import { LOGO_LIGHT, TAU, clamp, isFine, reducedNow } from '../lib/utils';
import { Reveal } from './shared';

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
