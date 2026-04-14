# Riquelme Fan Site

A retro early-2000s fan site dedicated to Juan Román Riquelme, built with static HTML, CSS, and vanilla JavaScript. The site recreates the look and feel of a GeoCities-era personal homepage — tiled backgrounds, marquee text, animated GIFs, beveled tables, and Comic Sans.

The site lives in the `riquelme-fan/` directory of this repository and runs entirely in the browser with no build step.

---

## Prerequisites

Install the following tools before you begin. Version numbers are minimums.

| Tool | Version | Purpose |
|---|---|---|
| [Git](https://git-scm.com/) | ≥ 2.30 | Clone the repository |
| Web browser | Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+ | View the site |
| [Python](https://www.python.org/) (optional) | ≥ 3.8 | Run a local development server |
| [Node.js](https://nodejs.org/) (optional) | ≥ 18.0 | Run tests or use `npx serve` as a local server |

> **Note:** Python and Node.js are optional. You can open the HTML files directly in a browser without either.

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/nravasi/kobani-boards.git
cd kobani-boards/riquelme-fan
```

### 2. Run the site

Choose one of the three options below. All three work on **macOS**, **Windows**, and **Linux**.

#### Option A — Open directly in your browser (no server needed)

Open `index.html` in your browser using the file path.

**macOS**

```bash
open index.html
```

**Linux**

```bash
xdg-open index.html
```

**Windows (PowerShell)**

```powershell
start index.html
```

> The message board's localStorage features work in most browsers via `file://`, but some browsers restrict local storage on file URLs. If messages fail to save, use Option B or C.

#### Option B — Python local server

```bash
python3 -m http.server 8000
```

On Windows, use `python` instead of `python3` if that is how your installation is named:

```powershell
python -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

#### Option C — Node.js local server

```bash
npx serve -l 8000
```

Then open **http://localhost:8000** in your browser. This command works identically on macOS, Windows, and Linux.

### 3. Run the tests (optional)

The message board includes a test suite that runs with the Node.js built-in test runner.

```bash
cd js
node --test messageboard.test.js
```

You should see output confirming all tests pass (validation, persistence, XSS prevention, and rendering).

---

## Visual Styles

The site uses three distinct visual styles. Each page applies a different look by setting a CSS class on the `<body>` element. All three styles share the same base stylesheet (`css/style.css`) and the same retro design language — gold-and-blue Boca Juniors colors, Impact headings, and animated GIF accents — but diverge in background treatment and layout emphasis.

### 1. Retro Showcase (Home)

| Property | Detail |
|---|---|
| **Page** | `index.html` |
| **Body class** | _(none — default)_ |
| **Background** | Tiled blue-and-gold diagonal stripe pattern (`images/bg-tile.png`), repeating across the viewport. Falls back to solid dark blue (`#000066`) if the image fails to load. |
| **Aesthetic intent** | Recreates the quintessential late-90s/early-2000s personal homepage. Marquee banners scroll across the page. A giant "10" hero section anchors the layout. Stats tables and a green-digit hit counter complete the period-accurate feel. |
| **Key elements** | Hero section, scrolling marquee, news table with "NEW!" blink animation, career stats table, titles table, hit counter, animated sparkle GIFs. |

**To activate:** Open `index.html`. No class is needed on `<body>` — this is the default style.

### 2. Dark Cinema (Gallery)

| Property | Detail |
|---|---|
| **Page** | `gallery.html` |
| **Body class** | `gallery-page` |
| **Background** | Solid dark navy (`#001040`). The tiled pattern is removed so photographs stand out without visual competition. |
| **Aesthetic intent** | Shifts the focus to imagery. The dark, untextured background acts like a gallery wall, letting the gold-bordered photo grid command attention. Section dividers use flame-animated GIFs instead of rainbow bars for a bolder contrast. |
| **Key elements** | Two-row photo grid organized by era ("Primeros Años" and "Gloria y Despedida"), thick gold-bordered table cells, descriptive captions below each image. |

**To activate:** Open `gallery.html`. The `<body>` tag includes `class="gallery-page"`. To apply this style to any page, add that class to its `<body>` element.

### 3. Starfield (Message Board)

| Property | Detail |
|---|---|
| **Page** | `messageboard.html` |
| **Body class** | `msgboard-page` |
| **Background** | Stars-on-dark-blue tiled pattern (`images/bg-stars.png`), repeating across the viewport. Creates a nighttime/cosmic feel distinct from the striped home background. |
| **Aesthetic intent** | Sets a community atmosphere for fan interaction. The starfield backdrop and cream-colored form inputs create a visual distinction from the showcase pages, signaling that this is a space for visitors to participate rather than just read. |
| **Key elements** | Message submission form with name, email, and text fields. Reverse-chronological message list rendered from localStorage. Live stats counter. Seed messages from fictional early-2000s fans. |

**To activate:** Open `messageboard.html`. The `<body>` tag includes `class="msgboard-page"`. To apply this style to any page, add that class to its `<body>` element.

### Switching styles on a custom page

To apply a style to a new HTML page, link the shared stylesheet and set the body class:

```html
<link rel="stylesheet" href="css/style.css">

<!-- Retro Showcase: no class needed -->
<body>

<!-- Dark Cinema -->
<body class="gallery-page">

<!-- Starfield -->
<body class="msgboard-page">
```

---

## Project Structure

All site files live under `riquelme-fan/` in the repository root.

```
riquelme-fan/
├── index.html              # Home page (Retro Showcase style)
├── gallery.html            # Photo gallery (Dark Cinema style)
├── messageboard.html       # Message board (Starfield style)
├── README.md               # Short workspace description
│
├── css/
│   └── style.css           # All styles: base reset, three visual themes,
│                           #   navigation, tables, forms, animations
│
├── js/
│   ├── messageboard.js     # Message board logic — localStorage CRUD,
│   │                       #   validation, XSS escaping, rendering
│   └── messageboard.test.js # 30+ unit tests (Node.js built-in runner)
│
└── images/
    ├── bg-tile.png         # Tiled background for Home (blue/gold stripes)
    ├── bg-stars.png        # Tiled background for Message Board (stars)
    ├── riquelme_1.jpg      # Gallery photos (8 total, _1 through _8)
    │   ...
    ├── riquelme_8.jpg
    ├── soccer-ball.gif     # Spinning ball icon in navigation bar
    ├── sparkle.gif         # Decorative sparkle next to headings
    ├── rainbow-hr.gif      # Rainbow horizontal-rule divider
    ├── fire-divider.gif    # Flame-animated section divider
    └── under-construction.gif  # "Under construction" badge
```

### Key files at a glance

| File | What it does |
|---|---|
| `index.html` | Landing page with hero banner, news, career stats, titles, and hit counter. |
| `gallery.html` | Eight captioned photos of Riquelme arranged in two thematic rows. |
| `messageboard.html` | Fan message board with form input and live-rendered posts. |
| `css/style.css` | Single stylesheet containing the base reset, all three visual themes, component styles (tables, forms, navigation), and CSS animations (blink, sparkle, marquee fallback). |
| `js/messageboard.js` | Self-contained IIFE module. Manages posts in `localStorage`, validates input, escapes HTML to prevent XSS, and renders messages to the DOM. Ships with eight seed posts on first visit. |
| `js/messageboard.test.js` | Test suite covering validation, persistence, render order, reload survival, and XSS prevention. Run with `node --test`. |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Messages disappear after closing the browser | Your browser may clear `localStorage` on exit. Check your privacy settings or use a local server (Option B/C) instead of `file://`. |
| Marquee text does not scroll | Modern browsers have deprecated `<marquee>`. The site includes a CSS fallback animation that activates when JavaScript is disabled. In most current browsers, `<marquee>` still works. |
| Images show broken-icon placeholders | Confirm you are running from the `riquelme-fan/` directory so relative paths resolve correctly. If using a local server, start it from inside `riquelme-fan/`. |
| `node --test` fails with "unknown flag" | You need Node.js 18 or later. The built-in test runner was introduced in Node.js 18. |
