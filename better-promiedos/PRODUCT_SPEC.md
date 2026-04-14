# Better Promiedos — Product Specification

> **Date:** 2026-04-14
> **Source analyzed:** https://www.promiedos.com.ar/
> **Scope:** Fixtures, past scores, league table, top goalscorers.
> **Exclusions:** All betting-related content (see §9).

---

## Table of Contents

1. [Overview](#1-overview)
2. [Visual Style](#2-visual-style)
3. [Layout & Grid](#3-layout--grid)
4. [Information Architecture](#4-information-architecture)
5. [Page Sections & Wireframe Descriptions](#5-page-sections--wireframe-descriptions)
6. [Data Structures](#6-data-structures)
7. [Asset URL Patterns](#7-asset-url-patterns)
8. [UI Patterns & Interactions](#8-ui-patterns--interactions)
9. [Betting-Related Elements to Omit](#9-betting-related-elements-to-omit)

---

## 1. Overview

Promiedos.com.ar is an Argentine football statistics website covering domestic and international leagues. It is a JavaScript single-page application (SPA) that renders a server-side shell with navigation and loads match data, standings, and statistics dynamically via API calls. The site's primary value proposition is real-time and historical match data — fixtures, live scores, final results, league standings, and player statistics — presented in a compact, data-dense layout optimized for quick scanning.

**Primary focus for our build:** We are rebuilding four core sections:

| Section | Description |
|---|---|
| **Fixtures** | Upcoming matches grouped by matchday/date within a league |
| **Past Scores** | Completed match results with scorelines and goal scorers |
| **League Table** | Standings table (Posiciones) with full statistical columns |
| **Top Goalscorers** | Per-league ranking of players by goals scored |

---

## 2. Visual Style

### 2.1 Color Palette

| Role | Value | Usage |
|---|---|---|
| **Page background** | `#1a1a2e` (very dark navy/charcoal) | Full-page background behind all content |
| **Card/panel background** | `#16213e` (dark blue-grey) | Content cards, fixture groups, table containers |
| **Sidebar background** | `#0f3460` (deep navy) | Left navigation sidebar |
| **Header bar** | `#0a0a23` (near-black) | Top sticky header with logo and "Destacado" links |
| **Primary accent** | `#e94560` (vibrant red-pink) | Live match indicators, active states, highlights |
| **Secondary accent** | `#53d8fb` (cyan/light blue) | Links within content, hover states |
| **Text primary** | `#ffffff` (white) | Headings, team names, scores |
| **Text secondary** | `#a0a0b0` (muted grey-lavender) | Dates, times, metadata labels |
| **Text on accent** | `#ffffff` | Text over red/pink accent areas |
| **Table row alternate** | `rgba(255,255,255,0.03)` | Subtle zebra striping on table rows |
| **Divider/border** | `rgba(255,255,255,0.08)` | Thin separators between fixture rows |
| **Win indicator** | `#4caf50` (green) | "W" form indicator, positive results |
| **Draw indicator** | `#ffeb3b` (yellow) | "D" form indicator |
| **Loss indicator** | `#f44336` (red) | "L" form indicator |
| **Live pulse** | `#e94560` with animation | Pulsing dot next to live match scores |

### 2.2 Typography

| Element | Font | Weight | Size (approx.) |
|---|---|---|---|
| **Body / default** | System sans-serif stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) | 400 | 14px |
| **Page title (H1)** | Same stack | 700 | 22–24px |
| **Section headers** | Same stack, uppercase | 700 | 13–14px |
| **Team names in fixtures** | Same stack | 600 | 14px |
| **Score digits** | Same stack | 700 | 16–18px |
| **Table header cells** | Same stack, uppercase | 600 | 11–12px |
| **Table body cells** | Same stack | 400 | 13px |
| **Metadata (dates, times)** | Same stack | 400 | 12px |
| **Navigation links** | Same stack | 500 | 13–14px |

The site does not use custom web fonts — it relies entirely on the system font stack, which keeps page weight low and rendering fast.

### 2.3 Iconography

- **Team crests/shields:** Served as raster images from the API (see §7)
- **Country flags:** Small inline images from the API (see §7)
- **Trophy icon:** SVG at `/assets/icons/cup.svg` — a small gold cup shown next to teams with titles
- **Spinner:** GIF at `/spinner.gif` used as a loading placeholder
- **TV network logos:** Raster images from the API (see §7)

---

## 3. Layout & Grid

### 3.1 Overall Page Structure

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (sticky top bar)                                     │
│  [Logo]  [Destacado links: Liga Prof | Nacional | Lib | ...] │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│  SIDEBAR   │  MAIN CONTENT AREA                              │
│  (nav)     │                                                 │
│            │  ┌─────────────────────────────────────────┐    │
│  Argentina │  │  League Title + Sub-navigation tabs     │    │
│  ├ Liga    │  │  [FIXTURE Y TABLAS] [EQUIPOS] [CAMPEONES]│   │
│  ├ Nac.    │  ├─────────────────────────────────────────┤    │
│  ├ Copa    │  │                                         │    │
│  Internac. │  │  Primary content (fixtures / table /    │    │
│  ├ Libert. │  │  stats depending on active tab)         │    │
│  ├ Sudam.  │  │                                         │    │
│  Inglaterra│  ├─────────────────────────────────────────┤    │
│  ├ Premier │  │  Secondary panel (standings table,      │    │
│  España    │  │  top scorers, or matchday selector)     │    │
│  ├ La Liga │  │                                         │    │
│  ...       │  └─────────────────────────────────────────┘    │
│            │                                                 │
├────────────┴─────────────────────────────────────────────────┤
│  FOOTER (legal, privacy, Opta attribution)                   │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Responsive Behavior

- **Desktop (≥1024px):** Sidebar visible on the left (~220px wide). Main content fills remaining space, max-width ~900px centered.
- **Mobile (<1024px):** Sidebar collapses into a hamburger menu. Main content is full-width. Fixture rows and table cells reduce padding. The header becomes a compact bar with the logo and a menu toggle.

### 3.3 Sidebar Navigation

The sidebar is organized into **country groups**, each with a small flag icon and a list of leagues:

```
[🇦🇷 flag] Argentina
  ├── Liga Profesional
  ├── Primera Nacional
  ├── Copa Argentina
  ├── Copa de la Liga
  ├── Primera B Metro
  ├── Federal A
  ├── Primera C
  └── ... (more)

[🌐 flag] Internacional
  ├── Copa Libertadores
  ├── Copa Sudamericana
  ├── Champions League
  └── ... (more)

[🏴󠁧󠁢󠁥󠁮󠁧󠁿 flag] Inglaterra
  ├── Premier League
  ├── Carabao Cup
  └── FA Cup

... (España, Italia, Alemania, Portugal, Francia, Brasil,
     Uruguay, Paraguay, Colombia, Chile, Mexico, EEUU, Selecciones)
```

Country flag icons use the pattern: `https://api.promiedos.com.ar/images/country/{countryCode}/{size}`

### 3.4 Header Bar ("Destacado")

A sticky horizontal bar across the top containing:
- Logo (left): `https://www.promiedos.com.ar/assets/header/logo_white.webp`
- Quick links (horizontal scroll on mobile): Liga Profesional, Primera Nacional, Libertadores, Sudamericana, Copa Argentina, Champions, Eliminatorias Conmebol, Mundial

---

## 4. Information Architecture

### 4.1 URL Structure

| Page | URL Pattern | Example |
|---|---|---|
| Homepage (today's matches) | `/` | `promiedos.com.ar/` |
| League — Fixtures & Tables | `/league/{slug}/{id}` | `/league/liga-profesional/hc` |
| League — Teams & Stats | `/league/{slug}/{id}/equipos` | `/league/liga-profesional/hc/equipos` |
| League — Champions History | `/league/{slug}/{id}/historial` | `/league/liga-profesional/hc/historial` |
| Team — Principal | `/team/{slug}/{id}` | `/team/river-plate/igi` |
| Team — Stadium | `/team/{slug}/{id}/stadium` | `/team/river-plate/igi/stadium` |
| Match detail | `/game/{slug}/{id}` | `/game/estudiantes-de-la-plata-vs-central-cordoba-sde/egdbgff` |
| Calendar (weekly view) | `/calendario` | `/calendario` |
| Calendar (specific week) | `/calendario/{dd-mm-yyyy}` | `/calendario/16-03-2026` |
| Historical table | `/tablahistorica` | `/tablahistorica` |

**ID scheme:** The site uses short alphanumeric codes (e.g., `hc`, `igi`, `egdbgff`) as opaque identifiers for leagues, teams, and matches.

### 4.2 League Page Tabs

Each league page has three top-level tabs:

| Tab | Label | Content |
|---|---|---|
| 1 | **FIXTURE Y TABLAS** | Matchday fixtures (grouped by round), league standings table |
| 2 | **EQUIPOS Y ESTADISTICAS** | Grid of all teams in the league with crest + short name |
| 3 | **CAMPEONES** | Historical list of champions by year, plus titles-per-team ranking |

For cup competitions (Copa de la Liga, Libertadores, Copa Argentina), the "FIXTURE Y TABLAS" tab shows a **knockout bracket (CUADRO)** with rounds displayed left-to-right (Primera Fase → Segunda Fase → … → Final).

---

## 5. Page Sections & Wireframe Descriptions

### 5.1 Homepage — "Partidos de HOY"

**Purpose:** Show all matches happening today, grouped by league/competition.

```
┌────────────────────────────────────────────────┐
│  "partidos de HOY"  [Calendar widget]          │
│                                                │
│  [TODOS] [VIVO (●)]   ← filter tabs           │
│                                                │
│  ── Liga Profesional ──────────────────────    │
│  18:00  [ESPN]  Estudiantes  vs  C. Córdoba    │
│  20:15  [TNT]   Huracán      vs  Barracas      │
│                                                │
│  ── Copa Argentina ────────────────────────    │
│  16:00  [TyC]   Independiente vs  Atenas RC    │
│  21:15  [TyC]   Belgrano      vs  Atl. Rafaela │
│                                                │
│  ── Primera Nacional ──────────────────────    │
│  17:15  [LPF]   Cd. Bolívar   vs  Agropecuario│
│  ...                                           │
└────────────────────────────────────────────────┘
```

**Key elements:**
- **Calendar widget** (inline mini-calendar): Allows jumping to any date. Displayed as a month grid with day numbers. Current date highlighted.
- **Filter tabs:** "TODOS" (all matches) and "VIVO" (live only, with a pulsing indicator showing count of live matches).
- **Match rows:** Each row shows `[Time] [TV logo?] [Home team] vs [Away team]`. If the match is live, time is replaced by the current minute and scores are shown. If finished, the final score is displayed.
- **League group headers:** A horizontal separator with the league name.

### 5.2 League Page — Fixture Section

**Purpose:** Display all matchdays for a league season, with a round selector.

```
┌──────────────────────────────────────────────┐
│  Liga Profesional Argentina                  │
│  [FIXTURE Y TABLAS] [EQUIPOS] [CAMPEONES]    │
│                                              │
│  ◄  Fecha 8 — Apertura  ►                   │
│                                              │
│  [crest] Boca Jrs.    2 - 1  Racing [crest]  │
│     Cavani 23', 67'         Almendra 55'     │
│  [crest] River        3 - 0  Belgrano [crest]│
│     Driussi 12',...         —                │
│  [crest] Sarmiento    vs   Lanús   [crest]   │
│     Sáb 19/04 — 16:00                       │
│  ...                                         │
│                                              │
│  ┌─ POSICIONES ─────────────────────────┐    │
│  │  #  Equipo    PJ  PG  PE  PP  GF ... │    │
│  │  1  Boca      8   6   1   1   14 ... │    │
│  │  2  River     8   5   2   1   13 ... │    │
│  │  ...                                  │    │
│  └───────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

**Key elements:**
- **Round navigator:** Left/right arrows to switch between matchdays (Fecha N). Label includes the sub-tournament name (e.g., "Apertura", "Clausura").
- **Fixture list:** Each match shows both team crests, team names, and either a scheduled time or a final score. Goal scorers are listed below each team if the match is completed.
- **Standings table** appears below or alongside the fixture list (see §5.4).

### 5.3 League Page — Cup Bracket (CUADRO)

For knockout competitions, instead of a matchday list, the page shows a bracket:

```
┌──────────────────────────────────────────────────┐
│  CUADRO                                          │
│                                                  │
│  Cuartos de Final                                │
│  ┌──────────────────┐  ┌──────────────────┐      │
│  │ River        2   │  │ Godoy Cruz   1   │      │
│  │ Boca         3   │  │ Vélez        2   │      │
│  │ Estudiantes  3   │  │ Argentinos   1   │      │
│  │ Barracas     0   │  │ Def y Just.  1   │      │
│  └──────────────────┘  └──────────────────┘      │
│                                                  │
│  Semifinales                                     │
│  ┌──────────────────┐  ┌──────────────────┐      │
│  │ Boca         1   │  │ Vélez        0   │      │
│  │ Estudiantes  1   │  │ Argentinos   0   │      │
│  └──────────────────┘  └──────────────────┘      │
│                                                  │
│  Final  [🏆]                                     │
│  ┌──────────────────┐                            │
│  │ Estudiantes  1   │                            │
│  │ Vélez        1   │                            │
│  └──────────────────┘                            │
└──────────────────────────────────────────────────┘
```

Each tie shows two legs with teams stacked vertically. Aggregate scores may appear with a "Global" label. The final is marked with a trophy icon (`/assets/icons/cup.svg`) and the label "FINAL".

### 5.4 League Table (Posiciones)

**Purpose:** Full standings for the current season/tournament.

```
┌───────────────────────────────────────────────────────────────┐
│  POSICIONES                                                   │
├───┬──────────────┬────┬────┬────┬────┬────┬────┬────┬────────┤
│ # │ Equipo       │ PJ │ PG │ PE │ PP │ GF │ GC │ Dif│ Pts    │
├───┼──────────────┼────┼────┼────┼────┼────┼────┼────┼────────┤
│ 1 │ [c] Boca     │  8 │  6 │  1 │  1 │ 14 │  5 │ +9 │  19   │
│ 2 │ [c] River    │  8 │  5 │  2 │  1 │ 13 │  4 │ +9 │  17   │
│ 3 │ [c] Vélez    │  8 │  5 │  1 │  2 │ 11 │  6 │ +5 │  16   │
│...│ ...          │... │... │... │... │... │... │... │  ...   │
│28 │ [c] Barracas │  8 │  0 │  2 │  6 │  3 │ 15 │-12 │   2   │
├───┴──────────────┴────┴────┴────┴────┴────┴────┴────┴────────┤
│  [c] = team crest icon                                        │
│  Rows may have colored left-border for qualification zones    │
│  (e.g., green = Libertadores, blue = Sudamericana, red =     │
│   relegation)                                                 │
└───────────────────────────────────────────────────────────────┘
```

**Column definitions:**
- `#` — Position
- `Equipo` — Team name with crest icon
- `PJ` — Partidos Jugados (matches played)
- `PG` — Partidos Ganados (wins)
- `PE` — Partidos Empatados (draws)
- `PP` — Partidos Perdidos (losses)
- `GF` — Goles a Favor (goals for)
- `GC` — Goles en Contra (goals against)
- `Dif` — Diferencia de gol (goal difference)
- `Pts` — Puntos (points)

**For the Historical Table** (`/tablahistorica`), additional columns appear:
- `PtsHis` — Historical points (using period-correct rules: 2pts pre-1995, 3pts after)
- `Ptsx3V` — Points recalculated with modern 3-per-win rules
- `PG2` / `PG3` — Wins worth 2 points / 3 points
- `%PG` / `%PE` / `%PP` — Win/draw/loss percentages

### 5.5 Top Goalscorers (Goleadores)

Displayed within the team detail page and within league statistics. The pattern is a simple ranked list:

```
┌──────────────────────────────────────┐
│  Goles                               │
├──────────────────────────────────────┤
│  [crest] Driussi              4      │
│  [crest] Montiel              4      │
│  [crest] Colidio              2      │
│  [crest] Quintero             2      │
│  [crest] Galván               2      │
│  [crest] Subiabre             1      │
│                                      │
│  [VER MÁS]                          │
└──────────────────────────────────────┘
```

Additional stat categories visible on team pages:
- **Asistencias** (Assists)
- **Barridas ganadas** (Tackles won — per-game average)
- **Tarjetas Rojas** (Red cards)
- **Tarjetas Amarillas** (Yellow cards)

### 5.6 Teams Grid Page (EQUIPOS Y ESTADISTICAS)

**Purpose:** Grid of all teams in a league, each as a clickable card.

```
┌──────────────────────────────────────────────────────────┐
│  EQUIPOS                                                 │
│  "Pulsar en el equipo para ver su info detallada"        │
│                                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │[crest]│  │[crest]│  │[crest]│  │[crest]│  │[crest]│   │
│  │Argent.│  │A.Tuc.│  │Banfi.│  │Barra.│  │Belgr.│      │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ...                      │
│  │[crest]│  │[crest]│  │[crest]│                         │
│  │Boca🏆│  │C.Cba │  │Defen.│                            │
│  │  35  │  │      │  │      │                            │
│  └──────┘  └──────┘  └──────┘                            │
└──────────────────────────────────────────────────────────┘
```

Each card shows:
- Team crest (large, ~64px)
- Short team name
- Trophy icon + count if the team has won the league before (e.g., 🏆 35 for Boca)

### 5.7 Team Detail Page

**Purpose:** Show a specific team's upcoming matches, recent results, squad roster, and per-player statistics.

```
┌──────────────────────────────────────────────────────────┐
│  [breadcrumb: Liga Profesional > River Plate]            │
│                                                          │
│  [Large crest] River Plate                               │
│  [PRINCIPAL]  [ESTADIO]                                  │
│                                                          │
│  ┌─ PRÓXIMOS PARTIDOS ──────────────────────────────┐    │
│  │ Día     │ L/V │ vs Equipo         │ Hora         │    │
│  │ 15/04   │  L  │ [c] Carabobo      │ 20:30        │    │
│  │ 19/04   │  L  │ [c] Boca Jrs.     │ 16:00        │    │
│  │ ...     │     │                    │              │    │
│  │ [VER MÁS]                                        │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ Resultados ─────────────────────────────────────┐    │
│  │ Día     │ L/V │ vs Equipo         │ Res          │    │
│  │ 12/04   │  V  │ [c] Racing        │ 0-2          │    │
│  │ 08/04   │  V  │ [c] Blooming      │ 1-1          │    │
│  │ ...     │     │                    │              │    │
│  │ [VER MÁS]                                        │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ PLANTEL ────────────────────────────────────────┐    │
│  │ #  │ [flag] Name    │ Position │ Age │ Height    │    │
│  │ DT │ [🇦🇷] Coudet   │ Entren.  │ 51  │ 1.78     │    │
│  │ 1  │ [🇦🇷] Armani   │ Arquero  │ 39  │ 1.89     │    │
│  │ 5  │ [🇦🇷] Portillo │ Def. Cen.│ 25  │ 1.66     │    │
│  │ ...│                │          │     │           │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ── Sidebar-style stat panels: ──                        │
│  [Goles] [Asistencias] [Barridas] [Rojas] [Amarillas]   │
│                                                          │
│  ┌─ Team Info ──────────────────────────────────────┐    │
│  │ Apodo: Millonarios                                │    │
│  │ Fundación: 1901                                   │    │
│  │ Estadio: Estadio Más Monumental                   │    │
│  │ Club de: Capital Federal, Buenos Aires            │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 5.8 Calendar Page

**Purpose:** Week-by-week view of all matches across all leagues.

```
┌──────────────────────────────────────────────────────────┐
│  [◄ ATRÁS]     Calendario     [SIGUIENTE ►]             │
│                                                          │
│  ── lunes 23/03 ──────────────────────────────────────   │
│                                                          │
│  Cumpleaños                                              │
│    Walter Samuel (Argentina) cumple hoy 48 años          │
│    ...                                                   │
│                                                          │
│  Primera C                                               │
│    13:30  [LPF] Leones de Rosario vs Centro Español      │
│    14:30        Muñiz vs J.J. Urquiza                    │
│    ...                                                   │
│                                                          │
│  Liga Profesional                                        │
│    18:00  [ESPN] Estudiantes vs C. Córdoba                │
│    20:15  [TNT]  Huracán vs Barracas                     │
│                                                          │
│  ── martes 24/03 ─────────────────────────────────────   │
│    (no matches)                                          │
│    Cumpleaños: Cristian Lema ...                         │
│                                                          │
│  ── miércoles 25/03 ──────────────────────────────────   │
│  Aniversario: Racing Club — 123 años desde su fundación  │
│  ...                                                     │
└──────────────────────────────────────────────────────────┘
```

The calendar shows a **full week** with previous/next week navigation. Each day includes:
- Player birthdays (with team and age)
- Club anniversaries
- Matches grouped by league, each row showing time, optional TV network logo, and team names

---

## 6. Data Structures

### 6.1 Fixture / Match

```typescript
interface Match {
  id: string;                   // Opaque alphanumeric ID, e.g. "egdbgff"
  slug: string;                 // URL-friendly name, e.g. "estudiantes-de-la-plata-vs-central-cordoba-sde"
  leagueId: string;             // Parent league ID, e.g. "hc"
  leagueName: string;           // "Liga Profesional"
  round: string | null;         // "Fecha 8", "Cuartos de Final", etc.
  subTournament: string | null; // "Apertura", "Clausura", "Liguilla", etc.

  homeTeam: TeamRef;
  awayTeam: TeamRef;

  scheduledDate: string;        // ISO 8601 date, e.g. "2026-03-23"
  scheduledTime: string;        // "HH:MM" in Argentina time (ART), e.g. "18:00"

  status: "scheduled" | "live" | "finished" | "postponed" | "suspended";
  minute: number | null;        // Current minute if live, null otherwise

  homeScore: number | null;     // null if not started
  awayScore: number | null;

  homeGoalScorers: GoalEvent[]; // Empty array if not started
  awayGoalScorers: GoalEvent[];

  tvNetworks: TvNetwork[];      // Can be empty (no broadcast info)
}

interface TeamRef {
  id: string;                   // e.g. "igi"
  name: string;                 // Full name: "River Plate"
  shortName: string;            // Display name: "River"
  slug: string;                 // "river-plate"
}

interface GoalEvent {
  playerName: string;           // "Driussi"
  minute: number;               // 12
  isPenalty: boolean;
  isOwnGoal: boolean;
}

interface TvNetwork {
  id: string;                   // e.g. "gchc"
  name: string;                 // "ESPN Premium"
}
```

### 6.2 League Table Row

```typescript
interface LeagueTableRow {
  position: number;             // 1-based ranking
  team: TeamRef;
  played: number;               // PJ — Partidos Jugados
  won: number;                  // PG — Partidos Ganados
  drawn: number;                // PE — Partidos Empatados
  lost: number;                 // PP — Partidos Perdidos
  goalsFor: number;             // GF — Goles a Favor
  goalsAgainst: number;         // GC — Goles en Contra
  goalDifference: number;       // Dif — Diferencia de gol (GF - GC)
  points: number;               // Pts — Puntos (3*PG + 1*PE)
  zone: ZoneType | null;        // Qualification or relegation zone indicator
}

type ZoneType =
  | "libertadores"              // Green left-border — qualifies for Libertadores
  | "sudamericana"              // Blue left-border — qualifies for Sudamericana
  | "relegation"                // Red left-border — relegation zone
  | "promotion"                 // Green left-border — promotion zone
  | "playoff";                  // Yellow left-border — playoff zone
```

### 6.3 Historical Table Row

```typescript
interface HistoricalTableRow {
  position: number;
  team: TeamRef;
  historicalPoints: number;     // PtsHis — points with period-correct rules
  modernPoints: number;         // Ptsx3V — 3 points per win recalculation
  played: number;               // PJ
  totalWins: number;            // PGT — total wins
  wins2pt: number;              // PG2 — wins in 2-point era
  wins3pt: number;              // PG3 — wins in 3-point era
  drawn: number;                // PE
  lost: number;                 // PP
  winPct: number;               // %PG
  drawPct: number;              // %PE
  lossPct: number;              // %PP
}
```

### 6.4 Top Goalscorer Entry

```typescript
interface TopGoalscorer {
  rank: number;
  playerName: string;           // "Driussi"
  team: TeamRef;
  goals: number;
}
```

### 6.5 Player Stats Entry (Team Detail)

```typescript
interface PlayerStatEntry {
  playerName: string;
  value: number;                // goals, assists, tackles/game, cards, etc.
}

type StatCategory =
  | "goals"                     // Goles
  | "assists"                   // Asistencias
  | "tacklesWonPerGame"         // Barridas ganadas (per-game average, decimal)
  | "redCards"                  // Tarjetas Rojas
  | "yellowCards";              // Tarjetas Amarillas
```

### 6.6 Squad Player

```typescript
interface SquadPlayer {
  number: number | null;        // Jersey number, null for unnumbered
  name: string;                 // "Franco Armani"
  nationality: string;          // Country code for flag
  position: PlayerPosition;
  age: number;
  birthDate: string;            // "DD/MM/YYYY"
  height: number | null;        // In meters, e.g. 1.89
  role: "player" | "coach";
}

type PlayerPosition =
  | "Arquero"                     // Goalkeeper
  | "Defensa Central"             // Center-back
  | "Defensa Lateral Derecho"     // Right-back
  | "Defensa Lateral Izquierdo"   // Left-back
  | "Centrocampista defensivo"    // Defensive midfielder
  | "Mediocampista Central"       // Central midfielder
  | "Mediocampista Ofensivo"      // Attacking midfielder
  | "Volante Derecho"             // Right midfielder
  | "Centro Delantero"            // Striker
  | "Segundo Delantero"           // Second striker
  | "Entrenador";                 // Coach/Manager
```

### 6.7 League

```typescript
interface League {
  id: string;                   // "hc"
  name: string;                 // "Liga Profesional Argentina"
  slug: string;                 // "liga-profesional"
  country: string;              // Country code for flag icon
  type: "league" | "cup";       // Determines fixture display: matchdays vs bracket
  currentSeason: string | null; // "2025", "2025/26", etc.
}
```

### 6.8 Champions History Entry

```typescript
interface ChampionEntry {
  tournament: string;           // "2025 C", "2024", "2023", "1991/92 A", etc.
  team: TeamRef;
  hasDetailedTable: boolean;    // Whether "Tabla >" link is available
}

interface TitlesRanking {
  team: TeamRef;
  titles: number;
}
```

---

## 7. Asset URL Patterns

All image assets for teams, countries, and networks are served from the API subdomain.

### 7.1 Team Crest / Icon

```
https://api.promiedos.com.ar/images/team/{teamId}/{size}
```

| Parameter | Description | Examples |
|---|---|---|
| `teamId` | Opaque team ID | `igi` (River Plate), `igg` (Boca Juniors), `ihb` (Argentinos) |
| `size` | Image size variant | `1` (standard ~32px), `4` (large, used for anniversaries) |

**Examples:**
- River Plate (standard): `https://api.promiedos.com.ar/images/team/igi/1`
- Boca Juniors (standard): `https://api.promiedos.com.ar/images/team/igg/1`
- River Plate (large): `https://api.promiedos.com.ar/images/team/igi/4`
- Argentinos Juniors: `https://api.promiedos.com.ar/images/team/ihb/1`
- Estudiantes LP: `https://api.promiedos.com.ar/images/team/igh/1`
- Racing Club: `https://api.promiedos.com.ar/images/team/ihg/1`
- San Lorenzo: `https://api.promiedos.com.ar/images/team/igf/1`
- Vélez Sarsfield: `https://api.promiedos.com.ar/images/team/ihc/1`
- Independiente: `https://api.promiedos.com.ar/images/team/ihe/1`
- Lanús: `https://api.promiedos.com.ar/images/team/igj/1`

### 7.2 Country Flag

```
https://api.promiedos.com.ar/images/country/{countryCode}/{size}
```

| `countryCode` | Country |
|---|---|
| `ba` | Argentina |
| `b` | England |
| `c` | Spain |
| `d` | Italy |
| `e` | Germany |
| `f` | France |
| `bb` | Portugal |
| `cb` | Brazil |
| `bbb` | Uruguay |
| `bai` | Paraguay |
| `baj` | Colombia |
| `ci` | Chile |
| `db` | Mexico |
| `bi` | USA |
| `fe` | International / Multi-country |

### 7.3 TV Network Logo

```
https://api.promiedos.com.ar/images/tvnetworks/{networkId}
```

| `networkId` | Network |
|---|---|
| `gchc` | ESPN Premium |
| `idef` | TNT Sports Premium |
| `cbcj` | TyC Sports |
| `hbdg` | LPF Play |
| `cicj` | ESPN |
| `chbb` | ESPN3 Sudamérica |
| `dfjb` | ESPN 2 |
| `hhgb` | Disney+ Premium |
| `cgaf` | Telefe |

### 7.4 Static Assets

| Asset | URL |
|---|---|
| Logo (white, for dark bg) | `https://www.promiedos.com.ar/assets/header/logo_white.webp` |
| Trophy/cup icon (SVG) | `https://www.promiedos.com.ar/assets/icons/cup.svg` |
| Loading spinner (GIF) | `https://www.promiedos.com.ar/spinner.gif` |
| Opta attribution logo | `https://www.promiedos.com.ar/assets/opta-wht.png` |

---

## 8. UI Patterns & Interactions

### 8.1 Loading States

The site uses spinner GIFs (`/spinner.gif`) as placeholders while API data loads. Since it's an SPA, the HTML shell renders instantly with navigation, and dynamic content areas show the spinner until data arrives.

**Recommendation for our build:** Use skeleton loading states (shimmer placeholders) instead of spinner GIFs for a more modern feel.

### 8.2 Match Row States

A match row can be in one of these visual states:

| State | Visual Treatment |
|---|---|
| **Scheduled** | Show date + time in secondary text color. No score. |
| **Live** | Pulsing red dot (●) + current minute. Score in bold white. Row may have a subtle highlight background. |
| **Half-time** | "ET" or "Entretiempo" label. Score shown. |
| **Finished** | Score in bold. Goal scorers listed below. Time replaced by "Final" or removed. |
| **Postponed** | "Postergado" label in secondary text. |

### 8.3 Table Sorting

On the historical table (`/tablahistorica`), column headers are clickable to sort. The instruction reads: "Pulsar item de la parte superior para ordenar según ese criterio." This implies client-side sort toggling on any column.

**Recommendation:** Implement sortable columns for all table views (standings, stats, historical).

### 8.4 Navigation

- **Sidebar links** navigate to league pages. Active league is highlighted.
- **"Destacado" header links** provide quick access to the most popular leagues.
- **League sub-tabs** (`FIXTURE Y TABLAS`, `EQUIPOS Y ESTADISTICAS`, `CAMPEONES`) switch views within a league page without a full page reload.
- **Team cards** on the EQUIPOS grid are fully clickable, navigating to the team detail page.
- **Match rows** on the homepage and fixture lists are clickable, navigating to the match detail page.
- **"VER MÁS"** buttons expand truncated lists (e.g., goalscorer lists capped at 5–6 entries).

### 8.5 Calendar Navigation

The homepage has a mini calendar widget allowing date selection. The calendar page (`/calendario`) navigates week-by-week with "ATRÁS" / "SIGUIENTE" links, each pointing to a specific date URL (`/calendario/DD-MM-YYYY`).

### 8.6 Data Attribution

The footer contains: "ESTADÍSTICAS DE [Opta logo]" — indicating that statistical data is sourced from Opta. Our build should include appropriate data source attribution.

---

## 9. Betting-Related Elements to Omit

The following elements present on promiedos.com.ar are **explicitly excluded** from our build and must NOT be implemented:

| Element | Location | Description |
|---|---|---|
| **"¿Querés saber quién es el favorito a ganar? Consultá acá."** | Homepage, below filter tabs | Call-to-action link directing users to betting/odds information |
| **Gambling disclaimer banner** | Site-wide footer | "El juego compulsivo es perjudicial para vos y tu família +18" — responsible gambling warning required by Argentine law for sites with betting content |
| **adsage.io tracking pixel** | Every page | `https://tracking.adsage.io/pixel.png?action=pageview&country_id=...` — ad/betting tracking pixel embedded in every page |
| **Any odds or "favorito" data** | N/A (loaded dynamically) | Any match-level odds, betting lines, or "favorite to win" predictions that may load via JavaScript |
| **Betting operator branding** | Ad placements | Any banner ads, sponsored sections, or branding from betting operators (these appear dynamically via ad networks) |
| **Betting-related sponsor logos** | Various | Any sponsor/partner logos associated with betting companies |

**Rationale:** The product scope is purely informational — fixtures, scores, standings, and statistics. Excluding betting content simplifies the interface, removes regulatory obligations (gambling disclaimers, age verification), and focuses the user experience on sports data.

---

## Appendix A: Team ID Reference (Liga Profesional)

For implementation reference, here are the observed team IDs and their asset URLs:

| Team | ID | Crest URL |
|---|---|---|
| Argentinos Juniors | `ihb` | `https://api.promiedos.com.ar/images/team/ihb/1` |
| Atlético Tucumán | `gbfc` | `https://api.promiedos.com.ar/images/team/gbfc/1` |
| Banfield | `ihi` | `https://api.promiedos.com.ar/images/team/ihi/1` |
| Barracas Central | `jafb` | `https://api.promiedos.com.ar/images/team/jafb/1` |
| Belgrano | `fhid` | `https://api.promiedos.com.ar/images/team/fhid/1` |
| Boca Juniors | `igg` | `https://api.promiedos.com.ar/images/team/igg/1` |
| Central Córdoba SdE | `beafh` | `https://api.promiedos.com.ar/images/team/beafh/1` |
| Defensa y Justicia | `hcbh` | `https://api.promiedos.com.ar/images/team/hcbh/1` |
| Deportivo Riestra | `bbjea` | `https://api.promiedos.com.ar/images/team/bbjea/1` |
| Estudiantes LP | `igh` | `https://api.promiedos.com.ar/images/team/igh/1` |
| Gimnasia LP | `iia` | `https://api.promiedos.com.ar/images/team/iia/1` |
| Godoy Cruz | `ihd` | `https://api.promiedos.com.ar/images/team/ihd/1` |
| Huracán | `iie` | `https://api.promiedos.com.ar/images/team/iie/1` |
| Independiente | `ihe` | `https://api.promiedos.com.ar/images/team/ihe/1` |
| Independiente Rivadavia | `hcch` | `https://api.promiedos.com.ar/images/team/hcch/1` |
| Instituto | `hchc` | `https://api.promiedos.com.ar/images/team/hchc/1` |
| Lanús | `igj` | `https://api.promiedos.com.ar/images/team/igj/1` |
| Newell's Old Boys | `ihh` | `https://api.promiedos.com.ar/images/team/ihh/1` |
| Platense | `hcah` | `https://api.promiedos.com.ar/images/team/hcah/1` |
| Racing Club | `ihg` | `https://api.promiedos.com.ar/images/team/ihg/1` |
| River Plate | `igi` | `https://api.promiedos.com.ar/images/team/igi/1` |
| Rosario Central | `ihf` | `https://api.promiedos.com.ar/images/team/ihf/1` |
| San Lorenzo | `igf` | `https://api.promiedos.com.ar/images/team/igf/1` |
| Sarmiento Junín | `hbbh` | `https://api.promiedos.com.ar/images/team/hbbh/1` |
| Talleres de Córdoba | `jche` | `https://api.promiedos.com.ar/images/team/jche/1` |
| Tigre | `iid` | `https://api.promiedos.com.ar/images/team/iid/1` |
| Unión de Santa Fe | `hcag` | `https://api.promiedos.com.ar/images/team/hcag/1` |
| Vélez Sarsfield | `ihc` | `https://api.promiedos.com.ar/images/team/ihc/1` |
| Aldosivi | `hccd` | `https://api.promiedos.com.ar/images/team/hccd/1` |
| Estudiantes RC | `bheaf` | `https://api.promiedos.com.ar/images/team/bheaf/1` |
| Gimnasia de Mendoza | `bbjbf` | `https://api.promiedos.com.ar/images/team/bbjbf/1` |
