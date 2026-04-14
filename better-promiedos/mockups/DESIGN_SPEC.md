# Better Promiedos — UI Design Specification

> Companion document for the HTML/CSS mockups in this directory.

---

## 1. Mockup Overview

The mockup file `index.html` + `styles.css` is a self-contained, high-fidelity HTML/CSS prototype covering the four core sections specified in the product spec:

| Section | Location in Mockup | Description |
|---|---|---|
| **Fixtures** | First panel (Fecha 8 — Apertura) | Upcoming matches with date/time, TV networks, team crests, plus one live match example |
| **Past Scores** | Second panel (Fecha 7 — Apertura) | Completed matches with final scores and goal scorer details |
| **League Table** | Third panel (POSICIONES) | Full 28-team standings with all statistical columns, zone indicators |
| **Top Goalscorers** | Fourth panel (GOLEADORES — Apertura) | Ranked list of 10 scorers with team crests and goal counts |

The mockup also includes the full page chrome (header, sidebar navigation, league tabs, footer) to demonstrate the complete visual system.

---

## 2. Design Tokens

All design tokens are defined as CSS custom properties in `styles.css` at `:root`. They map directly to the product spec §2.

### 2.1 Color Palette

| Token | Value | Role |
|---|---|---|
| `--bg-page` | `#1a1a2e` | Page background (dark navy/charcoal) |
| `--bg-card` | `#16213e` | Card/panel backgrounds |
| `--bg-sidebar` | `#0f3460` | Sidebar navigation |
| `--bg-header` | `#0a0a23` | Sticky top header bar |
| `--accent-primary` | `#e94560` | Live indicators, active states |
| `--accent-secondary` | `#53d8fb` | Links, hover states, points column |
| `--text-primary` | `#ffffff` | Headings, team names, scores |
| `--text-secondary` | `#a0a0b0` | Dates, metadata, table headers |
| `--row-alt` | `rgba(255,255,255,0.03)` | Zebra striping |
| `--divider` | `rgba(255,255,255,0.08)` | Row/section separators |
| `--zone-lib` | `#4caf50` | Libertadores qualification (green) |
| `--zone-sud` | `#53d8fb` | Sudamericana qualification (blue) |
| `--zone-rel` | `#f44336` | Relegation zone (red) |
| `--win` | `#4caf50` | Positive goal difference |
| `--loss` | `#f44336` | Negative goal difference |

### 2.2 Typography

| Element | Properties |
|---|---|
| Body default | System sans-serif stack, 400 weight, 14px |
| Page title (H1) | 22px, 700 weight |
| Section headers | 13px, 700 weight, uppercase |
| Team names | 14px, 600 weight |
| Score digits | 18px (desktop) / 16px (mobile), 700 weight |
| Table headers | 11px, 600 weight, uppercase |
| Table cells | 13px, 400 weight |
| Metadata | 12px, 400 weight |
| Navigation links | 13px, 500 weight |

---

## 3. Responsive Breakpoints

| Breakpoint | Layout Behavior |
|---|---|
| **≥1024px (Desktop)** | Sidebar visible (220px left). Main content fills remaining width, max 900px centered. Header shows inline navigation links. |
| **<1024px (Tablet/Mobile)** | Sidebar becomes off-canvas drawer (hamburger toggle). Main content is full-width. Reduced padding on fixture rows and table cells. Scorer team name hidden to save space. |
| **<480px (Small Mobile)** | Further reduction: smaller typography, tighter table cells, horizontally scrollable tabs. Crests shrink to 20px. |

---

## 4. Section Details

### 4.1 Fixtures Panel

- **Round navigation**: Centered `◄ Fecha N — [Torneo] ►` with arrow buttons.
- **Match rows**: Three-column layout — home team (right-aligned with crest), center (date/time + TV logo), away team (left-aligned with crest).
- **Upcoming matches**: Show date label (`Sáb 19/04`) + time (`16:00`) + TV network logo.
- **Live match**: Red pulsing dot + minute counter. Score displayed in large bold text. Row gets subtle red-tinted background (`rgba(233,69,96,0.06)`).
- **TV logos**: Use actual promiedos API URLs: `https://api.promiedos.com.ar/images/tvnetworks/{networkId}`.

### 4.2 Past Scores Panel

- Same row structure as fixtures but centered score replaces the date/time.
- Goal scorers listed below each match row in a `fixture-scorers` div, split left (home) and right (away).
- All matches show `fixture-row--finished` state.

