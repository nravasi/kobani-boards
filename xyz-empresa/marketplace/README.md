# Aviation Parts Marketplace — Wireframes & Mockups

High-fidelity wireframes for the XYZ Empresa aviation parts and equipment marketplace. All screens use the shared design system from `css/style.css` extended with marketplace-specific components.

## Screens

| Screen | File | Description |
|--------|------|-------------|
| Product Listing | [`wireframes/product-listing.html`](wireframes/product-listing.html) | Browsable product grid with aviation-specific category sidebar, search, filter chips, certification badges, condition indicators, sort/view toggle, and pagination |
| Product Detail | [`wireframes/product-detail.html`](wireframes/product-detail.html) | Full part detail with image gallery, technical specifications, compliance documentation, seller info card, quantity selector, and related parts |
| Checkout Flow | [`wireframes/checkout.html`](wireframes/checkout.html) | Multi-step checkout (Cart → Shipping → Compliance → Payment → Confirm) with step indicator, compliance acknowledgments, and order summary sidebar |
| Seller Dashboard | [`wireframes/seller-dashboard.html`](wireframes/seller-dashboard.html) | Revenue/order stats, quick actions, inventory management table, order queue, listing performance, messages, and alerts |

## Design Assets

| File | Description |
|------|-------------|
| [`DESIGN_SPEC.md`](DESIGN_SPEC.md) | Full design specification with tokens, taxonomy, component inventory, responsive breakpoints, and accessibility notes |
| [`css/marketplace.css`](css/marketplace.css) | Extended stylesheet with all marketplace-specific components, responsive rules for tablet (≤1024px), mobile (≤768px), and small mobile (≤480px) |

## Aviation-Specific Features

- **9 product categories** with nested subcategories (Engines, Avionics, Airframe, Landing Gear, Hydraulics, Interior, Safety, Tools/GSE, Consumables)
- **Part condition badges:** New (NE), Overhauled (OH), Serviceable (SV), As-Removed (AR)
- **Compliance tags:** FAA, EASA, 8130-3, CoC with distinct color coding
- **Trace status filters:** Back-to-Birth, Partial Trace, No Trace
- **Aircraft compatibility filter** by type/model
- **Compliance review step** in checkout with regulatory acknowledgments
- **Seller verification** with rating, on-time delivery, and review counts

## Responsive Breakpoints

All screens adapt across four breakpoints:

- **Desktop (>1024px):** Full sidebar + 3-column grid, side panels
- **Tablet (769–1024px):** Narrower sidebar, 2-column grid
- **Mobile (≤768px):** Single column, filter drawer overlay, sticky action bars
- **Small Mobile (≤480px):** Full-width stacked cards, simplified step indicator

## Viewing the Wireframes

Open any HTML file in a browser. The wireframes reference the shared CSS via relative paths:

```
../../css/style.css     → Shared design system
../css/marketplace.css  → Marketplace extensions
```
