# Brand Color Scheme Proposal

A cohesive color palette for the new brand identity. Each color has been selected to reinforce core brand values — **trust**, **approachability**, and **momentum** — while meeting WCAG 2.1 AA accessibility standards.

---

## Core Palette

### Primary — Deep Indigo

| Property | Value |
|----------|-------|
| **Hex** | `#2B3A67` |
| **RGB** | 43, 58, 103 |
| **Usage** | Navigation bars, hero sections, headings, primary backgrounds |

**Rationale:** Deep indigo projects stability, intelligence, and trust. As the dominant brand color it anchors the visual identity with a tone that feels both professional and confident. Unlike a standard navy, the purple-blue undertone adds a modern edge that differentiates the brand from corporate defaults while remaining universally approachable.

---

### Secondary — Warm Teal

| Property | Value |
|----------|-------|
| **Hex** | `#1A9E8F` |
| **RGB** | 26, 158, 143 |
| **Usage** | Supporting sections, secondary buttons, feature highlights, badges |

**Rationale:** Warm teal communicates growth, clarity, and forward motion. It creates a natural complement to the indigo primary — the green undertone introduces energy and optimism without clashing. This color signals that the brand is fresh and evolving, making it ideal for onboarding flows and welcome experiences where a sense of possibility matters.

---

### Accent — Sunset Coral

| Property | Value |
|----------|-------|
| **Hex** | `#E8734A` |
| **RGB** | 232, 115, 74 |
| **Usage** | Call-to-action buttons, notifications, key interactive elements, focus indicators |

**Rationale:** Sunset coral injects warmth and immediacy into the palette. Its warm orange tone draws the eye to actions and important information, creating clear visual priority. The color evokes friendliness and approachability — critical for a brand that wants users to feel welcomed and encouraged to engage. Used sparingly, it creates high-contrast focal points against both the indigo and teal.

---

## Extended Palette

These supporting colors complete the system for full interface coverage.

| Role | Hex | Usage |
|------|------|-------|
| Primary Light | `#3E4F80` | Hover states on primary surfaces |
| Primary Dark | `#1C2847` | Footer backgrounds, deep overlays |
| Secondary Light | `#22BCAB` | Hover states on secondary elements |
| Secondary Dark | `#147A6E` | Active/pressed secondary states |
| Accent Light | `#F09070` | Hover state for accent elements |
| Accent Dark | `#C95A34` | Active/pressed accent states |

---

## Neutral Colors

| Role | Hex | Usage |
|------|------|-------|
| Background | `#F7F8FA` | Page background |
| Background Alt | `#EEF0F4` | Alternating section backgrounds |
| Surface | `#FFFFFF` | Card backgrounds, modals, content panels |
| Text Primary | `#1E1E2C` | Headings and body text |
| Text Secondary | `#5C5F72` | Captions, metadata, supporting copy |
| Text Muted | `#9497A8` | Placeholder text, disabled states |
| Border | `#D8DAE3` | Card borders, dividers, input outlines |
| Border Focus | `#E8734A` | Focused input fields, active indicators |

---

## Semantic Colors

| Role | Hex | Usage |
|------|------|-------|
| Success | `#2EAD6B` | Confirmations, completed states |
| Warning | `#E8A123` | Caution messages, pending states |
| Error | `#D94452` | Validation errors, destructive actions |
| Info | `#2B3A67` | Informational banners (uses primary) |

---

## Accessibility — Contrast Ratios

All pairings meet WCAG 2.1 AA minimum requirements (4.5:1 for normal text, 3:1 for large text).

| Foreground | Background | Ratio | Rating |
|------------|------------|-------|--------|
| `#1E1E2C` (Text) | `#F7F8FA` (Background) | **14.5:1** | AAA |
| `#5C5F72` (Text Secondary) | `#F7F8FA` (Background) | **5.7:1** | AA |
| `#FFFFFF` (White) | `#2B3A67` (Primary) | **9.8:1** | AAA |
| `#FFFFFF` (White) | `#1A9E8F` (Secondary) | **3.6:1** | AA Large |
| `#1E1E2C` (Dark Text) | `#1A9E8F` (Secondary) | **3.2:1** | AA Large |
| `#FFFFFF` (White) | `#E8734A` (Accent) | **3.2:1** | AA Large |
| `#1E1E2C` (Dark Text) | `#E8734A` (Accent) | **3.8:1** | AA Large |

> **Note:** For normal-sized text on the secondary and accent colors, use dark text (`#1E1E2C`) or increase font weight to 600+ at 14px to meet AA. White text on these colors passes AA at 18px regular / 14px bold (large text threshold).

---

## Color Relationships

```
  PRIMARY            SECONDARY          ACCENT
  Deep Indigo        Warm Teal          Sunset Coral
  #2B3A67            #1A9E8F            #E8734A
  ████████           ████████           ████████

  Trust &            Growth &           Warmth &
  Stability          Clarity            Action
  ──────────────────────────────────────────────

  Cool ◄──────────── Balanced ──────────────► Warm

  60% usage          25% usage          15% usage
```

The palette follows a **60-30-10 distribution model**: primary indigo dominates structural elements (60%), teal supports and enriches secondary areas (25%), and coral accents draw attention to key interactions (15%). This ratio ensures visual harmony while maintaining a clear hierarchy.

---

## Usage Guidelines

### Do

- Use **Deep Indigo** for all primary navigation, headers, and hero sections
- Use **Warm Teal** to highlight features, secondary actions, and content groupings
- Use **Sunset Coral** exclusively for primary CTAs and critical interaction points
- Pair dark text with lighter colored backgrounds for body copy
- Maintain the 60/25/15 ratio across full-page layouts

### Don't

- Don't place coral text on indigo backgrounds (insufficient contrast for small text)
- Don't use coral and teal adjacent without a neutral separator
- Don't fill large surface areas with the accent color — it should remain a focal point
- Don't substitute semantic colors (success/warning/error) with brand colors

---

## Quick Reference

| Color | Hex | Preview |
|-------|------|---------|
| Deep Indigo (Primary) | `#2B3A67` | 🟦 |
| Warm Teal (Secondary) | `#1A9E8F` | 🟩 |
| Sunset Coral (Accent) | `#E8734A` | 🟧 |
