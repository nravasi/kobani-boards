# Boca Juniors Fan Site — Product Specification

## 1. Overview

A retro fan site dedicated to Club Atlético Boca Juniors, built with a deliberately exaggerated 1990s web aesthetic. The site is served by a Node.js backend and renders server-side HTML. Every page leans into the visual conventions of late-90s personal homepages: tiled backgrounds, marquee text, animated GIF decorations, glitter overlays, a visitor hit counter, and a guestbook.

The target audience is Boca Juniors fans who appreciate both the club and nostalgic internet culture.

---

## 2. Site Map

```
[Home /]
 ├── [History /history]
 ├── [Players /players]
 │    └── [Player Detail /players/:slug]
 ├── [Gallery /gallery]
 ├── [Guestbook /guestbook]
 └── [Links /links]
```

### Navigation

Every page includes a persistent top navigation bar with links to all six top-level pages. The navigation bar is rendered as a horizontal `<table>` row with cell borders, using a dark-blue background (`#000080`) and yellow text (`#FFD700`) — the Boca Juniors colors. The currently active page cell has a lighter background (`#0000CC`) to indicate selection.

Page hierarchy is flat: all pages are one level deep except Player Detail, which is a child of Players.

---

## 3. Pages and Content

### 3.1 Home (`/`)

| Section | Content |
|---|---|
| Hero banner | A centered club crest image (static PNG or animated GIF) with the text **"¡Bienvenidos a La Bombonera Digital!"** in large, bold, yellow `<font>` tags on a blue background. |
| Marquee welcome | A `<marquee>` element scrolling the text: *"Dale Boooo… Dale Boooo… La mitad más uno — ¡Boca Juniors!"* across the full page width. |
| Latest news | A manually curated list of 3–5 bullet points with hardcoded text about classic Boca moments (e.g., Copa Libertadores 2000, Intercontinental 2000). Content is static HTML, not fetched from an API. |
| Hit counter | A visible hit counter at the bottom of the page displaying total visits. See §4.3 for implementation details. |
| Under construction | An animated "Under Construction" GIF placed beside the news section. |

### 3.2 History (`/history`)

| Section | Content |
|---|---|
| Timeline | A vertical list of key dates and events in Boca Juniors history, from the club's founding (April 3, 1905) through major trophy wins. Each entry is a `<table>` row with a year column and a description column. Minimum 10 entries. |
| Famous matches | A subsection describing 3–5 legendary matches (e.g., Intercontinental Cup 2000 vs. Real Madrid). Each match block contains: date, opponent, score, and a two-sentence summary. |
| Club crest gallery | 3–4 historical versions of the Boca crest displayed as inline images. |

### 3.3 Players (`/players`)

| Section | Content |
|---|---|
| Player grid | A `<table>` grid showing 10–15 legendary Boca players. Each cell contains: a placeholder image (or actual photo), player name, position, and years active. |
| Link to detail | Each player name is an `<a>` link to `/players/:slug` (e.g., `/players/riquelme`). |

### 3.4 Player Detail (`/players/:slug`)

| Section | Content |
|---|---|
| Player header | Player name in large decorated text, position, and nationality. |
| Bio | A 2–4 sentence biography of the player. |
| Stats table | A `<table>` with columns: Season, Appearances, Goals. Minimum 3 rows of representative data. |
| Back link | A prominent "⬅ Volver al plantel" link back to `/players`. |

### 3.5 Gallery (`/gallery`)

| Section | Content |
|---|---|
| Photo grid | A grid of 6–12 placeholder images (can be solid-color PNGs or actual photos) displayed using `<table>` cells. Each image has a visible border and a caption below it. |
| Animated dividers | Animated GIF dividers (horizontal rules made of flames, stars, or soccer balls) between rows of images. |

### 3.6 Guestbook (`/guestbook`)

| Section | Content |
|---|---|
| Entry form | A `<form>` with fields: **Name** (text, required, max 50 chars), **Message** (textarea, required, max 500 chars). Submit button labeled "Firmar el libro". |
| Entry list | All submitted guestbook entries displayed in reverse-chronological order. Each entry shows: name, message, and timestamp. |
| Storage | Entries are stored in a JSON file on disk (`data/guestbook.json`). No database required. |

