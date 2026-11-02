import { useRef } from '../lib/react';
import { EASE } from '../lib/utils';
import { motion, useScroll, useTransform } from '../lib/motion';
import { Arrow, MagLink } from './shared';

/* ======================================================================
   Hero
   ====================================================================== */
export function Hero({ ready }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const lines = [<>Design that earns</>, <>attention, in</>, <>2D and <em>3D</em>.</>];
  const show = (d) => ({ initial: { opacity: 0, y: 16 }, animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }, transition: { duration: 0.9, ease: EASE, delay: d } });
  return (
    <section id="top" className="hero on-dark" ref={ref}>
      <motion.div className="wrap hero-inner" style={{ y: yText, opacity: fade }}>
        <div className="hero-top">
          <motion.p className="eyebrow light" {...show(0.1)}>Independent design studio, Jabalpur</motion.p>
          <motion.p className="hero-slot" {...show(0.18)}><span className="pulse" />Now taking on new projects</motion.p>
        </div>
        <h1 className="hero-h1">
          {lines.map((l, k) => (
            <span className="line" key={k}>
              <motion.span initial={{ y: '112%' }} animate={ready ? { y: '0%' } : { y: '112%' }} transition={{ duration: 1.1, ease: EASE, delay: 0.08 + k * 0.09 }}>{l}</motion.span>
            </span>
          ))}
        </h1>
        <div className="hero-foot">
          <motion.p className="hero-lede" {...show(0.5)}>
            Jayastra is an independent studio for brand identity, digital product and 3D visuals. Five years of craft, one accountable team, and no hand-offs between agencies.
          </motion.p>
          <motion.div className="hero-ctas" {...show(0.62)}>
            <MagLink href="#contact" className="btn btn-brand btn-lg">Start a project <Arrow /></MagLink>
            <a href="#work" className="hero-link">See the work <Arrow /></a>
          </motion.div>
        </div>
      </motion.div>
      <motion.div className="hero-base" {...show(0.8)}>
        <div className="wrap">
          <span className="hero-disc"><span>Brand identity</span><span>Product &amp; web</span><span>3D &amp; motion</span></span>
          <span className="scrollcue">Scroll<i /></span>
        </div>
      </motion.div>
    </section>
  );
}
