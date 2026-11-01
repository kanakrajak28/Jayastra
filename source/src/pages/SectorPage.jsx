import { img, imgHi, to } from '../lib/utils';
import { Arrow, Reveal } from '../components/shared';
import { SECTOR_SLUGS } from '../components/Industries';
import { Check } from '../components/Pricing';
import { CaseCard, casesFor, sectorBySlug } from '../components/CaseStudies';
import { PageShell } from './PageShell';
import { NotFound } from './NotFound';

export function SectorPage({ slug }) {
  const sec = sectorBySlug(slug);
  if (!sec) return <NotFound />;
  const list = casesFor(slug);
  const next = sectorBySlug(SECTOR_SLUGS[(sec.k + 1) % SECTOR_SLUGS.length]);
  return (
    <PageShell>
      <section className="ip-hero">
        <img className="ip-bg" src={imgHi(sec.photo)} alt="" fetchpriority="high" />
        <div className="ip-shade" />
        <div className="wrap ip-in">
          <nav className="ip-crumb" aria-label="Breadcrumb"><a href="#industries">Industries</a><span>/</span><span>{sec.name}</span></nav>
          <h1>{sec.name}</h1>
          <p>{sec.text}</p>
          <ul className="ip-chips">{sec.names.map((n) => <li key={n}>{n}</li>)}</ul>
          <a className="ip-cta" href="#contact">Start a project <Arrow /></a>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <div className="ip-head">
            <p className="eyebrow">Projects</p>
            <h2 className="h2">{list.length} {list.length === 1 ? "project" : "projects"} in {sec.name}</h2>
          </div>
          <div className="cs-grid two">
            {list.map((c, k) => <Reveal key={c.slug} delay={k * 0.08}><CaseCard c={c} /></Reveal>)}
          </div>
          <div className="ip-help">
            <div>
              <h3>What we usually make for {sec.name.toLowerCase()}</h3>
              <p>{sec.text}</p>
            </div>
            <ul>{sec.names.map((n) => <li key={n}><Check />{n}</li>)}</ul>
          </div>
          <a className="ip-next" href={to('/industries/' + next.slug)}><span>Next sector</span><b>{next.name}</b><Arrow /></a>
        </div>
      </section>
    </PageShell>
  );
}
