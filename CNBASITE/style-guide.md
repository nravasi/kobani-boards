# CNBA Club Website — Visual Style Guide

Three distinct visual style concepts for the club website. Each concept defines a complete visual language including color palette, typography, component treatment, and design rationale. Design tokens for each style are exported as companion JSON files.

---

## Style 1: Estilo Puro — Modern Minimal

**Token file:** `tokens-style1.json`

### Design Rationale

Estilo Puro strips the interface down to its essentials, placing the club's content — news, photos, match results — at the center of every page. The restrained color palette uses a deep navy (`#1A1A2E`) as the primary identity color paired with a bold coral-red accent (`#E94560`) that draws the eye exactly where action is needed. Generous white space and a single font family (Inter) create a calm, modern feel that reads well on any device. This style signals that the club is forward-thinking and digitally mature without sacrificing warmth — the coral accent and rounded corners keep the interface friendly and approachable. It is ideal for a club that wants its online presence to feel as polished as a top-tier sports brand.

### Color Palette

| Role | Hex | Swatch | Usage |
|------|------|--------|-------|
| Primary | `#1A1A2E` | 🟪 | Header backgrounds, hero overlays, heading text |
| Primary Light | `#2D2D4A` | 🟪 | Hover states on dark surfaces |
| Secondary | `#E94560` | 🔴 | Call-to-action buttons, active nav indicators, links |
| Secondary Light | `#FF6B81` | 🔴 | Hover state for secondary elements |
| Accent | `#0F3460` | 🔵 | Supporting information, badges, footer |
| Background | `#FAFAFA` | ⬜ | Page background |
| Background Alt | `#F0F0F5` | ⬜ | Alternating section backgrounds |
| Surface | `#FFFFFF` | ⬜ | Card backgrounds, modals |
| Text | `#1A1A2E` | ⬛ | Primary body and heading text |
| Text Secondary | `#6B6B80` | 🔘 | Captions, timestamps, secondary labels |
| Text Muted | `#9E9EB0` | 🔘 | Placeholder text, disabled states |
| Border | `#E0E0E8` | ⬜ | Card borders, dividers, input outlines |
| Border Focus | `#E94560` | 🔴 | Focused input fields, active tab indicator |

### Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| H1 (Hero) | Inter | 700 (Bold) | 4.5rem (72px) | 1.1 |
| H2 (Section) | Inter | 700 (Bold) | 3rem (48px) | 1.2 |
| H3 (Card title) | Inter | 600 (Semibold) | 1.875rem (30px) | 1.2 |
| H4 (Subsection) | Inter | 600 (Semibold) | 1.5rem (24px) | 1.35 |
| Body large | Inter | 400 (Regular) | 1.125rem (18px) | 1.6 |
| Body | Inter | 400 (Regular) | 1rem (16px) | 1.6 |
| Body small | Inter | 400 (Regular) | 0.875rem (14px) | 1.6 |
| Caption | Inter | 500 (Medium) | 0.75rem (12px) | 1.6 |
| Button label | Inter | 600 (Semibold) | 0.875rem (14px) | 1.2 |
| Nav link | Inter | 500 (Medium) | 0.875rem (14px) | 1.2 |

**Font stack:** `'Inter', 'Helvetica Neue', Arial, sans-serif`

A single typeface (Inter) is used throughout for headings and body, creating a unified and clean appearance. Visual hierarchy is established through weight and size variation rather than font contrast.

### UI Component Treatment

#### Buttons
- **Primary:** Coral-red fill (`#E94560`) with white text, 0.5rem border-radius, subtle hover darkening to `#C7293F`. No text transform — labels remain sentence case for friendliness.
- **Secondary:** Transparent background with a 1px border in `#E0E0E8`, dark text. On hover the background tints to `#F0F0F5`.
- **Size:** Horizontal padding of 1.5rem, vertical padding of 0.75rem. Comfortable click target.
- **Transitions:** 250ms ease on all state changes for smooth interaction feedback.

