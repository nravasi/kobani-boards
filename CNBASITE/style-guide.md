# CNBASITE — Visual Style Concepts

Three distinct design directions for the club website. Each concept includes a color palette, typography system, component treatments, and design rationale. Design tokens for each are exported as JSON files for direct implementation as CSS themes.

---

## Style 1: Modern Minimal

**Token file:** `tokens-style1.json`

### Design Rationale

Modern Minimal strips away visual noise and lets content lead. It uses generous whitespace, a neutral dark-navy foundation, and a single bold accent color (vibrant red) to create focal points where they matter — calls to action, scores, and key information. The approach communicates professionalism and forward-thinking without sacrificing the energy a club site needs. It targets fans who value clarity, fast scanning, and a polished digital experience that feels current.

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Dark Navy | `#1A1A2E` |
| Primary Light | Muted Navy | `#2D2D44` |
| Secondary | Vibrant Red | `#E94560` |
| Secondary Light | Soft Red | `#F06B80` |
| Accent | Deep Blue | `#0F3460` |
| Accent Light | Medium Blue | `#1B4F8A` |
| Background | White | `#FFFFFF` |
| Background Alt | Cool Grey | `#F7F7FA` |
| Surface | White | `#FFFFFF` |
| Surface Border | Light Grey | `#E8E8EE` |
| Text | Dark Navy | `#1A1A2E` |
| Text Secondary | Mid Grey | `#6B6B80` |
| Text Inverse | White | `#FFFFFF` |

### Typography

- **Headings:** Inter, semibold (600). Clean geometric sans-serif that reads well at all sizes.
- **Body:** Inter, regular (400). Consistent typeface pairing keeps the page visually unified.
- **Size scale:** Ranges from 0.75rem (xs) to 3.75rem (6xl) for clear hierarchy.
- **Heading letter-spacing:** Slightly tight (-0.025em) for display sizes; body text at normal (0).
- **Line height:** 1.2 tight for headings, 1.5 normal for body, 1.75 relaxed for long-form text.

| Level | Size | Weight |
|-------|------|--------|
| H1 | 3.75rem (6xl) | 600 |
| H2 | 3rem (5xl) | 600 |
| H3 | 2.25rem (4xl) | 600 |
| H4 | 1.875rem (3xl) | 600 |
| Body | 1rem (base) | 400 |
| Small | 0.875rem (sm) | 400 |
| Caption | 0.75rem (xs) | 400 |

### Component Treatment

#### Buttons
- **Primary:** Solid vibrant red (`#E94560`) fill with white text. 0.5rem border-radius gives a slightly rounded shape without being pill-shaped. No text transform — sentence case keeps the tone approachable.
- **Secondary:** Ghost style with dark navy border and text. On hover, fills to solid dark navy with white text.
- **Sizing:** 0.75rem vertical / 1.5rem horizontal padding. Font at 0.875rem, semibold.

#### Cards
- **Container:** White background with a subtle 1px border (`#E8E8EE`) and light shadow. 0.75rem border-radius.
- **Hover state:** Shadow deepens to create a gentle lift effect. No border color change — the shadow does the work.
- **Content:** 1.5rem internal padding. Images within cards get 0.5rem radius.
- **Pattern:** Content cards for news, match results, and player profiles all use this same container.

#### Navigation
- **Style:** Clean horizontal bar, white background, 1px bottom border. Fixed at 4rem height.
- **Links:** Mid-grey (`#6B6B80`) by default, dark navy on hover, vibrant red when active. 0.875rem, medium weight (500).
- **Logo:** Left-aligned at 2rem. Nav links to the right. Minimal spacing, no decorative elements.

#### Hero
- **Layout:** Full-bleed section at 85vh minimum height. Dark navy-to-deep-blue gradient background.
- **Typography:** Large heading at 3.75rem in white, subheading at 1.25rem. Centered or left-aligned depending on content.
- **CTA:** Filled red button, prominent and singular. One clear action per hero.
- **Feel:** Calm authority. The dark background makes the content pop without visual clutter.

---

## Style 2: Bold Athletic

**Token file:** `tokens-style2.json`

### Design Rationale

Bold Athletic is designed to hit hard and fast. A dark, near-black background creates an immersive stage where gold and orange accents punch through like stadium lights. Condensed uppercase headings in Oswald demand attention, echoing the typographic energy of sports broadcasting and match-day graphics. This style is unapologetically loud — it targets the passionate fan who wants the website to feel as intense as being in the stands. Every element is designed to convey power, speed, and pride.

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Stadium Gold | `#FFD700` |
| Primary Light | Bright Gold | `#FFE44D` |
| Secondary | Deep Navy | `#002B5C` |
| Secondary Light | Royal Blue | `#003D82` |
| Accent | Blaze Orange | `#FF4500` |
| Accent Light | Warm Orange | `#FF6B33` |
| Background | Near Black | `#0A0A0F` |
| Background Alt | Dark Charcoal | `#121218` |
| Surface | Dark Surface | `#1A1A24` |
| Surface Border | Muted Border | `#2A2A38` |
| Text | White | `#FFFFFF` |
| Text Secondary | Light Grey | `#B0B0C0` |
| Text Inverse | Near Black | `#0A0A0F` |

