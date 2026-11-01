import { img, imgHi, to } from '../lib/utils';
import { Reveal } from '../components/shared';
import { CASES, caseBySlug, sectorBySlug } from '../components/CaseStudies';
import { PageShell } from './PageShell';
import { NotFound } from './NotFound';

export function CasePage({ slug }) {
  const c = caseBySlug(slug);
  if (!c) return <NotFound />;
  const sec = sectorBySlug(c.sector);
  const i = CASES.indexOf(c);
  const next = CASES[(i + 1) % CASES.length];
  return (
    <PageShell>
      <section className="cp-hero">
        <div className="wrap">
          <nav className="ip-crumb dark" aria-label="Breadcrumb"><a href={to('/work')}>Case studies</a><span>/</span><a href={to('/industries/' + c.sector)}>{sec.name}</a></nav>
          <span className="cc-tag static">Concept project</span>
          <h1>{c.name}</h1>
          <p className="cp-sum">{c.summary}</p>
          <dl className="cp-meta">
            <div><dt>Sector</dt><dd><a href={to('/industries/' + c.sector)}>{sec.name}</a></dd></div>
            <div><dt>Services</dt><dd>{c.services}</dd></div>
            <div><dt>Year</dt><dd>{c.year}</dd></div>
          </dl>
        </div>
        <div className="wrap"><div className="cp-cover"><img src={imgHi(c.images[0])} alt={c.name} fetchpriority="high" /></div></div>
      </section>
      <section className="band cp-body">
        <div className="wrap cp-cols">
          {[['The challenge', c.challenge], ['Our approach', c.approach], ['The outcome', c.outcome]].map(([h, t], k) => (
            <Reveal key={h} className="cp-block" delay={k * 0.06}><span className="cp-n">{String(k + 1).padStart(2, '0')}</span><h2>{h}</h2><p>{t}</p></Reveal>
          ))}
        </div>
        <div className="wrap cp-gallery">
          {c.images.slice(1).map((im) => <Reveal key={im} className="cp-shot"><img src={img(im)} alt="" loading="lazy" /></Reveal>)}
        </div>
        <div className="wrap">
          <a className="cp-next" href={to('/work/' + next.slug)}>
            <span>Next project</span>
            <b>{next.name}</b>
            <img src={img(next.images[0])} alt="" loading="lazy" />
          </a>
        </div>
      </section>
    </PageShell>
  );
}
