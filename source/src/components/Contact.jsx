import { useEffect, useRef, useState } from '../lib/react';
import { isFine, reducedNow } from '../lib/utils';
import { Reveal } from './shared';
import { Booker } from './Booker';
import { Clock } from './Footer';

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
export function Contact() {
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