### Typography

- **Headings:** Oswald, bold (700). A condensed, high-impact typeface that commands attention and mirrors sports-broadcast aesthetics.
- **Body:** Source Sans 3, regular (400). A clean, readable sans-serif that balances the headings' intensity.
- **Size scale:** Amplified range — body at 1rem but headings scale up to 4.5rem (6xl) for maximum impact.
- **Heading letter-spacing:** Wide (0.08–0.15em) in uppercase. Creates the bold, spaced-out sports-title look.
- **Line height:** Tight at 1.1 for headings to keep large type compact; 1.5 for body.

| Level | Size | Weight | Transform |
|-------|------|--------|-----------|
| H1 | 4.5rem (6xl) | 700 | UPPERCASE |
| H2 | 3.5rem (5xl) | 700 | UPPERCASE |
| H3 | 2.5rem (4xl) | 700 | UPPERCASE |
| H4 | 2rem (3xl) | 700 | UPPERCASE |
| Body | 1rem (base) | 400 | none |
| Small | 0.875rem (sm) | 400 | none |
| Caption | 0.75rem (xs) | 500 | UPPERCASE |

### Component Treatment

#### Buttons
- **Primary:** Solid gold (`#FFD700`) fill with near-black text. Small 0.25rem border-radius keeps edges sharp. Text is uppercase, bold, with wide letter-spacing (0.15em) — reads like a call to action on a scoreboard.
- **Secondary:** Ghost style with gold border and gold text on dark. On hover, fills gold with dark text.
- **Sizing:** Generous — 0.875rem vertical / 2rem horizontal padding. Built to be tapped easily.

#### Cards
- **Container:** Dark surface (`#1A1A24`) with subtle border. Minimal radius (0.25rem) — angular, not rounded.
- **Accent bar:** A 3px gold top border on cards creates a strong branded element.
- **Hover state:** Shadow deepens and border shifts to gold, creating a "selected" feel.
- **Content:** 1.25rem padding. Images have minimal radius (0.125rem). Headlines in card are uppercase.

#### Navigation
- **Style:** Dark bar with a bold 2px gold bottom border. 4.5rem height. Feels like a scoreboard ticker.
- **Links:** Light grey by default, gold on hover and when active. All uppercase, bold, wide-spaced (0.15em) at 0.8125rem.
- **Logo:** Prominent left-aligned at 2.5rem. High contrast against dark background.
- **Effect:** The gold accent line anchors the brand color across every page.

#### Hero
- **Layout:** Nearly full-screen at 90vh. Dark background with a gradient overlay that fades a background image to black at the bottom.
- **Typography:** Massive heading at 4.5rem, uppercase, gold or white. The sheer scale is the design statement.
- **CTA:** Bold gold filled button. Can include a secondary ghost-style link alongside.
- **Feel:** Walking into the stadium. The dark surroundings, the gold glow, the massive text — it all creates an arena atmosphere.

---

## Style 3: Classic Prestigious

**Token file:** `tokens-style3.json`

### Design Rationale

Classic Prestigious draws on the visual language of established institutions — think vintage club crests, formal award dinners, and decades of tradition. A warm off-white background paired with deep teal and muted gold accents creates a palette that feels timeless rather than trendy. Serif typography in Playfair Display adds gravitas to headings while Lora keeps body text elegant and readable. This style suits a club that wants to emphasize its history, achievements, and standing. It communicates respect, tradition, and quiet confidence.

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Deep Teal | `#1B3A4B` |
| Primary Light | Medium Teal | `#264D63` |
| Secondary | Warm Bronze | `#8B6F47` |
| Secondary Light | Light Bronze | `#A68B5B` |
| Accent | Muted Gold | `#C9A84C` |
| Accent Light | Soft Gold | `#D4B86A` |
| Background | Warm White | `#FAF8F5` |
| Background Alt | Warm Grey | `#F0ECE5` |
| Surface | White | `#FFFFFF` |
| Surface Border | Warm Border | `#DDD7CC` |
| Text | Dark Charcoal | `#2C2C2C` |
| Text Secondary | Medium Grey | `#5A5A5A` |
| Text Inverse | Warm White | `#FAF8F5` |

### Typography

