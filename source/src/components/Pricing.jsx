import { useRef } from '../lib/react';
import { isFine } from '../lib/utils';
import { motion, useReducedMotion, useSpring } from '../lib/motion';
import { Arrow, MagLink, Reveal, SectionHead } from './shared';
import { SPEAR_PATH } from './Footer';

/* ======================================================================
   Pricing — floating cards that tilt toward the cursor
   ====================================================================== */
export const Check = () => (
  <svg className="chk" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const RETAINER = ['No long contracts', 'Pause or cancel anytime', 'Unlimited requests, one at a time', 'Brand, web and 3D work', '48-hour average turnaround', 'Weekly check-in call'];
const PROJECT = ['Clearly defined scope', 'Fixed timeline', 'Two revision rounds', 'Milestone updates'];

/* Pricing in the "floating card" layout: a dark card drifts over the corner of the intro card. */
export function Pricing() {
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
