import { useEffect, useState } from '../lib/react';
import { EASE, LOGO_DARK, LOGO_LIGHT, img } from '../lib/utils';
import { AnimatePresence, motion } from '../lib/motion';
import { MagLink } from './shared';

/* ======================================================================
   Header
   ====================================================================== */
const NAV = [['Work', '#work'], ['Services', '#services'], ['Industries', '#industries'], ['Case studies', '#case-studies'], ['Process', '#process'], ['Pricing', '#pricing'], ['FAQ', '#faq']];
export function Header({ ready }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => {
      const hero = document.querySelector('#top, .ip-hero');
      const past = hero ? window.scrollY > hero.offsetHeight - 80 : true;
      let dark = false;
      document.querySelectorAll('.inds-dark').forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < 60 && r.bottom > 40) dark = true; });
      setSolid(past && !dark);
    };
    on();
    const onHash = () => setTimeout(on, 120);
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    window.addEventListener('hashchange', onHash);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); window.removeEventListener('hashchange', onHash); };
  }, []);
  return (
    <motion.header className={'hdr' + (solid || open ? ' solid' : '') + (solid || open ? '' : ' on-dark')}
      initial={{ y: -20, opacity: 0 }} animate={ready ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}>
      <div className="wrap hdr-in">
        <a href="#top" className="brand" aria-label="Jayastra, back to top">
          <img className="light" src={LOGO_LIGHT} alt="" />
          <img className="dark" src={LOGO_DARK} alt="" />
        </a>
        <nav className="nav" aria-label="Main">
          {NAV.map(([l, h]) => <a key={h} href={h}>{l}</a>)}
        </nav>
        <MagLink href="#contact" className="btn btn-brand hdr-cta">Let's talk</MagLink>
        <button className="menu-btn" aria-expanded={open} aria-controls="mmenu" onClick={() => setOpen((o) => !o)}>
          <span /><span /><span className="sr">Menu</span>
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav id="mmenu" className="mmenu" aria-label="Mobile" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
            {NAV.concat([['Contact', '#contact']]).map(([l, h], k) => (
              <motion.a key={h} href={h} onClick={() => setOpen(false)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * k, duration: 0.4, ease: EASE }}>{l}</motion.a>
            ))}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
