# San Lorenzo de Almagro — Sitio Oficial (Rediseño)

Implementación HTML/CSS del rediseño del sitio oficial de sanlorenzo.com.ar según el PRD aprobado.

## Estructura

```
san-lorenzo-posta-posta/
├── index.html                   # Página de inicio
├── contacto.html                # Formulario de contacto
├── busqueda.html                # Resultados de búsqueda
├── 404.html                     # Página de error
├── css/
│   └── styles.css               # Hoja de estilos global (responsive)
├── js/
│   └── main.js                  # JavaScript (mobile nav, tabs, forms)
├── images/                      # Placeholder SVG assets
├── club/                        # 13 páginas del club
├── futbol/
│   ├── profesional/             # 5 páginas
│   ├── femenino/                # 3 páginas
│   ├── amateur.html
│   └── senior.html
├── basquet/                     # 4 páginas
├── mas-deportes/                # 1 página (20 disciplinas)
├── socios/                      # 4 páginas
├── entradas/                    # 2 páginas
├── multimedia/                  # 4 páginas
├── enciclonpedia/               # 4 páginas
├── prensa/                      # 2 páginas
└── test/
    └── site.test.js             # 379 automated tests
```

## Tech Stack

- **HTML5** — Semantic, accessible markup (WCAG 2.1 AA)
- **CSS3** — Custom properties, Grid, Flexbox, responsive breakpoints
- **Vanilla JavaScript** — No frameworks, progressive enhancement
- **Testing** — Jest + JSDOM + html-validate

## Breakpoints

| Breakpoint | Width |
|---|---|
| Mobile | < 768px |
| Tablet | 768px – 1023px |
| Desktop | ≥ 1024px |

## Running Tests

```bash
npm install
npm test           # Jest tests (379 tests)
npm run validate   # HTML validation
```

## Pages (48 total)

All pages defined in PRD §5 are implemented, including:
- Home with hero, próximo partido, noticias, agenda, CASLA TV, galerías, sponsors
- 13 Club sub-pages with sidebar navigation
- Fútbol (profesional, amateur, femenino, senior)
- Básquet (noticias, plantel, historia, títulos)
- Más Deportes (20 disciplines)
- Socios (asociate with comparison table, Mi CASLA, peñas, colonia)
- Entradas (match list with ticket status, abonos)
- Multimedia (galerías, videos, revista, cuervitos)
- Enciclonpedia (diccionario, jugadores históricos, números, títulos)
- Prensa (acreditaciones form, medios partidarios)
- Contacto (form with honeypot, alternative channels, sede addresses)
- Búsqueda (search input with empty state)
- 404 error page
