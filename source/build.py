"""Build the Jayastra site.

site/index.html      -> single-page preview (hash routes, images as files next to it)
../Jayastra/         -> production site for Vercel: one pre-rendered HTML file per URL
                        (titles, descriptions, Open Graph, JSON-LD), shared /app.js,
                        /img, sitemap.xml, robots.txt, 404.html, favicon, share image.
"""
import subprocess, sys, pathlib, base64, json, re, shutil, hashlib, html as H
from datetime import date

root = pathlib.Path(__file__).parent
src, out, dep = root / 'src', root / 'site', root.parent / 'Jayastra'  # Vercel serves the Jayastra folder
DOMAIN = 'https://www.jayastra.com'
esb = shutil.which('esbuild') or '/opt/npm-tools/node_modules/esbuild/bin/esbuild'
if not pathlib.Path(esb).exists():
    esb = None
r = subprocess.run(([esb] if esb else ['npx', '--yes', 'esbuild@0.24.0']) + [ str(src / 'main.jsx'), '--bundle', '--loader:.jsx=jsx', '--jsx=transform',
                    '--jsx-factory=React.createElement', '--jsx-fragment=React.Fragment',
                    '--format=iife', '--target=es2018', '--charset=utf8', '--minify'],
                   capture_output=True, text=True, encoding='utf-8', shell=(sys.platform == 'win32'))
if r.returncode != 0:
    print(r.stderr); sys.exit(1)
js = r.stdout.replace('</script', '<\\/script')
shell = (src / 'shell.html').read_text(encoding='utf-8')
assert '/*__APP__*/' in shell and '/*__LOGOS__*/' in shell
enc = lambda f: 'data:image/png;base64,' + base64.b64encode((out / f).read_bytes()).decode()

# ---------- 1. preview (hash routing, inline logos, images as files) ----------
preview = shell.replace('/*__APP__*/', js).replace('/*__LOGOS__*/', 'window.__LOGO_LIGHT="' + enc('logo.png') + '";window.__LOGO_DARK="' + enc('logo-dark.png') + '";')
(out / 'index.html').write_text(preview, encoding='utf-8')
(src / 'app.compiled.js').write_text(js, encoding='utf-8')

# ---------- 2. route data parsed from the app source (all modules under src/) ----------
app = '\n'.join(p.read_text(encoding='utf-8') for p in sorted(src.rglob('*.js*')) if p.name != 'app.compiled.js')
slugs = re.search(r"const SECTOR_SLUGS = \[([^\]]*)\]", app).group(1)
slugs = re.findall(r"'([\w-]+)'", slugs)
inds = re.findall(r"\{ name: '((?:[^'\\]|\\.)*)', photo: '([\w-]+)', text: '((?:[^'\\]|\\.)*)'", app)
assert len(inds) == len(slugs) == 14, (len(inds), len(slugs))
sectors = {s: {'name': n, 'photo': p, 'text': t} for s, (n, p, t) in zip(slugs, inds)}
cases = re.findall(r"\['([\w-]+)', '((?:[^'\\]|\\.)*)', '([\w-]+)', '((?:[^'\\]|\\.)*)', '(\d{4})', '((?:[^'\\]|\\.)*)', '(?:[^'\\]|\\.)*', '(?:[^'\\]|\\.)*', '(?:[^'\\]|\\.)*', \['([\w-]+)'", app)
assert len(cases) == 28, len(cases)
remote = dict(re.findall(r"(\w+): '(\d{10,13}-[0-9a-f]{12})'", app[app.index('const REMOTE = {'):app.index('const REMOTE_FB')]))
hi = dict(re.findall(r"(\w+): '(\d{10,13}-[0-9a-f]{12})'", app[app.index('const HI = {'):app.index('const FB_BY_ID')]))

def share_img(k):
    if k in remote: return 'https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=1200&h=630&q=70' % remote[k]
    if k in hi: return 'https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=1200&h=630&q=70' % hi[k]
    return DOMAIN + '/og.png'

SITE_DESC = re.search(r"const SITE_DESC = '([^']*)'", app).group(1)
routes = [('/', 'Jayastra | Brand, digital & 3D design studio in Jabalpur, India', SITE_DESC, DOMAIN + '/og.png', '1.0')]
routes.append(('/work', 'Case studies | Jayastra', 'Concept projects across 14 sectors, from brand identity and packaging to product UI and 3D renders.', DOMAIN + '/og.png', '0.8'))
for s, d in sectors.items():
    routes.append(('/industries/' + s, d['name'] + ' design & 3D | Jayastra', d['text'], share_img(d['photo']), '0.8'))
for slug, name, sec, services, year, summary, im0 in cases:
    routes.append(('/work/' + slug, name + ' · ' + services + ' | Jayastra', summary, share_img(im0), '0.6'))
routes.append(('/privacy', 'Privacy Policy | Jayastra', 'How Jayastra collects, uses and protects your personal information.', DOMAIN + '/og.png', '0.3'))
routes.append(('/terms', 'Terms of Use | Jayastra', 'The terms for using jayastra.com and working with Jayastra.', DOMAIN + '/og.png', '0.3'))