### 3.7 Links (`/links`)

| Section | Content |
|---|---|
| Link list | A curated list of 5–10 external links related to Boca Juniors (official site, fan forums, Wikipedia, etc.). Each link is displayed as a styled `<a>` tag with a short description. |
| Link exchange banner | A "Link exchange" section at the bottom with a small 88×31 pixel site banner (a standard 90s web convention) and HTML snippet visitors can copy to link back to this site. |

---

## 4. 90s Aesthetic — UI Element Inventory

Every visual element below is required. This section specifies what each element is, where it appears, and any behavioral rules.

### 4.1 Marquee Text

| Property | Value |
|---|---|
| Element | `<marquee>` HTML tag |
| Locations | **Home page**: one marquee below the hero banner. **Every page footer**: a secondary marquee with the text *"© Boca Juniors Fan Site — Hecho con el corazón 💛💙"*. |
| Direction | Default left-to-right scroll (`direction="left"`). |
| Speed | `scrollamount="4"` for comfortable reading pace. |
| Styling | Yellow text (`#FFD700`) on dark blue background (`#000080`), bold, `font-size: 18px`. |

### 4.2 Glitter / Sparkle Effects

| Property | Value |
|---|---|
| Implementation | Small animated GIF images (star sparkle, ~15×15 px) positioned as decorative accents. Alternatively, a CSS animation using semi-transparent star characters that cycle opacity. |
| Locations | **Page headings** on every page: 1–2 sparkle GIFs placed immediately before and after each `<h1>` text. **Home hero banner**: 4–6 sparkle GIFs scattered around the crest image. **Guestbook header**: sparkles flanking the "Libro de Visitas" title. |
| Behavior | Sparkles loop infinitely. If implemented as CSS, the animation cycle is 1–2 seconds with opacity fading between 0.2 and 1.0. |

### 4.3 Hit Counter

| Property | Value |
|---|---|
| Location | Bottom of the **Home page**, centered, above the footer marquee. |
| Display | Text reading `"Visitante Nº: "` followed by a zero-padded 6-digit number (e.g., `000042`), rendered in a monospace font styled to resemble a classic digit counter (black background, green or white digits). |
| Storage | The count is stored in a plain-text file (`data/hit_count.txt`). The server reads the file, increments the value by 1 on each `GET /` request, writes it back, and serves the updated count. |
| Initial value | `0` (file is created automatically on first request if it does not exist). |

### 4.4 Animated GIFs

| GIF Type | Placement |
|---|---|
| Under construction sign | Home page, beside the news section. |
| Spinning soccer ball | Navigation bar, one on each end of the nav row. |
| Horizontal flame/star dividers | Gallery page between image rows; History page between timeline and famous-matches sections. |
| Dancing baby or dancing figure | Links page, beside the "Link exchange" section (a nod to the iconic 90s dancing baby meme). |
| Mailbox / envelope | Guestbook page, next to the form heading. |
| Waving Argentine flag | Home page hero area. |

All animated GIFs are stored in `public/images/gifs/`. Placeholder GIFs can be simple colored-frame animations during initial development; they must be replaced with thematic artwork before launch.

### 4.5 Background Patterns

| Property | Value |
|---|---|
| Default pattern | A small (~50×50 px) tiled image combining blue and yellow diagonal stripes, set via CSS `background-image: url('/images/bg-tile.png'); background-repeat: repeat;` on `<body>`. |
| Page-specific overrides | The **Guestbook** page uses a stars-on-dark-blue tile. The **Gallery** page uses a solid dark background (`#001040`) without a tile, to let photos stand out. |
| Fallback | If the tile image fails to load, the body background-color falls back to `#000080` (dark blue). |

### 4.6 Cursor and Misc Effects

