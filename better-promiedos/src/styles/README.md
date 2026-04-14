# Better Promiedos — Global Styles

Production CSS stylesheet matching the [promiedos.com.ar](https://www.promiedos.com.ar/) visual theme.
Consumed by all feature components (fixtures, scores, standings, goalscorers).

## Usage

```html
<link rel="stylesheet" href="src/styles/global.css">
```

Open `src/styles/validate.html` in a browser to preview all components.

---

## Design Tokens (CSS Custom Properties)

All tokens are defined on `:root` in `global.css`.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg-page` | `#1a1a2e` | Dark navy page background |
| `--color-bg-card` | `#16213e` | Card/panel surface |
| `--color-bg-sidebar` | `#0f3460` | Sidebar navigation |
| `--color-bg-header` | `#0a0a23` | Sticky top header |
| `--color-accent-primary` | `#e94560` | Red-pink: live indicators, active states |
| `--color-accent-secondary` | `#53d8fb` | Cyan: links, points, hover states |
| `--color-text-primary` | `#ffffff` | Headings, team names, scores |
| `--color-text-secondary` | `#a0a0b0` | Dates, metadata, table headers |
| `--color-text-on-accent` | `#ffffff` | Text on accent backgrounds |

### Surface & Divider

| Token | Value | Usage |
|---|---|---|
| `--color-row-alt` | `rgba(255,255,255,0.03)` | Zebra row striping |
| `--color-row-hover` | `rgba(255,255,255,0.05)` | Row hover |
| `--color-divider` | `rgba(255,255,255,0.08)` | Borders and separators |
| `--color-surface-hover` | `rgba(255,255,255,0.06)` | Generic hover overlay |
| `--color-live-bg` | `rgba(233,69,96,0.06)` | Live match row tint |
| `--color-live-bg-hover` | `rgba(233,69,96,0.10)` | Live match row hover |

### Zone & Result Indicators

| Token | Value | Usage |
|---|---|---|
| `--color-zone-libertadores` | `#4caf50` | Green: Libertadores zone |
| `--color-zone-sudamericana` | `#53d8fb` | Cyan: Sudamericana zone |
| `--color-zone-relegation` | `#f44336` | Red: Relegation zone |
| `--color-win` | `#4caf50` | Win / positive goal diff |
| `--color-draw` | `#ffeb3b` | Draw indicator |
| `--color-loss` | `#f44336` | Loss / negative goal diff |

### Typography

| Token | Value | Element |
|---|---|---|
| `--font-stack` | System sans-serif | All text |
| `--font-size-h1` | `22px` | Page title |
| `--font-size-section` | `13px` | Section headers |
| `--font-size-team` | `14px` | Team names |
| `--font-size-score` | `18px` | Score digits (desktop) |
| `--font-size-score-sm` | `16px` | Score digits (mobile) |
| `--font-size-th` | `11px` | Table header cells |
| `--font-size-td` | `13px` | Table body cells |
| `--font-size-meta` | `12px` | Metadata (dates, times) |
| `--font-size-nav` | `13px` | Navigation links |
| `--font-size-tab` | `12px` | Tab labels |
| `--font-size-label` | `11px` | Small labels, legends |

### Spacing & Sizing

| Token | Value |
|---|---|
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `12px` |
| `--space-lg` | `16px` |
| `--space-xl` | `24px` |
| `--space-2xl` | `32px` |
| `--sidebar-width` | `220px` |
| `--header-height` | `48px` |
| `--max-content-width` | `900px` |

---

## Component Classes

### Score Badge (`.score`, `.fixture-score`)

Displays match scores in large bold digits with tabular numerals.

```html
<div class="fixture-score">
  <span class="score">2 - 1</span>
</div>

<!-- Compact variant for dense lists -->
<span class="score score--compact">3 - 0</span>

<!-- Live match with pulsing indicator -->
<div class="fixture-score">
  <span class="live-indicator"><span class="live-dot"></span> 67'</span>
  <span class="score">2 - 0</span>
</div>
```

### Team Name (`.team-name`, `.team-crest`)

Team names with 14px/600 weight and ellipsis truncation. Pair with crest images.

```html
<!-- Standard (24×24 crest) in fixture rows -->
<img src="..." alt="" class="team-crest" width="24" height="24">
<span class="team-name">River Plate</span>

<!-- Small (18×18 crest) in tables and scorer lists -->
<img src="..." alt="" class="team-crest-sm" width="18" height="18">
```

### Fixture Row (`.fixture-row`)

Three-column layout: home team (right-aligned), center (score/time), away team (left-aligned).

```html
<a href="#" class="fixture-row" aria-label="Boca 2, Racing 1">
  <div class="fixture-home">
    <span class="team-name">Boca Juniors</span>
    <img src="..." alt="" class="team-crest" width="24" height="24">
  </div>
  <div class="fixture-center">
    <div class="fixture-score"><span class="score">2 - 1</span></div>
  </div>
  <div class="fixture-away">
    <img src="..." alt="" class="team-crest" width="24" height="24">
    <span class="team-name">Racing</span>
  </div>
</a>
```

**Variants:** `.fixture-row--live` adds a red-tinted background.

### Standings Table (`.standings-table`)

Full data table with alternating row colors, hover states, sticky header.

```html
<div class="table-wrapper">
  <table class="standings-table">
    <thead><tr>
      <th class="col-pos">#</th>
      <th class="col-team">Equipo</th>
      <th class="col-stat">PJ</th>
      <th class="col-pts">Pts</th>
    </tr></thead>
    <tbody>
      <tr class="zone-libertadores">
        <td class="col-pos">1</td>
        <td class="col-team"><img ... class="team-crest-sm" width="18" height="18"> Boca</td>
        <td class="col-stat">7</td>
        <td class="col-pts">19</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Zone classes** (on `<tr>`): `.zone-libertadores`, `.zone-sudamericana`, `.zone-relegation`
**Diff colors** (on `<td>`): `.col-diff-pos` (green), `.col-diff-neg` (red)

### Goalscorer Row (`.scorer-row`)

```html
<div class="scorer-row">
  <span class="scorer-rank">1</span>
  <img src="..." alt="" class="team-crest-sm" width="18" height="18">
  <span class="scorer-name">Driussi</span>
  <span class="scorer-team-label">River Plate</span>
  <span class="scorer-goals">6</span>
</div>
```

---

## Accessibility

- `:focus-visible` outline: 2px cyan on all interactive elements
- `prefers-reduced-motion: reduce` disables live dot animation
- `.sr-only` utility for screen-reader-only text
- Contrast ratios: `#fff` on `#1a1a2e` ≈ 14.5:1 (AAA); `#a0a0b0` on `#16213e` ≈ 5.8:1 (AA); `#53d8fb` on `#16213e` ≈ 8.2:1 (AAA)

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| ≥1024px | Full sidebar + desktop layout |
| <1024px | Off-canvas sidebar, compact padding, scorer team hidden |
| <480px | Smaller type, tighter table cells, 20px crests |
