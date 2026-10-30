#!/usr/bin/env python3
"""
PUZZLE AI · web — build
Arma un único HTML autocontenido a partir de src/ y de los recursos del repo.

    python build.py            -> html/PUZZLE-WEB-home.html  +  _site/ (vista previa local)

Requisitos: Python 3.9+ y Pillow  (pip install pillow)

Marcadores que entiende src/index.html:
  {{css}} {{js}}                 estilos y código de src/
  {{img:ruta|ancho}}             foto -> WebP q78 embebida (ancho máx. opcional)
  {{png:ruta|ancho}}             logo/PNG con transparencia -> WebP q90 embebido
  {{video:ruta}}                 MP4 embebido
  {{font:ruta}}                  WOFF2 embebido
  {{pdf:brochures/x.pdf}}        enlace relativo: los PDF viajan aparte, en brochures/
  {{gallery:carpeta}}            una diapositiva por imagen de la carpeta
  {{logos:carpeta|a|b|all|dup}}  tira de logos para los carruseles
  {{ico:nombre}}                 ícono SVG
  {{cfg:clave}}                  valor de CONFIG (abajo)
"""
import base64, io, os, re, shutil, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'html', 'PUZZLE-WEB-home.html')

# Datos que conviene tener en un solo lugar
CONFIG = {
    'linkedin': 'https://www.linkedin.com/company/thepuzzle-ai/',  # A CONFIRMAR: el brochure solo dice "thepuzzle.ai"
}

ICONS = {
 'arrow':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
 'arrow-down':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
 'download':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
 'play':'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
 'globe':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
 'pin':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
 'shield':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.6-3.4 8.3-8 9-4.6-.7-8-4.4-8-9V6z"/><path d="M9 12l2 2 4-4" stroke-linecap="round"/></svg>',
 'mic':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
 'chat':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5" stroke-linecap="round"/></svg>',
 'doc':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6" stroke-linecap="round"/></svg>',
 'bolt':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M13 3L5 14h6l-1 7 8-11h-6z"/></svg>',
 'gear':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke-linecap="round"/></svg>',
 'chart':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V4M4 20h16M8 16l4-5 3 3 5-7"/></svg>',
 'target':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
 'chev-l':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
 'chev-r':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
 'mail':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
 'whatsapp':'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z"/></svg>',
 'instagram':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
 'linkedin':'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z"/></svg>',
 'user':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.6-4 3.7-6 7.5-6s6.9 2 7.5 6"/></svg>',
 'lock':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7"/></svg>',
 'eye':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1.8 12S5.6 5.5 12 5.5 22.2 12 22.2 12 18.4 18.5 12 18.5 1.8 12 1.8 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 'mute':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>',
 'sound':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
}

IMG_EXT = ('.jpg', '.jpeg', '.png', '.webp')
_cache = {}
stats = {'bytes': 0, 'items': 0}

def p(rel): return os.path.join(ROOT, rel)

def b64(data, mime):
    stats['bytes'] += len(data); stats['items'] += 1
    return 'data:%s;base64,%s' % (mime, base64.b64encode(data).decode())

def image(rel, width=None, alpha=False):
    key = (rel, width, alpha)
    if key in _cache: return _cache[key]
    im = Image.open(p(rel)); im = ImageOps.exif_transpose(im)
    im = im.convert('RGBA') if (alpha or im.mode in ('RGBA', 'LA', 'P')) else im.convert('RGB')
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)  # nunca deforma
    buf = io.BytesIO()
    if rel.startswith('iconos/'):
        im.save(buf, 'PNG'); uri = b64(buf.getvalue(), 'image/png')
    else:
        im.save(buf, 'WEBP', quality=90 if im.mode == 'RGBA' else 78, method=6)
        uri = b64(buf.getvalue(), 'image/webp')
    _cache[key] = uri
    return uri

def files_in(folder):
    return sorted(f for f in os.listdir(p(folder)) if f.lower().endswith(IMG_EXT) and os.path.isfile(p(folder + '/' + f)))

def nice(name):
    return os.path.splitext(name)[0].replace('-', ' ').title()

def logos(arg):
    parts = arg.split('|'); folder = parts[0]; half = parts[1] if len(parts) > 1 else 'all'; dup = 'dup' in parts[2:]
    fs = files_in(folder)
    if half == 'a': fs = fs[:(len(fs) + 1) // 2]
    elif half == 'b': fs = fs[(len(fs) + 1) // 2:]
    out = []
    for f in fs:
        alt = '' if dup else nice(f)
        extra = ' aria-hidden="true"' if dup else ''
        out.append('<img src="%s" alt="%s"%s loading="lazy">' % (image(folder + '/' + f, 420, True), alt, extra))
    return ''.join(out)

def gallery(folder):
    out = []
    for i, f in enumerate(files_in(folder)):
        out.append('<div class="gslide"><img src="%s" alt="Privacy AI Studio · %d" loading="lazy"></div>' % (image(folder + '/' + f, 1500), i + 1))
    return ''.join(out)

def render(tpl):
    def rep(m):
        kind, arg = m.group(1), m.group(2)
        if kind == 'img':
            rel, _, w = arg.partition('|'); return image(rel, int(w) if w else 1600)
        if kind == 'png':
            rel, _, w = arg.partition('|'); return image(rel, int(w) if w else None, True)
        if kind == 'video': return b64(open(p(arg), 'rb').read(), 'video/mp4')
        if kind == 'font': return b64(open(p(arg), 'rb').read(), 'font/woff2')
        if kind == 'pdf':
            if not os.path.exists(p(arg)): sys.exit('Falta el PDF: ' + arg)
            return arg
        if kind == 'gallery': return gallery(arg)
        if kind == 'logos': return logos(arg)
        if kind == 'ico': return ICONS[arg]
        if kind == 'cfg': return CONFIG[arg]
        raise ValueError(kind)
    return re.sub(r'\{\{(img|png|video|font|pdf|gallery|logos|ico|cfg):([^}]+)\}\}', rep, tpl)

def main():
    html = open(p('src/index.html'), encoding='utf-8').read()
    css = open(p('src/styles.css'), encoding='utf-8').read()
    js = open(p('src/app.js'), encoding='utf-8').read()
    js = 'var ICO_MUTE=%r,ICO_SOUND=%r;\n' % (ICONS['mute'], ICONS['sound']) + js
    gate = open(p('src/gate.js'), encoding='utf-8').read()
    html = html.replace('{{css}}', render(css)).replace('{{js}}', js).replace('{{gate}}', gate)
    html = render(html)
    left = re.findall(r'\{\{[^}]*\}\}', html)
    if left: sys.exit('Marcadores sin resolver: %s' % left[:5])
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w', encoding='utf-8').write(html)
    # vista previa local / lo que se publica
    site = p('_site'); shutil.rmtree(site, ignore_errors=True); os.makedirs(site + '/brochures')
    shutil.copy(OUT, site + '/index.html')
    for f in os.listdir(p('brochures')):
        if f.endswith('.pdf'): shutil.copy(p('brochures/' + f), site + '/brochures/' + f)
    for f in os.listdir(p('iconos/web')): shutil.copy(p('iconos/web/' + f), site + '/' + f)
    shutil.copy(p('html/robots.txt'), site + '/robots.txt')
    mb = os.path.getsize(OUT) / 1048576
    print('OK  %s  %.1f MB  (%d recursos embebidos)' % (os.path.relpath(OUT, ROOT), mb, stats['items']))
    if mb > 30: print('ATENCION: supera 30 MiB')

if __name__ == '__main__':
    main()
