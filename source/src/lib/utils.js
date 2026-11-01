export const TAU = Math.PI * 2;
/* Logos are embedded in the page so they always load; the files are a fallback. */
export const LOGO_LIGHT = (typeof window !== 'undefined' && window.__LOGO_LIGHT) || 'logo.png';
export const LOGO_DARK = (typeof window !== 'undefined' && window.__LOGO_DARK) || 'logo-dark.png';
const ASSET = (typeof window !== 'undefined' && window.__ASSET_BASE) || '';
export const ROUTING = (typeof window !== 'undefined' && window.__ROUTING) || 'hash';
export const to = (p) => (ROUTING === 'path' ? p : '#' + p);
/* Extra photos served by Unsplash's image CDN on the live site; each falls back to a local photo if blocked. */
const REMOTE = { re1: '1738168246881-40f35f8aba0a', re2: '1675754965318-5d31291657d4', re3: '1580587771525-78b9dba3b914', re4: '1616594039964-ae9021a400a0', re5: '1479839672679-a46483c0e7c8',
  mf1: '1717386255773-1e3037c81788', mf2: '1647427060118-4911c9821b82', mf3: '1578776349090-de61da00ff1a', mf4: '1606337321936-02d1b1a4d5ef', mf5: '1631270314738-e6f6827f8d9f',
  jw1: '1622398925373-3f91b1e275f5', jw2: '1611107683227-e9060eccd846', jw3: '1640292343595-889db1c8262e', jw4: '1573612664822-d7d347da7b80', jw5: '1557777586-f6682739fcf3',
  tr1: '1671683886944-6478e6c84cbc', tr2: '1577971132997-c10be9372519', tr3: '1537616930345-1d330ad3e0a9', tr4: '1618773928121-c32242e63f39',
  ev1: '1516617442634-75371039cb3a', ev2: '1540575467063-178a50c2df87', ev3: '1712903276879-9de15f1b9e81', ev4: '1610173827043-9db50e0d8ef9',
  fd1: '1608198093002-ad4e005484ec', fd2: '1524350876685-274059332603', hc1: '1704455306251-b4634215d98f', hc2: '1514733670139-4d87a1941d55',
  ed1: '1571260899304-425eee4c7efc', ed2: '1501504905252-473c47e087f8', st1: '1531403009284-440f080d1e12', gm1: '1612287230202-1ff1d85d1bdf', gm2: '1657208431551-cbf415b8ef26', br1: '1602678460152-719a9af1fb6c' };
const REMOTE_FB = { re: 's_realestate', mf: 's_industrial', jw: 's_jewellery', tr: 's_tourism', ev: 's_events', fd: 's_food', hc: 's_health', ed: 's_edu', st: 's_startup', gm: 's_gaming', br: 'brand' };
/* Higher-resolution originals of local photos, for full-width heroes. */
const HI = { s_realestate: '1602872029708-84d970d3382b', s_industrial: '1735494033576-9c882e80504c', s_jewellery: '1722410180687-b05b50922362', s_food: '1747160262337-68a64efb183c', s_health: '1666887360388-93e684b6474a',
  s_edu: '1638957835514-224c57ffe617', s_startup: '1521737711867-e3b97375f902', s_tourism: '1647250945832-5b5aa0f6366e', s_gaming: '1608403890614-ec62cb35b46e', s_events: '1769812343353-ae6ca1250bc2',
  i0a: '1617825295690-28ae56c56135', i1b: '1460925895917-afdab827c52f', i2b: '1760386128692-81476422e599', i3a: '1567880905822-56f8e06fe630' };
export const FB_BY_ID = {};
Object.keys(REMOTE).forEach((k) => { FB_BY_ID[REMOTE[k]] = REMOTE_FB[k.replace(/\d+$/, '')]; });
Object.keys(HI).forEach((k) => { FB_BY_ID[HI[k]] = k; });
const unsplash = (id, w, h) => 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + w + '&h=' + h + '&q=70';
export const localImg = (k) => ASSET + 'img/' + k + '.webp';
export const img = (k) => (REMOTE[k] ? unsplash(REMOTE[k], 900, 675) : localImg(k));
export const imgHi = (k) => (ROUTING === 'path' && HI[k] ? unsplash(HI[k], 1920, 1200) : (REMOTE[k] ? unsplash(REMOTE[k], 1600, 1000) : localImg(k)));
export const EASE = [0.2, 0.75, 0.15, 1];
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mq = (q) => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(q).matches;
export const isFine = () => mq('(hover: hover) and (pointer: fine)');
export const reducedNow = () => mq('(prefers-reduced-motion: reduce)');