#### Cards
- White background on a `#FAFAFA` page gives subtle lift. Bordered with a 1px `#E0E0E8` stroke and a soft `0.75rem` border-radius.
- At rest, cards have a minimal shadow (`0 1px 2px`). On hover, the shadow deepens (`0 8px 24px`) to create a gentle lift effect.
- Internal padding of 1.5rem with 1rem gaps between child elements.
- Image slots fill full width at the top of the card with rounded top corners.

#### Navigation
- Clean white bar, 4rem height, anchored at the top. A 1px bottom border in `#E0E0E8` separates it from page content.
- Links use `#6B6B80` at rest, darken to `#1A1A2E` on hover, and show `#E94560` when active.
- Club logo sits at the left. Navigation links are center-aligned. A CTA button sits at the right edge.
- On mobile, the nav collapses into a hamburger menu with a full-screen overlay.

#### Hero Section
- Deep navy (`#1A1A2E`) background with a gradient overlay blending toward accent blue. Full-bleed image behind the overlay.
- Heading in white at 4.5rem/700 with tight leading (1.1) for dramatic impact.
- Subtitle in muted gray (`#9E9EB0`). One or two CTA buttons in coral-red below the subtitle.
- Minimum height of 70vh to create an immersive entry point.

---

## Style 2: Cancha Viva — Bold Athletic

**Token file:** `tokens-style2.json`

### Design Rationale

Cancha Viva is built for energy. A dark background (`#0D0D0D`) lets the vivid red (`#FF2D55`), electric yellow (`#FFB800`), and teal (`#00D4AA`) colors punch through the screen like stadium lights cutting through night air. Oversized uppercase headings in Bebas Neue evoke scoreboard typography, while the condensed letterforms allow impactful statements at large sizes without overwhelming the layout. Sharp, nearly square corners and accent bars give components a structured, modular quality — like a broadcast graphics package. This style will resonate with a younger, digitally-native audience that expects bold visuals and fast-paced content delivery from their club. It is particularly effective for match-day content, live updates, and highlight reels.

### Color Palette

| Role | Hex | Swatch | Usage |
|------|------|--------|-------|
| Primary | `#FF2D55` | 🔴 | Primary actions, accent bars, active states |
| Primary Light | `#FF5C7C` | 🔴 | Hover states on primary elements |
| Secondary | `#FFB800` | 🟡 | Badges, highlights, secondary CTAs |
| Secondary Light | `#FFCC33` | 🟡 | Hover state for secondary |
| Accent | `#00D4AA` | 🟢 | Success states, featured tags, stat highlights |
| Accent Light | `#33EACC` | 🟢 | Hover on accent elements |
| Background | `#0D0D0D` | ⬛ | Page background |
| Background Alt | `#1A1A1A` | ⬛ | Alternating section backgrounds |
| Surface | `#1E1E1E` | ⬛ | Card backgrounds |
| Surface Elevated | `#2A2A2A` | ⬛ | Elevated cards, modals, dropdowns |
| Text | `#FFFFFF` | ⬜ | Primary body and heading text |
| Text Secondary | `#B0B0B0` | 🔘 | Captions, secondary labels |
| Text Muted | `#777777` | 🔘 | Placeholder text, disabled states |
| Border | `#333333` | ⬛ | Card borders, dividers |
| Border Focus | `#FF2D55` | 🔴 | Input focus ring, active borders |

### Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| H1 (Hero) | Bebas Neue | 400 | 6rem (96px) | 1.0 |
| H2 (Section) | Bebas Neue | 400 | 3.5rem (56px) | 1.0 |
| H3 (Card title) | Bebas Neue | 400 | 2rem (32px) | 1.2 |
| H4 (Subsection) | Bebas Neue | 400 | 1.5rem (24px) | 1.2 |
| Body large | Roboto | 400 (Regular) | 1.125rem (18px) | 1.5 |
| Body | Roboto | 400 (Regular) | 1rem (16px) | 1.5 |
| Body small | Roboto | 400 (Regular) | 0.875rem (14px) | 1.5 |
| Caption | Roboto | 500 (Medium) | 0.75rem (12px) | 1.5 |
| Button label | Roboto | 700 (Bold) | 0.875rem (14px) | 1.2 |
| Nav link | Roboto | 700 (Bold) | 0.8125rem (13px) | 1.2 |

