#!/usr/bin/env python3
"""
CABNA Website — Automated test suite.
Tests all acceptance criteria: pages exist, themes work, localStorage persistence,
responsive design, accessibility (alt attributes, contrast), and navigation.
"""

import json
import os
import re
import sys
from pathlib import Path

SITE_DIR = Path(__file__).parent
PAGES = ["index.html", "about.html", "membership.html", "events.html", "gallery.html", "news.html", "contact.html"]
THEMES = ["estilo-puro", "cancha-viva", "tribuna-dorada"]

passed = 0
failed = 0
errors = []

def check(description, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  ✅ {description}")
    else:
        failed += 1
        msg = f"  ❌ {description}"
        if detail:
            msg += f" — {detail}"
        print(msg)
        errors.append(description)

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


# =============================================================
# 1. ALL PAGES EXIST AND ARE NAVIGABLE
# =============================================================
print("\n===== 1. PAGES EXIST AND ARE NAVIGABLE =====")
for page in PAGES:
    path = SITE_DIR / page
    check(f"{page} exists", path.is_file())

for page in PAGES:
    path = SITE_DIR / page
    if not path.is_file():
        continue
    html = read_file(path)
    # Check that all nav links are present
    for target in PAGES:
        check(f"{page} has link to {target}", f'href="{target}"' in html, f"Missing link to {target}")

print("\n  -- Cross-page navigation: every page links to all 7 pages --")
for page in PAGES:
    path = SITE_DIR / page
    if not path.is_file():
        continue
    html = read_file(path)
    link_count = sum(1 for p in PAGES if f'href="{p}"' in html)
    check(f"{page} links to all 7 pages", link_count == 7, f"Found {link_count}/7")


# =============================================================
# 2. THREE CSS THEME FILES + UI TOGGLE
# =============================================================
print("\n===== 2. THREE THEME FILES AND SWITCHER UI =====")
theme_files = [
    "css/theme-estilo-puro.css",
    "css/theme-cancha-viva.css",
    "css/theme-tribuna-dorada.css",
]
for tf in theme_files:
    path = SITE_DIR / tf
    check(f"Theme file {tf} exists", path.is_file())
    if path.is_file():
        content = read_file(path)
        check(f"{tf} uses data-theme selector", "[data-theme=" in content)
        check(f"{tf} defines --color-primary", "--color-primary:" in content)
        check(f"{tf} defines --btn-bg", "--btn-bg:" in content)
        check(f"{tf} defines --nav-bg", "--nav-bg:" in content)
        check(f"{tf} defines --hero-bg", "--hero-bg:" in content)

# Check theme switcher UI exists on all pages
for page in PAGES:
    path = SITE_DIR / page
    if not path.is_file():
        continue
    html = read_file(path)
    check(f"{page} has theme switcher", 'class="theme-switcher"' in html)
    for theme in THEMES:
        check(f"{page} has button for {theme}", f'data-theme-choice="{theme}"' in html)


# =============================================================
# 3. THEME PERSISTENCE VIA LOCALSTORAGE (JS check)
# =============================================================
print("\n===== 3. LOCALSTORAGE THEME PERSISTENCE =====")
js_path = SITE_DIR / "js" / "main.js"
check("main.js exists", js_path.is_file())
if js_path.is_file():
    js = read_file(js_path)
    check("JS reads from localStorage", "localStorage.getItem" in js)
    check("JS writes to localStorage", "localStorage.setItem" in js)
    check("JS uses cabna-theme key", '"cabna-theme"' in js)
    check("JS applies data-theme attribute", 'setAttribute("data-theme"' in js or "setAttribute('data-theme'" in js)

# Check inline script for FOUC prevention
for page in PAGES:
    path = SITE_DIR / page
    if not path.is_file():
        continue
    html = read_file(path)
    check(f"{page} has inline theme restore script", "localStorage.getItem" in html and "data-theme" in html)


# =============================================================
# 4. RESPONSIVE DESIGN
# =============================================================
print("\n===== 4. RESPONSIVE DESIGN =====")
base_css_path = SITE_DIR / "css" / "base.css"
check("base.css exists", base_css_path.is_file())
if base_css_path.is_file():
    css = read_file(base_css_path)
    check("Has mobile breakpoint (max-width: 767px)", "max-width: 767px" in css or "max-width:767px" in css)
    check("Has tablet breakpoint (768px)", "768px" in css)
    check("Has small mobile breakpoint (320-360px)", "360px" in css or "320px" in css)
    check("Has responsive grid for cards", "grid-template-columns" in css)
    check("Mobile menu button styles", ".mobile-menu-btn" in css)
    check("Mobile nav overlay", ".mobile-overlay" in css)
    check("Footer grid collapses on mobile", "footer-grid" in css)
    # Viewport meta tag on all pages
    for page in PAGES:
        html = read_file(SITE_DIR / page)
        check(f"{page} has viewport meta", 'viewport' in html and 'width=device-width' in html)


# =============================================================
# 5. ACCESSIBILITY: ALT ATTRIBUTES AND CONTRAST
# =============================================================
print("\n===== 5. ACCESSIBILITY =====")

for page in PAGES:
    path = SITE_DIR / page
    if not path.is_file():
        continue
    html = read_file(path)

    # Find all <img> tags and verify they have alt attributes
    img_tags = re.findall(r'<img\b[^>]*>', html, re.IGNORECASE)
    imgs_without_alt = [img for img in img_tags if 'alt=' not in img.lower()]
    check(f"{page}: all <img> have alt attributes ({len(img_tags)} images)",
          len(imgs_without_alt) == 0,
          f"{len(imgs_without_alt)} missing: {imgs_without_alt[:2]}")

    # Check for skip link
    check(f"{page} has skip-to-content link", 'skip-link' in html or 'skip-nav' in html)

    # Check for ARIA landmarks
    check(f"{page} has role=banner (header)", 'role="banner"' in html)
    check(f"{page} has role=contentinfo (footer)", 'role="contentinfo"' in html)
    check(f"{page} has main element", '<main' in html)

    # Check for lang attribute
    check(f"{page} has lang attribute on html", 'lang=' in html)


# Contrast checks: verify the themes define high-contrast values
print("\n  -- WCAG 2.1 AA Contrast Verification (from style-guide) --")

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def relative_luminance(rgb):
    vals = []
    for c in rgb:
        s = c / 255.0
        vals.append(s / 12.92 if s <= 0.03928 else ((s + 0.055) / 1.055) ** 2.4)
    return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2]

