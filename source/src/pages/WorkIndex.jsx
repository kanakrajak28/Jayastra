import { useState } from '../lib/react';
import { INDUSTRIES, SECTOR_SLUGS } from '../components/Industries';
import { CASES, CaseCard, casesFor } from '../components/CaseStudies';
import { PageShell } from './PageShell';

export function WorkIndex() {
  const [f, setF] = useState('all');
  const list = f === 'all' ? CASES : casesFor(f);
  return (
    <PageShell>
      <section className="band wi-head">
        <div className="wrap">
          <p className="eyebrow">Case studies</p>
          <h1 className="wi-h">All case studies</h1>
          <p className="wi-sub">Concept projects across {SECTOR_SLUGS.length} sectors. Filter by the one closest to yours.</p>
          <div className="wi-filters" role="group" aria-label="Filter by sector">
            <button type="button" className={f === 'all' ? 'on' : ''} onClick={() => setF('all')}>All <small>{CASES.length}</small></button>
            {SECTOR_SLUGS.map((s, k) => <button type="button" key={s} className={f === s ? 'on' : ''} onClick={() => setF(s)}>{INDUSTRIES[k].name}</button>)}
          </div>
          <div className="cs-grid two">
            {list.map((c) => <CaseCard key={c.slug} c={c} />)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
