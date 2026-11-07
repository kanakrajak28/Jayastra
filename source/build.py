"""Build the Jayastra site.

site/index.html      -> single-page preview (hash routes, images as files next to it)
../Jayastra/         -> production site for Vercel: one pre-rendered HTML file per URL
                        (titles, descriptions, Open Graph, JSON-LD), shared /app.js,
                        /img, sitemap.xml, robots.txt, 404.html, favicon, share image.
"""
import subprocess, sys, pathlib, base64, json, re, shutil, hashlib, urllib.request, html as H
from html.parser import HTMLParser
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
# shell.html keeps its CSS readable; the built pages get it minified
a, b = shell.index('<style>') + len('<style>'), shell.index('</style>')
r = subprocess.run(([esb] if esb else ['npx', '--yes', 'esbuild@0.24.0']) + ['--loader=css', '--minify'],
                   input=shell[a:b], capture_output=True, text=True, encoding='utf-8', shell=(sys.platform == 'win32'))
if r.returncode != 0:
    print(r.stderr); sys.exit(1)
shell = shell[:a] + '\n' + r.stdout.strip() + '\n' + shell[b:]
# logos are shown at most a few hundred pixels wide, so the page uses 640px copies (the full-size files stay for share images and JSON-LD)
from PIL import Image
for f in ['logo.png', 'logo-dark.png']:
    im = Image.open(out / f).convert('RGBA')
    sm = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
    sm.quantize(128, method=Image.FASTOCTREE).save(out / f.replace('.png', '-sm.png'), optimize=True)
enc = lambda f: 'data:image/png;base64,' + base64.b64encode((out / f).read_bytes()).decode()

# ---------- 1. preview (hash routing, inline logos, images as files) ----------
# the libraries are deferred, so the inline app waits for them
preview = shell.replace('/*__APP__*/', "document.addEventListener('DOMContentLoaded',function(){" + js + '});').replace('/*__LOGOS__*/', 'window.__LOGO_LIGHT="' + enc('logo-sm.png') + '";window.__LOGO_DARK="' + enc('logo-dark-sm.png') + '";')
(out / 'index.html').write_text(preview, encoding='utf-8')
(src / 'app.compiled.js').write_text(js, encoding='utf-8')

# ---------- 2. route data parsed from the app source (all modules under src/) ----------
app = '\n'.join(p.read_text(encoding='utf-8') for p in sorted(src.rglob('*.js*')) if p.name != 'app.compiled.js')
# the patterns allow any line breaks and either quote style, so the sources can be run through Prettier
STR = r"""('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")"""  # a JS string literal, quotes included
SKIP = r"""(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")"""  # the same, not captured
lit = lambda s: re.sub(r'\\(.)', r'\1', s[1:-1])
slugs = re.search(r"const SECTOR_SLUGS = \[([^\]]*)\]", app).group(1)
slugs = re.findall(r"'([\w-]+)'", slugs)
inds = [(lit(n), p, lit(t)) for n, p, t in re.findall(r"\{\s*name:\s*" + STR + r",\s*photo:\s*'([\w-]+)',\s*text:\s*" + STR, app)]
assert len(inds) == len(slugs) == 14, (len(inds), len(slugs))
sectors = {s: {'name': n, 'photo': p, 'text': t} for s, (n, p, t) in zip(slugs, inds)}
cases = re.findall(r"\[\s*'([\w-]+)',\s*" + STR + r",\s*'([\w-]+)',\s*" + STR + r",\s*'(\d{4})',\s*" + STR + r",\s*" + SKIP + r",\s*" + SKIP + r",\s*" + SKIP + r",\s*\[\s*'([\w-]+)'", app)
cases = [(slug, lit(name), sec, lit(services), year, lit(summary), im0) for slug, name, sec, services, year, summary, im0 in cases]
assert len(cases) == 28, len(cases)
svc_slugs = re.findall(r"'([\w-]+)'", re.search(r"const SERVICE_SLUGS = \[([^\]]*)\]", app).group(1))
disc = app[app.index('export const DISCIPLINES'):app.index('export const DISC_INFO')]
info = app[app.index('export const DISC_INFO'):app.index('export const SERVICE_SLUGS')]
svc_names = [lit(n) for n in re.findall(r"name:\s*" + STR, disc)]
svc_texts = [lit(t) for t in re.findall(r"text:\s*" + STR, info)]
svc_photos = re.findall(r"photo:\s*'([\w-]+)'", info)
assert len(svc_slugs) == len(svc_names) == len(svc_texts) == len(svc_photos) == 6, (svc_slugs, svc_names)
remote = dict(re.findall(r"(\w+): '(\d{10,13}-[0-9a-f]{12})'", app[app.index('const REMOTE = {'):app.index('const REMOTE_FB')]))
hi = dict(re.findall(r"(\w+): '(\d{10,13}-[0-9a-f]{12})'", app[app.index('const HI = {'):app.index('const FB_BY_ID')]))

