# CNBASITE — Technical Review

**Reviewer:** Tech Lead Agent  
**Date:** 2026-04-14  
**Scope:** Full codebase audit — code quality, architecture, performance, accessibility, security  
**Verdict:** Approved with recommendations

---

## 1. Project Summary

CNBASITE is a content-pipeline project for the Club Atlético Banco de la Nación Argentina (CABNA) website redesign. It consists of:

| Component | Files | Purpose |
|---|---|---|
| Web scraper | `scraper.py` | Extracts content from clubbanconacion.org.ar |
| Test suite | `test_scraper.py` | Validates scraped output schema (12 test classes, 28 assertions) |
| Design tokens | `tokens-style{1,2,3}.json` | Machine-readable theme definitions for three visual concepts |
| Style guide | `style-guide.md` | Human-readable design specification with accessibility notes |
| Content spec | `site-copy.md` | Production-ready copy for every website section |
| Scraped data | `data/*.json`, root `*.json` | Structured JSON output consumed by downstream agents |
| Documentation | `README.md` | Setup and usage instructions |

**Key observation:** This project contains no HTML, CSS, or deployed web pages. It is a data and design layer that feeds into a separate implementation phase. Acceptance criteria relating to HTML validation and Lighthouse scores are not applicable to this codebase in its current form and are documented accordingly below.

---

## 2. Architecture Review

### 2.1 Overall Structure — Approved

The project follows a clear pipeline architecture: scrape → parse → structure → output. Each phase has dedicated functions. The separation between scraping logic, data transformation, and output serialisation is sound.

**Decision:** Single-file scraper is appropriate for this scope.  
**Context:** The scraper targets one website (7 pages) and one Instagram profile. A multi-module package would add overhead without benefit.  
**Consequence:** If scraping scope grows (multiple clubs, scheduled runs), refactoring into a package with separate modules per source would be warranted.

### 2.2 Data Duplication — Issue

The scraper produces two copies of most data:

| Root file | data/ file | Root size | data/ size |
|---|---|---|---|
| `club_website_content.json` | `data/club_website_content.json` | 19 KB | 59 KB |
| `sitemap.json` | `data/sitemap.json` | 7.6 KB | 4.1 KB |
| `image_assets.json` | `data/image_assets.json` | 6.7 KB | 7.7 KB |

The `data/` versions are the raw scraper output. The root versions are reshaped for downstream test compatibility. Both are committed to version control.

**Recommendation:** Keep only one canonical version. If the test suite requires a specific schema, have the scraper produce that schema directly and eliminate the duplicate. Alternatively, generate root-level files via a separate transform step and `.gitignore` one set to avoid stale data.

### 2.3 Design Token Architecture — Approved with Notes

The three token files share a consistent top-level schema: `name`, `version`, `colors`, `typography`, `spacing`, `borderRadius`, `shadows`, `transitions`, `components`. This is solid.

**Token key inconsistencies found:**

| Category | Style 1 only | Style 2 only | Style 3 only |
|---|---|---|---|
| colors | — | — | `surfaceDark` |
| shadows | — | `glow`, `glowAccent` | — |
| letterSpacing | — | `widest` | `widest` |
| components.button | — | — | `goldVariantBg`, `goldVariantText`, `goldVariantHoverBg` |
| components.card | — | `hoverBorderColor`, `accentBar` | `headerBorder` |
| components.hero | — | `headingTextTransform`, `accentLine`, `headingLetterSpacing` | `headingFontFamily`, `goldAccent`, `decorativeDivider` |

These per-style extensions are intentional (each theme has unique design features), but they create a non-uniform contract for consumers. A build tool that iterates over all token keys to generate CSS custom properties would produce different variable sets per theme.

**Recommendation:** Define a base schema that all three themes implement (with `null` or default values for unused properties). Style-specific extensions should be in a clearly separated `extensions` key so consumers know which properties are guaranteed and which are optional.

### 2.4 Hardcoded Data in Scraper — Issue

Several scraper functions contain hardcoded strings rather than extracting them from the DOM:

- `scrape_hacete_socio_page()` (97 lines): Returns a static dictionary with 27 hardcoded strings — plan names, prices, benefits, requirements. None of this data is actually scraped from the page.
- `build_instagram_data()` (113 lines): Returns fully hardcoded Instagram profile data including follower counts, bio text, and post URLs.
- `scrape_actividades_page()` (7 lines): Returns a static list of categories without parsing the page.

**Recommendation:** Either (a) rename these functions to `build_*` to signal they return static reference data, not scraped content, or (b) implement actual DOM extraction. The current naming implies scraping but the implementation is a data fixture. This matters for maintainability — when prices change, a developer will expect to re-run the scraper, not edit source code.

