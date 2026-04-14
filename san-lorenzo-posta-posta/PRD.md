# sanlorenzo.com.ar Redesign — Product Requirements Document

## 1. Overview

This document defines the product requirements for a redesign of the official Club Atlético San Lorenzo de Almagro (CASLA) website at sanlorenzo.com.ar. The redesign aims to modernize the fan experience, simplify navigation, improve mobile usability, and strengthen key conversion paths (membership sign-ups, ticket sales, merchandise).

The current site is a content-rich portal with 100+ pages spanning football, basketball, 20+ other sports, institutional information, multimedia, and membership services. While comprehensive, it suffers from structural complexity, inconsistent presentation, and gaps in interactive functionality. The redesign preserves all existing content categories while reorganizing them around clearer user journeys.

---

## 2. Current Site Analysis

### 2.1 Current Site Map

The existing site is organized under eight top-level navigation categories:

```
sanlorenzo.com.ar
├── Club (23 subpages)
│   ├── Autoridades, Historia, Camisetas
│   ├── El Nuevo Gasómetro, El Viejo Gasómetro, La Vuelta a Boedo
│   ├── Himno, Estatuto, Sedes (4 locations), Socios, Peñas
│   ├── Balances y Presupuestos, Institucional (noticias)
│   ├── Elecciones 2026, Obras e infraestructura
│   ├── CASLA Social, Colonia, Cultura, Marketing
│   ├── Ciclón de Beneficios (external), Recursos Humanos
│   └── Punto de acceso a la Justicia (/denuncias), Defensoría del Pueblo Sanlorencista
├── Fútbol
│   ├── Profesional → Noticias, Plantel, Títulos, Jugadores Históricos, Números Históricos
│   ├── Amateur → Reserva, Inferiores, Cuarta–Novena, Infantiles, Staff, Escuelita, Fútbol Recreativo, Revista
│   ├── Femenino → Información, Plantel, Noticias
│   └── Senior → Noticias
├── Basquet → Noticias, Plantel, Historia, Títulos
├── Más Deportes (20 disciplines)
│   ├── Futsal (M/F), eSports, Vóley (M/F), Handball (M/F)
│   ├── Tenis, Hockey Césped, Hockey Patines, Patín Artístico
│   ├── Natación, Artes Marciales, Gimnasia Rítmica, Boxeo
│   ├── Fitness y Musculación, Tenis de Mesa, Atletismo, Otros
│   └── Fútbol Senior (duplicate link)
├── Prensa → Acreditaciones, Medios Partidarios
├── Multimedia → Galerías de Fotos, Videos, CASLA Revista, Cuervitos
├── Entretenimiento → Cría Cuervos (kids games)
└── Enciclonpedia → Diccionario CASLA, Jugadores Históricos, Números Históricos, Títulos
```

### 2.2 Homepage Content Blocks (Current)

| Block | Description |
|---|---|
| Hero banner | Featured news article with full-bleed image and headline |
| Secondary news grid | 4–5 news cards (Fútbol, Institucionales, Socios) in mixed layout |
| Agenda Semanal | Tabbed weekly schedule (Fútbol / Más Deportes) with horizontal scroll |
| Mi CASLA | Horizontal carousel of member-service CTAs (Registrate, Asociate, Pagá la cuota, Débito Automático, Pagá tu actividad) |
| CASLA TV | Video carousel pulling from YouTube channel |
| Galerías de Fotos | Photo gallery carousel of match-day albums (Flickr-hosted) |
| #VamosCiclon | Social media stats bar (Facebook 1M, Twitter 806K, Instagram 772K, YouTube 62K, TikTok 433K, WhatsApp 103K, Peñas 152, Socios 89K) |
| Efemérides | "Un día como hoy" historical events carousel |
| Más en CASLA | Carousel of institutional links (Vuelta a Boedo, Beneficios, Sueño Azulgrana, Enciclonpedia, Jugadores Históricos, Peñas, Chat Facebook, Cría Cuervos) |
| Sedes | Contact cards for 4 physical locations with addresses and hours |
| Sponsor strip | Sponsor Técnico, Main Sponsor, Sponsors Oficiales, Proveedores Oficiales |
| Footer | Club crest, WhatsApp, email, quick links, full sitemap, copyright |

