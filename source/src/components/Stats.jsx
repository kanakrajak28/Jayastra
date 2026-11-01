import { useEffect, useRef, useState } from '../lib/react';
import { reducedNow } from '../lib/utils';
import { animate, useInView } from '../lib/motion';
import { Reveal, dot } from './shared';

/* ======================================================================
   Stats + The Jayastra advantage
   ====================================================================== */
const STATS = [
  { n: 5, s: '+', l: 'Years in design', d: 'Brand, product and 3D work since 2021.', viz: 'years' },
  { n: 41, s: '', l: 'Services in-house', d: 'Six disciplines under one roof, no outsourcing.', viz: 'grid' },
  { n: 48, s: 'h', l: 'Average turnaround', d: 'For retainer requests, from brief to first draft.', viz: 'ticks' },
  { n: 2, s: '', l: 'Revision rounds', d: 'Included in every project, structured and on time.', viz: 'rounds' },
];
function Counter({ to, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [v, setV] = useState(() => (reducedNow() ? to : 0));
  useEffect(() => {
    if (!inView || reducedNow()) return undefined;
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => { if (c && c.stop) c.stop(); };
  }, [inView]);
  return <b ref={ref} className="stat-num">{v}{suffix ? <em>{suffix}</em> : null}</b>;
}
function StatViz({ kind }) {
  if (kind === 'years') {
    return (
      <div className="sv sv-years" aria-hidden="true">
        {['21', '22', '23', '24', '25', '26'].map((y, i) => <span key={y} style={{ '--i': i }}><i />{"'" + y}</span>)}
      </div>
    );
  }
  if (kind === 'grid') {
    return (
      <div className="sv sv-grid" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => <i key={i} className={i >= 6 && i < 9 ? 'o' : ''} style={{ '--i': i }} />)}
      </div>
    );
  }
  if (kind === 'ticks') {
    return (
      <div className="sv sv-ticks" aria-hidden="true">
        <div className="sv-tick-row">{Array.from({ length: 24 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}</div>
        <div className="sv-tick-cap"><span>Brief</span><span>Draft</span></div>
      </div>
    );
  }
  return (
    <div className="sv sv-rounds" aria-hidden="true">
      {['Round 1', 'Round 2'].map((r, i) => (
        <span key={r} style={{ '--i': i }}><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>{r}</span>
      ))}
    </div>
  );
}
export function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  return (
    <section className="band line-top stats-band" aria-label="Studio in numbers">
      <div className="wrap">
        <div className="stats-head">
          <Reveal as="p" className="eyebrow">In numbers</Reveal>
          <Reveal as="h2" className="h2" delay={0.06}>{dot('Small studio. Clear numbers.')}</Reveal>
        </div>
        <div ref={ref} className={'stats' + (inView ? ' in' : '')}>
          {STATS.map((st, k) => (
            <Reveal className="stat" key={st.l} delay={k * 0.08}>
              <span className="stat-k">{String(k + 1).padStart(2, '0')}</span>
              <Counter to={st.n} suffix={st.s} />
              <h3 className="stat-l">{st.l}</h3>
              <p className="stat-d">{st.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
