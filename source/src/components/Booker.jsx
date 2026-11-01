import { useMemo, useState } from '../lib/react';
import { LOGO_DARK, img, to } from '../lib/utils';

/* ======================================================================
   Booker — cal.com-style call scheduler (studio hours in IST)
   ====================================================================== */
const BUDGETS = ['Under ₹1 lakh', '₹1–3 lakh', '₹3–6 lakh', '₹6 lakh +'];
const BK_HOURS = [10, 19];           // studio hours, IST
const BK_DAYS = [1, 2, 3, 4, 5, 6];  // Mon–Sat
const BK_LEN = 20;                   // minutes
const BK_ZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney'];
const BK_CODES = [['IN', '+91'], ['AE', '+971'], ['GB', '+44'], ['US', '+1'], ['SG', '+65'], ['AU', '+61'], ['DE', '+49']];
const flag = (cc) => cc.replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
const dkey = (d, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
function bkSlots(tz) {
  const out = {};
  const now = Date.now() + 2 * 3600e3;
  const ist = new Date(Date.now() + 5.5 * 3600e3);
  for (let i = 0; i < 45; i++) {
    const y = ist.getUTCFullYear(), m = ist.getUTCMonth(), d = ist.getUTCDate() + i;
    const dow = new Date(Date.UTC(y, m, d)).getUTCDay();
    if (BK_DAYS.indexOf(dow) < 0) continue;
    for (let mins = BK_HOURS[0] * 60; mins + BK_LEN <= BK_HOURS[1] * 60; mins += 30) {
      const t = Date.UTC(y, m, d, 0, mins) - 5.5 * 3600e3;
      if (t < now) continue;
      const k = dkey(new Date(t), tz);
      (out[k] = out[k] || []).push(t);
    }
  }
  return out;
}
export function Booker() {
  const guessTz = (() => { try { const z = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'; return z === 'Asia/Calcutta' ? 'Asia/Kolkata' : z; } catch (e) { return 'Asia/Kolkata'; } })();
  const [tz, setTz] = useState(guessTz);
  const zones = BK_ZONES.indexOf(guessTz) >= 0 ? BK_ZONES : [guessTz].concat(BK_ZONES);
  const slots = useMemo(() => bkSlots(tz), [tz]);
  const firstKey = Object.keys(slots).sort()[0];
  const today = dkey(new Date(), tz);
  const [view, setView] = useState(() => { const k = (firstKey || today).split('-'); return [+k[0], +k[1] - 1]; });
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [h12, setH12] = useState(true);
  const [step, setStep] = useState('pick');
  const [f, setF] = useState({ name: '', email: '', about: '', budget: '', cc: 'IN', phone: '', notes: '' });
  const [guests, setGuests] = useState(null);
  const [err, setErr] = useState({});
  const set = (k) => (e) => { const v = e.target.value; setF((o) => Object.assign({}, o, { [k]: v })); setErr((o) => Object.assign({}, o, { [k]: null })); };
  const fmtT = (t) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: h12 ? 'numeric' : '2-digit', minute: '2-digit', hour12: h12 }).format(new Date(t)).replace(' am', 'am').replace(' pm', 'pm');
  const fmtD = (t, o) => new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: tz }, o)).format(new Date(t));
  const [vy, vm] = view;
  const first = new Date(Date.UTC(vy, vm, 1)).getUTCDay();
  const dim = new Date(Date.UTC(vy, vm + 1, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(vy + '-' + String(vm + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'));
  const isNowMonth = vy + '-' + String(vm + 1).padStart(2, '0') === today.slice(0, 7);
  const spill = [];
  if (isNowMonth && dim - (+today.slice(8)) < 10) {
    const nd = new Date(Date.UTC(vy, vm + 1, 1)); const ny = nd.getUTCFullYear(), nm = nd.getUTCMonth();
    const need = (7 - (cells.length % 7)) % 7 + 7;
    for (let d = 1; d <= need; d++) spill.push(ny + '-' + String(nm + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'));
  }
  const spillMon = spill.length ? new Date(spill[0] + 'T12:00:00Z').toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }).toUpperCase() : '';
  const monthName = new Date(Date.UTC(vy, vm, 1)).toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
  const shift = (n) => setView(([y, m]) => { const d = new Date(Date.UTC(y, m + n, 1)); return [d.getUTCFullYear(), d.getUTCMonth()]; });
  const canPrev = (vy * 12 + vm) > (+today.slice(0, 4) * 12 + (+today.slice(5, 7) - 1));
  const daySlots = day ? (slots[day] || []) : [];
  const confirm = (e) => {
    e.preventDefault();
    const n = {};
    if (!f.name.trim()) n.name = 'Please add your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) n.email = 'Please add a valid email.';
    if (!f.about.trim()) n.about = 'Tell us what the call is about.';
    if (!f.budget) n.budget = 'Pick a budget range.';
    setErr(n);
    if (Object.keys(n).length) return;
    const when = fmtD(slot, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + fmtT(slot) + ' (' + tz + ')';
    const istWhen = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(slot)) + ' IST';
    const cc = (BK_CODES.find((c) => c[0] === f.cc) || BK_CODES[0])[1];
    const body = ['Call request: 20-minute intro call', 'When: ' + when, 'Studio time: ' + istWhen, '', 'Name: ' + f.name.trim(), 'Email: ' + f.email.trim(), f.phone.trim() ? 'Phone: ' + cc + ' ' + f.phone.trim() : null,
      'About: ' + f.about.trim(), 'Budget: ' + f.budget, guests && guests.filter(Boolean).length ? 'Guests: ' + guests.filter(Boolean).join(', ') : null, f.notes.trim() ? '\nNotes: ' + f.notes.trim() : null].filter((x) => x !== null).join('\n');
    try { window.location.href = 'mailto:hello@jayastra.com?subject=' + encodeURIComponent('Call request: ' + istWhen + ' (' + f.name.trim() + ')') + '&body=' + encodeURIComponent(body); } catch (er) { /* ignore */ }
    setStep('done');
  };
  const ics = () => {
    const z = (t) => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Jayastra//Booking//EN', 'BEGIN:VEVENT', 'UID:' + slot + '@jayastra.com', 'DTSTAMP:' + z(Date.now()), 'DTSTART:' + z(slot), 'DTEND:' + z(slot + BK_LEN * 60e3),
      'SUMMARY:Intro call with Jayastra', 'DESCRIPTION:20-minute intro call. We will email you the meeting link.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(txt);
  };
  return (
    <div className={'bk is-' + step}>
      <div className="bk-info">
        <img className="bk-avatar" src={LOGO_DARK} alt="" />
        <h3>20-minute intro call</h3>
        <ul>
          <li><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M8 4.6V8l2.3 1.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>{BK_LEN} min</li>
          <li><svg viewBox="0 0 16 16"><rect x="1.5" y="4" width="9" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M10.5 7l4-2.2v6.4l-4-2.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>Google Meet</li>
          <li className="bk-tz"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M1.8 8h12.4M8 1.8c2 2.2 2 10.2 0 12.4M8 1.8c-2 2.2-2 10.2 0 12.4" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
            <select value={tz} onChange={(e) => { setTz(e.target.value); setSlot(null); }} aria-label="Time zone">{zones.map((z) => <option key={z} value={z}>{z.replace('_', ' ')}</option>)}</select>
          </li>
        </ul>
        <p className="bk-hours"><span className="pulse" />Mon–Sat · 10:00–19:00 IST</p>
        {slot && step !== 'pick' ? <p className="bk-when"><b>{fmtD(slot, { weekday: 'long', day: 'numeric', month: 'long' })}</b><span>{fmtT(slot)} – {fmtT(slot + BK_LEN * 60e3)}</span></p> : <p className="bk-note">A real call with the designer. We'll talk through the work, the timeline and roughly what it costs.</p>}
      </div>

      {step === 'pick' ? (
        <>
          <div className="bk-cal">
            <div className="bk-mhead">
              <p><b>{monthName}</b> {vy}</p>
              <div>
                <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month">‹</button>
                <button type="button" onClick={() => shift(1)} aria-label="Next month">›</button>
              </div>
            </div>
            <div className="bk-grid" role="grid">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((w) => <span key={w} className="bk-wd">{w}</span>)}
              {cells.concat(spill).map((k, i) => {
                if (!k) return <span key={'e' + i} />;
                const avail = !!slots[k];
                return (
                  <button type="button" key={k} disabled={!avail} className={'bk-day' + (avail ? ' av' : '') + (k === day ? ' on' : '') + (k === today ? ' today' : '')}
                    onClick={() => { setDay(k); setSlot(null); }} aria-pressed={k === day} aria-label={k + (avail ? ', available' : ', unavailable')}>
                    {k === spill[0] ? <small className="bk-mon">{spillMon}</small> : null}{+k.slice(8)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="bk-slots">
            {day ? (
              <>
                <div className="bk-shead">
                  <p><b>{new Date(day + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })}</b> {+day.slice(8)}</p>
                  <div className="bk-fmt" role="group" aria-label="Time format">
                    <button type="button" className={h12 ? 'on' : ''} onClick={() => setH12(true)}>12h</button>
                    <button type="button" className={!h12 ? 'on' : ''} onClick={() => setH12(false)}>24h</button>
                  </div>
                </div>
                <div className="bk-list" data-lenis-prevent>
                  {daySlots.map((t) => (
                    <button type="button" key={t} className="bk-slot" onClick={() => { setSlot(t); setStep('form'); }}><i />{fmtT(t)}</button>
                  ))}
                </div>
              </>
            ) : <p className="bk-empty">Pick a day to see open times.</p>}
          </div>
        </>
      ) : null}

      {step === 'form' ? (
        <form className="bk-form" onSubmit={confirm} noValidate>
          <label>Your name *<input value={f.name} onChange={set('name')} autoComplete="name" aria-invalid={!!err.name} />{err.name ? <em>{err.name}</em> : null}</label>
          <label>Email address *<input type="email" value={f.email} onChange={set('email')} autoComplete="email" aria-invalid={!!err.email} />{err.email ? <em>{err.email}</em> : null}</label>
          <label>What is this meeting about? *<input value={f.about} onChange={set('about')} placeholder="A rebrand, a website, 3D renders…" aria-invalid={!!err.about} />{err.about ? <em>{err.about}</em> : null}</label>
          <label>Budget range *
            <select value={f.budget} onChange={set('budget')} aria-invalid={!!err.budget}><option value="">Select a range</option>{BUDGETS.map((b) => <option key={b}>{b}</option>)}<option>Not sure yet</option></select>
            {err.budget ? <em>{err.budget}</em> : null}
          </label>
          <label>Phone number
            <span className="bk-phone">
              <select value={f.cc} onChange={set('cc')} aria-label="Country code">{BK_CODES.map(([c, p]) => <option key={c} value={c}>{flag(c)} {p}</option>)}</select>
              <input type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel-national" placeholder="98765 43210" />
            </span>
          </label>
          <label>Additional notes<textarea rows="3" value={f.notes} onChange={set('notes')} placeholder="Please share anything that will help prepare for our meeting." /></label>
          {guests ? (
            <div className="bk-guests">
              <span>Add guests</span>
              {guests.map((g, i) => (
                <span className="bk-gin" key={i}>
                  <input type="email" placeholder="Email" value={g} onChange={(e) => { const v = e.target.value; setGuests((gs) => gs.map((x, j) => (j === i ? v : x))); }} />
                  <button type="button" aria-label="Remove guest" onClick={() => setGuests((gs) => (gs.length > 1 ? gs.filter((_, j) => j !== i) : null))}>×</button>
                </span>
              ))}
              <button type="button" className="bk-addg" onClick={() => setGuests((gs) => gs.concat(['']))}>+ Add another</button>
            </div>
          ) : <button type="button" className="bk-addg" onClick={() => setGuests([''])}>+ Add guests</button>}
          <p className="bk-legal">Your request goes to hello@jayastra.com. We confirm every booking by email within one working day. See our <a href={to('/privacy')}>Privacy Policy</a>.</p>
          <div className="bk-actions">
            <button type="button" className="bk-back" onClick={() => setStep('pick')}>Back</button>
            <button type="submit" className="bk-confirm">Confirm</button>
          </div>
        </form>
      ) : null}

      {step === 'done' ? (
        <div className="bk-done" role="status">
          <span className="bk-check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <h3>Request sent, {f.name.trim().split(' ')[0]}.</h3>
          <p>Your email app should have opened with the booking details. Press send there, and we'll confirm the slot and share the meeting link within one working day.</p>
          <dl>
            <div><dt>What</dt><dd>20-minute intro call</dd></div>
            <div><dt>When</dt><dd>{fmtD(slot, { weekday: 'long', day: 'numeric', month: 'long' })}, {fmtT(slot)}</dd></div>
            <div><dt>Time zone</dt><dd>{tz.replace('_', ' ')}</dd></div>
          </dl>
          <div className="bk-actions left">
            <a className="bk-confirm" href={ics()} download="jayastra-call.ics">Add to calendar</a>
            <button type="button" className="bk-back" onClick={() => { setStep('pick'); setSlot(null); }}>Book another time</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