### 2.3 Identified Deficiencies

| # | Category | Issue |
|---|---|---|
| D1 | Navigation | Menu has 8 top-level items with up to 23 children per section. Finding a specific page requires navigating a dense mega-menu. No visible search bar. |
| D2 | Mobile experience | Navigation relies on wide mega-menu panels that are hard to use on small screens. |
| D3 | Image loading | Many images use 4×3px transparent placeholders with lazy loading. If JavaScript fails or loads slowly, content sections display blank areas with no meaningful fallback. |
| D4 | Content duplication | Several pages appear in multiple menu locations (e.g., Jugadores Históricos under Fútbol Profesional and Enciclonpedia; Fútbol Senior under Fútbol and Más Deportes; Números Históricos under Fútbol Profesional and Enciclonpedia). |
| D5 | Contact / support | No general contact form exists. The only contact channels are a WhatsApp number and a socios@ email address embedded in the footer. No dedicated "Contact Us" page. |
| D6 | Ticket purchasing | Ticket sales rely on news articles with inline instructions rather than a dedicated, permanent ticket-purchase flow or page. |
| D7 | Search | No site-wide search functionality. Users must browse menus or scroll news feeds to find content. |
| D8 | Inconsistent templates | Copyright shows "© 2024" on the Asociate page (which also uses the older `membrete.svg` asset) while the homepage and Sedes page show "© 2026" (with `membrete-v2026.svg`). This confirms that inner pages use divergent template fragments rather than a shared layout. |
| D9 | Sponsor images | Sponsor logos use `px.gif` transparent pixels as `src`, relying on CSS `background-image` or lazy load. This breaks if styles fail and provides no alt text or fallback. |
| D10 | Accessibility | No visible skip-navigation links, no language toggle, and alt text is missing or generic on many images. |
| D11 | Ephemeral content mixed with permanent | "Elecciones 2026" sits alongside permanent pages like "Historia" in the Club menu, creating clutter once the event passes. |
| D12 | External redirects without indication | "Ciclón de Beneficios" and "Tienda Online" link to external domains (ciclondebeneficios.com.ar, soycuervo.com) without any visual indicator. |
| D13 | Inconsistent navigation across pages | The Club submenu differs between inner pages. For example, the Asociate page omits "Elecciones 2026" and "Defensoría del Pueblo Sanlorencista" while the Sedes page includes them. This means different pages render different navigation menus. |

---

## 3. Target Audience

### 3.1 Persona: El Hincha (The Fan)

| Attribute | Detail |
|---|---|
| Age range | 18–45 |
| Location | Buenos Aires metro area, with significant presence in Argentine provinces and international diaspora |
| Primary goal | Follow match results, news, upcoming fixtures, and buy tickets |
| Secondary goal | Watch highlights, browse photo galleries, share content on social media |
| Device | Predominantly mobile (estimated 70%+) |
| Language | Spanish (Argentine) |
| Key frustration | Cannot quickly find match schedule, ticket info, or latest score |

### 3.2 Persona: El/La Socia/o (The Member)

| Attribute | Detail |
|---|---|
| Age range | 25–60 |
| Location | Buenos Aires metro area primarily; Interior and Exterior members also |
| Primary goal | Pay monthly dues, manage membership, access member benefits |
| Secondary goal | Sign up for sports activities, check sede hours, access Ciclón de Beneficios |
| Device | Mobile and desktop |
| Key frustration | Membership management (Mi CASLA) requires multiple clicks and redirects to external service |

### 3.3 Persona: El Periodista (Press / Media)

| Attribute | Detail |
|---|---|
| Age range | 25–55 |
| Primary goal | Access press accreditations, download high-res photos, find contact info |
| Device | Desktop |
| Key frustration | Photo galleries use lazy-loaded thumbnails with no direct download option |

### 3.4 Persona: El Sponsor / Partner

