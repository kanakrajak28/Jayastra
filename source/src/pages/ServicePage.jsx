import { img, to } from '../lib/utils';
import { Arrow, Reveal } from '../components/shared';
import { SERVICE_SLUGS, serviceBySlug } from '../components/Services';
import { PageShell } from './PageShell';
import { NotFound } from './NotFound';

export function ServicePage({ slug }) {
  const s = serviceBySlug(slug);
  if (!s) return <NotFound />;
  const next = serviceBySlug(SERVICE_SLUGS[(s.k + 1) % SERVICE_SLUGS.length]);
  return (
    <PageShell>
      <section className="sv-hero">
        <div className="wrap sv-hero-in">
          <div>
            <nav className="ip-crumb dark" aria-label="Breadcrumb">
              <a href="#services">Services</a>
              <span>/</span>
              <span>{s.name}</span>
            </nav>
            <h1>{s.name}</h1>
            <p>{s.text}</p>
            <a className="btn btn-brand btn-lg sv-cta" href="#contact">
              Enquire about {s.name.toLowerCase()} <Arrow />
            </a>
          </div>
          <div className="sv-hero-media" style={{ background: s.bg }}>
            <img src={img(s.photo)} alt={s.alt} fetchpriority="high" />
          </div>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <div className="ip-head">
            <p className="eyebrow">{s.note}</p>
            <h2 className="h2">
              {s.items.length} services in {s.name}
            </h2>
          </div>
          <ol className="sv-list">
            {s.items.map(([t, desc], i) => (
              <Reveal as="li" key={t} delay={0.06 * (i % 2)} y={24}>
                <span className="sv-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{t}</h3>
                <p>{desc}</p>
              </Reveal>
            ))}
          </ol>
          <a className="ip-next" href={to('/services/' + next.slug)}>
            <span>Next service</span>
            <b>{next.name}</b>
            <Arrow />
          </a>
        </div>
      </section>
    </PageShell>
  );
}