| Element | Detail |
|---|---|
| Custom cursor | Pages use `cursor: url('/images/cursor-soccer.cur'), auto;` to show a soccer-ball cursor on hover over links. |
| `<blink>` text | The "NEW!" label next to the latest news item on the Home page uses a CSS `blink` animation (since the `<blink>` tag is deprecated): alternating `visibility: visible` and `visibility: hidden` every 0.8 seconds. |
| Beveled table borders | All `<table>` elements use `border="2"` with `bordercolor="#FFD700"` and `cellpadding="5"` for the classic raised-edge look. |
| Font choices | Primary text uses `<font face="Comic Sans MS, Arial, sans-serif">`. Headings use `<font face="Impact, Arial Black, sans-serif">`. |
| Text colors | Body text is white (`#FFFFFF`) or yellow (`#FFD700`) on blue backgrounds. Links are cyan (`#00FFFF`); visited links are magenta (`#FF00FF`). |
| `<hr>` styling | Horizontal rules use rainbow-colored animated GIF images (`<img src="/images/gifs/rainbow-hr.gif">`) instead of plain `<hr>` tags wherever a section divider is needed. |

### 4.7 Sound (Optional Enhancement)

| Property | Value |
|---|---|
| Background MIDI | An auto-playing MIDI embed of the Boca Juniors anthem on the Home page, using an `<audio>` tag with `autoplay` and `loop`. A visible play/pause control must be present so the user can stop it. |
| Scope | Home page only. All other pages are silent. |
| Note | This is an optional enhancement. The site must function correctly without it. |

---

## 5. Node.js Server Requirements

### 5.1 Runtime and Framework

| Requirement | Value |
|---|---|
| Runtime | Node.js (>=18.x LTS) |
| Framework | **Express.js** (latest 4.x) |
| Template engine | **EJS** — `.ejs` files in a `views/` directory. Server-rendered HTML; no client-side SPA framework. |
| Package manager | npm |

### 5.2 Port Configuration

| Requirement | Value |
|---|---|
| Default port | `3000` |
| Environment override | The server reads `process.env.PORT` and uses it if set; otherwise falls back to `3000`. |
| Startup log | On successful listen, the server logs: `Bokita Fan Site running on http://localhost:<port>` |

### 5.3 Project Directory Structure

```
bokita-fansite/
├── server.js              # Express app entry point
├── package.json           # Dependencies and scripts
├── SPEC.md                # This specification
├── README.md              # Project overview
├── data/                  # Runtime data (gitignored except README)
│   ├── guestbook.json     # Guestbook entries (created at runtime)
│   └── hit_count.txt      # Hit counter (created at runtime)
├── public/                # Static assets served by Express
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   ├── images/
│   │   ├── bg-tile.png    # Tiled background
│   │   ├── crest.png      # Club crest
│   │   ├── cursor-soccer.cur
│   │   └── gifs/          # All animated GIFs
│   │       ├── under-construction.gif
│   │       ├── spinning-ball.gif
│   │       ├── flame-divider.gif
│   │       ├── rainbow-hr.gif
│   │       ├── sparkle.gif
│   │       ├── dancing-figure.gif
│   │       ├── mailbox.gif
│   │       └── waving-flag.gif
│   └── audio/             # Optional MIDI/audio files
│       └── boca-anthem.mid
└── views/                 # EJS templates
    ├── partials/
    │   ├── header.ejs     # <head>, opening <body>, nav bar
    │   └── footer.ejs     # Footer marquee, closing tags
    ├── home.ejs
    ├── history.ejs
    ├── players.ejs
    ├── player-detail.ejs
    ├── gallery.ejs
    ├── guestbook.ejs
    └── links.ejs
```

### 5.4 Routing Table

| Method | Path | Handler Description |
|---|---|---|
| `GET` | `/` | Increment hit counter, render `home.ejs` with counter value. |
| `GET` | `/history` | Render `history.ejs` with static timeline and match data. |
| `GET` | `/players` | Render `players.ejs` with player list array. |
| `GET` | `/players/:slug` | Look up player by slug; render `player-detail.ejs`. Return 404 page if slug not found. |
| `GET` | `/gallery` | Render `gallery.ejs` with image list. |
| `GET` | `/guestbook` | Read `data/guestbook.json`, render `guestbook.ejs` with entries. |
| `POST` | `/guestbook` | Validate name and message fields, append entry to `data/guestbook.json`, redirect to `GET /guestbook`. |
| `GET` | `/links` | Render `links.ejs` with static link data. |

### 5.5 Static File Serving

Express serves the `public/` directory at the root URL path:

```js
app.use(express.static('public'));
```