| Attribute | Detail |
|---|---|
| Primary goal | Verify brand visibility, access marketing/partnership information |
| Key frustration | No dedicated partnerships or sponsorship inquiry page |

---

## 4. Business Goals

| # | Goal | Success Metric |
|---|---|---|
| BG1 | Increase new membership sign-ups through the website | 20% increase in online membership registrations within 6 months of launch |
| BG2 | Reduce bounce rate on mobile devices | Bounce rate below 45% on mobile (measure via analytics) |
| BG3 | Centralize ticket sales into a dedicated, always-available flow | At least 60% of ticket transactions originate from the website's ticket page |
| BG4 | Increase engagement with multimedia content | Average session duration above 3 minutes |
| BG5 | Improve sponsor visibility and satisfaction | All sponsor logos load visibly on first page render without requiring JavaScript |
| BG6 | Strengthen institutional transparency | Balances, estatuto, and election info accessible within 2 clicks from homepage |

---

## 5. Redesign Scope — Pages and Sections

The redesign consolidates the current 100+ page structure into a cleaner information architecture. The following table lists every page and section included.

### 5.1 Proposed Site Map

```
sanlorenzo.com.ar (Redesign)
│
├── Inicio (Home)
│
├── Club
│   ├── Historia
│   ├── Autoridades
│   ├── Sedes (with embedded map and hours for all 4 locations)
│   ├── Himno
│   ├── Estatuto
│   ├── Balances y Presupuestos
│   ├── Camisetas
│   ├── El Nuevo Gasómetro
│   ├── El Viejo Gasómetro
│   ├── La Vuelta a Boedo
│   ├── Obras e Infraestructura
│   ├── Noticias Institucionales
│   └── CASLA Social
│
├── Fútbol
│   ├── Profesional
│   │   ├── Noticias
│   │   ├── Plantel y Cuerpo Técnico
│   │   ├── Títulos
│   │   ├── Jugadores Históricos
│   │   └── Números Históricos
│   ├── Amateur / Inferiores
│   │   ├── Noticias
│   │   ├── Categorías (Reserva, 4ta–9na, Infantiles)
│   │   ├── Staff
│   │   └── Escuela de Fútbol
│   ├── Femenino
│   │   ├── Noticias
│   │   ├── Plantel
│   │   └── Información
│   └── Senior → Noticias
│
├── Básquet
│   ├── Noticias
│   ├── Plantel y Cuerpo Técnico
│   ├── Historia
│   └── Títulos
│
├── Más Deportes
│   └── One page per discipline (20 disciplines, same as current)
│
├── Socios (elevated from sub-section to top-level)
│   ├── Asociate (membership sign-up with plan comparison)
│   ├── Mi CASLA (member portal — pay dues, manage account)
│   ├── Peñas
│   ├── Ciclón de Beneficios (link to external, marked as external)
│   └── Colonia
│
├── Entradas (Tickets — new dedicated section)
│   ├── Próximos Partidos (with buy/reserve CTA per match)
│   └── Abonos
│
├── Multimedia
│   ├── Galerías de Fotos
│   ├── Videos (CASLA TV)
│   ├── CASLA Revista
│   └── Cuervitos
│
├── Enciclonpedia
│   ├── Diccionario CASLA
│   ├── Jugadores Históricos
│   ├── Números Históricos
│   └── Títulos
│
├── Prensa
│   ├── Acreditaciones
│   └── Medios Partidarios
│
├── Contacto (new page)
│
├── Tienda (external link to soycuervo.com, clearly marked)
│
└── Búsqueda (site-wide search results page)
```

### 5.2 Page Specifications

#### 5.2.1 Inicio (Home)

