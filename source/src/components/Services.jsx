import { useEffect, useRef, useState } from '../lib/react';
import { EASE, img, isFine } from '../lib/utils';
import { AnimatePresence, afterRender, motion } from '../lib/motion';
import { Arrow, Reveal, SectionHead } from './shared';

/* ======================================================================
   Services — interactive box grid with a cursor-lit hairline
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
// opening and closing a row: a gentle ease-in-out, with the content fading in once the row has started to open
const OPEN = {
  height: { duration: 0.6, ease: [0.45, 0, 0.2, 1] },
  opacity: { duration: 0.4, delay: 0.12, ease: 'easeOut' },
};
const CLOSE = {
  height: { duration: 0.55, ease: [0.45, 0, 0.2, 1] },
  opacity: { duration: 0.2, ease: 'easeOut' },
};

// While a row above collapses, everything below it moves up. Scroll by the same amount for the length of
// the animation, so the row that was hovered or tapped stays where it is and opens downward.
function keepInPlace(el) {
  const top = el.getBoundingClientRect().top;
  const start = performance.now();
  const root = document.documentElement;
  // the page has scroll-behavior: smooth, which would turn each correction into a slow scroll that lags behind
  root.style.scrollBehavior = 'auto';
  let stopped = false;
  const stop = () => {
    stopped = true;
  };
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchmove', stop, { passive: true });
  const step = () => {
    const shift = el.getBoundingClientRect().top - top;
    if (!stopped && Math.abs(shift) > 0.5) {
      const y = window.scrollY + shift;
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
      window.scrollTo(0, y);
    }
    if (!stopped && performance.now() - start < 700) afterRender(step);
    else {
      root.style.scrollBehavior = '';
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
    }
  };
  afterRender(step);
}

export function Services() {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState({});
  const hoverTimer = useRef(0);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);
  const open = (k, head) => {
    if (k === active) return;
    if (head) keepInPlace(head);
    setActive(k);
  };
  // a row opens only once the cursor rests on it, so moving across the list doesn't flip rows open
  const hoverOpen = (k, head) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => open(k, head), 150);
  };
  return (
    <section id="services" className="band line-top">
      <div className="wrap">
        <SectionHead
          eyebrow="Services"
          title="Forty-one services. Six disciplines. One studio."
          aside="Take one line item or hand us the whole thing, from strategy to the final render."
        />
        <Reveal amount={0.08} className="svc">
          <div className="svc-media">
            {DISCIPLINES.map((d, k) => (
              <motion.div
                key={d.name}
                className="svc-layer"
                style={{ background: DISC_INFO[k].bg }}
                initial={false}
                animate={{ opacity: k === active ? 1 : 0, scale: k === active ? 1 : 1.06 }}
                transition={{ duration: 0.7, ease: EASE }}
                aria-hidden={k !== active}
              >
                <span className="svc-ghost">{d.name}</span>
                {!failed[k] ? (
                  <img
                    src={img(DISC_INFO[k].photo)}
                    alt={DISC_INFO[k].alt}
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailed((f) => Object.assign({}, f, { [k]: true }))}
                  />
                ) : null}
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {DISCIPLINES[active].name}
                </motion.b>
              </AnimatePresence>
            </div>
          </div>
          <ol className="svc-list">
            {DISCIPLINES.map((d, k) => {
              const on = k === active;
              return (
                <li
                  key={d.name}
                  className={'svc-row' + (on ? ' on' : '')}
                  onMouseEnter={(e) => {
                    if (isFine()) hoverOpen(k, e.currentTarget.querySelector('.svc-head'));
                  }}
                  onMouseLeave={() => clearTimeout(hoverTimer.current)}
                >
                  <button
                    className="svc-head"
                    aria-expanded={on}
                    aria-controls={'svc-' + k}
                    onClick={(e) => open(k, e.currentTarget)}
                    onFocus={(e) => open(k, e.currentTarget)}
                  >
                    <span className="svc-n">{String(k + 1).padStart(2, '0')}</span>
                    <span className="svc-name">
                      {d.name}
                      {d.edge ? <em>Our edge</em> : null}
                    </span>
                    <span className="svc-arrow" aria-hidden="true">
                      <Arrow />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on ? (
                      <motion.div
                        id={'svc-' + k}
                        className="svc-body"
                        key="b"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: OPEN }}
                        exit={{ height: 0, opacity: 0, transition: CLOSE }}
                      >
                        <p>{DISC_INFO[k].text}</p>
                        <ul>
                          {d.items.map(([t, desc]) => (
                            <li key={t}>
                              <b>{t}</b>
                              <span>{desc}</span>
                            </li>
                          ))}
                        </ul>
                        <a className="svc-link" href="#contact">
                          Enquire about {d.name.toLowerCase()} <Arrow />
                        </a>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