**Heading font stack:** `'Bebas Neue', 'Oswald', 'Impact', sans-serif`
**Body font stack:** `'Roboto', 'Helvetica Neue', Arial, sans-serif`

Bebas Neue, a tall condensed display face, is used exclusively for headings in uppercase with wide letter-spacing (0.08–0.15em). Roboto serves as the body workhorse — its geometric forms complement the display type while staying highly legible at small sizes on screen.

### UI Component Treatment

#### Buttons
- **Primary:** Vivid red fill (`#FF2D55`) with white text. Uppercase with 0.15em letter-spacing and bold weight. Nearly square corners (0.25rem radius) for a hard, athletic edge.
- **Secondary:** Transparent with a `#FF2D55` border. On hover, fills with a translucent red wash (`rgba(255, 45, 85, 0.15)`).
- **Size:** 2rem horizontal padding, 0.875rem vertical — slightly larger targets for an action-oriented layout.
- **Glow effect:** On hover, the primary button gains a subtle red glow (`0 0 20px rgba(255, 45, 85, 0.4)`) reinforcing the electric aesthetic.
- **Transitions:** 200ms with a sharp cubic-bezier for snappy feedback.

#### Cards
- Dark surface (`#1E1E1E`) against a near-black page. A 1px `#333333` border separates card from background.
- A 3px solid red accent bar at the top of each card creates a strong visual hook.
- On hover, the border color shifts to `#FF2D55` and the shadow deepens, with a slight scale or lift.
- Tight padding (1.5rem) and compact gaps (0.75rem) give a data-dense, sports-dashboard feel.
- Image slots are full-bleed with no rounded corners for a photojournalistic treatment.

#### Navigation
- Near-black background (`#0D0D0D`) with a 2px solid `#FF2D55` bottom border that acts as an energy line.
- Links are uppercase, bold, in `#B0B0B0` at rest — brightening to white on hover and red when active.
- Wide letter-spacing (0.15em) on nav items reinforces the athletic, scoreboard aesthetic.
- 4.5rem height gives breathing room. Club logo or wordmark at left, nav items centered or right-aligned.
- On mobile, uses a sliding panel from the right with the same dark background.

#### Hero Section
- Full-screen (90vh) with a dark gradient overlay that fades from subtle at top to near-opaque at bottom, allowing large background images to show through at the top while text reads cleanly at the bottom.
- Heading in Bebas Neue at 6rem, uppercase, letter-spaced. Maximum visual impact.
- A 4px solid red accent line sits above or below the heading as a graphic anchor.
- Subtitle in `#B0B0B0`. CTA buttons below in vivid red and yellow variants.
- Motion: subtle parallax scroll on the background image for a broadcast-quality feel.

---

## Style 3: Tribuna Dorada — Classic Prestigious

**Token file:** `tokens-style3.json`

### Design Rationale

Tribuna Dorada draws on the visual language of established sporting institutions — think trophy rooms, engraved plaques, and members-only lounges. A deep teal primary (`#1B3A4B`) conveys authority and trust, while gold accents (`#C8A951`) add an unmistakable prestige that connects to the club's heritage and achievements. Playfair Display, a transitional serif with sharp wedge serifs, lends headings a dignified, editorial quality, while Source Sans 3 ensures body text remains crisp and readable on screens. Warm cream backgrounds (`#FAF8F4`) soften the interface and distinguish it from the cold whites common in generic templates. This style suits a club that prizes its history, values its members, and wants to project gravitas alongside a welcoming warmth.

### Color Palette

