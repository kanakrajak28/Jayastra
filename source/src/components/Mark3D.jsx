import { useEffect, useRef, useState } from '../lib/react';
import { reducedNow } from '../lib/utils';
import { Reveal } from './shared';
import { SPEAR_PATH } from './Footer';

/* ======================================================================
   Mark3D — the spear from the logo "t", extruded in 3D, drag to spin
   ====================================================================== */
const loadThree = () => {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (window.__loadThree) return window.__loadThree();
  if (window.__threeP) return window.__threeP;
  window.__threeP = new Promise((res, rej) => {
    const sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    sc.async = true; sc.onload = () => res(window.THREE); sc.onerror = rej;
    document.head.appendChild(sc);
  });
  return window.__threeP;
};
export function Mark3D() {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const [state, setState] = useState('idle');
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let cleanup = null, started = false;
    const start = () => {
      if (started) return; started = true; setState('loading');
      loadThree().then((THREE) => { if (!hostRef.current) return; cleanup = initMark(THREE, host, apiRef); setState(cleanup ? 'ready' : 'fail'); }).catch(() => setState('fail'));
    };
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); }, { rootMargin: '600px 0px' }) : null;
    if (io) io.observe(host); else start();
    return () => { if (io) io.disconnect(); if (cleanup) cleanup(); };
  }, []);
  return (
    <section className="m3d" aria-labelledby="m3d-h">
      <div className="m3d-stage" ref={hostRef} />
      {state === 'fail' ? <div className="m3d-fallback" aria-hidden="true"><svg viewBox="4 1 117 251"><path fill="#D24E01" fillRule="evenodd" d={SPEAR_PATH} /></svg></div> : null}
      <div className="wrap m3d-top">
        <Reveal as="p" className="eyebrow light">3D studio</Reveal>
        <Reveal as="h2" className="m3d-h" id="m3d-h" delay={0.06}>The Jayastra mark, in 3D.</Reveal>
      </div>
      <div className="m3d-ui">
        <p className="m3d-hint">Drag to turn it.</p>
      </div>
    </section>
  );
}
function initMark(THREE, host, apiRef) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
  const reduce = reducedNow();
  renderer.setPixelRatio(Math.min(window.innerWidth < 760 ? 1.5 : 2, window.devicePixelRatio || 1));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  // studio environment: soft boxes around a dark room
  const pm = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x111114);
  const box = (w, h, x, y, z, c, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); if (ry) m.rotation.z = ry; envScene.add(m); };
  box(8, 3, 0, 7, 3, 0x9a9a9a); box(3, 9, -8, 1, 2, 0x8a8278); box(3, 9, 8, 0, -1, 0x7c8494); box(10, 2, 0, -6, 4, 0x2a1a12); box(4, 4, 3, 2, -8, 0x8a3a10);
  const env = pm.fromScene(envScene, 0.035).texture;
  scene.environment = env;
  // lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xffffff, 0.62); key.position.set(4, 6, 8); scene.add(key);
  const rim = new THREE.PointLight(0xffffff, 0.9, 30); rim.position.set(-5, 2, -4); scene.add(rim);
  // geometry from the logo path (SVG y-down -> flip)
  const shapes = [];
  SPEAR_PATH.split('Z').map((sp) => sp.trim()).filter(Boolean).forEach((sp) => {
    const pts = sp.replace(/[ML]/g, ' ').trim().split(/\s+/).map(Number);
    const sh = new THREE.Shape();
    for (let i = 0; i < pts.length; i += 2) { const x = pts[i], y = -pts[i + 1]; if (i === 0) sh.moveTo(x, y); else sh.lineTo(x, y); }
    shapes.push(sh);
  });
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 22, bevelEnabled: true, bevelThickness: 3.2, bevelSize: 2.2, bevelSegments: 5, curveSegments: 1 });
  geo.computeBoundingBox();
  const bb = geo.boundingBox, c = new THREE.Vector3(); bb.getCenter(c);
  geo.translate(-c.x, -c.y, -c.z);
  const s = 3.7 / (bb.max.y - bb.min.y);
  geo.scale(s, s, s);
  geo.computeVertexNormals();
  const logo = new THREE.Color('#D24E01').convertSRGBToLinear();
  const mats = [new THREE.MeshPhysicalMaterial({ color: logo, emissive: logo, emissiveIntensity: 0.42, metalness: 0, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.12, envMapIntensity: 0.35 })];
  const mesh = new THREE.Mesh(geo, mats[0]);
  const group = new THREE.Group(); group.add(mesh); scene.add(group);
  // soft floor shadow
  const sc = document.createElement('canvas'); sc.width = sc.height = 128;
  const sx = sc.getContext('2d'); const sg = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
  sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -2.75; scene.add(shadow);
  // interaction
  let rx = 0.12, ry = -0.5, vx = 0, vy = 0, drag = null, hover = [0, 0], lastT = performance.now();
  const el = renderer.domElement;
  el.style.touchAction = 'pan-y';
  const down = (e) => { drag = { x: e.clientX, y: e.clientY }; vx = vy = 0; try { el.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } host.classList.add('grab'); };
  const move = (e) => {
    const r = el.getBoundingClientRect();
    hover = [((e.clientX - r.left) / r.width - 0.5), ((e.clientY - r.top) / r.height - 0.5)];
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
    ry += dx * 0.01; rx += dy * 0.006; rx = Math.max(-0.7, Math.min(0.7, rx));
    vy = dx * 0.01; vx = dy * 0.006;
  };
  const up = () => { drag = null; host.classList.remove('grab'); };
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  const size = () => {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w / h < 0.8 ? 15 : 11;
    camera.updateProjectionMatrix();
  };
  size();
  const ro = 'ResizeObserver' in window ? new ResizeObserver(size) : null; if (ro) ro.observe(host);
  let visible = true, raf = 0; const t0 = performance.now();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }) : null; if (io) io.observe(host);
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    const t = (now - t0) / 1000;
    if (!drag) {
      ry += vy; rx += vx; vy *= 0.94; vx *= 0.9;
      if (!reduce && Math.abs(vy) < 0.002) ry += dt * 0.35;
      rx += (0.12 - rx) * dt * 0.8;
    }
    group.rotation.set(rx + hover[1] * 0.12, ry + hover[0] * 0.2, 0);
    group.position.y = -0.55 + (reduce ? 0 : Math.sin(t * 1.1) * 0.12);
    const lift = group.position.y + 0.55;
    shadow.scale.setScalar(1 - lift * 0.25);
    shadow.material.opacity = 0.9 - lift * 0.6;
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect();
    el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    apiRef.current = null; renderer.dispose(); pm.dispose(); if (el.parentNode) el.parentNode.removeChild(el);
  };
}