| Section | Content | Priority |
|---|---|---|
| Hero | Full-width featured-news slider (max 3 slides, auto-rotate every 8 seconds, pause on hover). Each slide: background image, category badge, headline, summary, CTA link. | Must have |
| Próximo Partido | Countdown widget showing next match: opponent crest, competition name, date/time, venue, "Comprar Entradas" button linking to /entradas. | Must have |
| Noticias Destacadas | Grid of 6 latest news cards (thumbnail, category tag, headline, date). "Ver todas" link to /futbol-profesional/noticias. | Must have |
| Agenda Semanal | Tabbed schedule (Fútbol / Básquet / Más Deportes). Each entry: date, opponent, competition, time. | Must have |
| Mi CASLA Quick Actions | Row of 4 CTA buttons: Asociate, Pagá la Cuota, Entradas, Tienda. | Must have |
| CASLA TV | Horizontal carousel of latest 8 videos (YouTube embeds open in lightbox). | Should have |
| Galerías | Horizontal carousel of latest 6 photo albums. | Should have |
| Redes Sociales | Social stats strip with live follower counts and links. | Should have |
| Efemérides | "Un día como hoy" single-card component. | Nice to have |
| Sponsors | Sponsor strip: logos load as real `<img>` tags with alt text. Grouped by tier. | Must have |

#### 5.2.2 Club Section

Each page renders as a content page with a sidebar navigation listing all Club sub-pages.

- **Historia**: Interactive timeline (year-by-year scrollable view with decade quick-jump). Existing year-by-year data must be preserved.
- **Autoridades**: Current board members with name, role, and photo.
- **Sedes**: Cards for each of the 4 physical locations (Boedo, Ciudad Deportiva, Administrativa, Centro de Atención Boedo) showing address, phone, hours, and embedded map (Google Maps or OpenStreetMap). A fifth card links to the Mi CASLA virtual sede.
- **Himno**: Lyrics text with optional audio player (play/pause control).
- **Estatuto**: PDF viewer or downloadable PDF link.
- **Balances y Presupuestos**: List of downloadable PDFs by year.
- **Camisetas**: Gallery of current and historical jerseys.
- **El Nuevo Gasómetro / El Viejo Gasómetro**: Long-form article pages with photos.
- **La Vuelta a Boedo**: Long-form article with embedded timeline of milestones.
- **Obras e Infraestructura**: Progress updates with photos and descriptions.
- **Noticias Institucionales**: Paginated news list filtered to institutional category.
- **CASLA Social**: Community and social responsibility programs.

#### 5.2.3 Fútbol Section

- **Profesional > Plantel**: Player grid. Each card: photo, number, name, position. Click opens player profile page with bio and stats.
- **Profesional > Noticias**: Paginated news list. Each card: thumbnail, date, headline, excerpt.
- **Profesional > Títulos**: Visual timeline of championships won.
- **Profesional > Jugadores Históricos**: Card grid of historical legends with name, photo, years, and link to detail.
- **Profesional > Números Históricos**: Statistical records in sortable tables.
- **Amateur/Inferiores**: Combined landing page for all youth categories with news feed and roster links per division.
- **Femenino**: Dedicated sub-section following same structure as Profesional (Noticias, Plantel, Info).
- **Senior**: Simple news-feed page.

#### 5.2.4 Básquet Section

Same structure as Fútbol Profesional: Noticias, Plantel, Historia, Títulos.

#### 5.2.5 Más Deportes Section

Landing page listing all 20 disciplines as cards (icon, name, brief description). Each card links to a discipline-specific news/info page.

#### 5.2.6 Socios Section

- **Asociate**: Membership plan comparison page. The current site lists four tiers — Socia/o Simple, Socia/o Plena/o, Socia/o Interior, and Socia/o Exterior — each with monthly pricing and a benefits description. The redesign must present these as a comparison table with tier name, monthly price, included benefits (checkmarks), and a per-tier "Asociarme" CTA button. Pricing is adjusted bimonthly by IPC and will be CMS-managed.
- **Mi CASLA**: Embed or deep link to the member portal (casla.miclub.info). If embedded, wrap in an iframe with fallback link.
- **Peñas**: Searchable/filterable directory of fan clubs worldwide.
- **Ciclón de Beneficios**: External link to ciclondebeneficios.com.ar, displayed with external-link icon.
- **Colonia**: Information page with schedules, pricing, and registration CTA.

#### 5.2.7 Entradas (Tickets) — New Section

