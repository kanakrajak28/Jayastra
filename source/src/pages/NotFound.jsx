import { Arrow } from '../components/shared';
import { PageShell } from './PageShell';

export function NotFound() {
  return (
    <PageShell>
      <section className="band nf">
        <div className="wrap"><p className="eyebrow">404</p><h1 className="wi-h">This page moved or never existed.</h1><a className="cs-all" href="#top">Back to the homepage <Arrow /></a></div>
      </section>
    </PageShell>
  );
}
