const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const BASE = path.resolve(__dirname, "..");

function loadPage(relPath) {
  const html = fs.readFileSync(path.join(BASE, relPath), "utf-8");
  return new JSDOM(html);
}

function getAllHtmlFiles(dir, files) {
  files = files || [];
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      if (entry === "node_modules") continue;
      getAllHtmlFiles(full, files);
    } else if (entry.endsWith(".html")) {
      files.push(path.relative(BASE, full));
    }
  }
  return files;
}

const allPages = getAllHtmlFiles(BASE);

describe("Site structure", () => {
  test("has at least 40 HTML pages", () => {
    expect(allPages.length).toBeGreaterThanOrEqual(40);
  });

  test("all PRD-defined sections have pages", () => {
    const requiredFiles = [
      "index.html",
      "contacto.html",
      "busqueda.html",
      "404.html",
      "club/historia.html",
      "club/autoridades.html",
      "club/sedes.html",
      "club/himno.html",
      "club/estatuto.html",
      "club/balances.html",
      "club/camisetas.html",
      "club/nuevo-gasometro.html",
      "club/viejo-gasometro.html",
      "club/vuelta-a-boedo.html",
      "club/obras.html",
      "club/noticias.html",
      "club/casla-social.html",
      "futbol/profesional/noticias.html",
      "futbol/profesional/plantel.html",
      "futbol/profesional/titulos.html",
      "futbol/profesional/jugadores-historicos.html",
      "futbol/profesional/numeros-historicos.html",
      "futbol/amateur.html",
      "futbol/femenino/noticias.html",
      "futbol/femenino/plantel.html",
      "futbol/femenino/info.html",
      "futbol/senior.html",
      "basquet/noticias.html",
      "basquet/plantel.html",
      "basquet/historia.html",
      "basquet/titulos.html",
      "mas-deportes/index.html",
      "socios/asociate.html",
      "socios/mi-casla.html",
      "socios/penas.html",
      "socios/colonia.html",
      "entradas/index.html",
      "entradas/abonos.html",
      "multimedia/galerias.html",
      "multimedia/videos.html",
      "multimedia/revista.html",
      "multimedia/cuervitos.html",
      "enciclonpedia/diccionario.html",
      "enciclonpedia/jugadores-historicos.html",
      "enciclonpedia/numeros-historicos.html",
      "enciclonpedia/titulos.html",
      "prensa/acreditaciones.html",
      "prensa/medios-partidarios.html",
    ];
    for (const file of requiredFiles) {
      expect(fs.existsSync(path.join(BASE, file))).toBe(true);
    }
  });
});

describe("HTML5 validity", () => {
  test.each(allPages)("%s has DOCTYPE html", (pagePath) => {
    const html = fs.readFileSync(path.join(BASE, pagePath), "utf-8");
    expect(html.trimStart().startsWith("<!DOCTYPE html>")).toBe(true);
  });

  test.each(allPages)("%s has lang=es attribute", (pagePath) => {
    const html = fs.readFileSync(path.join(BASE, pagePath), "utf-8");
    expect(html).toMatch(/<html lang="es">/);
  });

  test.each(allPages)("%s has viewport meta tag", (pagePath) => {
    const html = fs.readFileSync(path.join(BASE, pagePath), "utf-8");
    expect(html).toMatch(/meta name="viewport"/);
  });

  test.each(allPages)("%s has charset UTF-8", (pagePath) => {
    const html = fs.readFileSync(path.join(BASE, pagePath), "utf-8");
    expect(html).toMatch(/charset="UTF-8"/i);
  });
});

describe("Accessibility", () => {
  test.each(allPages)("%s has skip link", (pagePath) => {
    const { document } = loadPage(pagePath).window;
    const skipLink = document.querySelector(".skip-link");
    expect(skipLink).not.toBeNull();
    expect(skipLink.getAttribute("href")).toBe("#main-content");
  });

  test.each(allPages)("%s has main element with id", (pagePath) => {
    const { document } = loadPage(pagePath).window;
    const main = document.getElementById("main-content");
    expect(main).not.toBeNull();
    expect(main.tagName.toLowerCase()).toBe("main");
  });

  test.each(allPages)("%s has exactly one h1", (pagePath) => {
    const { document } = loadPage(pagePath).window;
    const h1s = document.querySelectorAll("h1");
    expect(h1s.length).toBe(1);
  });
});

