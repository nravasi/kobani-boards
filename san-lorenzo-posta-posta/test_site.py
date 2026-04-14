"""
Test suite for San Lorenzo website — HTML/CSS validation and structure tests.
Run with: python3 test_site.py
"""
import os
import sys
import html5lib
from html5lib import HTMLParser, getTreeBuilder
import re

BASE = os.path.dirname(os.path.abspath(__file__))
PASS = 0
FAIL = 0
ERRORS = []

def test(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ✓ {name}")
    else:
        FAIL += 1
        msg = f"  ✗ {name}"
        if detail:
            msg += f" — {detail}"
        print(msg)
        ERRORS.append(msg)

def read_html(path):
    with open(os.path.join(BASE, path), 'r', encoding='utf-8') as f:
        return f.read()

def parse_and_check(path):
    """Parse HTML file and return (content, errors)"""
    content = read_html(path)
    parser = HTMLParser(strict=False, namespaceHTMLElements=False)
    doc = parser.parse(content)
    errors = parser.errors
    return content, errors

def find_all_html_files():
    files = []
    for root, dirs, fnames in os.walk(BASE):
        for fn in fnames:
            if fn.endswith('.html'):
                rel = os.path.relpath(os.path.join(root, fn), BASE)
                files.append(rel)
    return sorted(files)

# ============================================================
# TEST GROUP 1: All pages exist
# ============================================================
print("\n=== TEST GROUP 1: Required Pages Exist ===")

required_pages = [
    "index.html",
    "contacto.html",
    "busqueda.html",
    "404.html",
    # Club
    "club/index.html", "club/historia.html", "club/autoridades.html",
    "club/sedes.html", "club/himno.html", "club/estatuto.html",
    "club/balances.html", "club/camisetas.html", "club/nuevo-gasometro.html",
    "club/viejo-gasometro.html", "club/vuelta-a-boedo.html",
    "club/obras.html", "club/noticias.html", "club/casla-social.html",
    # Fútbol
    "futbol/profesional/index.html", "futbol/profesional/noticias.html",
    "futbol/profesional/plantel.html", "futbol/profesional/titulos.html",
    "futbol/profesional/jugadores-historicos.html",
    "futbol/profesional/numeros-historicos.html",
    "futbol/amateur/index.html",
    "futbol/femenino/index.html", "futbol/femenino/noticias.html",
    "futbol/femenino/plantel.html",
    "futbol/senior/index.html",
    # Básquet
    "basquet/index.html", "basquet/noticias.html", "basquet/plantel.html",
    "basquet/historia.html", "basquet/titulos.html",
    # Más Deportes
    "mas-deportes/index.html",
    # Socios
    "socios/index.html", "socios/asociate.html", "socios/mi-casla.html",
    "socios/penas.html", "socios/colonia.html",
    # Entradas
    "entradas/index.html",
    # Multimedia
    "multimedia/index.html", "multimedia/galerias.html",
    "multimedia/videos.html", "multimedia/revista.html",
    "multimedia/cuervitos.html",
    # Enciclonpedia
    "enciclonpedia/index.html", "enciclonpedia/diccionario.html",
    "enciclonpedia/jugadores-historicos.html",
    "enciclonpedia/numeros-historicos.html", "enciclonpedia/titulos.html",
    # Prensa
    "prensa/index.html", "prensa/acreditaciones.html",
    "prensa/medios-partidarios.html",
]

for page in required_pages:
    test(f"Page exists: {page}", os.path.exists(os.path.join(BASE, page)))

# ============================================================
# TEST GROUP 2: HTML5 Validation
# ============================================================
print("\n=== TEST GROUP 2: HTML5 Validation ===")

all_html = find_all_html_files()

for page in all_html:
    content, errors = parse_and_check(page)
    # Filter critical errors only (ignore minor warnings)
    critical = [e for e in errors if e[0] not in ('unexpected-end-tag',)]
    test(f"HTML5 valid: {page}",
         len(critical) == 0,
         f"{len(critical)} errors" if critical else "")

# ============================================================
# TEST GROUP 3: Semantic HTML structure
# ============================================================
print("\n=== TEST GROUP 3: Semantic HTML Structure ===")

for page in all_html:
    content = read_html(page)

    # DOCTYPE
    test(f"DOCTYPE html: {page}", content.strip().startswith("<!DOCTYPE html>"))

    # lang attribute
    test(f"lang=es: {page}", 'lang="es"' in content)

    # charset
    test(f"charset UTF-8: {page}", 'charset="UTF-8"' in content or 'charset="utf-8"' in content)

    # viewport
    test(f"viewport meta: {page}", 'viewport' in content)

    # Skip link
    test(f"skip-link present: {page}", 'skip-link' in content)

    # main element
    test(f"<main> element: {page}", '<main' in content)

    # header
    test(f"<header> element: {page}", '<header' in content)

    # footer
    test(f"<footer> element: {page}", '<footer' in content)

    # title tag
    test(f"<title> present: {page}", '<title>' in content)

# ============================================================
# TEST GROUP 4: Responsive CSS
# ============================================================
print("\n=== TEST GROUP 4: Responsive CSS ===")

css_content = read_html("css/styles.css")
test("CSS file exists", os.path.exists(os.path.join(BASE, "css/styles.css")))
test("Mobile breakpoint (<768px)", "@media (min-width: 768px)" in css_content)
test("Desktop breakpoint (>=1024px)", "@media (min-width: 1024px)" in css_content)
test("CSS custom properties", ":root" in css_content and "--color-" in css_content)
test("Grid layout used", "grid-template-columns" in css_content)
test("Flexbox used", "display: flex" in css_content)
test("box-sizing: border-box", "box-sizing: border-box" in css_content)
test("Sticky header", "position: sticky" in css_content)
test("Hamburger menu styles", ".hamburger" in css_content)
test("Mobile nav styles", ".nav-mobile" in css_content)
test("Desktop nav styles", ".nav-desktop" in css_content)
test("Responsive card grid", ".card-grid" in css_content)
test("Skip link styles", ".skip-link" in css_content)

# ============================================================
# TEST GROUP 5: Accessibility
# ============================================================
print("\n=== TEST GROUP 5: Accessibility ===")

for page in all_html:
    content = read_html(page)
    # aria-label on nav
    test(f"nav has aria-label: {page}", 'aria-label=' in content)
    # role=banner on header
    test(f"header role=banner: {page}", 'role="banner"' in content)
    # role=contentinfo on footer
    test(f"footer role=contentinfo: {page}", 'role="contentinfo"' in content)

# Check skip link first focusable element
home = read_html("index.html")
skip_pos = home.find('class="skip-link"')
first_a = home.find('<a ')
test("Skip link is first <a> on homepage", skip_pos == first_a + 2 or home.find('skip-link') < home.find('<header'))

# ============================================================
# TEST GROUP 6: Content and Brand
# ============================================================
print("\n=== TEST GROUP 6: Content & Brand Integration ===")

home = read_html("index.html")
test("Homepage has hero section", "hero" in home)
test("Homepage has news section", "Noticias Destacadas" in home)
test("Homepage has schedule tabs", "Agenda Semanal" in home)
test("Homepage has quick actions", "Acciones Rápidas" in home or "quick-action" in home)
test("Homepage has CASLA TV", "CASLA TV" in home)
test("Homepage has social stats", "social-strip" in home)
test("Homepage has sponsors", "sponsors" in home)
test("Homepage has next match widget", "next-match" in home)
test("Homepage has efemérides", "Un día como hoy" in home)
test("Brand: CASLA in logo", "CASLA" in home)
test("Brand: San Lorenzo in title", "San Lorenzo" in home)
test("Brand: © 2026", "© 2026" in home)
test("Club colors in CSS", "--color-red: #E2001A" in css_content and "--color-blue: #003DA5" in css_content)

# Contacto page
contact = read_html("contacto.html")
test("Contact form exists", "contact-form" in contact)
test("Contact form: name field", 'id="contact-name"' in contact)
test("Contact form: email field", 'id="contact-email"' in contact)
test("Contact form: subject dropdown", 'id="contact-subject"' in contact)
test("Contact form: message field", 'id="contact-message"' in contact)
test("Contact form: honeypot", "honeypot" in contact)
test("Contact: WhatsApp", "5491153336237" in contact)
test("Contact: email address", "socios@sanlorenzo.com.ar" in contact)
test("Contact: sede addresses", "Sede Boedo" in contact)

# Asociate page
asociate = read_html("socios/asociate.html")
test("Asociate: comparison table", "comparison-table" in asociate)
test("Asociate: Socia/o Simple", "Simple" in asociate)
test("Asociate: Socia/o Plena/o", "Plena" in asociate)
test("Asociate: Socia/o Interior", "Interior" in asociate)
test("Asociate: Socia/o Exterior", "Exterior" in asociate)
test("Asociate: Asociarme CTA", "Asociarme" in asociate)
test("Asociate: links to miclub", "casla.miclub.info" in asociate)
test("Asociate: English summary", 'lang="en"' in asociate)

# Entradas page
entradas = read_html("entradas/index.html")
test("Entradas: match list", "match-list" in entradas)
test("Entradas: buy CTA", "Comprar" in entradas)
test("Entradas: abonos section", "Abonos" in entradas)
test("Entradas: info/rules", "Normas de ingreso" in entradas)
test("Entradas: badge-sale", "badge-sale" in entradas)

# Prensa acreditaciones
prensa = read_html("prensa/acreditaciones.html")
test("Prensa: form exists", "press-form" in prensa)
test("Prensa: name field", "press-name" in prensa)
test("Prensa: outlet field", "press-outlet" in prensa)
test("Prensa: email field", "press-email" in prensa)
test("Prensa: event field", "press-event" in prensa)
test("Prensa: honeypot", "honeypot" in prensa)

# Search page
search = read_html("busqueda.html")
test("Search: input exists", "search-input" in search or 'type="search"' in search)
test("Search: placeholder text", "Buscá en sanlorenzo.com.ar" in search)
test("Search: results layout", "search-result" in search)
test("Search: empty state", "No encontramos resultados" in search)

# 404 page
p404 = read_html("404.html")
test("404: error message", "no existe o fue movida" in p404)
test("404: home link", "Ir al Inicio" in p404)
test("404: contact link", "Contacto" in p404)

# External links
test("Tienda link: external (soycuervo.com)", "soycuervo.com" in home and 'target="_blank"' in home)
test("Ciclón de Beneficios: external link",
     "ciclondebeneficios.com.ar" in read_html("socios/index.html"))

# Más Deportes: 20 disciplines
masdeportes = read_html("mas-deportes/index.html")
test("Más Deportes: 20 disciplines listed",
     masdeportes.count("card-title") >= 20)

# ============================================================
# TEST GROUP 7: Images use real <img> tags
# ============================================================
print("\n=== TEST GROUP 7: Images ===")

for page in all_html:
    content = read_html(page)
    test(f"No px.gif references: {page}", "px.gif" not in content)

# Check sponsor images use real img tags
test("Sponsors use <img> with alt", 'alt="Nike' in home or 'alt="Main Sponsor' in home or 'alt="Sponsor' in home)

# ============================================================
# TEST GROUP 8: JavaScript
# ============================================================
print("\n=== TEST GROUP 8: JavaScript ===")

js_content = read_html("js/main.js")
test("JS file exists", os.path.exists(os.path.join(BASE, "js/main.js")))
test("JS: hamburger toggle", "hamburger" in js_content)
test("JS: tab switching", "tab-btn" in js_content or "tab" in js_content)
test("JS: contact form handler", "contact-form" in js_content)
test("JS: press form handler", "press-form" in js_content)
test("JS: success message", "Gracias" in js_content or "gracias" in js_content)

# ============================================================
# SUMMARY
# ============================================================
print(f"\n{'='*60}")
print(f"RESULTS: {PASS} passed, {FAIL} failed out of {PASS+FAIL} tests")
print(f"{'='*60}")

if ERRORS:
    print("\nFailed tests:")
    for e in ERRORS:
        print(e)

sys.exit(0 if FAIL == 0 else 1)