---

## 3. Code Quality Review

### 3.1 Python Code — Good

- Both `.py` files compile without errors.
- `scraper.py` uses type-safe patterns: explicit `dict`/`list` construction, `.get()` with defaults, `strip()` on all text extraction.
- Error handling is appropriate: `requests.RequestException` catch in `fetch_page()`, `ImportError` catch for missing dependencies.
- No bare `except` clauses. No use of `eval`, `exec`, `subprocess`, or `os.system`.
- The 0.5-second sleep between requests (`time.sleep(0.5)`) is respectful of the target server.

**Issues found:**

1. **`main()` is 307 lines.** This function handles scraping, data transformation, root-level file generation, and console output. It should be split into `scrape_website()`, `generate_root_files()`, and `print_summary()`.

2. **`scrape_home_page()` uses fragile content matching.** Sections are identified by checking for specific Spanish strings (e.g., `"Seguidores" in text and "redes sociales" in text`). If the site copy changes even slightly, these matches will silently fail and return empty data. This is inherent to scraping but should be documented.

3. **No type hints.** All functions use `def f(soup):` without parameter or return type annotations. For a codebase consumed by multiple agents, adding `-> dict`, `-> list[dict]`, etc. would improve discoverability.

### 3.2 Test Suite — Good

- 28 test assertions across 4 test classes covering all output files.
- Tests validate schema structure, required keys, data types, and specific expected values.
- Tests are pure data validation (no network calls, no mocking needed) — fast and reliable.

**Issue:** Tests depend on pre-existing JSON files rather than running the scraper. If the scraper breaks but old output files remain, tests will still pass. This is acceptable for a pipeline where scraping and validation are separate steps, but it should be documented.

### 3.3 JSON Data — Valid

All 11 JSON files parse without errors. No truncated files or malformed structures.

### 3.4 Documentation — Good

- `README.md` is concise and accurate: setup, output file descriptions, test command.
- `style-guide.md` is comprehensive: three full visual concepts with rationale, colour palettes, typography, component specs, accessibility notes, and implementation guidance.
- `site-copy.md` is production-ready: structured per-section copy with tone guidelines and content analysis.

---

## 4. Security Audit — Passed

### 4.1 Credentials and Secrets

- **No API keys, tokens, or passwords** found anywhere in the codebase.
- No `.env` files, no `config.ini`, no secrets in any format.
- The emails (`cabna@argentina.com`) and phone numbers found are **public contact information** published on the club's website — not credentials.
- The `120.0.0.0` match is a Chrome version string in the User-Agent header, not a server IP.

### 4.2 Code Safety

- No use of `eval()`, `exec()`, `subprocess`, `os.system()`, `pickle`, or `marshal`.
- No shell injection vectors.
- External input (HTML from web requests) is processed through BeautifulSoup, which is a safe HTML parser.
- No SQL, no database connections, no file path construction from user input.

### 4.3 .gitignore Coverage

Current `.gitignore` only excludes `__pycache__/`. This is minimal but sufficient — there are no build artifacts, no environment files, and no generated assets that need exclusion beyond what exists.

**Recommendation:** Add common Python ignores (`.env`, `*.pyc`, `.venv/`, `dist/`, `*.egg-info/`) as a preventive measure for future development.

---

## 5. Accessibility Audit

### 5.1 Design Token Contrast — Issues Found

The style guide (lines 287–298) claims WCAG 2.1 AA compliance for all three themes. Independent verification reveals two inaccurate claims:

| Pairing | Claimed ratio | Actual ratio | WCAG AA normal | WCAG AA large |
|---|---|---|---|---|
| Style 1: `#1A1A2E` on `#FAFAFA` | 15.4:1 | **16.3:1** | ✅ PASS | ✅ PASS |
| Style 1: `#6B6B80` on `#FAFAFA` | 5.0:1 | **5.0:1** | ✅ PASS | ✅ PASS |
| Style 2: `#FFFFFF` on `#0D0D0D` | 19.4:1 | **19.4:1** | ✅ PASS | ✅ PASS |
| Style 2: `#B0B0B0` on `#0D0D0D` | 10.3:1 | **9.0:1** | ✅ PASS | ✅ PASS |
| Style 3: `#2C2C2C` on `#FAF8F4` | 13.2:1 | **13.2:1** | ✅ PASS | ✅ PASS |
| Style 3: `#5A5A5A` on `#FAF8F4` | 6.3:1 | **6.5:1** | ✅ PASS | ✅ PASS |
| **Button: `#E94560` + white** | **4.6:1** | **3.8:1** | ❌ **FAIL** | ✅ PASS |
| **Button: `#FF2D55` + white** | **4.5:1** | **3.6:1** | ❌ **FAIL** | ✅ PASS |
| Button: `#1B3A4B` + `#FAF8F4` | 9.2:1 | **11.3:1** | ✅ PASS | ✅ PASS |
| Button: `#C8A951` + `#1B3A4B` | 4.7:1 | **5.3:1** | ✅ PASS | ✅ PASS |

