import { useRef } from '../lib/react';
import { motion, useScroll, useSpring, useTransform } from '../lib/motion';
import { Reveal, dot } from './shared';

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
export function Process() {
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
