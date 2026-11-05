import { useEffect, useRef, useState } from '../lib/react';

/* ======================================================================
   Booker: the Cal.com booking calendar (cal.com/jayastra/30min), embedded
   ====================================================================== */
export const CAL_LINK = 'jayastra/30min';
export const CAL_URL = 'https://cal.com/' + CAL_LINK;

// Cal.com's embed loader: queues calls until embed.js has loaded, and adds the script only once
function loadCal() {
  if (window.Cal) return window.Cal;
  const Cal = function () {
    const cal = window.Cal;
    const args = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      const s = document.head.appendChild(document.createElement('script'));
      s.src = 'https://app.cal.com/embed/embed.js';
      s.onerror = () => window.dispatchEvent(new Event('jy:cal-failed'));
      cal.loaded = true;
    }
    if (args[0] === 'init') {
      const api = function () {
        api.q.push(arguments);
      };
      api.q = [];
      const name = args[1];
      if (typeof name === 'string') {
        cal.ns[name] = cal.ns[name] || api;
        cal.ns[name].q.push(args);
        cal.q.push(['initNamespace', name]);
      } else cal.q.push(args);
      return;
    }
    cal.q.push(args);
  };
  window.Cal = Cal;
  return Cal;
}

export function Booker() {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const onFail = () => setFailed(true);
    window.addEventListener('jy:cal-failed', onFail);
    const Cal = loadCal();
    if (!Cal.ns || !Cal.ns.jayastra) Cal('init', 'jayastra', { origin: 'https://cal.com' });
    Cal.ns.jayastra('inline', {
      elementOrSelector: ref.current,
      calLink: CAL_LINK,
      config: { layout: 'month_view' },
    });
    Cal.ns.jayastra('ui', {
      theme: 'light',
      cssVarsPerTheme: { light: { 'cal-brand': '#D24E01' } },
      hideEventTypeDetails: false,
      layout: 'month_view',
    });
    return () => window.removeEventListener('jy:cal-failed', onFail);
  }, []);
  return (
    <div className="bk-embed">
      <div ref={ref} className="bk-cal-frame" data-lenis-prevent />
      {failed ? (
        <p className="bk-fallback">
          The booking calendar couldn't load here.{' '}
          <a href={CAL_URL} target="_blank" rel="noopener">
            Book a call on Cal.com
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}