**Critical finding:** The coral button (Style 1, `#E94560`) and red button (Style 2, `#FF2D55`) both **fail WCAG AA for normal-sized text** (minimum 4.5:1 required). The style guide claims they pass. They only pass AA at large text sizes (≥18px regular or ≥14px bold).

**Recommendation:**
- For Style 1: Darken the coral to `#D63A52` (contrast ≈ 4.6:1) or ensure buttons always use `font-weight: 600+` at `≥ 14px` to qualify under the large-text exception.
- For Style 2: Darken the red to `#E52049` (contrast ≈ 4.5:1) or enforce the same large-text constraint. Since the style already specifies `font-weight: 700` and `font-size: 0.875rem (14px)`, it technically qualifies for AA large text — but this should be stated accurately in the style guide rather than implying unrestricted AA compliance.
- Update the contrast ratio claims in `style-guide.md` lines 295–296 to reflect actual values.

---

## 6. Performance Review

### 6.1 Scraper Performance

- Requests use a 30-second timeout — appropriate for a synchronous scraper.
- The 0.5-second politeness delay between pages totals ~3.5 seconds for 7 pages — acceptable.
- `lxml` parser is specified for BeautifulSoup, which is the fastest available parser.
- Image deduplication uses `set()` lookups — O(1) per check.

**Potential improvement:** The `main()` function writes two copies of each dataset sequentially. If the root-level file generation were eliminated (see §2.2), scraping time would be unchanged but I/O would halve.

### 6.2 JSON File Sizes

All output files are reasonable for their content:
- Largest file: `data/club_website_content.json` at 59 KB (full website text extraction).
- Total data footprint: ~110 KB across all JSON files.
- No performance concern for downstream consumers.

---

## 7. HTML Validation & Lighthouse Scores

### 7.1 Status: Not Applicable

This project contains **no HTML or CSS files**. It is a data-extraction and design-specification layer. The HTML/CSS implementation phase consumes the outputs of this project (design tokens, content spec, scraped data) but lives in a separate scope.

There are no web pages to validate against W3C standards or to score with Lighthouse.

### 7.2 CSS Theme Architecture

While there is no CSS in this project, the **design token architecture** serves as the CSS specification layer. Review of this architecture is covered in §2.3 above. The token structure is maintainable and scalable, with the noted recommendation to normalise cross-theme key consistency.

---

## 8. Outstanding Recommendations

Ranked by impact:

| Priority | Area | Recommendation |
|---|---|---|
| **High** | Accessibility | Fix contrast ratio claims in style-guide.md for coral and red buttons. Either darken the colours or explicitly document the large-text constraint. |
| **High** | Architecture | Eliminate data duplication between root-level and `data/` JSON files. Choose one canonical location. |
| **Medium** | Code quality | Split `main()` (307 lines) into focused functions: `scrape_website()`, `generate_output_files()`, `print_summary()`. |
| **Medium** | Code quality | Rename `scrape_hacete_socio_page()`, `scrape_actividades_page()`, and `build_instagram_data()` to accurately reflect that they return static data, not scraped content. |
| **Medium** | Tokens | Normalise token schemas: define a guaranteed base contract and separate style-specific extensions into a dedicated key. |
| **Low** | Code quality | Add return type hints to all scraper functions. |
| **Low** | DevOps | Expand `.gitignore` with standard Python ignores (`.env`, `.venv/`, `dist/`, `*.egg-info/`). |
| **Low** | Testing | Document that tests validate output files, not the scraper itself — re-running tests after a scraper regression will still pass if old files exist. |

---

## 9. Approval

**Verdict: Approved for the current project phase.**

The codebase is clean, well-documented, and free of security issues. The design token system and content specification are production-quality deliverables ready for the implementation phase. The recommendations above are improvements, not blockers — the project is in a solid state for handoff.

The two items that should be addressed before the design tokens are consumed by a frontend implementation:
1. Correct the button contrast ratio claims (accessibility compliance).
2. Normalise the token key schema across all three themes (build-tool compatibility).

---

*Review conducted against commit `b809fa6` on branch `main`.*