def share_img(k):
    if k in remote: return 'https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=1200&h=630&q=70' % remote[k]
    if k in hi: return 'https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=1200&h=630&q=70' % hi[k]
    return DOMAIN + '/og.png'

SITE_DESC = lit(re.search(r"const SITE_DESC =\s*" + STR, app).group(1))
routes = [('/', 'Jayastra | Brand, digital & 3D design studio in Jabalpur, India', SITE_DESC, DOMAIN + '/og.png', '1.0')]
routes.append(('/work', 'Case studies | Jayastra', 'Concept projects across 14 sectors, from brand identity and packaging to product UI and 3D renders.', DOMAIN + '/og.png', '0.8'))
for s, d in sectors.items():
    routes.append(('/industries/' + s, d['name'] + ' design & 3D | Jayastra', d['text'], share_img(d['photo']), '0.8'))
for slug, name, text, photo in zip(svc_slugs, svc_names, svc_texts, svc_photos):
    routes.append(('/services/' + slug, name + ' services | Jayastra', text, share_img(photo), '0.8'))
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

# ---------- 2b. readable text in every page, structured data, llms.txt ----------
# Search engines and AI crawlers that don't run JavaScript would otherwise see an empty page. Each route is
# rendered once with React in Node (prerender.js), reduced to its text (headings, paragraphs, lists, links)
# and put inside #root; the app replaces it when it loads.
cache = root / '.cache'
cache.mkdir(exist_ok=True)
VENDOR = {
    'react.production.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js',
    'react-dom-server-legacy.browser.production.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom-server-legacy.browser.production.min.js',
    'framer-motion.js': 'https://cdn.jsdelivr.net/npm/framer-motion@12.7.3/dist/framer-motion.js',
}
for name, url in VENDOR.items():
    if not (cache / name).exists(): urllib.request.urlretrieve(url, cache / name)
r = subprocess.run(([esb] if esb else ['npx', '--yes', 'esbuild@0.24.0']) + [str(root / 'ssr-entry.jsx'), '--bundle', '--loader:.jsx=jsx', '--jsx=transform',
                    '--jsx-factory=React.createElement', '--jsx-fragment=React.Fragment', '--format=iife', '--target=es2018',
                    '--charset=utf8', '--log-level=error', '--outfile=' + str(cache / 'ssr.js')],
                   capture_output=True, text=True, encoding='utf-8', shell=(sys.platform == 'win32'))
if r.returncode != 0:
    print(r.stderr); sys.exit(1)
(cache / 'routes.json').write_text(json.dumps([p for p, *_ in routes] + ['/404']), encoding='utf-8')
r = subprocess.run(['node', str(root / 'prerender.js'), str(cache), str(cache / 'ssr.js'), str(cache / 'routes.json'), str(cache / 'pre.json')],
                   capture_output=True, text=True, encoding='utf-8')
