import { useRef } from '../lib/react';
import { motion, useReducedMotion, useScroll, useTransform } from '../lib/motion';
import { Reveal, Spark } from './shared';

/* ======================================================================
   Marquee + statement
   ====================================================================== */
const MARQUEE = ['Brand identity', '3D product rendering', 'UI / UX', 'Packaging', 'Motion design', 'Websites', 'Pitch decks', 'Social systems'];
function Marquee() {
  const reduce = useReducedMotion();
  const row = MARQUEE.concat(MARQUEE);
  return (
    <div className="marq" aria-hidden="true">
      <motion.div className="marq-row" animate={reduce ? { x: '0%' } : { x: ['0%', '-50%'] }} transition={{ duration: 42, ease: 'linear', repeat: Infinity }}>
        {row.map((w, i) => <span className="marq-item" key={i}>{w}<Spark /></span>)}
      </motion.div>
    </div>
  );
}

const STATEMENT = 'Jayastra is a small studio with senior hands. We design the brand, build the interface and render the product in-house, so everything you launch looks like it came from *one *mind. Because it did.';
function Word({ children, progress, range, em }) {
  const o = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity: o }}>{em ? <em>{children}</em> : children} </motion.span>;
}
export function Statement() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.82', 'end 0.42'] });
  const words = STATEMENT.split(' ');
  return (
    <section className="band" aria-labelledby="stmt-h">
      <div className="wrap stmt">
        <div className="stmt-side">
          <Reveal as="p" className="eyebrow" id="stmt-h">The studio</Reveal>
          <Reveal as="ul" className="facts" delay={0.08}>
            <li><span>Practice</span><b>5+ years</b></li>
            <li><span>Base</span><b>Jabalpur, Madhya Pradesh</b></li>
            <li><span>Clients</span><b>India and abroad</b></li>
            <li><span>Tools</span><b>Figma · Blender · Adobe</b></li>
          </Reveal>
        </div>
        <p className="stmt-text" ref={ref}>
          {words.map((w, i) => {
            const em = w.charAt(0) === '*';
            return <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} em={em}>{em ? w.slice(1) : w}</Word>;
          })}
        </p>
      </div>
    </section>
  );
}