describe("Navigation", () => {
  test("home page has sticky header", () => {
    const { document } = loadPage("index.html").window;
    const header = document.querySelector(".site-header");
    expect(header).not.toBeNull();
    expect(header.tagName.toLowerCase()).toBe("header");
  });

  test("home page has main navigation", () => {
    const { document } = loadPage("index.html").window;
    const nav = document.querySelector(".main-nav");
    expect(nav).not.toBeNull();
    const links = nav.querySelectorAll("a");
    expect(links.length).toBeGreaterThanOrEqual(10);
  });

  test("home page has mobile nav toggle", () => {
    const { document } = loadPage("index.html").window;
    const toggle = document.getElementById("nav-toggle");
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute("aria-controls")).toBe("mobile-nav");
  });

  test("home page has mobile nav panel", () => {
    const { document } = loadPage("index.html").window;
    const mobileNav = document.getElementById("mobile-nav");
    expect(mobileNav).not.toBeNull();
  });

  test("inner pages have breadcrumb", () => {
    const { document } = loadPage("club/historia.html").window;
    const bc = document.querySelector(".breadcrumb");
    expect(bc).not.toBeNull();
    expect(bc.querySelector("ol")).not.toBeNull();
  });

  test("footer has full sitemap links", () => {
    const { document } = loadPage("index.html").window;
    const footer = document.querySelector(".site-footer");
    expect(footer).not.toBeNull();
    const links = footer.querySelectorAll("a");
    expect(links.length).toBeGreaterThanOrEqual(10);
  });

  test("search icon is in header", () => {
    const { document } = loadPage("index.html").window;
    const search = document.querySelector(".btn-search");
    expect(search).not.toBeNull();
  });

  test("Asociate CTA button in header", () => {
    const { document } = loadPage("index.html").window;
    const btn = document.querySelector(".btn-asociate");
    expect(btn).not.toBeNull();
    expect(btn.textContent).toContain("Asociate");
  });
});

describe("Home page sections", () => {
  let doc;
  beforeAll(() => {
    doc = loadPage("index.html").window.document;
  });

  test("has hero section", () => {
    expect(doc.querySelector(".hero")).not.toBeNull();
  });

  test("has próximo partido widget", () => {
    expect(doc.querySelector(".proximo-partido")).not.toBeNull();
  });

  test("has noticias grid with 6 cards", () => {
    const section = doc.getElementById("noticias-title");
    expect(section).not.toBeNull();
    const cards = doc.querySelectorAll(".card-grid .card");
    expect(cards.length).toBeGreaterThanOrEqual(6);
  });

  test("has agenda semanal with tabs", () => {
    expect(doc.querySelector("[data-tabs]")).not.toBeNull();
    expect(doc.querySelectorAll(".tab-btn").length).toBeGreaterThanOrEqual(3);
  });

  test("has quick actions", () => {
    const actions = doc.querySelectorAll(".quick-action");
    expect(actions.length).toBe(4);
  });

  test("has sponsor strip with img tags", () => {
    const sponsors = doc.querySelector(".sponsor-logos");
    expect(sponsors).not.toBeNull();
    const imgs = sponsors.querySelectorAll("img");
    expect(imgs.length).toBeGreaterThanOrEqual(4);
    imgs.forEach((img) => {
      expect(img.getAttribute("alt")).toBeTruthy();
    });
  });

  test("has social stats strip", () => {
    const stats = doc.querySelectorAll(".social-stat");
    expect(stats.length).toBeGreaterThanOrEqual(5);
  });

  test("has efemérides card", () => {
    expect(doc.querySelector(".efemeride-card")).not.toBeNull();
  });

  test("external links have target=_blank", () => {
    const extLinks = doc.querySelectorAll('a[target="_blank"]');
    expect(extLinks.length).toBeGreaterThan(0);
    extLinks.forEach((link) => {
      expect(link.getAttribute("rel")).toContain("noopener");
    });
  });
});

