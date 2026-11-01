import { useState } from '../lib/react';
import { EASE, img, isFine, to } from '../lib/utils';
import { AnimatePresence, motion } from '../lib/motion';
import { Arrow, SectionHead } from './shared';

/* ======================================================================
   Industries — editorial sector index with cursor preview
   ====================================================================== */
export const INDUSTRIES = [
  { name: 'Consumer & D2C', photo: 'i0a', text: 'Packaging that earns its place on the shelf, and social that keeps the brand recognisable at thumb speed.', names: ['Packaging', 'Labels', 'Social kits', 'Product renders'] },
  { name: 'Real estate & architecture', photo: 's_realestate', text: 'Show buyers the project before the first brick: photoreal renders, walkthroughs and launch branding.', names: ['3D walkthroughs', 'Interior renders', 'Brochures', 'Hoardings'] },
  { name: 'Manufacturing & industrial', photo: 's_industrial', text: 'Machines and parts rendered without a shoot, and catalogues and websites that win B2B buyers.', names: ['Product renders', 'Catalogues', 'Exhibition stalls', 'Website redesign'] },
  { name: 'Jewellery & fashion', photo: 's_jewellery', text: 'Photoreal jewellery renders, lookbooks and storefronts that make every piece feel precious.', names: ['3D jewellery renders', 'Lookbooks', 'E-commerce', 'Packaging'] },
  { name: 'SaaS & Fintech', photo: 'i1b', text: 'Interfaces that make money and data feel simple, and websites that explain the product in one scroll.', names: ['Product UI', 'Dashboards', 'Websites', 'Pitch decks'] },
  { name: 'Food & beverage', photo: 's_food', text: 'Packs, labels and social content that make people want to taste it, from cafés to FMCG brands.', names: ['Packaging', 'Labels', 'Social media', 'Ad creative'] },
  { name: 'Healthcare & wellness', photo: 's_health', text: 'Calm, trustworthy branding and patient-friendly websites and apps for clinics, pharma and wellness brands.', names: ['Branding', 'Websites', 'App UI', 'Packaging'] },
  { name: 'Education & EdTech', photo: 's_edu', text: 'Brands, platforms and explainers for institutes and course creators that make learning look worth it.', names: ['Branding', 'Websites', 'App UI', 'Explainer animation'] },
  { name: 'Startups', photo: 's_startup', text: 'From zero to launch: brand, pitch deck, MVP design and build, and a retainer once you are moving.', names: ['Pitch decks', 'Brand from zero', 'MVP design', 'Design retainer'] },
  { name: 'Hardware & Mobility', photo: 'i2b', text: 'Show the product before the factory does: models, renders and launch films from our in-house Blender studio.', names: ['3D models', 'Product renders', 'Launch films', 'Spec sheets'] },
  { name: 'Hospitality & Retail', photo: 'i3a', text: 'Identity, signage and menus that hold together on a storefront, a table and a phone screen.', names: ['Identity', 'Signage', 'Menus', 'Print'] },
  { name: 'Tourism & heritage', photo: 's_tourism', text: 'Branding, websites and motion content for hotels, resorts and destinations worth the journey.', names: ['Destination branding', 'Websites', 'Motion content', 'Print'] },
  { name: 'Gaming & entertainment', photo: 's_gaming', text: '3D assets, motion graphics and key art that look right on a poster, a stream and a store page.', names: ['3D assets', 'Motion graphics', 'Key art', 'Social content'] },
  { name: 'Weddings & events', photo: 's_events', text: 'Invitations, event identities and 3D venue previews that set the tone before guests arrive.', names: ['Invitations', 'Event branding', '3D venue previews', 'Signage'] },
];
export function Industries() {
  const [active, setActive] = useState(0);
  const ind = INDUSTRIES[active];
  return (
    <section id="industries" className="band inds-dark">
      <div className="wrap">
        <SectionHead eyebrow="Industries" title="Sectors we know from the inside." aside="The patterns repeat, so we start faster. Open a sector to see what we usually make for it." />
        <div className="idk">
          <div className="idk-panel">
            <a className="idk-media" href={to('/industries/' + SECTOR_SLUGS[active])} aria-label={'Open ' + ind.name}>
              {INDUSTRIES.map((s2, k) => (s2.photo ? <img key={s2.name} src={img(s2.photo)} alt="" className={k === active ? 'on' : ''} loading="lazy" decoding="async" /> : null))}
              <span className={'idk-blank' + (ind.photo ? '' : ' on')} aria-hidden="true"><b>{String(active + 1).padStart(2, '0')}</b></span>
              <span className="idk-shade" aria-hidden="true" />
              <div className="idk-cap">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>
                    <h3>{ind.name}</h3>
                    <p>{ind.text}</p>
                    <ul>{ind.names.map((nm) => <li key={nm}>{nm}</li>)}</ul>
                  </motion.div>
                </AnimatePresence>
              </div>
            </a>
            <div className="idk-links"><a className="idk-cta" href={to('/industries/' + SECTOR_SLUGS[active])}>View sector &amp; projects <Arrow /></a><a className="idk-sub" href="#contact">Start a project</a></div>
          </div>
          <ol className="idk-list">
            {INDUSTRIES.map((s2, k) => (
              <li key={s2.name}>
                <a className={'idk-name' + (k === active ? ' on' : '')} href={to('/industries/' + SECTOR_SLUGS[k])}
                  onMouseEnter={() => { if (isFine()) setActive(k); }} onFocus={() => setActive(k)}>
                  <span className="idk-n">{String(k + 1).padStart(2, '0')}</span>{s2.name}<span className="idk-go" aria-hidden="true"><Arrow /></span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export const SECTOR_SLUGS = ['consumer', 'real-estate', 'manufacturing', 'jewellery', 'saas', 'food', 'healthcare', 'education', 'startups', 'hardware', 'hospitality', 'tourism', 'gaming', 'events'];