| Element | Specification |
|---|---|
| Match list | List of upcoming home matches: date, opponent, competition, venue, ticket status (On Sale / Coming Soon / Sold Out). |
| Buy CTA | Each match row has a "Comprar" button that links to the ticketing provider or opens inline purchase flow. |
| Abonos | Season-pass information with pricing tiers and purchase CTA. |
| Info block | Seating map of Estadio Pedro Bidegain, entry rules, FAQs. |

#### 5.2.8 Multimedia Section

- **Galerías de Fotos**: Filterable gallery index (by competition, date). Click opens lightbox slideshow with swipe support.
- **Videos**: Video grid pulling from club YouTube channel. Click opens embedded player in lightbox.
- **CASLA Revista**: Digital magazine archive with cover thumbnails and read/download links.
- **Cuervitos**: Kids content section with illustrations and interactive elements.

#### 5.2.9 Enciclonpedia Section

- **Diccionario CASLA**: A-Z glossary of club terms.
- **Jugadores Históricos**: Card grid with search/filter by name, position, or decade.
- **Números Históricos**: Statistical tables with sortable columns.
- **Títulos**: Visual timeline of all titles won across all sports.

#### 5.2.10 Prensa Section

- **Acreditaciones**: Press credential request form (Name, Outlet, Email, Event, Message). Submit via POST endpoint or email integration.
- **Medios Partidarios**: Directory of approved fan media outlets.

#### 5.2.11 Contacto — New Page

| Element | Specification |
|---|---|
| Contact form | Fields: Name (text, required, max 100 chars), Email (email, required), Subject (dropdown: General, Socios, Prensa, Sponsors, Otro), Message (textarea, required, max 2000 chars). Submit button labeled "Enviar". |
| Confirmation | On successful submission, display inline success message: "¡Gracias! Tu mensaje fue enviado. Te responderemos a la brevedad." |
| Validation | Client-side validation for required fields and email format. Server-side validation strips HTML from all inputs. |
| Alternative channels | Below the form: WhatsApp link (5491153336237), email (socios@sanlorenzo.com.ar), and phone number. |
| Sede addresses | Repeated from Sedes page in compact format. |

#### 5.2.12 Búsqueda (Search) — New Feature

| Element | Specification |
|---|---|
| Search input | Visible search icon in the global header. Click expands an input field with placeholder "Buscá en sanlorenzo.com.ar". |
| Results page | `/busqueda?q=<query>` displays paginated results (10 per page). Each result shows: page title, URL, and content excerpt with highlighted query terms. |
| Scope | Indexes all news articles, player profiles, institutional pages, and multimedia titles. |
| No results | Displays message: "No encontramos resultados para '<query>'. Probá con otros términos." |

---

## 6. Functional Requirements

### 6.1 Navigation

| ID | Requirement |
|---|---|
| NAV-1 | The global navigation bar is fixed at the top of the viewport on scroll (sticky header). |
| NAV-2 | On desktop (≥1024px), the navigation displays top-level items horizontally. Hover reveals a dropdown panel for sections with children. |
| NAV-3 | On mobile (<1024px), the navigation collapses into a hamburger menu. Tapping opens a full-screen slide-out panel with expandable accordion sections. |
| NAV-4 | The header always shows: Club crest (links to home), navigation items, search icon, "Asociate" CTA button, and "Mi CASLA" link. |
| NAV-5 | A breadcrumb trail is displayed below the header on all inner pages (e.g., Inicio > Fútbol > Profesional > Plantel). |
| NAV-6 | The footer contains a full sitemap organized by section, contact info, social media links, and sponsor logos. |
| NAV-7 | All links to external domains (soycuervo.com, ciclondebeneficios.com.ar, adn.sanlorenzo.com.ar) open in a new tab and display an external-link icon. |

### 6.2 Contact Forms

| ID | Requirement |
|---|---|
| FORM-1 | The Contacto page (§5.2.11) has a general inquiry form with fields: Name, Email, Subject, Message. |
| FORM-2 | The Prensa > Acreditaciones page has a press credential request form with fields: Name, Media Outlet, Email, Event, Message. |
| FORM-3 | All form submissions are validated client-side (required fields, email format) and server-side (HTML stripping, length limits). |
| FORM-4 | On submission, the form displays a success message inline without a full page reload. If the server returns an error, the form displays an error message: "Hubo un problema al enviar tu mensaje. Intentá de nuevo." |
| FORM-5 | Forms include a honeypot field (hidden, must remain empty) to deter basic spam bots. |

