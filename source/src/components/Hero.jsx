import { useEffect, useRef, useState } from '../lib/react';
import { EASE, clamp, reducedNow } from '../lib/utils';
import { motion, useScroll, useTransform } from '../lib/motion';
import { Arrow, MagLink } from './shared';

/* ======================================================================
   Hero — ember light shader (WebGL) behind the headline
   ====================================================================== */
const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = [
  'precision highp float;',
  'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;',
  'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
  'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
  ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
  'float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}',
  'void main(){',
  ' vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;',
  ' vec2 p=vec2((uv.x-.5)*asp,uv.y-.5);float t=uTime;',
  ' vec2 src=vec2((.22+(uMouse.x-.5)*.35)*asp,.78+(uMouse.y-.5)*.08);',
  ' vec2 d=p-src;float ang=atan(d.x,-d.y);float dist=length(d);',
  ' float shafts=fbm(vec2(ang*7.+3.,t*.09));',
  ' shafts=smoothstep(.38,.9,shafts)*.9+.1*fbm(vec2(ang*22.,t*.2));',
  ' float cone=smoothstep(1.25,.05,abs(ang+.18));',
  ' float fall=exp(-dist*1.05);',
  ' float beam=shafts*cone*fall;',
  ' vec2 cp=p*2.8+vec2(t*.035,-t*.05);',
  ' cp+=vec2(fbm(p*1.5+t*.04),fbm(p*1.5-t*.03))*.8;',
  ' float rid=1.-abs(fbm(cp)*2.-1.);',
  ' float shim=pow(rid,16.)*(.25+.75*cone)*fall;',
  ' float w=fbm(p*1.4+vec2(t*.02,-t*.015)+fbm(p*2.1-t*.02)*1.3);',
  ' vec3 base=vec3(.030,.029,.036);vec3 deep=vec3(.17,.052,.018);',
  ' vec3 ember=vec3(.86,.31,.02);vec3 hi=vec3(1.,.76,.52);',
  ' vec3 col=base;',
  ' col=mix(col,deep,smoothstep(.32,.86,w)*(.35+.65*fall));',
  ' col+=ember*beam*.95;',
  ' col+=hi*pow(beam,2.6)*.7;',
  ' col+=mix(ember,hi,.4)*shim*.42;',
  ' float vig=smoothstep(1.5,.25,length(p*vec2(.75,1.)));',
  ' col*=.45+.55*vig;',
  ' col+=(hash(gl_FragCoord.xy+fract(t)*91.7)-.5)*.028;',
  ' gl_FragColor=vec4(max(col,0.),1.);',
  '}',
].join('\n');

function HeroLight() {
  const ref = useRef(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    let gl = null;
    try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false }); } catch (e) { gl = null; }
    if (!gl) { setFallback(true); return undefined; }
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setFallback(true); return undefined; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFallback(true); return undefined; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');
    const reduce = reducedNow();
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let raf = 0, visible = true;
    const start = performance.now();
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * (r.width < 760 ? 0.6 : 0.75);
      canvas.width = Math.max(2, Math.round(r.width * scale));
      canvas.height = Math.max(2, Math.round(r.height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (reduce) draw(performance.now());
    };
    const draw = (now) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduce ? 14 : (now - start) / 1000 + 6);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now) => { raf = requestAnimationFrame(loop); if (visible) draw(now); };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = clamp((e.clientX - r.left) / r.width, 0, 1);
      mouse.ty = clamp(1 - (e.clientY - r.top) / r.height, 0, 1);
    };
    const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(canvas); else window.addEventListener('resize', resize);
    resize();
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }) : null;
    if (io) io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    if (reduce) draw(performance.now()); else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
      if (io) io.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, []);
  return fallback ? <div className="hero-fallback" aria-hidden="true" /> : <canvas ref={ref} className="hero-gl" aria-hidden="true" />;
}

export function Hero({ ready }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const lines = [<>Design that earns</>, <>attention, in</>, <>2D and <em>3D</em>.</>];
  const show = (d) => ({ initial: { opacity: 0, y: 16 }, animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }, transition: { duration: 0.9, ease: EASE, delay: d } });
  return (
    <section id="top" className="hero on-dark" ref={ref}>
      <HeroLight />
      <div className="hero-veil" />
      <motion.div className="wrap hero-inner" style={{ y: yText, opacity: fade }}>
        <div className="hero-top">
          <motion.p className="eyebrow light" {...show(0.1)}>Independent design studio, Jabalpur</motion.p>
          <motion.p className="hero-slot" {...show(0.18)}><span className="pulse" />Now taking on new projects</motion.p>
        </div>
        <h1 className="hero-h1">
          {lines.map((l, k) => (
            <span className="line" key={k}>
              <motion.span initial={{ y: '112%' }} animate={ready ? { y: '0%' } : { y: '112%' }} transition={{ duration: 1.1, ease: EASE, delay: 0.08 + k * 0.09 }}>{l}</motion.span>
            </span>
          ))}
        </h1>
        <div className="hero-foot">
          <motion.p className="hero-lede" {...show(0.5)}>
            Jayastra is an independent studio for brand identity, digital product and 3D visuals. Five years of craft, one accountable team, and no hand-offs between agencies.
          </motion.p>
          <motion.div className="hero-ctas" {...show(0.62)}>
            <MagLink href="#contact" className="btn btn-brand btn-lg">Start a project <Arrow /></MagLink>
            <a href="#work" className="hero-link">See the work <Arrow /></a>
          </motion.div>
        </div>
      </motion.div>
      <motion.div className="hero-base" {...show(0.8)}>
        <div className="wrap">
          <span className="hero-disc"><span>Brand identity</span><span>Product &amp; web</span><span>3D &amp; motion</span></span>
          <span className="scrollcue">Scroll<i /></span>
        </div>
      </motion.div>
    </section>
  );
}
