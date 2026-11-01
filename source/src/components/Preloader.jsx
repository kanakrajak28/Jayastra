import { useCallback, useEffect, useRef, useState } from '../lib/react';
import { AnimatePresence, motion } from '../lib/motion';

/* ======================================================================
   Preloader — "hello" in eleven languages, about three seconds.
   ====================================================================== */
const HELLOS = [
  ['Hello', 'en'], ['नमस्ते', 'hi'], ['ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'pa'], ['Bonjour', 'fr'], ['Hola', 'es'], ['Ciao', 'it'],
  ['こんにちは', 'ja'], ['Olá', 'pt'], ['Hallo', 'de'], ['مرحبا', 'ar'], ['안녕하세요', 'ko'],
];
export function Preloader({ onReveal, onDone }) {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [vp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const left = useRef(false);
  const leave = useCallback(() => {
    if (left.current) return;
    left.current = true;
    setLeaving(true);
    setTimeout(onReveal, 240);
    setTimeout(onDone, 1150);
  }, [onReveal, onDone]);
  useEffect(() => {
    const timers = [];
    let t = 280;
    for (let k = 1; k < HELLOS.length; k++) { const n = k; timers.push(setTimeout(() => setI(n), t)); t += 125; }
    timers.push(setTimeout(leave, t + 20));
    const onKey = () => leave();
    window.addEventListener('keydown', onKey);
    return () => { timers.forEach(clearTimeout); window.removeEventListener('keydown', onKey); };
  }, [leave]);
  const curve = Math.min(240, vp.h * 0.28);
  const from = 'M0 0 L' + vp.w + ' 0 L' + vp.w + ' ' + vp.h + ' Q' + vp.w / 2 + ' ' + (vp.h + curve) + ' 0 ' + vp.h + ' L0 0Z';
  const to = 'M0 0 L' + vp.w + ' 0 L' + vp.w + ' ' + vp.h + ' Q' + vp.w / 2 + ' ' + vp.h + ' 0 ' + vp.h + ' L0 0Z';
  const ease = [0.76, 0, 0.24, 1];
  const [word, lang] = HELLOS[i];
  return (
    <motion.div className="loader" onClick={leave} role="status" aria-label="Loading Jayastra"
      initial={{ y: 0 }} animate={leaving ? { y: -(vp.h + curve) } : { y: 0 }} transition={{ duration: 0.82, ease }}
      onAnimationComplete={() => { if (left.current) onDone(); }}>
      <svg width={vp.w} height={vp.h + curve} aria-hidden="true">
        <motion.path fill="#09090B" d={leaving ? to : from} initial={{ d: from }} animate={{ d: leaving ? to : from }} transition={{ duration: 0.82, ease }} />
      </svg>
      <div className="loader-words" aria-hidden="true">
        <div className="hello-mask">
          <AnimatePresence initial={false}>
            <motion.span key={i} className="hello" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}
              initial={{ y: '75%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-75%', opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.3, 0, 0.2, 1] }}>
              <i className="hello-dot" />{word}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <motion.span className="loader-skip" animate={{ opacity: leaving ? 0 : 1 }}>Click to skip</motion.span>
    </motion.div>
  );
}
