# Aviation Parts Marketplace — Design Specification

## Overview

UX wireframes and high-fidelity mockups for an aviation parts and equipment marketplace built on the XYZ Empresa design system. The marketplace enables buyers to search, filter, and purchase aviation parts while providing sellers with dashboard tools to manage inventory and orders.

## Design System Alignment

All marketplace screens inherit from the shared XYZ Empresa design system (`css/style.css`). Extended styles are additive and follow existing conventions:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-dark` | `#1a1a2e` | Navbar, headings |
| `--color-primary-blue` | `#0f3460` | Buttons, accents, links |
| `--color-secondary-dark` | `#16213e` | Hover states |
| `--color-success` | `#27ae60` | Certified/approved badges, stock status |
| `--color-danger` | `#e74c3c` | Warnings, out-of-stock, required fields |
| `--color-warning` | `#f39c12` | Pending states, limited stock |
| `--color-background` | `#f0f2f5` | Page background |
| `--color-card-bg` | `#ffffff` | Panels, cards |
| `--color-badge-bg` | `#e8eaf6` | Tags, category pills |
| `--color-badge-text` | `#303f9f` | Tag text |
| `--font-stack` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif` | All text |
| `--radius-sm` | `6px` | Inputs, buttons |
| `--radius-md` | `10px` | Panels, cards |
| `--radius-pill` | `16px` | Category tags, filter chips |
| `--shadow-card` | `0 1px 4px rgba(0,0,0,0.08)` | Card elevation |
| `--shadow-nav` | `0 2px 8px rgba(0,0,0,0.15)` | Sticky nav |

## Aviation-Specific Taxonomy

### Product Categories

| Category | Subcategories |
|----------|--------------|
| Engines & Propulsion | Turbofan, Turboprop, Piston, Auxiliary Power Units (APU) |
| Avionics & Electronics | Flight Management Systems, Transponders, Radios, Displays, GPS/NAV |
| Airframe & Structure | Fuselage Panels, Wings, Control Surfaces, Fairings |
| Landing Gear | Main Gear, Nose Gear, Brakes, Tires, Actuators |
| Hydraulics & Pneumatics | Pumps, Valves, Reservoirs, Accumulators |
| Interior & Cabin | Seats, Galleys, Lavatories, Overhead Bins, Lighting |
| Safety & Emergency | Life Vests, Fire Extinguishers, Oxygen Systems, Escape Slides |
| Tools & GSE | Ground Support Equipment, Maintenance Tools, Test Equipment |
| Consumables | Lubricants, Sealants, Chemicals, Fasteners, O-Rings |

### Compliance & Certification Filters

- **Regulatory Authority:** FAA, EASA, TCCA, ANAC, CAAC
- **Documentation:** 8130-3 (FAA), EASA Form 1, CoC (Certificate of Conformance)
- **Part Condition:** New (NE), Factory New (FN), Overhauled (OH), Serviceable (SV), As-Removed (AR), Inspected/Tested (IN)
- **Trace Status:** Back-to-Birth, Partial Trace, No Trace

## Screen Inventory

### 1. Product Listing (`product-listing.html`)
- Search bar with instant suggestions
- Category sidebar with aviation taxonomy tree
- Sortable product grid/list toggle
- Certification and condition filter chips
- Pagination controls
- Mobile: collapsible filter drawer, single-column product cards

### 2. Product Detail (`product-detail.html`)
- Hero section with part images
- Part number, description, condition, price
- Compliance documentation section (8130-3 status, trace info)
- Seller information card with rating
- Quantity selector and "Add to Cart" / "Request Quote" actions
- Related/alternative parts section
- Mobile: stacked layout, sticky bottom action bar

### 3. Checkout Flow (`checkout.html`)
- Cart summary with line items
- Multi-step form: Shipping → Compliance Review → Payment → Confirmation
- Step indicator/progress bar
- Compliance acknowledgment checkbox
- Order summary sidebar
- Mobile: full-width steps, collapsible order summary

### 4. Seller Dashboard (`seller-dashboard.html`)
- Revenue and order summary cards
- Inventory management table with stock/condition columns
- Order queue with status badges
- Listing performance chart placeholder
- Quick actions: Add Listing, Manage Inventory, View Messages
- Mobile: stacked cards, scrollable table

### 5. Search & Filters (integrated into Product Listing)
- Full-text search with debounced input
- Multi-select filter chips for condition, certification, category
- Price range slider
- Aircraft compatibility filter (by type/model)
- Active filter summary bar with clear-all

## Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| Desktop (>1024px) | Sidebar + 3-column product grid, side-by-side checkout panels |
| Tablet (769–1024px) | Collapsible sidebar, 2-column product grid |
| Mobile (≤768px) | Single column, bottom sheet filters, stacked forms |
| Small Mobile (≤480px) | Full-width cards, sticky action bars, simplified navigation |

## Accessibility

- All interactive elements are keyboard-accessible with visible focus states
- Color contrast meets WCAG 2.1 AA (minimum 4.5:1 for normal text)
- Form inputs have associated `<label>` elements
- Filter state changes are announced via `aria-live` regions
- Images include descriptive `alt` text
- Modal dialogs trap focus and support Escape to close
- Touch targets are minimum 44×44px on mobile

## Component Additions

The marketplace extends the shared design system with these new components:

| Component | Class | Description |
|-----------|-------|-------------|
| Product Card | `.product-card` | Grid item with image, title, price, condition badge |
| Filter Chip | `.filter-chip` | Removable active filter indicator |
| Step Indicator | `.step-indicator` | Multi-step checkout progress |
| Rating Display | `.rating` | Star rating with count |
| Stock Badge | `.stock-badge` | Availability status indicator |
| Compliance Tag | `.compliance-tag` | Certification/regulatory badge |
| Price Display | `.price-display` | Formatted price with currency |
| Sidebar Nav | `.sidebar-filters` | Collapsible category navigation |
| Image Gallery | `.product-gallery` | Thumbnail + main image viewer |
| Quantity Control | `.qty-control` | Increment/decrement input |