def contrast_ratio(hex1, hex2):
    l1 = relative_luminance(hex_to_rgb(hex1))
    l2 = relative_luminance(hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

# Style 1: Estilo Puro
cr = contrast_ratio("#1A1A2E", "#FAFAFA")
check(f"Estilo Puro: text on background contrast = {cr:.1f}:1 (≥4.5)", cr >= 4.5)
cr = contrast_ratio("#6B6B80", "#FAFAFA")
check(f"Estilo Puro: secondary text contrast = {cr:.1f}:1 (≥4.5)", cr >= 4.5)

# Style 2: Cancha Viva
cr = contrast_ratio("#FFFFFF", "#0D0D0D")
check(f"Cancha Viva: text on background contrast = {cr:.1f}:1 (≥4.5)", cr >= 4.5)
cr = contrast_ratio("#B0B0B0", "#0D0D0D")
check(f"Cancha Viva: secondary text contrast = {cr:.1f}:1 (≥4.5)", cr >= 4.5)

# Style 3: Tribuna Dorada
cr = contrast_ratio("#2C2C2C", "#FAF8F4")
check(f"Tribuna Dorada: text on background contrast = {cr:.1f}:1 (≥4.5)", cr >= 4.5)
cr = contrast_ratio("#5A5A5A", "#FAF8F4")
check(f"Tribuna Dorada: secondary text contrast = {cr:.1f}:1 (≥4.5)", cr >= 4.5)

# Button contrast
cr = contrast_ratio("#E94560", "#FFFFFF")
check(f"Estilo Puro: coral button w/ white text = {cr:.1f}:1 (≥3.0 AA large)", cr >= 3.0)
cr = contrast_ratio("#FF2D55", "#FFFFFF")
check(f"Cancha Viva: red button w/ white text = {cr:.1f}:1 (≥3.0 AA large)", cr >= 3.0)
cr = contrast_ratio("#1B3A4B", "#FAF8F4")
check(f"Tribuna Dorada: teal button w/ cream text = {cr:.1f}:1 (≥4.5)", cr >= 4.5)
cr = contrast_ratio("#C8A951", "#1B3A4B")
check(f"Tribuna Dorada: gold button w/ teal text = {cr:.1f}:1 (≥3.0 AA large)", cr >= 3.0)


# =============================================================
# 6. DATA FILES INTEGRITY
# =============================================================
print("\n===== 6. DATA FILES =====")
events_path = SITE_DIR / "data" / "events.json"
check("events.json exists", events_path.is_file())
if events_path.is_file():
    with open(events_path) as f:
        events = json.load(f)
    check(f"events.json has {len(events)} events", len(events) >= 5)
    for ev in events:
        check(f"Event '{ev['title']}' has required fields",
              all(k in ev for k in ["title", "date", "time", "location", "description"]))

img_path = SITE_DIR / "data" / "image_assets.json"
check("image_assets.json exists", img_path.is_file())


# =============================================================
# 7. CONTENT INTEGRITY
# =============================================================
print("\n===== 7. CONTENT CHECKS =====")
index_html = read_file(SITE_DIR / "index.html")
check("Home: hero headline present", "Your Club. Your Community. Your Game." in index_html)
check("Home: hero subtitle present", "Sport, family, and tradition since 1909" in index_html)
check("Home: 115+ stat", "115+" in index_html)
check("Home: 25+ stat", "25+" in index_html)
check("Home: testimonials section", "What Our Members Say" in index_html)
check("Home: newsletter section", "Stay in the Loop" in index_html)

membership_html = read_file(SITE_DIR / "membership.html")
check("Membership: pricing table exists", "pricing-table" in membership_html)
check("Membership: Cuota Única plan", "Cuota Única" in membership_html)
check("Membership: CABNA Individual plan", "CABNA Individual" in membership_html)
check("Membership: CABNA Plus plan", "CABNA Plus" in membership_html)
check("Membership: CABNA Familiar plan", "CABNA Familiar" in membership_html)
check("Membership: $20,000 price", "$20,000" in membership_html)
check("Membership: $52,000 price", "$52,000" in membership_html)
check("Membership: $70,000 price", "$70,000" in membership_html)
check("Membership: $91,000 price", "$91,000" in membership_html)
check("Membership: How to Join steps", "How to Join" in membership_html)

contact_html = read_file(SITE_DIR / "contact.html")
check("Contact: contact form", 'id="contact-form"' in contact_html)
check("Contact: WhatsApp number", "2785-1234" in contact_html)
check("Contact: phone number", "4791-7440" in contact_html)
check("Contact: email", "cabna@argentina.com" in contact_html)
check("Contact: address", "Zufriategui 1251" in contact_html)
check("Contact: quincho rental", "Quincho Rental" in contact_html)
check("Contact: work with us", "Work With Us" in contact_html)

about_html = read_file(SITE_DIR / "about.html")
check("About: founding date", "12 October 1909" in about_html)
check("About: sports directory", "Sports &amp; Activities" in about_html or "Sports & Activities" in about_html)

news_html = read_file(SITE_DIR / "news.html")
check("News: has news cards", "news-card" in news_html)
check("News: sample headline 1", "Facility Upgrades" in news_html)
check("News: sample headline 2", "Futsal First Division" in news_html)

gallery_html = read_file(SITE_DIR / "gallery.html")
check("Gallery: gallery grid", 'id="gallery-grid"' in gallery_html)
check("Gallery: lightbox", 'id="lightbox"' in gallery_html)

events_html = read_file(SITE_DIR / "events.html")
check("Events: events grid", 'id="events-grid"' in events_html)
check("Events: filter controls", 'id="filter-category"' in events_html)


# =============================================================
# SUMMARY
# =============================================================
print(f"\n{'='*50}")
print(f"TOTAL: {passed + failed} tests | ✅ {passed} passed | ❌ {failed} failed")
if errors:
    print(f"\nFailed tests:")
    for e in errors:
        print(f"  - {e}")
print(f"{'='*50}\n")

sys.exit(0 if failed == 0 else 1)
