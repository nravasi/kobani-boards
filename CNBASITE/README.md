# CNBASITE

Design workspace and content pipeline for the CABNA (Club Atlético Banco de la Nación Argentina) website redesign. This project contains a web scraper that extracts content from the existing club site, structured JSON data files, production-ready site copy, and three complete visual style systems with design tokens.

---

## Prerequisites

Install these tools before you begin:

| Tool | Minimum Version | Check Command |
|------|-----------------|---------------|
| **Git** | 2.30+ | `git --version` |
| **Python** | 3.9+ | `python3 --version` |
| **pip** | 21.0+ | `pip3 --version` |

### Python Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `requests` | 2.28+ | HTTP requests for web scraping |
| `beautifulsoup4` | 4.12+ | HTML parsing and content extraction |

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/nravasi/kobani-boards.git
cd kobani-boards/CNBASITE
```

### 2. Create a virtual environment (recommended)

**macOS / Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows (Command Prompt):**

```cmd
python -m venv venv
venv\Scripts\activate
```

**Windows (PowerShell):**

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install requests beautifulsoup4
```

### 4. Verify the setup

Run the test suite against the included JSON data files:

```bash
python3 -m unittest test_scraper -v
```

All 33 tests should pass. You do not need network access for this step — the tests validate the pre-scraped JSON files already in the repository.

### 5. Run the scraper (optional)

To re-scrape fresh data from the live CABNA website:

```bash
python3 scraper.py
```

This fetches all pages from `clubbanconacion.org.ar`, extracts structured content, and writes four JSON output files into the current directory. An active internet connection is required.

---

## Project Structure

```
CNBASITE/
├── README.md                        # This file
├── scraper.py                       # Web scraper for clubbanconacion.org.ar
├── test_scraper.py                  # Unit tests for scraped data integrity
├── .gitignore                       # Ignores __pycache__/
│
├── club_website_content.json        # Scraped content from all site pages
├── sitemap.json                     # Site structure, navigation, and tech stack
├── image_assets.json                # Catalogue of all images found on the site
├── instagram_cabnaoficial.json      # Instagram profile data for @cabnaoficial
│
├── site-copy.md                     # Production-ready English copy for every section
├── style-guide.md                   # Full design spec for all three visual styles
│
├── tokens-style1.json               # Design tokens — Modern Minimal
├── tokens-style2.json               # Design tokens — Bold Athletic
└── tokens-style3.json               # Design tokens — Classic Prestigious
```

### Key files explained

| File | What it does |
|------|-------------|
| **scraper.py** | Fetches HTML from seven pages of the CABNA site, parses each page into structured data (hero banners, navigation, sports listings, membership plans, contact info), and writes the results as JSON. Also compiles Instagram profile metadata. |
| **test_scraper.py** | 33 unit tests that validate the structure and content of every JSON output file. Covers page sections, navigation hierarchy, image assets, and Instagram data. |
| **club_website_content.json** | The main data file. Contains parsed content for all seven site sections: home, el-club, deportes, actividades, novedades, contacto, and hacete-socio. |
| **sitemap.json** | Documents the site's navigation tree, page list, 19 sports pages, 3 activity pages, external social links, and detected technology stack (Laravel/Livewire, Bootstrap 5, Swiper.js). |
| **site-copy.md** | Rewritten English copy for a redesigned site. Includes hero text, about section, membership benefits, events, gallery, news, contact form, and footer — all production-ready. |
| **style-guide.md** | Detailed design specification for three visual themes. Covers colour palettes, typography, component treatments (buttons, cards, navigation, hero), accessibility notes, and font-loading recommendations. |
| **tokens-style*.json** | Machine-readable design tokens for each style. Identical key structure across all three files, making theme switching straightforward. |

---

## Styles

This project provides three distinct visual themes for the club website. Each theme has a complete set of design tokens (colours, typography, spacing, component styles) stored in a JSON file. The token structure is identical across all three files, so switching themes means swapping the token source — every component updates automatically.

### Style 1: Modern Minimal

**Token file:** `tokens-style1.json`

**Aesthetic intent:** Clean, content-first design that uses generous whitespace and a neutral dark-navy foundation. A single vibrant red accent creates focal points on calls to action and key information. The look communicates professionalism and clarity — built for fans who value fast scanning and a polished digital experience.

**Visual characteristics:**
- Light white background (`#FFFFFF`) with cool grey alternates
- Dark navy (`#1A1A2E`) and vibrant red (`#E94560`) accent pairing
- Inter typeface for both headings and body — geometric, unified, modern
- Subtle card shadows with rounded corners (0.75rem)
- Clean horizontal navigation bar with a 1px bottom border
- Hero section uses a dark navy-to-blue gradient at 85vh

**How to activate:**

Load `tokens-style1.json` and map its values to CSS custom properties:

```css
/* Example: generated from tokens-style1.json */
:root {
  --color-primary: #1A1A2E;
  --color-secondary: #E94560;
  --color-background: #FFFFFF;
  --font-heading: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
}
```

**Google Fonts import:** `Inter:wght@400;500;600;700`

---

### Style 2: Bold Athletic

**Token file:** `tokens-style2.json`

