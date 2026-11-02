import { useEffect, useRef, useState } from '../lib/react';
import { EASE, img } from '../lib/utils';
import { AnimatePresence, motion } from '../lib/motion';
import { Arrow, Reveal, SectionHead } from './shared';

/* ======================================================================
   Services: every discipline open in a column, with a photo panel that
   stays in view and follows the discipline being read
   ====================================================================== */
const DISCIPLINES = [
  {
    name: 'Research',
    note: 'Know the user before you design',
    items: [
      [
        'UX research',
        'Interviews, surveys and analytics reviews that show what users actually need.',
      ],
      [
        'Usability testing',
        'Moderated and remote sessions on real tasks, with clear findings and fixes.',
      ],
      [
        'Heuristic analysis',
        'An expert review of your product against proven usability principles.',
      ],
      [
        'Design audit',
        'A full check of brand and UI consistency, accessibility and quality, with priorities.',
      ],
      [
        'Ethnographic research',
        'Time with users in their own context, to understand habits and workarounds.',
      ],
      [
        'Emerging trends',
        'Market and competitor scans so your product and brand stay ahead, not behind.',
      ],
    ],
  },
  {
    name: 'Brand',
    note: 'Who you are and how you look',
    items: [
      [
        'Brand identity',
        'Logo suite, type, colour and a guideline book that holds every touchpoint together.',
      ],
      [
        'Strategy & positioning',
        'Research, naming, messaging and tone, so the design has something true to say.',
      ],
      [
        'Rebranding',
        'A full brand overhaul for businesses that have outgrown their look, with a rollout plan for every touchpoint.',
      ],
      [
        'Logo refresh',
        'Modernise an existing logo without losing the recognition you have already built.',
      ],
      [
        'Packaging',
        'Structure, labels and print-ready dielines built for the shelf and the print run.',
      ],
      [
        'Packaging redesign',
        'Refresh tired packs to stand out on the shelf again, while staying recognisable to loyal buyers.',
      ],
      [
        'Print & collateral',
        'Brochures, catalogues, stationery and business cards, set up properly for print.',
      ],
      [
        'Photography',
        'Product, food and lifestyle shoots, art-directed to match the brand and ready for web, social and print.',
      ],
      [
        'Illustrations & iconography',
        'Custom illustration styles and icon sets drawn to match the brand.',
      ],
    ],
  },
  {
    name: 'Digital',
    note: 'Interfaces people get through',
    items: [
      [
        'UI / UX design',
        'Flows, wireframes and clickable prototypes for apps, SaaS and dashboards.',
      ],
      [
        'Websites',
        'Responsive, conversion-focused sites, designed and shipped in Webflow, Framer or WordPress.',
      ],
      [
        'Website redesign',
        'Rebuild an outdated site around a clearer structure, faster pages and a stronger brand.',
      ],
      [
        'App & product redesign',
        'UX audit and redesign of an existing app or SaaS product, fixing what users struggle with.',
      ],
      [
        'Pitch decks',
        'Investor and sales decks that carry one clear argument from the first slide to the ask.',
      ],
      [
        'E-commerce design',
        'Shopify and custom storefronts, product pages and checkout flows built to convert.',
      ],
      [
        'Design systems',
        'Figma component libraries, tokens and documentation so every new screen stays consistent.',
      ],
      [
        'Interaction design',
        'Micro-interactions, states and transitions that make an interface feel responsive.',
      ],
      [
        'Digital prototyping',
        'High-fidelity clickable prototypes to test ideas before a line of code is written.',
      ],
      [
        'AI design solutions',
        'Interfaces for AI products, and AI-assisted workflows that speed up design delivery.',
      ],
    ],
  },
  {
    name: 'Build',
    note: 'From Figma to a working product',
    items: [
      [
        'Front-end development',
        'Pixel-accurate, responsive front ends in React and modern frameworks.',
      ],
      [
        'Web application development',
        'Dashboards, portals and web apps built to scale with your users.',
      ],
      [
        'Mobile application development',
        'iOS and Android apps that match the design down to the detail.',
      ],
      [
        'Custom application development',
        'Software shaped around your business processes, not the other way round.',
      ],
      [
        'AI solution development',
        'Chat assistants, automations and AI features integrated into your product.',
      ],
      [
        'SaaS implementation',
        'Setup, integration and launch of SaaS platforms, configured to your workflow.',
      ],
    ],
  },
  {
    name: '3D & motion',
    edge: true,
    note: 'Built in Blender, in-house',
    items: [
      [
        '3D modelling',
        'Accurate models, materials and lighting for products, spaces and concepts.',
      ],
      [
        'Product rendering',
        'Studio-grade visuals for listings, ads and launches, without a shoot day.',
      ],
      ['3D animation', 'Logo reveals, product explainers and short-form motion for reels and ads.'],
      [
        'Motion graphics',
        '2D animated explainers, UI animations and kinetic type for launches and socials.',
      ],
      [
        'Interior & architectural visuals',
        'Photoreal renders and walkthroughs of spaces before they are built.',
      ],
    ],
  },
  {
    name: 'Growth',
    note: 'Design that ships every week',
    items: [
      [
        'Social design',
        'Post systems, story sets, reel covers and campaign creative built to a template.',
      ],
      ['Ad creative', 'Performance ads, banners, posters and brochures, with variants tested.'],
      [
        'Design retainer',
        'A dedicated designer at a fixed monthly fee. Queue work, get it back fast.',
      ],
      [
        'Reels & video editing',
        'Short-form edits, captions and cover frames, cut for Instagram, YouTube and LinkedIn.',
      ],
      [
        'Email & newsletter design',
        'Templates and campaigns that look right in every inbox and stay on-brand.',
      ],
    ],
  },
];
const DISC_INFO = [
  {
    photo: 'i1a',
    alt: 'A hand holding a phone showing an app',
    bg: 'linear-gradient(160deg,#1C2233,#0E0E10)',
    text: 'Research that turns what users do and say into decisions your team can act on.',
  },
  {
    photo: 'i0a',
    alt: 'Pink and green branded soap packaging',
    bg: 'linear-gradient(160deg,#3A1A0C,#0E0E10)',
    text: 'Strategy, identity and packaging that give your business a clear point of view and a look people remember.',
  },
  {
    photo: 'digital',
    alt: 'A designer working at a computer in a dim studio',
    bg: 'linear-gradient(160deg,#1C2233,#0E0E10)',
    text: 'Interfaces, websites and decks designed around how people actually read, click and decide.',
  },
  {
    photo: 'northbrook',
    alt: 'An analytics dashboard on a dark screen',
    bg: 'linear-gradient(160deg,#1C2233,#0E0E10)',
    text: 'We build what we design, so the product that ships looks exactly like the one you approved.',
  },
  {
    photo: 'three',
    alt: 'Abstract orange and white rendered ribbons',
    bg: 'linear-gradient(160deg,#C94B00,#3A1406)',
    text: 'Models, product renders and animation built in Blender, in-house. Show the product before it exists.',
  },
  {
    photo: 'growth',
    alt: 'A hand holding a phone with social media apps',
    bg: 'linear-gradient(160deg,#2F3A33,#0E0E10)',
    text: 'Social, ads and an ongoing retainer, built to a system so the work stays on-brand week after week.',
  },
];
export function Services() {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState({});
  const blocks = useRef([]);
  // the discipline crossing a line just above the middle of the screen is the one being read
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(blocks.current.indexOf(e.target));
        });
      },
      { rootMargin: '-45% 0px -54% 0px' },
    );
    blocks.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  const photo = (k, className) =>
    !failed[k] ? (
      <img
        className={className}
        src={img(DISC_INFO[k].photo)}
        alt={DISC_INFO[k].alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed((f) => Object.assign({}, f, { [k]: true }))}
      />
    ) : null;
  return (
    <section id="services" className="band line-top">
      <div className="wrap">
        <SectionHead
          eyebrow="Services"
          title="Forty-one services. Six disciplines. One studio."
          aside="Take one line item or hand us the whole thing, from strategy to the final render."
        />
        <div className="svc">
          <div className="svc-aside" aria-hidden="true">
            <div className="svc-media">
              {DISCIPLINES.map((d, k) => (
                <motion.div
                  key={d.name}
                  className="svc-layer"
                  style={{ background: DISC_INFO[k].bg }}
                  initial={false}
                  animate={{ opacity: k === active ? 1 : 0, scale: k === active ? 1 : 1.06 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  {photo(k)}
                </motion.div>
              ))}
              <div className="svc-cap">
                <span>
                  {String(active + 1).padStart(2, '0')} /{' '}
                  {String(DISCIPLINES.length).padStart(2, '0')}
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.b
                    key={active}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    {DISCIPLINES[active].name}
                  </motion.b>
                </AnimatePresence>
              </div>
            </div>
            <div className="svc-progress">
              {DISCIPLINES.map((d, k) => (
                <span key={d.name} className={k <= active ? 'on' : ''} />
              ))}
            </div>
          </div>
          <div className="svc-list">
            {DISCIPLINES.map((d, k) => (
              <article
                key={d.name}
                ref={(el) => {
                  blocks.current[k] = el;
                }}
                className={'svc-block' + (k === active ? ' on' : '')}
                aria-labelledby={'svc-' + k}
              >
                <div className="svc-block-media">{photo(k)}</div>
                <Reveal className="svc-title" amount={0.4}>
                  <span className="svc-n">{String(k + 1).padStart(2, '0')}</span>
                  <h3 id={'svc-' + k} className="svc-name">
                    {d.name}
                    {d.edge ? <em>Our edge</em> : null}
                  </h3>
                </Reveal>
                <Reveal delay={0.06} amount={0.3}>
                  <p className="svc-note">{d.note}</p>
                  <p className="svc-text">{DISC_INFO[k].text}</p>
                </Reveal>
                <ul className="svc-items">
                  {d.items.map(([t, desc], i) => (
                    <Reveal
                      as="li"
                      key={t}
                      delay={0.04 * (i % 2) + 0.03 * Math.floor(i / 2)}
                      y={18}
                      amount={0.5}
                    >
                      <b>{t}</b>
                      <span>{desc}</span>
                    </Reveal>
                  ))}
                </ul>
                <a className="svc-link" href="#contact">
                  Enquire about {d.name.toLowerCase()} <Arrow />
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