if r.returncode != 0:
    print(r.stderr); sys.exit(1)
pre = json.loads((cache / 'pre.json').read_text(encoding='utf-8'))
data = pre['data']

KEEP = {'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'a', 'strong', 'em', 'blockquote',
        'section', 'article', 'main', 'nav', 'footer', 'header'}
DROP = {'svg', 'canvas', 'script', 'style', 'noscript', 'video', 'iframe', 'form', 'select', 'textarea', 'template'}
VOID = {'img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'wbr'}
FAQ_HTML = ''.join('<h3>%s</h3><p>%s</p>' % (H.escape(q), H.escape(a)) for q, a in data['FAQS'])

class Text(HTMLParser):
    """Reduces rendered HTML to readable markup: keeps headings, paragraphs, lists and links, drops
    decoration (images, icons, canvases, aria-hidden parts, the intro screen) and every attribute but href."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.stack, self.skip = [], [], 0
    def handle_starttag(self, tag, attrs):
        if tag in VOID: return
        a = dict(attrs)
        cls = a.get('class') or ''
        drop = self.skip or tag in DROP or a.get('aria-hidden') == 'true' or 'loader' in cls.split() or 'later' in cls.split()
        if not drop and 'faq-list' in cls.split():
            self.out.append(FAQ_HTML)  # all answers, not just the one the accordion shows open
            drop = True
        self.stack.append((tag, drop))
        if drop: self.skip += 1; return
        b = 'strong' if tag == 'b' else tag
        if b in KEEP:
            self.out.append('<a href="%s">' % H.escape(a['href'], quote=True) if b == 'a' and a.get('href') else '<%s>' % b)
    def handle_endtag(self, tag):
        if tag in VOID or not self.stack: return
        t, drop = self.stack.pop()
        while t != tag and self.stack: t, drop = self.stack.pop()
        if drop: self.skip -= 1; return
        b = 'strong' if t == 'b' else t
        self.out.append('</%s>' % b if b in KEEP else ' ')
    def handle_data(self, d):
        if not self.skip: self.out.append(H.escape(d, quote=False))
def readable(html_src):
    t = Text(); t.feed(html_src); s = ''.join(t.out)
    s = re.sub(r'\s+', ' ', s)
    for _ in range(3): s = re.sub(r'<(h[1-4]|p|li|ul|ol|dl|dt|dd|strong|em|a|section|article|nav|header|footer|blockquote)>\s*</\1>', '', s)
    s = re.sub(r'\s*(</?(?:h[1-4]|p|li|ul|ol|dl|dt|dd|section|article|main|nav|header|footer|blockquote)>)\s*', r'\1', s)
    return '<div class="pre">' + s.strip() + '</div>'

# structured data (schema.org JSON-LD)
ORG_ID = DOMAIN + '/#studio'
ORG_REF = {'@type': 'ProfessionalService', '@id': ORG_ID, 'name': 'Jayastra', 'url': DOMAIN + '/'}
CAL_URL = 'https://cal.com/jayastra/30min'
svc_url = lambda slug: DOMAIN + '/services/' + slug
LD.update({'@id': ORG_ID, 'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': 'Design services', 'itemListElement': [
    {'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': d['name'], 'description': i['text'], 'url': svc_url(s)}}
    for s, d, i in zip(data['SERVICE_SLUGS'], data['DISCIPLINES'], data['DISC_INFO'])]}})
SITE_LD = {'@context': 'https://schema.org', '@type': 'WebSite', 'name': 'Jayastra', 'url': DOMAIN + '/', 'publisher': {'@id': ORG_ID}}
FAQ_LD = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
    {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in data['FAQS']]}
def crumbs(*items):
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': k + 1, 'name': n, 'item': u} for k, (n, u) in enumerate(items)]}
HOME, WORK = ('Home', DOMAIN + '/'), ('Case studies', DOMAIN + '/work')
lds = {'/': [LD, SITE_LD, FAQ_LD], '/work': [crumbs(HOME, WORK)]}
for s, d, i in zip(data['SERVICE_SLUGS'], data['DISCIPLINES'], data['DISC_INFO']):
    lds['/services/' + s] = [{'@context': 'https://schema.org', '@type': 'Service', 'name': d['name'], 'serviceType': d['name'],
        'description': i['text'], 'url': svc_url(s), 'provider': ORG_REF, 'areaServed': 'Worldwide',
        'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': d['name'], 'itemListElement': [
            {'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': t, 'description': x}} for t, x in d['items']]}},
        crumbs(HOME, ('Services', DOMAIN + '/#services'), (d['name'], svc_url(s)))]
for s, ind in zip(data['SECTOR_SLUGS'], data['INDUSTRIES']):
    lds['/industries/' + s] = [crumbs(HOME, WORK, (ind['name'], DOMAIN + '/industries/' + s))]
sector_name = dict(zip(data['SECTOR_SLUGS'], (i['name'] for i in data['INDUSTRIES'])))
for c in data['CASES']:
    u = DOMAIN + '/work/' + c['slug']
    lds['/work/' + c['slug']] = [{'@context': 'https://schema.org', '@type': 'CreativeWork', 'name': c['name'], 'url': u,
        'description': c['summary'], 'genre': c['services'], 'about': sector_name.get(c['sector']), 'dateCreated': c['year'],
        'creativeWorkStatus': 'Concept project', 'creator': ORG_REF}, crumbs(HOME, WORK, (c['name'], u))]
for p, n in [('/privacy', 'Privacy Policy'), ('/terms', 'Terms of Use')]:
    lds[p] = [crumbs(HOME, (n, DOMAIN + p))]

# ---------- 3. production pages ----------
if dep.exists(): shutil.rmtree(dep)
dep.mkdir()
(dep / 'app.js').write_text(js.replace('<\\/script', '</script'), encoding='utf-8')
shutil.copytree(out / 'img', dep / 'img')
for f in ['logo.png', 'logo-dark.png', 'logo-sm.png', 'logo-dark-sm.png']: shutil.copy(out / f, dep / f)

css_end = shell.index('</style>') + len('</style>')
head_src, body_src = shell[:css_end], shell[css_end:]
head_src = re.sub(r'<meta charset="utf-8">\n', '', head_src, count=1)
head_src = re.sub(r'<title>.*?</title>\n', '', head_src, count=1)
head_src = re.sub(r'<meta name="description"[^>]*>\n', '', head_src, count=1)
body_prod = body_src.replace('<script>/*__LOGOS__*/</script>', '<script>window.__ROUTING="path";window.__ASSET_BASE="/";window.__LOGO_LIGHT="/logo-sm.png";window.__LOGO_DARK="/logo-dark-sm.png";</script>')
# versioned URL so browsers fetch the new app.js right after each deploy instead of a cached copy
APP_URL = '/app.js?v=' + hashlib.sha1(js.encode('utf-8')).hexdigest()[:10]
body_prod = re.sub(r'<script>\s*/\*__APP__\*/\s*</script>', '<script defer src="%s"></script>' % APP_URL, body_prod)
assert '/*__APP__*/' not in body_prod and '/*__LOGOS__*/' not in body_prod

def page(path, title, desc, image, robots='index, follow'):
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
    for ld in lds.get(path, []):
        meta.append('<script type="application/ld+json">%s</script>' % json.dumps(ld, ensure_ascii=False).replace('</', '<\\/'))
    body = body_prod.replace('<div id="root"></div>', '<div id="root">%s</div>' % readable(pre['pages'][path]), 1)
    return '<!doctype html>\n<html lang="en-IN">\n<head>\n' + '\n'.join(meta) + '\n' + head_src + '\n</head>\n<body>\n' + body + '\n</body>\n</html>\n'

for path, title, desc, image, _ in routes:
    target = dep / 'index.html' if path == '/' else dep / path.strip('/') / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(page(path, title, desc, image), encoding='utf-8')
(dep / '404.html').write_text(page('/404', 'Page not found | Jayastra', SITE_DESC, DOMAIN + '/og.png', robots='noindex'), encoding='utf-8')

today = date.today().isoformat()
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for path, _, _, _, pri in routes:
    sm.append('  <url><loc>%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>' % (DOMAIN + ('/' if path == '/' else path), today, pri))
sm.append('</urlset>')
(dep / 'sitemap.xml').write_text('\n'.join(sm) + '\n', encoding='utf-8')
(dep / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' % DOMAIN, encoding='utf-8')

# llms.txt: a plain summary of the studio for AI assistants (llmstxt.org), from the same data as the pages
plain = lambda s: ' '.join(H.unescape(re.sub(r'<[^>]+>', ' ', s)).split())
home = pre['pages']['/']
pricing = home[home.index('id="pricing"'):home.index('id="faq"')]
prices = []  # each plan heading in the pricing section, with the first paragraph after it that names a price
for chunk in pricing.split('<h3')[1:]:
    head, _, rest = chunk.partition('</h3>')
    p = next((x for x in re.findall(r'<p[^>]*>(.*?)</p>', rest, re.S) if '₹' in x), None)
    if p: prices.append((plain('<h3' + head), plain(p)))
llms = ['# Jayastra', '', '> ' + SITE_DESC, '',
        'Website: %s/' % DOMAIN, 'Email: hello@jayastra.com', 'Book a 30-minute call: ' + CAL_URL,
        'Location: Jabalpur, Madhya Pradesh, India. Works with clients worldwide.', '', '## Services', '']
for s, d, i in zip(data['SERVICE_SLUGS'], data['DISCIPLINES'], data['DISC_INFO']):
    llms.append('- [%s](%s): %s Includes: %s.' % (d['name'], svc_url(s), i['text'], ', '.join(t for t, _ in d['items'])))
if prices:
    llms += ['', '## Pricing (starting points; the final price follows the scope)', '']
    llms += ['- %s: %s' % (n, p) for n, p in prices]
llms += ['', '## Case studies', '', 'These are concept projects.', '']
llms += ['- [%s](%s/work/%s): %s. %s' % (c['name'], DOMAIN, c['slug'], c['services'], c['summary']) for c in data['CASES']]
llms += ['', '## FAQ', '']
for q, a in data['FAQS']: llms += ['### ' + q, '', a, '']
llms += ['## Pages', '', '- [Home](%s/)' % DOMAIN, '- [All case studies](%s/work)' % DOMAIN,
         '- [Privacy Policy](%s/privacy)' % DOMAIN, '- [Terms of Use](%s/terms)' % DOMAIN]
(dep / 'llms.txt').write_text('\n'.join(llms) + '\n', encoding='utf-8')
(dep / 'vercel.json').write_text(json.dumps({
    'cleanUrls': True, 'trailingSlash': False,
    'headers': [
        {'source': '/img/(.*)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=31536000, immutable'}]},
        {'source': '/(logo.png|logo-dark.png|logo-sm.png|logo-dark-sm.png|favicon.png|favicon-32.png|apple-touch-icon.png|og.png)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=604800'}]},
        {'source': '/app.js', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=3600, must-revalidate'}]},
    ],
}, indent=2), encoding='utf-8')
for f in ['favicon.png', 'favicon-32.png', 'apple-touch-icon.png', 'og.png']:
    if (root / 'brand' / f).exists(): shutil.copy(root / 'brand' / f, dep / f)

kb = lambda p: p.stat().st_size // 1024
print('built preview', kb(out / 'index.html'), 'KB | deploy pages', len(routes), '+404 | home', kb(dep / 'index.html'), 'KB | app.js', kb(dep / 'app.js'), 'KB')