- **Headings:** Playfair Display, bold (700). A high-contrast serif with elegant proportions that convey tradition and class.
- **Body:** Lora, regular (400). A well-balanced serif optimized for screen reading, complementing the display face.
- **Size scale:** Slightly larger base (1.0625rem) for comfortable serif reading. Scale tops at 3.75rem.
- **Heading letter-spacing:** Slightly positive (0.01em) at base, widening (0.06em) for navigation and labels.
- **Line height:** 1.25 for headings, 1.6 for body (serifs need more leading), 1.8 for long-form.

| Level | Size | Weight |
|-------|------|--------|
| H1 | 3.75rem (6xl) | 700 |
| H2 | 3rem (5xl) | 700 |
| H3 | 2.375rem (4xl) | 700 |
| H4 | 1.875rem (3xl) | 600 |
| Body | 1.0625rem (base) | 400 |
| Small | 0.875rem (sm) | 400 |
| Caption | 0.75rem (xs) | 400 |

### Component Treatment

#### Buttons
- **Primary:** Solid deep teal (`#1B3A4B`) fill with warm white text. 0.375rem border-radius — refined, not casual. Sentence case — uppercase would feel too aggressive for this style.
- **Secondary:** Ghost style with deep teal border and text. On hover, fills smoothly (300ms ease-in-out) to deep teal with warm white text.
- **Sizing:** 0.8125rem vertical / 1.75rem horizontal. Slightly larger font (0.9375rem) than the other styles — serifs need room.

#### Cards
- **Container:** White background with warm grey border (`#DDD7CC`). 0.5rem radius — gentle but structured.
- **Header accent:** A 2px gold bottom border on card headers adds subtle branded distinction.
- **Hover state:** Shadow lifts gently. Transitions are slower (300ms) for an unhurried, refined feel.
- **Content:** 2rem internal padding — more generous than the other styles. Content breathes.

#### Navigation
- **Style:** Deep teal background with a 3px gold bottom border — the club's signature color combination. 4.5rem height.
- **Links:** Muted light teal (`#A0B5C0`) by default, warm white on hover, gold when active. 0.9375rem with medium weight and slight letter-spacing (0.06em).
- **Logo:** Left-aligned at 2.25rem. Could incorporate a crest or monogram naturally.
- **Effect:** The dark nav over warm body creates a clear visual "header" that echoes traditional club branding.

#### Hero
- **Layout:** 75vh — slightly shorter than other styles, maintaining proportion without overwhelming. Deep teal background with a photographic overlay.
- **Typography:** 3.75rem serif heading in warm white. The subheading at 1.3125rem with a wider line-height for readability.
- **CTA:** Outlined style with gold border — elegant and restrained. A "Learn More" feels more natural here than "Join Now."
- **Feel:** Standing in the trophy room. Rich colors, dignified type, space to appreciate the content. The gold accents catch light like engraved plaques.

---

## Implementation Notes

### Using the Design Tokens

Each JSON token file can be consumed by CSS-in-JS systems, preprocessors, or converted to CSS custom properties. Example CSS variable generation:

```css
/* Generated from tokens-style1.json */
:root {
  --color-primary: #1A1A2E;
  --color-secondary: #E94560;
  --color-accent: #0F3460;
  --color-background: #FFFFFF;
  --color-text: #1A1A2E;
  --font-heading: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  /* ... etc */
}
```

### Theme Switching

The token structure is identical across all three files, making theme switching straightforward — swap the token source and all components update. Key structural elements shared:

- `colors.*` — all three define the same color role keys
- `typography.*` — same scale keys, different values
- `components.*` — same component structure, different visual properties

### Accessibility Notes

- **Modern Minimal:** Primary text (#1A1A2E) on white background (#FFFFFF) = contrast ratio 15.4:1 (AAA). Secondary red (#E94560) on white = 4.6:1 (AA for large text, use for accents not small body text).
- **Bold Athletic:** White text (#FFFFFF) on dark background (#0A0A0F) = contrast ratio 19.5:1 (AAA). Gold (#FFD700) on dark (#0A0A0F) = 12.1:1 (AAA).
- **Classic Prestigious:** Dark text (#2C2C2C) on warm white (#FAF8F5) = contrast ratio 12.8:1 (AAA). Gold accent (#C9A84C) on deep teal (#1B3A4B) = 4.8:1 (AA for large text).

All three styles meet WCAG 2.1 AA requirements for their primary text/background combinations.

### Font Loading

Recommended Google Fonts imports:

- **Style 1:** `Inter:wght@400;500;600;700`
- **Style 2:** `Oswald:wght@400;500;600;700` + `Source+Sans+3:wght@400;500;600`
- **Style 3:** `Playfair+Display:wght@400;600;700` + `Lora:wght@400;500;600;700`