### 5.6 Error Handling

| Scenario | Behavior |
|---|---|
| Unknown route | Return a custom 404 page styled in the 90s theme with the message *"¡Uy! Esta página no existe, amigo."* and a link back to Home. The 404 page includes an "Under Construction" GIF. |
| Player slug not found | Same 404 page as unknown route. |
| Guestbook validation failure | Re-render the guestbook page with an inline error message (*"¡Completá todos los campos!"*) and preserve the user's input in the form fields. |
| Server error | Return a generic 500 page with the message *"Algo salió mal. Volvé a intentar."* |

### 5.7 npm Scripts

| Script | Command | Purpose |
|---|---|---|
| `start` | `node server.js` | Run the server in production mode. |
| `dev` | `npx nodemon server.js` | Run with auto-restart on file changes (development). |

### 5.8 Dependencies

| Package | Purpose |
|---|---|
| `express` | Web framework |
| `ejs` | Template rendering |

| Dev Dependency | Purpose |
|---|---|
| `nodemon` | Auto-restart during development |

No other runtime dependencies are required. The site does not use a database — all persistent data (hit counter, guestbook) is stored in flat files under `data/`.

---

## 6. Data Schemas

### 6.1 Guestbook Entry (`data/guestbook.json`)

The file contains a JSON array of entry objects:

```json
[
  {
    "name": "Diego",
    "message": "Aguante Boca!",
    "timestamp": "2024-12-01T18:30:00.000Z"
  }
]
```

| Field | Type | Constraints |
|---|---|---|
| `name` | string | Required. 1–50 characters. Stripped of HTML tags before storage. |
| `message` | string | Required. 1–500 characters. Stripped of HTML tags before storage. |
| `timestamp` | string (ISO 8601) | Set by the server at submission time. |

If the file does not exist when the server starts or when a read is attempted, the server creates it with an empty array `[]`.

### 6.2 Hit Counter (`data/hit_count.txt`)

A plain-text file containing a single integer (e.g., `42`). If the file does not exist, the server creates it with `0`.

---

## 7. Edge Cases

| Scenario | Expected Behavior |
|---|---|
| Concurrent guestbook writes | Acceptable to lose a write in a race condition; no locking required for this project scope. |
| Hit counter overflow | The counter is displayed as a 6-digit zero-padded string. If the value exceeds 999999, display all digits without truncation (e.g., `1000000`). |
| Empty guestbook | Display the text *"¡Sé el primero en firmar el libro!"* instead of an empty list. |
| Missing GIF assets | The page layout must not break if an image fails to load. Use `alt` text on every `<img>` tag (e.g., `alt="under construction"`). |
| Browser without marquee support | Modern browsers have removed `<marquee>`. Provide a CSS fallback animation that scrolls text horizontally for browsers that do not support the tag. |
| XSS via guestbook | All user input (name, message) must be sanitized by stripping HTML tags before storing and by using EJS escaped output (`<%= %>`) when rendering. |
| Long player slug | If `:slug` does not match any known player, return 404. No partial matching. |
| `data/` directory missing | The server creates the `data/` directory on startup if it does not exist. |

---

## 8. Out of Scope

The following are explicitly **not** part of this project:

- User authentication or login system.
- Admin panel for managing content.
- Database (PostgreSQL, MongoDB, etc.) — flat files only.
- Client-side JavaScript frameworks (React, Vue, etc.).
- Responsive/mobile-first design — the site targets desktop browsers, as was typical in the 90s.
- SEO optimization or meta tags beyond a basic `<title>`.
- HTTPS / TLS configuration (handled at deployment infrastructure level).
- Internationalization — all content is in Spanish.
- Deployment pipeline or Docker configuration.

---

## 9. Open Questions

These items require input from the engineering or design team before implementation:

1. **GIF sourcing**: Should animated GIFs be created as original artwork, or is it acceptable to use freely licensed retro GIFs from public archives (e.g., gifcities.org)?
2. **Player data completeness**: The spec calls for 10–15 players. Should the list be limited to historical legends, or include any current squad players?
3. **Audio autoplay**: Modern browsers block autoplay audio. Should the optional MIDI feature (§4.7) be dropped entirely, or implemented behind a user-click interaction?