### 6.3 Media Galleries

| ID | Requirement |
|---|---|
| MEDIA-1 | Photo galleries display a grid of thumbnails (4 columns on desktop, 2 on mobile). Clicking a thumbnail opens a lightbox overlay with full-size image, left/right navigation arrows, and a close button. |
| MEDIA-2 | The lightbox supports keyboard navigation: left/right arrows to navigate, Escape to close. |
| MEDIA-3 | The lightbox supports touch swipe gestures on mobile for left/right navigation. |
| MEDIA-4 | Video items embed YouTube players in a responsive 16:9 container. Videos open in a lightbox on the index page; on the video detail page they render inline. |
| MEDIA-5 | Gallery index pages support filtering by competition/category and pagination (12 items per page). |
| MEDIA-6 | All images use real `<img>` tags with meaningful `alt` text. No transparent-pixel `src` placeholder hacks. |

### 6.4 Membership and Ticketing

| ID | Requirement |
|---|---|
| MEMBER-1 | The Asociate page displays all membership tiers in a comparison table: tier name, monthly price, included benefits (checkmarks), and a "Asociarme" button per tier. |
| MEMBER-2 | The "Asociarme" button links to the external registration flow at casla.miclub.info/register.php. |
| MEMBER-3 | The Entradas page lists upcoming home matches with ticket status and purchase links. |
| MEMBER-4 | When tickets are on sale, the homepage Próximo Partido widget displays a prominent "Comprar Entradas" button. When tickets are not yet available, the button reads "Próximamente" and is disabled. |

### 6.5 Search

| ID | Requirement |
|---|---|
| SEARCH-1 | A search icon is visible in the global header on all pages. |
| SEARCH-2 | Clicking the search icon reveals a text input overlay or expands inline. Pressing Enter or a search button navigates to `/busqueda?q=<query>`. |
| SEARCH-3 | The results page shows title, URL path, and a text excerpt per result, paginated at 10 results per page. |
| SEARCH-4 | Searches with no results display a user-friendly empty-state message. |

### 6.6 Responsive Design

| ID | Requirement |
|---|---|
| RESP-1 | The site is fully responsive across three breakpoints: mobile (<768px), tablet (768–1023px), desktop (≥1024px). |
| RESP-2 | All content is accessible and readable without horizontal scrolling at any breakpoint. |
| RESP-3 | Touch targets (buttons, links) are at least 44×44px on mobile. |

### 6.7 Performance

| ID | Requirement |
|---|---|
| PERF-1 | The homepage achieves a Lighthouse Performance score of at least 70 on mobile. |
| PERF-2 | Images are served in modern formats (WebP with JPEG fallback) and use responsive `srcset` attributes. |
| PERF-3 | CSS and JavaScript bundles are minified and code-split so that pages load only what they need. |

### 6.8 Accessibility

| ID | Requirement |
|---|---|
| A11Y-1 | The site meets WCAG 2.1 Level AA compliance. |
| A11Y-2 | All images have descriptive `alt` attributes. Decorative images use `alt=""`. |
| A11Y-3 | A "Skip to main content" link is the first focusable element on every page. |
| A11Y-4 | Color contrast ratios meet at minimum 4.5:1 for body text and 3:1 for large text. |
| A11Y-5 | All interactive elements are reachable and operable via keyboard. |

### 6.9 Internationalization

| ID | Requirement |
|---|---|
| I18N-1 | All site content is in Spanish (Argentine Spanish). No multi-language support is required at launch. |
| I18N-2 | The Asociate > Exterior page includes a brief English-language summary and a "Become a Member" CTA, as the current site already does. |

---

## 7. Edge Cases

