/**
 * San Lorenzo Website — Validation Tests
 * Tests HTML structure, semantic elements, responsiveness, accessibility,
 * and content integration across all pages.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const BASE = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(message);
    console.log('  FAIL: ' + message);
  }
}

function getHTML(relPath) {
  const filePath = path.join(BASE, relPath);
  const html = fs.readFileSync(filePath, 'utf-8');
  return new JSDOM(html);
}

function getAllHTMLFiles() {
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'test') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.html')) {
        files.push(path.relative(BASE, full));
      }
    }
  }
  walk(BASE);
  return files;
}

// ============================================================
// TEST SUITE: All PRD Pages Exist
// ============================================================
console.log('\n=== Test: All PRD Pages Exist ===');

const requiredPages = [
  'index.html',
  // Club
  'club/historia.html', 'club/autoridades.html', 'club/sedes.html',
  'club/himno.html', 'club/estatuto.html', 'club/balances.html',
  'club/camisetas.html', 'club/nuevo-gasometro.html', 'club/viejo-gasometro.html',
  'club/vuelta-a-boedo.html', 'club/obras.html', 'club/noticias.html', 'club/casla-social.html',
  // Fútbol
  'futbol/index.html', 'futbol/noticias.html', 'futbol/plantel.html',
  'futbol/titulos.html', 'futbol/jugadores-historicos.html', 'futbol/numeros-historicos.html',
  'futbol/amateur.html', 'futbol/femenino.html', 'futbol/senior.html',
  // Básquet
  'basquet/index.html', 'basquet/noticias.html', 'basquet/plantel.html',
  'basquet/historia.html', 'basquet/titulos.html',
  // Más Deportes
  'mas-deportes/index.html',
  // Socios
  'socios/asociate.html', 'socios/mi-casla.html', 'socios/penas.html', 'socios/colonia.html',
  // Entradas
  'entradas/index.html', 'entradas/abonos.html',
  // Multimedia
  'multimedia/galerias.html', 'multimedia/videos.html', 'multimedia/revista.html', 'multimedia/cuervitos.html',
  // Enciclonpedia
  'enciclonpedia/index.html', 'enciclonpedia/diccionario.html',
  'enciclonpedia/jugadores-historicos.html', 'enciclonpedia/numeros-historicos.html', 'enciclonpedia/titulos.html',
  // Prensa
  'prensa/acreditaciones.html', 'prensa/medios.html',
  // New pages
  'contacto.html', 'busqueda.html', '404.html',
];

for (const page of requiredPages) {
  const exists = fs.existsSync(path.join(BASE, page));
  assert(exists, `Page exists: ${page}`);
}


// ============================================================
// TEST SUITE: Valid HTML5 Structure for All Pages
// ============================================================
console.log('\n=== Test: Valid HTML5 Structure ===');

const allFiles = getAllHTMLFiles();
for (const file of allFiles) {
  const html = fs.readFileSync(path.join(BASE, file), 'utf-8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // DOCTYPE check
  assert(html.trim().startsWith('<!DOCTYPE html>'), `${file}: starts with <!DOCTYPE html>`);

  // lang attribute
  const htmlEl = doc.documentElement;
  assert(htmlEl.getAttribute('lang') === 'es', `${file}: html lang="es"`);

  // charset
  const charset = doc.querySelector('meta[charset]');
  assert(charset && charset.getAttribute('charset').toLowerCase() === 'utf-8', `${file}: charset UTF-8`);

  // viewport
  const viewport = doc.querySelector('meta[name="viewport"]');
  assert(viewport !== null, `${file}: has viewport meta`);

  // title
  const title = doc.querySelector('title');
  assert(title && title.textContent.trim().length > 0, `${file}: has <title>`);

  // CSS link
  const cssLink = doc.querySelector('link[rel="stylesheet"]');
  assert(cssLink !== null, `${file}: links to CSS`);
}


// ============================================================
// TEST SUITE: Semantic Structure
// ============================================================
console.log('\n=== Test: Semantic HTML Elements ===');

for (const file of allFiles) {
  const dom = getHTML(file);
  const doc = dom.window.document;

  // header, main, footer
  assert(doc.querySelector('header') !== null, `${file}: has <header>`);
  assert(doc.querySelector('main') !== null, `${file}: has <main>`);
  assert(doc.querySelector('footer') !== null, `${file}: has <footer>`);

  // nav
  assert(doc.querySelector('nav') !== null, `${file}: has <nav>`);

  // h1 exists (except 404 which has it in the page-header or error-page)
  const h1 = doc.querySelector('h1');
  assert(h1 !== null, `${file}: has <h1>`);
}


// ============================================================
// TEST SUITE: Accessibility
// ============================================================
console.log('\n=== Test: Accessibility ===');

for (const file of allFiles) {
  const dom = getHTML(file);
  const doc = dom.window.document;

  // Skip link
  const skipLink = doc.querySelector('.skip-link');
  assert(skipLink !== null, `${file}: has skip-to-content link`);
  if (skipLink) {
    assert(skipLink.getAttribute('href') === '#main-content', `${file}: skip link targets #main-content`);
  }

  // main has id
  const mainEl = doc.querySelector('main');
  if (mainEl) {
    assert(mainEl.getAttribute('id') === 'main-content', `${file}: main has id="main-content"`);
  }

  // header has role="banner"
  const headerEl = doc.querySelector('header.site-header');
  if (headerEl) {
    assert(headerEl.getAttribute('role') === 'banner', `${file}: header has role="banner"`);
  }

  // footer has role="contentinfo"
  const footerEl = doc.querySelector('footer.site-footer');
  if (footerEl) {
    assert(footerEl.getAttribute('role') === 'contentinfo', `${file}: footer has role="contentinfo"`);
  }

  // nav has aria-label
  const navs = doc.querySelectorAll('nav');
  for (const nav of navs) {
    const label = nav.getAttribute('aria-label');
    assert(label && label.length > 0, `${file}: nav has aria-label`);
  }

  // Hamburger has aria-expanded
  const hamburger = doc.getElementById('hamburger');
  if (hamburger) {
    assert(hamburger.hasAttribute('aria-expanded'), `${file}: hamburger has aria-expanded`);
    assert(hamburger.hasAttribute('aria-controls'), `${file}: hamburger has aria-controls`);
    assert(hamburger.hasAttribute('aria-label'), `${file}: hamburger has aria-label`);
  }

  // Search button has aria-label
  const searchBtn = doc.getElementById('btn-search');
  if (searchBtn) {
    assert(searchBtn.hasAttribute('aria-label'), `${file}: search button has aria-label`);
  }
}


// ============================================================
// TEST SUITE: Homepage Sections (PRD §5.2.1)
// ============================================================
console.log('\n=== Test: Homepage Sections ===');
{
  const dom = getHTML('index.html');
  const doc = dom.window.document;

  // Hero slider
  const heroSlides = doc.querySelectorAll('.hero__slide');
  assert(heroSlides.length === 3, `Homepage: hero has 3 slides (got ${heroSlides.length})`);
  assert(doc.querySelector('.hero__dot') !== null, 'Homepage: hero has dot navigation');

  // Next match widget
  assert(doc.querySelector('.next-match') !== null, 'Homepage: has Próximo Partido widget');
  assert(doc.querySelector('.next-match .btn--secondary') !== null, 'Homepage: next match has Comprar Entradas CTA');

  // News grid
  const newsCards = doc.querySelectorAll('.section--alt .card');
  assert(newsCards.length >= 6, `Homepage: has 6+ news cards (got ${newsCards.length})`);

  // Agenda tabs
  const agendaTabs = doc.querySelectorAll('.agenda__tab');
  assert(agendaTabs.length === 3, `Homepage: has 3 agenda tabs (Fútbol/Básquet/Más Deportes)`);

  // Quick actions (4 CTAs)
  const quickActions = doc.querySelectorAll('.quick-action');
  assert(quickActions.length === 4, `Homepage: has 4 quick action CTAs (got ${quickActions.length})`);

  // CASLA TV videos
  const videoCards = doc.querySelectorAll('.video-card');
  assert(videoCards.length >= 4, `Homepage: has 4+ video cards`);

  // Social bar
  const socialItems = doc.querySelectorAll('.social-bar__item');
  assert(socialItems.length >= 5, `Homepage: has 5+ social items`);

  // Sponsors
  const sponsorLogos = doc.querySelectorAll('.sponsors__logo');
  assert(sponsorLogos.length >= 4, `Homepage: has 4+ sponsor logos`);
  // Sponsors have aria-label (for alt text)
  for (const logo of sponsorLogos) {
    assert(logo.getAttribute('aria-label'), 'Homepage: sponsor logo has aria-label');
  }

  // Efemérides section
  assert(doc.querySelector('#efemeride-title') !== null, 'Homepage: has Efemérides section');
}


// ============================================================
// TEST SUITE: Contact Form (PRD §5.2.11)
// ============================================================
console.log('\n=== Test: Contact Form ===');
{
  const dom = getHTML('contacto.html');
  const doc = dom.window.document;

  const form = doc.getElementById('contact-form');
  assert(form !== null, 'Contact: has form#contact-form');

  if (form) {
    assert(form.querySelector('input[name="name"][required]') !== null, 'Contact: name field exists and is required');
    assert(form.querySelector('input[type="email"][required]') !== null, 'Contact: email field exists and is required');
    assert(form.querySelector('select[name="subject"]') !== null, 'Contact: subject dropdown exists');
    assert(form.querySelector('textarea[name="message"][required]') !== null, 'Contact: message textarea exists and is required');

    // Subject options
    const options = form.querySelectorAll('select[name="subject"] option');
    const optionValues = Array.from(options).map(o => o.value);
    assert(optionValues.includes('General'), 'Contact: subject has General option');
    assert(optionValues.includes('Socios'), 'Contact: subject has Socios option');
    assert(optionValues.includes('Prensa'), 'Contact: subject has Prensa option');
    assert(optionValues.includes('Sponsors'), 'Contact: subject has Sponsors option');

    // Honeypot
    const honeypot = form.querySelector('.honeypot input');
    assert(honeypot !== null, 'Contact: honeypot field exists');

    // Success message
    const success = form.querySelector('.form-success');
    assert(success !== null, 'Contact: success message element exists');
  }

  // Alternative channels
  const whatsappLink = doc.querySelector('a[href*="wa.me"]');
  assert(whatsappLink !== null, 'Contact: WhatsApp link exists');
  const emailLink = doc.querySelector('a[href*="socios@sanlorenzo"]');
  assert(emailLink !== null, 'Contact: email link exists');
}


// ============================================================
// TEST SUITE: Press Form (PRD §5.2.10)
// ============================================================
console.log('\n=== Test: Press Form ===');
{
  const dom = getHTML('prensa/acreditaciones.html');
  const doc = dom.window.document;
  const form = doc.getElementById('press-form');
  assert(form !== null, 'Press: has form#press-form');
  if (form) {
    assert(form.querySelector('input[name="name"]') !== null, 'Press: name field exists');
    assert(form.querySelector('input[name="outlet"]') !== null, 'Press: outlet field exists');
    assert(form.querySelector('input[name="email"]') !== null, 'Press: email field exists');
    assert(form.querySelector('input[name="event"]') !== null, 'Press: event field exists');
    assert(form.querySelector('textarea[name="message"]') !== null, 'Press: message field exists');
    assert(form.querySelector('.honeypot') !== null, 'Press: honeypot exists');
  }
}


// ============================================================
// TEST SUITE: Asociate / Membership (PRD §5.2.6)
// ============================================================
console.log('\n=== Test: Membership Page ===');
{
  const dom = getHTML('socios/asociate.html');
  const doc = dom.window.document;

  // Comparison table
  const table = doc.querySelector('.comparison-table table');
  assert(table !== null, 'Asociate: has comparison table');

  // Tier names in header
  const headers = doc.querySelectorAll('.comparison-table thead th');
  const headerTexts = Array.from(headers).map(h => h.textContent);
  assert(headerTexts.some(t => t.includes('Simple')), 'Asociate: has Socia/o Simple tier');
  assert(headerTexts.some(t => t.includes('Plena')), 'Asociate: has Socia/o Plena/o tier');
  assert(headerTexts.some(t => t.includes('Interior')), 'Asociate: has Socia/o Interior tier');
  assert(headerTexts.some(t => t.includes('Exterior')), 'Asociate: has Socia/o Exterior tier');

  // Asociarme CTAs linking to external
  const ctaLinks = doc.querySelectorAll('a[href*="casla.miclub.info/register"]');
  assert(ctaLinks.length >= 4, `Asociate: has 4+ Asociarme CTAs (got ${ctaLinks.length})`);

  // English section for Exterior
  const bodyText = doc.body.textContent;
  assert(bodyText.includes('Become a Member'), 'Asociate: has English "Become a Member" section');
}


// ============================================================
// TEST SUITE: Entradas (PRD §5.2.7)
// ============================================================
console.log('\n=== Test: Entradas Page ===');
{
  const dom = getHTML('entradas/index.html');
  const doc = dom.window.document;

  const matchItems = doc.querySelectorAll('.match-list__item');
  assert(matchItems.length >= 2, `Entradas: has 2+ match items (got ${matchItems.length})`);

  // Status badges
  assert(doc.querySelector('.match-list__status--sale') !== null, 'Entradas: has "En venta" status');
  assert(doc.querySelector('.match-list__status--soon') !== null, 'Entradas: has "Próximamente" status');

  // Comprar button
  assert(doc.querySelector('.btn--secondary') !== null, 'Entradas: has Comprar button');

  // Disabled button
  assert(doc.querySelector('button[disabled]') !== null, 'Entradas: has disabled Próximamente button');
}


// ============================================================
// TEST SUITE: Search Page (PRD §5.2.12)
// ============================================================
console.log('\n=== Test: Search Page ===');
{
  const dom = getHTML('busqueda.html');
  const doc = dom.window.document;

  assert(doc.querySelector('input[type="search"]') !== null, 'Search: has search input');
  assert(doc.querySelector('.search-results__item') !== null, 'Search: has result items');
  assert(doc.querySelector('.search-results__excerpt mark') !== null, 'Search: has highlighted terms');
  assert(doc.querySelector('.pagination') !== null, 'Search: has pagination');
}


// ============================================================
// TEST SUITE: 404 Page
// ============================================================
console.log('\n=== Test: 404 Page ===');
{
  const dom = getHTML('404.html');
  const doc = dom.window.document;
  const bodyText = doc.body.textContent;
  assert(bodyText.includes('404'), '404: displays 404 code');
  assert(bodyText.includes('no existe') || bodyText.includes('fue movida'), '404: appropriate message');
  assert(doc.querySelector('a[href*="index.html"]') !== null, '404: link to home');
  assert(doc.querySelector('a[href*="contacto"]') !== null, '404: link to contact');
}


// ============================================================
// TEST SUITE: External Links
// ============================================================
console.log('\n=== Test: External Links ===');
{
  const dom = getHTML('index.html');
  const doc = dom.window.document;

  // Tienda link (soycuervo.com)
  const tiendaLink = doc.querySelector('a[href*="soycuervo.com"]');
  assert(tiendaLink !== null, 'Homepage: has Tienda link');
  if (tiendaLink) {
    assert(tiendaLink.getAttribute('target') === '_blank', 'Homepage: Tienda opens in new tab');
    assert(tiendaLink.getAttribute('rel') && tiendaLink.getAttribute('rel').includes('noopener'), 'Homepage: Tienda has noopener');
  }

  // Social links open in new tab
  const socialLinks = doc.querySelectorAll('.footer-social a');
  for (const link of socialLinks) {
    assert(link.getAttribute('target') === '_blank', 'Homepage: social link opens in new tab');
  }
}


// ============================================================
// TEST SUITE: CSS Responsiveness
// ============================================================
console.log('\n=== Test: CSS Responsive Design ===');
{
  const cssPath = path.join(BASE, 'css', 'styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Breakpoints
  assert(css.includes('@media (min-width: 768px)'), 'CSS: has tablet breakpoint (768px)');
  assert(css.includes('@media (min-width: 1024px)'), 'CSS: has desktop breakpoint (1024px)');

  // Mobile-first approach (no max-width media queries needed)
  // Grid system
  assert(css.includes('.grid--2'), 'CSS: has 2-column grid');
  assert(css.includes('.grid--3'), 'CSS: has 3-column grid');
  assert(css.includes('.grid--4'), 'CSS: has 4-column grid');

  // Sticky header
  assert(css.includes('position: sticky'), 'CSS: header is sticky');

  // Nav mobile vs desktop
  assert(css.includes('.nav-desktop'), 'CSS: has desktop nav styles');
  assert(css.includes('.nav-mobile'), 'CSS: has mobile nav styles');
  assert(css.includes('.hamburger'), 'CSS: has hamburger styles');

  // Min touch targets
  assert(css.includes('min-height: 44px') || css.includes('min-width: 44px'), 'CSS: buttons have 44px min touch targets');
}


// ============================================================
// TEST SUITE: JavaScript Exists
// ============================================================
console.log('\n=== Test: JavaScript ===');
{
  const jsPath = path.join(BASE, 'js', 'main.js');
  assert(fs.existsSync(jsPath), 'JS: main.js exists');
  const js = fs.readFileSync(jsPath, 'utf-8');
  assert(js.includes('hamburger'), 'JS: handles hamburger menu');
  assert(js.includes('search-overlay'), 'JS: handles search overlay');
  assert(js.includes('hero__slide') || js.includes('slides'), 'JS: handles hero slider');
  assert(js.includes('contact-form'), 'JS: handles contact form validation');
  assert(js.includes('press-form'), 'JS: handles press form validation');
  assert(js.includes('agenda__tab') || js.includes('agendaTabs'), 'JS: handles agenda tabs');
}


// ============================================================
// TEST SUITE: Más Deportes (20 disciplines)
// ============================================================
console.log('\n=== Test: Más Deportes ===');
{
  const dom = getHTML('mas-deportes/index.html');
  const doc = dom.window.document;
  const cards = doc.querySelectorAll('.discipline-card');
  assert(cards.length >= 20, `Más Deportes: has 20+ discipline cards (got ${cards.length})`);
}


// ============================================================
// RESULTS
// ============================================================
console.log('\n========================================');
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log('  - ' + f));
}
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