### 4.3 League Table (POSICIONES)

- Full 28-team table with columns: `#`, `Equipo`, `PJ`, `PG`, `PE`, `PP`, `GF`, `GC`, `Dif`, `Pts`.
- Team column includes crest image (18×18px) from `https://api.promiedos.com.ar/images/team/{id}/1`.
- Zone indicators via `box-shadow: inset 3px 0 0` on the first cell:
  - Green (`#4caf50`): Libertadores (rows 1–4)
  - Cyan (`#53d8fb`): Sudamericana (rows 5–6)
  - Red (`#f44336`): Relegation (rows 26–28)
- Points column highlighted in `--accent-secondary` (cyan).
- Positive goal difference in green, negative in red.
- Legend displayed below the table.
- Horizontally scrollable on mobile.

### 4.4 Top Goalscorers (GOLEADORES)

- Ranked list with: rank number, team crest (18px), player name, team name, goal count.
- Goals displayed in large cyan text (`--accent-secondary`).
- "VER MÁS" button at bottom for expansion.
- On mobile, team name is hidden to save horizontal space.

---

## 5. Betting Content Exclusions

Per product spec §9, the following elements are **not present** in any mockup:

- ❌ No odds or "favorito a ganar" data
- ❌ No bookmaker logos
- ❌ No gambling disclaimer banners
- ❌ No "Consultá acá" betting CTAs
- ❌ No adsage.io tracking pixels
- ❌ No betting operator branding or sponsored sections

The footer displays only data attribution (Opta) and the site identity.

---

## 6. Accessibility Notes

- All interactive elements have `:focus-visible` outline (2px cyan).
- Fixture rows use semantic `<a>` tags with descriptive `aria-label` attributes.
- Standings table is wrapped in `role="region"` with `aria-label` and is keyboard-scrollable (`tabindex="0"`).
- League tabs use `role="tablist"` / `role="tab"` + `aria-selected`.
- Live match dot has CSS animation with `prefers-reduced-motion` consideration (can be extended).
- Color contrast ratios: White text (#fff) on dark navy (#1a1a2e) ≈ 14.5:1 (AAA). Secondary text (#a0a0b0) on card (#16213e) ≈ 5.8:1 (AA). Accent cyan (#53d8fb) on card (#16213e) ≈ 8.2:1 (AAA).
- Hamburger button includes `aria-label` and `aria-expanded` state.

---

## 7. Asset References

All team crest images reference the live promiedos API using the pattern documented in PRODUCT_SPEC.md §7:

```
Team crests:  https://api.promiedos.com.ar/images/team/{teamId}/1
Country flags: https://api.promiedos.com.ar/images/country/{code}/1
TV networks:  https://api.promiedos.com.ar/images/tvnetworks/{networkId}
Logo:         https://www.promiedos.com.ar/assets/header/logo_white.webp
Opta logo:    https://www.promiedos.com.ar/assets/opta-wht.png
```

Teams used in the mockup (all from Appendix A of the product spec):

| Team | ID | Used in |
|---|---|---|
| River Plate | `igi` | Fixtures, scores, table, goalscorers |
| Boca Juniors | `igg` | Scores, table, goalscorers |
| Racing | `ihg` | Fixtures, scores, table, goalscorers |
| Vélez | `ihc` | Fixtures, scores, table, goalscorers |
| San Lorenzo | `igf` | Fixtures, scores, table, goalscorers |
| Independiente | `ihe` | Fixtures, scores, table, goalscorers |
| Huracán | `iie` | Fixtures, table, goalscorers |
| Talleres | `jche` | Fixtures, scores, table, goalscorers |
| Lanús | `igj` | Fixtures, scores, table |
| Sarmiento | `hbbh` | Fixtures, table |
| Belgrano | `fhid` | Fixtures, scores, table |
| Estudiantes | `igh` | Scores, table |
| Godoy Cruz | `ihd` | Fixtures, table |
| Tigre | `iid` | Fixtures, table |
| Platense | `hcah` | Scores, table |
| Barracas Central | `jafb` | Scores, table |
| + 12 more teams | various | Table only |

---

## 8. How to View

Open `mockups/index.html` in any modern browser. No build step required.

- **Desktop view**: Resize browser to ≥1024px to see sidebar + full layout.
- **Mobile view**: Resize to <1024px or use browser DevTools responsive mode. Tap the hamburger (☰) to toggle the sidebar drawer.
- **Print**: Use browser print function to see the print-optimized layout.