| Role | Hex | Swatch | Usage |
|------|------|--------|-------|
| Primary | `#1B3A4B` | 🟦 | Navigation bar, hero background, heading color |
| Primary Light | `#2A5572` | 🟦 | Hover states, secondary surfaces |
| Primary Dark | `#0F2330` | 🟦 | Footer background, deep overlays |
| Secondary | `#C8A951` | 🟨 | Gold accents, decorative dividers, award badges |
| Secondary Light | `#D9C06E` | 🟨 | Hover on gold elements |
| Secondary Dark | `#A88C3A` | 🟨 | Active/pressed gold elements |
| Accent | `#8B2E3B` | 🟥 | Alerts, important labels, club crest accent |
| Background | `#FAF8F4` | ⬜ | Main page background (warm cream) |
| Background Alt | `#F0ECE3` | ⬜ | Alternating section backgrounds |
| Surface | `#FFFFFF` | ⬜ | Card backgrounds, content panels |
| Surface Dark | `#1B3A4B` | 🟦 | Dark feature sections, testimonial blocks |
| Text | `#2C2C2C` | ⬛ | Primary body text |
| Text Secondary | `#5A5A5A` | 🔘 | Captions, metadata |
| Text Muted | `#8A8A8A` | 🔘 | Placeholders, disabled text |
| Text on Primary | `#FAF8F4` | ⬜ | Text on dark teal surfaces |
| Border | `#D6D0C4` | ⬜ | Card borders, input outlines |
| Border Focus | `#C8A951` | 🟨 | Focus rings, active inputs |

### Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| H1 (Hero) | Playfair Display | 700 (Bold) | 4.25rem (68px) | 1.15 |
| H2 (Section) | Playfair Display | 700 (Bold) | 2.75rem (44px) | 1.2 |
| H3 (Card title) | Playfair Display | 600 (Semibold) | 1.75rem (28px) | 1.2 |
| H4 (Subsection) | Playfair Display | 600 (Semibold) | 1.375rem (22px) | 1.35 |
| Body large | Source Sans 3 | 400 (Regular) | 1.0625rem (17px) | 1.65 |
| Body | Source Sans 3 | 400 (Regular) | 1rem (16px) | 1.65 |
| Body small | Source Sans 3 | 400 (Regular) | 0.875rem (14px) | 1.65 |
| Caption | Source Sans 3 | 600 (Semibold) | 0.75rem (12px) | 1.6 |
| Button label | Source Sans 3 | 600 (Semibold) | 0.875rem (14px) | 1.2 |
| Nav link | Source Sans 3 | 600 (Semibold) | 0.875rem (14px) | 1.2 |

**Heading font stack:** `'Playfair Display', 'Georgia', 'Times New Roman', serif`
**Body font stack:** `'Source Sans 3', 'Lato', 'Helvetica Neue', sans-serif`

The serif/sans-serif pairing creates a clear visual hierarchy: Playfair Display commands attention on headings with its elegant contrast and sharp details, while Source Sans 3 provides a neutral, highly readable base for body content. The combination projects sophistication without pretension.

### UI Component Treatment

#### Buttons
- **Primary:** Deep teal fill (`#1B3A4B`) with warm cream text. 0.375rem border-radius — slightly rounded but not bubbly. Sentence case with 0.04em letter-spacing for understated elegance.
- **Gold variant:** Gold fill (`#C8A951`) with dark teal text. Used for premium CTAs (membership sign-up, exclusive content).
- **Secondary:** Transparent with a teal border. Hover fills with `#F0ECE3` (warm sand).
- **Transitions:** 300ms ease-in-out for a composed, unhurried interaction feel.

#### Cards
- White surface on a cream (`#FAF8F4`) page provides gentle depth. Bordered with `#D6D0C4` and softly rounded (0.5rem).
- A 2px gold top-border (`#C8A951`) on featured or highlighted cards acts as a refined accent.
- Generous internal padding (2rem) and 1.25rem gaps create a spacious, editorial reading experience.
- Shadow is minimal at rest and gently increases on hover. The effect is subtle — cards never feel like they are floating aggressively.
- Image slots sit within the card with a small internal margin and rounded corners for a framed photograph treatment.

#### Navigation
- Deep teal (`#1B3A4B`) background with a 3px gold (`#C8A951`) bottom border — the combination immediately signals prestige.
- Links in cream/sand (`#D6D0C4`) at rest, brightening to white on hover. Active state uses gold (`#C8A951`).
- Sentence case, 600 weight, with subtle letter-spacing. The navigation feels authoritative without shouting.
- Club crest at the left, navigation links centered. A gold-accented CTA (e.g., "Hacete Socio") at the right edge.
- On mobile, uses a drawer menu with the same teal-and-gold palette.