describe("Contact page", () => {
  let doc;
  beforeAll(() => {
    doc = loadPage("contacto.html").window.document;
  });

  test("has contact form with required fields", () => {
    const form = doc.querySelector("form");
    expect(form).not.toBeNull();
    expect(doc.getElementById("c-nombre")).not.toBeNull();
    expect(doc.getElementById("c-email")).not.toBeNull();
    expect(doc.getElementById("c-asunto")).not.toBeNull();
    expect(doc.getElementById("c-msg")).not.toBeNull();
  });

  test("has subject dropdown with correct options", () => {
    const select = doc.getElementById("c-asunto");
    const options = select.querySelectorAll("option");
    const values = Array.from(options).map((o) => o.value);
    expect(values).toContain("general");
    expect(values).toContain("socios");
    expect(values).toContain("prensa");
    expect(values).toContain("sponsors");
    expect(values).toContain("otro");
  });

  test("has honeypot field", () => {
    const hp = doc.querySelector(".hp-field");
    expect(hp).not.toBeNull();
    expect(hp.getAttribute("aria-hidden")).toBe("true");
  });

  test("has WhatsApp and email channels", () => {
    const channels = doc.querySelectorAll(".contact-channel");
    expect(channels.length).toBeGreaterThanOrEqual(2);
    const html = doc.body.innerHTML;
    expect(html).toContain("5491153336237");
    expect(html).toContain("socios@sanlorenzo.com.ar");
  });

  test("has sede addresses", () => {
    const sedes = doc.querySelectorAll(".sede-card");
    expect(sedes.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Asociate page", () => {
  let doc;
  beforeAll(() => {
    doc = loadPage("socios/asociate.html").window.document;
  });

  test("has membership comparison table", () => {
    const table = doc.querySelector(".comparison-table table");
    expect(table).not.toBeNull();
  });

  test("has all 4 tiers", () => {
    const html = doc.body.innerHTML;
    expect(html).toContain("Simple");
    expect(html).toContain("Pleno/a");
    expect(html).toContain("Interior");
    expect(html).toContain("Exterior");
  });

  test("has Asociarme CTA buttons linking to external registration", () => {
    const links = doc.querySelectorAll('a[href*="casla.miclub.info/register"]');
    expect(links.length).toBe(4);
  });
});

describe("Entradas page", () => {
  let doc;
  beforeAll(() => {
    doc = loadPage("entradas/index.html").window.document;
  });

  test("has match list", () => {
    const matches = doc.querySelectorAll(".match-row");
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test("has ticket status badges", () => {
    expect(doc.querySelector(".ticket-status.on-sale")).not.toBeNull();
    expect(doc.querySelector(".ticket-status.coming-soon")).not.toBeNull();
  });

  test("has comprar button for on-sale matches", () => {
    const buyBtn = doc.querySelector(".match-row .btn-primary");
    expect(buyBtn).not.toBeNull();
    expect(buyBtn.textContent).toContain("Comprar");
  });
});

describe("Prensa page", () => {
  let doc;
  beforeAll(() => {
    doc = loadPage("prensa/acreditaciones.html").window.document;
  });

  test("has press form with required fields", () => {
    expect(doc.getElementById("p-nombre")).not.toBeNull();
    expect(doc.getElementById("p-medio")).not.toBeNull();
    expect(doc.getElementById("p-email")).not.toBeNull();
    expect(doc.getElementById("p-evento")).not.toBeNull();
  });

  test("has honeypot field", () => {
    expect(doc.querySelector(".hp-field")).not.toBeNull();
  });
});

describe("Search page", () => {
  test("has search input", () => {
    const { document } = loadPage("busqueda.html").window;
    const input = document.querySelector('input[type="search"]');
    expect(input).not.toBeNull();
    expect(input.getAttribute("placeholder")).toContain("sanlorenzo.com.ar");
  });

  test("has empty state message", () => {
    const { document } = loadPage("busqueda.html").window;
    expect(document.querySelector(".empty-state")).not.toBeNull();
  });
});

describe("404 page", () => {
  test("has error message and links", () => {
    const { document } = loadPage("404.html").window;
    const errPage = document.querySelector(".error-page");
    expect(errPage).not.toBeNull();
    expect(errPage.textContent).toContain("404");
    expect(errPage.textContent).toContain("no existe o fue movida");
    const homeLink = errPage.querySelector('a[href="index.html"]');
    expect(homeLink).not.toBeNull();
    const contactLink = errPage.querySelector('a[href="contacto.html"]');
    expect(contactLink).not.toBeNull();
  });
});

describe("CSS responsiveness", () => {
  test("CSS file exists and has mobile/tablet/desktop breakpoints", () => {
    const css = fs.readFileSync(path.join(BASE, "css/styles.css"), "utf-8");
    expect(css).toContain("min-width: 768px");
    expect(css).toContain("min-width: 1024px");
  });

  test("CSS has sticky header", () => {
    const css = fs.readFileSync(path.join(BASE, "css/styles.css"), "utf-8");
    expect(css).toContain("position: sticky");
  });

  test("CSS has grid layouts", () => {
    const css = fs.readFileSync(path.join(BASE, "css/styles.css"), "utf-8");
    expect(css).toContain("display: grid");
  });

  test("CSS has 44px minimum touch targets", () => {
    const css = fs.readFileSync(path.join(BASE, "css/styles.css"), "utf-8");
    expect(css).toContain("min-height: 44px");
    expect(css).toContain("min-width: 44px");
  });

  test("CSS hides desktop nav on mobile and shows hamburger", () => {
    const css = fs.readFileSync(path.join(BASE, "css/styles.css"), "utf-8");
    expect(css).toContain(".main-nav");
    expect(css).toContain("display: none");
    expect(css).toContain(".nav-toggle");
  });
});

describe("Brand & content integration", () => {
  test("uses San Lorenzo brand colors", () => {
    const css = fs.readFileSync(path.join(BASE, "css/styles.css"), "utf-8");
    expect(css).toContain("#003DA5");
    expect(css).toContain("#C8102E");
  });

  test("home page has club name", () => {
    const html = fs.readFileSync(path.join(BASE, "index.html"), "utf-8");
    expect(html).toContain("San Lorenzo");
    expect(html).toContain("CASLA");
  });

  test("all pages have copyright 2026", () => {
    for (const page of allPages) {
      const html = fs.readFileSync(path.join(BASE, page), "utf-8");
      expect(html).toContain("2026");
    }
  });
});
