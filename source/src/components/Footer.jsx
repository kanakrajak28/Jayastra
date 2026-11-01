import { useEffect, useRef, useState } from '../lib/react';
import { LOGO_DARK, img, isFine, reducedNow, to } from '../lib/utils';
import { Arrow } from './shared';

/* ======================================================================
   Footer — the wordmark reacts to the cursor (variable width and weight)
   ====================================================================== */
export function Clock() {
  const fmt = () => {
    try { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date()); } catch (e) { return ''; }
  };
  const [t, setT] = useState(fmt);
  useEffect(() => { const id = setInterval(() => setT(fmt()), 20000); return () => clearInterval(id); }, []);
  return <span className="clock"><span className="pulse" />Jabalpur {t} IST</span>;
}
/* The spear from the logo, traced from logo.png; it replaces the t like it does in the mark. */
const SPEAR = 5;
export const SPEAR_PATH = 'M119.0 84.6 L65.8 67.0 L66.0 1.3 L82.4 55.0 L119.0 83.7 L119.0 84.6Z M64.0 251.3 L39.3 85.0 L38.0 83.8 L4.1 71.0 L5.0 69.6 L52.0 47.6 L53.1 48.0 L40.5 69.0 L41.0 70.0 L81.0 88.7 L82.3 90.0 L64.0 251.3Z';
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
export function Footer() {
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