| Scenario | Expected Behavior |
|---|---|
| News feed is empty | Display message: "No hay noticias disponibles en este momento." |
| No upcoming matches in Entradas | Display message: "No hay partidos programados. ¡Volvé pronto!" Disable ticket CTA on homepage widget. |
| Photo gallery has 0 images | Display message: "Esta galería aún no tiene fotos." |
| Search query is empty string | Redirect to homepage or display prompt: "Ingresá un término para buscar." |
| Search query returns 0 results | Display: "No encontramos resultados para '<query>'. Probá con otros términos." |
| External service (Mi CASLA) is down | Display message with fallback: "El servicio no está disponible en este momento. Podés comunicarte por WhatsApp al 5333-6237." |
| Contact form submitted with all fields empty | Client-side validation prevents submission and highlights empty required fields in red. |
| User accesses a removed/old URL | Return a styled 404 page with club branding, message "Esta página no existe o fue movida", and links to Home and Contacto. |
| Sponsor logo image fails to load | The `<img>` tag shows the sponsor name via `alt` text. Layout does not collapse. |
| JavaScript fails to load | Navigation remains usable (hamburger menu degrades to a plain link list). Hero slider shows the first slide as a static image. Forms submit via standard POST without AJAX. |

---

## 8. Out of Scope

The following are explicitly **not** part of this redesign:

- **User authentication or login system** — membership management is delegated to the external Mi CASLA platform.
- **E-commerce / in-site merchandise checkout** — the Tienda links to the external soycuervo.com shop.
- **In-site ticket purchase processing** — the Entradas section links to the existing ticketing provider.
- **Live match scores or real-time data feeds** — match data is manually updated via CMS.
- **Native mobile application** — the redesign targets mobile browsers only.
- **CMS selection or backend architecture** — this PRD defines the front-end experience. Backend/CMS decisions belong to the engineering team.
- **Content migration** — the volume of historical articles, galleries, and player data requires a separate migration plan.
- **Analytics implementation** — tracking setup (Google Analytics, Meta Pixel, etc.) will be defined in a separate document.
- **SEO audit and optimization** — keyword strategy and meta-tag standards will be addressed in a follow-up task.
- **Hosting and infrastructure** — deployment to Nuthost or alternative providers is outside this scope.

---

## 9. Open Questions

These items require input from the stakeholder or engineering team before implementation begins:

1. **Ticket provider integration**: Does the club use a specific ticketing platform (e.g., Ticketek, Passline)? The Entradas page design depends on whether links go to an external provider or if an API-based embed is possible.
2. **CMS platform**: The current site appears to be a custom-built CMS (developed by Naxela). Should the redesign continue on this platform, migrate to a headless CMS, or use a different solution? This is flagged as an engineering decision.
3. **Mi CASLA portal**: The member portal at casla.miclub.info is a third-party service. Should the redesign attempt to visually integrate it (iframe embed with matching styles) or simply link to it?
4. **YouTube integration**: CASLA TV currently shows videos from the club YouTube channel. Should the redesign use the YouTube Data API for automatic feed updates, or continue with manually curated video lists?
5. **Photo hosting**: Gallery photos currently appear to be hosted on Flickr (contenidos1.sanlorenzo.com.ar). Should the redesign self-host images, continue with the CDN, or migrate to a different media service?
6. **Search implementation**: Should search use a client-side index (e.g., Algolia, Lunr.js) or a server-side full-text engine? This depends on CMS choice.
7. **Accessibility audit scope**: Should the WCAG 2.1 AA requirement apply only to the redesigned pages, or should legacy content (unchanged articles) also be audited?
8. **ADN San Lorenzo**: The current site links to adn.sanlorenzo.com.ar. What is this product and should it be incorporated into the redesign or remain a separate platform?

---

## 10. Approval

This PRD must be reviewed and approved before design or development work begins. Approval indicates agreement on:

- The scope of pages and sections listed in §5
- The functional requirements in §6
- The business goals and success metrics in §4
- The items marked as out-of-scope in §8

| Role | Name | Status | Date |
|---|---|---|---|
| Product Owner | — | Pending | — |
| Tech Lead | — | Pending | — |
| Design Lead | — | Pending | — |