LD = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', 'name': 'Jayastra', 'url': DOMAIN + '/',
    'logo': DOMAIN + '/logo-dark.png', 'image': DOMAIN + '/og.png', 'email': 'hello@jayastra.com', 'description': SITE_DESC,
    'address': {'@type': 'PostalAddress', 'addressLocality': 'Jabalpur', 'addressRegion': 'Madhya Pradesh', 'addressCountry': 'IN'},
    'areaServed': 'Worldwide', 'priceRange': '₹₹',
    'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], 'opens': '10:00', 'closes': '19:00'}],
    'knowsAbout': ['Brand identity', 'UI/UX design', 'Website design', 'Packaging design', '3D product rendering', '3D animation'],
}

# ---------- 3. production pages ----------
if dep.exists(): shutil.rmtree(dep)
dep.mkdir()
(dep / 'app.js').write_text(js.replace('<\\/script', '</script'), encoding='utf-8')
shutil.copytree(out / 'img', dep / 'img')
for f in ['logo.png', 'logo-dark.png']: shutil.copy(out / f, dep / f)

css_end = shell.index('</style>') + len('</style>')
head_src, body_src = shell[:css_end], shell[css_end:]
head_src = re.sub(r'<meta charset="utf-8">\n', '', head_src, count=1)
head_src = re.sub(r'<title>.*?</title>\n', '', head_src, count=1)
head_src = re.sub(r'<meta name="description"[^>]*>\n', '', head_src, count=1)
body_prod = body_src.replace('<script>/*__LOGOS__*/</script>', '<script>window.__ROUTING="path";window.__ASSET_BASE="/";window.__LOGO_LIGHT="/logo.png";window.__LOGO_DARK="/logo-dark.png";</script>')
# versioned URL so browsers fetch the new app.js right after each deploy instead of a cached copy
APP_URL = '/app.js?v=' + hashlib.sha1(js.encode('utf-8')).hexdigest()[:10]
body_prod = re.sub(r'<script>\s*/\*__APP__\*/\s*</script>', '<script src="%s"></script>' % APP_URL, body_prod)
assert '/*__APP__*/' not in body_prod and '/*__LOGOS__*/' not in body_prod

def page(path, title, desc, image, ld=False, robots='index, follow'):
    url = DOMAIN + ('' if path == '/' else path)
    e = lambda x: H.escape(x, quote=True)
    meta = [
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        '<title>%s</title>' % e(title),
        '<meta name="description" content="%s">' % e(desc),
        '<meta name="robots" content="%s">' % robots,
        '<link rel="canonical" href="%s">' % url,
        '<meta name="theme-color" content="#0E0E10">',
        '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">',
        '<link rel="icon" type="image/png" sizes="512x512" href="/favicon.png">',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Jayastra">',
        '<meta property="og:title" content="%s">' % e(title),
        '<meta property="og:description" content="%s">' % e(desc),
        '<meta property="og:url" content="%s">' % url,
        '<meta property="og:image" content="%s">' % e(image),
        '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="%s">' % e(title),
        '<meta name="twitter:description" content="%s">' % e(desc),
        '<meta name="twitter:image" content="%s">' % e(image),
        '<link rel="preload" href="%s" as="script">' % APP_URL,
    ]
    if ld: meta.append('<script type="application/ld+json">%s</script>' % json.dumps(LD, ensure_ascii=False))
    return '<!doctype html>\n<html lang="en-IN">\n<head>\n' + '\n'.join(meta) + '\n' + head_src + '\n</head>\n<body>\n' + body_prod + '\n</body>\n</html>\n'

for path, title, desc, image, _ in routes:
    target = dep / 'index.html' if path == '/' else dep / path.strip('/') / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(page(path, title, desc, image, ld=(path == '/')), encoding='utf-8')
(dep / '404.html').write_text(page('/404', 'Page not found | Jayastra', SITE_DESC, DOMAIN + '/og.png', robots='noindex'), encoding='utf-8')

today = date.today().isoformat()
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for path, _, _, _, pri in routes:
    sm.append('  <url><loc>%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>' % (DOMAIN + ('/' if path == '/' else path), today, pri))
sm.append('</urlset>')
(dep / 'sitemap.xml').write_text('\n'.join(sm) + '\n', encoding='utf-8')
(dep / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' % DOMAIN, encoding='utf-8')
(dep / 'vercel.json').write_text(json.dumps({
    'cleanUrls': True, 'trailingSlash': False,
    'headers': [
        {'source': '/img/(.*)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=31536000, immutable'}]},
        {'source': '/(logo.png|logo-dark.png|favicon.png|favicon-32.png|apple-touch-icon.png|og.png)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=604800'}]},
        {'source': '/app.js', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=3600, must-revalidate'}]},
    ],
}, indent=2), encoding='utf-8')
for f in ['favicon.png', 'favicon-32.png', 'apple-touch-icon.png', 'og.png']:
    if (root / 'brand' / f).exists(): shutil.copy(root / 'brand' / f, dep / f)

kb = lambda p: p.stat().st_size // 1024
print('built preview', kb(out / 'index.html'), 'KB | deploy pages', len(routes), '+404 | home', kb(dep / 'index.html'), 'KB | app.js', kb(dep / 'app.js'), 'KB')
