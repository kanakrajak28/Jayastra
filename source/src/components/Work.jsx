import { useCallback, useEffect, useRef, useState } from '../lib/react';
import { LOGO_LIGHT, clamp, img, isFine, reducedNow } from '../lib/utils';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from '../lib/motion';
import { Arrow, Reveal, SectionHead } from './shared';

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

export function Work() {
  return (
    <section id="work" className="band line-top">
      <div className="wrap">
        <SectionHead eyebrow="Selected work" title="A few pages from the album." aside="Concept briefs from the studio. Flip through, drag the pages, or let it play." />
        <Reveal amount={0.1}><MemoryAlbum /></Reveal>
      </div>
    </section>
  );
}
