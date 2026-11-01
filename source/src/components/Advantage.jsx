import { useEffect, useRef, useState } from '../lib/react';
import { EASE, TAU, isFine, reducedNow } from '../lib/utils';
import { animate, motion, useAnimationFrame, useInView, useReducedMotion } from '../lib/motion';
import { Reveal, SectionHead, useOnScreen } from './shared';
import { isLand } from './Testimonials';
import { SPEAR_PATH } from './Footer';

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
export function Advantage() {
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