#### Hero Section
- Deep teal background with a gradient overlay that blends from slightly transparent at center to opaque at edges, framing the background image.
- Heading in Playfair Display at 4.25rem/700 — the serifs add gravitas and editorial authority.
- A decorative gold divider line (1px, `#C8A951`) sits between the heading and subtitle, adding a classic touch.
- Subtitle in cream (`#D6D0C4`). CTA buttons in gold and teal variants.
- 75vh minimum height — substantial but not overwhelming. The approach is confident, not desperate for attention.

---

## Quick Comparison

| Attribute | Estilo Puro | Cancha Viva | Tribuna Dorada |
|-----------|-------------|-------------|----------------|
| **Mood** | Clean, calm, contemporary | Electric, bold, high-energy | Elegant, warm, authoritative |
| **Background** | Light (`#FAFAFA`) | Dark (`#0D0D0D`) | Warm cream (`#FAF8F4`) |
| **Primary color** | Deep navy `#1A1A2E` | Vivid red `#FF2D55` | Deep teal `#1B3A4B` |
| **Accent** | Coral `#E94560` | Electric yellow `#FFB800` | Gold `#C8A951` |
| **Heading font** | Inter (sans-serif) | Bebas Neue (display) | Playfair Display (serif) |
| **Body font** | Inter (sans-serif) | Roboto (sans-serif) | Source Sans 3 (sans-serif) |
| **Corner radius** | Rounded (0.75rem) | Sharp (0.25rem) | Gently rounded (0.5rem) |
| **Card style** | Light, bordered, soft shadow | Dark, accent-barred, glowing | Cream, gold-bordered, editorial |
| **Button style** | Coral fill, sentence case | Red fill, uppercase + tracked | Teal fill, sentence case |
| **Hero height** | 70vh | 90vh | 75vh |
| **Target audience** | Broad, tech-savvy | Young, match-day focused | Members, heritage-focused |

---

## Implementation Notes

### Using the Token Files

Each `tokens-*.json` file can be consumed by build tools to generate CSS custom properties. Example transformation:

```css
/* Generated from tokens-style1.json */
:root {
  --color-primary: #1A1A2E;
  --color-secondary: #E94560;
  --color-accent: #0F3460;
  --color-background: #FAFAFA;
  --color-text: #1A1A2E;
  --font-heading: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --radius-md: 0.5rem;
  /* ... */
}
```

To switch themes at runtime, generate a separate set of custom properties for each style and toggle a class on `<html>`:

```html
<html class="theme-estilo-puro">  <!-- or theme-cancha-viva, theme-tribuna-dorada -->
```

### Accessibility

All three styles have been designed to meet WCAG 2.1 AA contrast requirements:

- **Estilo Puro:** Text `#1A1A2E` on `#FAFAFA` = 15.4:1 contrast ratio. Secondary text `#6B6B80` on `#FAFAFA` = 5.0:1.
- **Cancha Viva:** Text `#FFFFFF` on `#0D0D0D` = 19.4:1 contrast ratio. Secondary text `#B0B0B0` on `#0D0D0D` = 10.3:1.
- **Tribuna Dorada:** Text `#2C2C2C` on `#FAF8F4` = 13.2:1 contrast ratio. Secondary text `#5A5A5A` on `#FAF8F4` = 6.3:1.

Button text on colored backgrounds also meets AA:
- Coral `#E94560` with white text: 4.6:1 (AA for large text, AA for normal with the lighter variant).
- Red `#FF2D55` with white text: 4.5:1 (AA for normal text at 14px bold / 18px regular).
- Teal `#1B3A4B` with cream `#FAF8F4` text: 9.2:1.
- Gold `#C8A951` with dark `#1B3A4B` text: 4.7:1 (AA).

### Font Loading

Recommended Google Fonts links:

**Estilo Puro:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Cancha Viva:**
```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
```

**Tribuna Dorada:**
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet">
```
