import { useState } from '../lib/react';
import { EASE } from '../lib/utils';
import { AnimatePresence, motion } from '../lib/motion';
import { Reveal, dot } from './shared';

/* ======================================================================
   FAQ
   ====================================================================== */
const FAQS = [
  ['How long does a typical project take?', 'A brand identity runs 3–5 weeks, a website 4–8 weeks and a 3D render set 1–2 weeks. You get an exact timeline in the proposal before we start.'],
  ['Do you work with clients outside India?', 'Yes. We work remotely across time zones, keep a fixed weekly call slot that suits yours, and invoice in INR or USD.'],
  ['What do you need from us to start?', 'A short brief, any existing brand material and one decision-maker who can approve work. We send the questionnaire.'],
  ['How many revisions are included?', 'Two structured rounds per deliverable. Beyond that we bill hourly, which rarely happens because feedback is collected in one place.'],
  ["Can you render a product that doesn't exist yet?", 'Yes, that is what 3D is for. Send CAD files, technical drawings or dimensioned sketches and we build it in Blender.'],
  ['What are your payment terms?', '50% to book the slot and 50% on delivery. Retainers are billed monthly in advance.'],
];
export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="band line-top">
      <div className="wrap faq-wrap">
        <div className="faq-side">
          <Reveal as="p" className="eyebrow">FAQ</Reveal>
          <Reveal as="h2" className="h2" delay={0.06} style={{ maxWidth: '12ch' }}>{dot('Questions we get asked a lot.')}</Reveal>
        </div>
        <Reveal className="faq-list" delay={0.1} amount={0.1}>
          {FAQS.map(([q, a], k) => {
            const on = open === k;
            return (
              <div className="faq-item" key={q}>
                <h3 style={{ margin: 0 }}>
                  <button className="faq-q" aria-expanded={on} aria-controls={'faq-' + k} id={'faq-q-' + k} onClick={() => setOpen(on ? -1 : k)}>
                    <span>{q}</span><span className={'plus' + (on ? ' on' : '')} aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on ? (
                    <motion.div className="faq-a" id={'faq-' + k} role="region" aria-labelledby={'faq-q-' + k} key="a"
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                      <p>{a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