**Aesthetic intent:** High-energy, stadium-inspired design that hits hard and fast. A near-black background creates an immersive stage where gold and orange accents punch through like stadium lights. Condensed uppercase headings echo sports broadcasting. This style targets the passionate fan who wants the site to feel as intense as being in the stands.

**Visual characteristics:**
- Dark near-black background (`#0A0A0F`) throughout
- Stadium gold (`#FFD700`) and blaze orange (`#FF4500`) accents
- Oswald headings (bold, uppercase, wide letter-spacing) paired with Source Sans 3 body text
- Angular card design with minimal border-radius (0.25rem) and 3px gold accent bars
- Navigation with a bold 2px gold bottom border — like a scoreboard ticker
- Hero section at 90vh with massive 4.5rem uppercase headings

**How to activate:**

Load `tokens-style2.json` and map its values to the same CSS custom properties:

```css
/* Example: generated from tokens-style2.json */
:root {
  --color-primary: #FFD700;
  --color-secondary: #002B5C;
  --color-background: #0A0A0F;
  --font-heading: 'Oswald', 'Anton', 'Impact', sans-serif;
  --font-body: 'Source Sans 3', 'Roboto', Arial, sans-serif;
}
```

**Google Fonts import:** `Oswald:wght@400;500;600;700` and `Source+Sans+3:wght@400;500;600`

---

### Style 3: Classic Prestigious

**Token file:** `tokens-style3.json`

**Aesthetic intent:** Timeless, institution-inspired design that draws on the visual language of vintage club crests, formal award dinners, and decades of tradition. Warm tones and serif typography communicate respect, history, and quiet confidence. This style suits a club that wants to emphasise its achievements and standing.

**Visual characteristics:**
- Warm off-white background (`#FAF8F5`) with warm grey alternates
- Deep teal (`#1B3A4B`) and muted gold (`#C9A84C`) accent pairing
- Playfair Display serif headings with Lora serif body text — elegant and readable
- Generous card padding (2rem) with warm grey borders and gold header accents
- Deep teal navigation with a 3px gold bottom border
- Hero section at 75vh — slightly shorter, maintaining dignified proportion

**How to activate:**

Load `tokens-style3.json` and map its values to the same CSS custom properties:

```css
/* Example: generated from tokens-style3.json */
:root {
  --color-primary: #1B3A4B;
  --color-secondary: #8B6F47;
  --color-background: #FAF8F5;
  --font-heading: 'Playfair Display', 'Georgia', 'Times New Roman', serif;
  --font-body: 'Lora', 'Cambria', 'Georgia', serif;
}
```

**Google Fonts import:** `Playfair+Display:wght@400;600;700` and `Lora:wght@400;500;600;700`

---

### Switching Between Styles

All three token files share an identical key structure (`colors.*`, `typography.*`, `spacing.*`, `components.*`). To switch themes at build time or runtime:

1. **Build-time:** Point your CSS generation script at a different token file. Re-run to produce new custom properties.
2. **Runtime:** Load the desired token JSON, iterate over its keys, and set each as a CSS custom property on `document.documentElement`. All components that reference these variables update instantly.

```js
// Runtime theme switching example
async function applyTheme(styleName) {
  const res = await fetch(`tokens-${styleName}.json`);
  const tokens = await res.json();

  const root = document.documentElement;
  root.style.setProperty('--color-primary', tokens.colors.primary);
  root.style.setProperty('--color-secondary', tokens.colors.secondary);
  root.style.setProperty('--color-background', tokens.colors.background);
  root.style.setProperty('--font-heading', tokens.typography.headingFamily);
  root.style.setProperty('--font-body', tokens.typography.bodyFamily);
  // ... map remaining tokens
}

// Usage
applyTheme('style1'); // Modern Minimal
applyTheme('style2'); // Bold Athletic
applyTheme('style3'); // Classic Prestigious
```

### Accessibility

All three styles meet WCAG 2.1 AA requirements for primary text/background combinations:

| Style | Text on Background | Contrast Ratio | Level |
|-------|-------------------|----------------|-------|
| Modern Minimal | `#1A1A2E` on `#FFFFFF` | 15.4:1 | AAA |
| Bold Athletic | `#FFFFFF` on `#0A0A0F` | 19.5:1 | AAA |
| Classic Prestigious | `#2C2C2C` on `#FAF8F5` | 12.8:1 | AAA |

---

## Running Tests

The test suite validates the integrity of all four JSON data files:

```bash
python3 -m unittest test_scraper -v
```

Expected output: 33 tests, all passing. Tests cover:

- All seven page sections present in `club_website_content.json`
- Navigation structure and sports dropdown in `sitemap.json`
- Image cataloguing and alt-text coverage in `image_assets.json`
- Instagram profile metadata in `instagram_cabnaoficial.json`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: No module named 'requests'` | Run `pip install requests beautifulsoup4` inside your virtual environment. |
| `python3: command not found` (Windows) | Use `python` instead of `python3`. Ensure Python is added to your PATH during installation. |
| Scraper fails with connection errors | The live site (`clubbanconacion.org.ar`) may be temporarily down. The pre-scraped JSON files in the repo are still usable. |
| Tests fail after re-scraping | The live site content may have changed. Tests validate the committed JSON files; re-scraping produces fresh data that may differ. |
