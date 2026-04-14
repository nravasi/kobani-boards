"""
Comprehensive QA Test Suite for CNBASITE
==========================================
Tests all verifiable acceptance criteria: data integrity, design tokens,
content specifications, cross-references, and accessibility compliance.

Run: python3 -m unittest test_qa_comprehensive -v
"""

import json
import os
import re
import math
import unittest


def load_json(path):
    with open(path) as f:
        return json.load(f)


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def relative_luminance(r, g, b):
    def linearize(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)


def contrast_ratio(hex1, hex2):
    l1 = relative_luminance(*hex_to_rgb(hex1))
    l2 = relative_luminance(*hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


# ============================================================
# 1. FILE INVENTORY TESTS
# ============================================================

class TestFileInventory(unittest.TestCase):
    """Verify all expected files exist and have non-zero size."""

    REQUIRED_FILES = [
        "scraper.py",
        "test_scraper.py",
        "club_website_content.json",
        "sitemap.json",
        "image_assets.json",
        "instagram_cabnaoficial.json",
        "tokens-style1.json",
        "tokens-style2.json",
        "tokens-style3.json",
        "style-guide.md",
        "site-copy.md",
        "README.md",
        ".gitignore",
        "data/club_website_content.json",
        "data/image_assets.json",
        "data/instagram_profile.json",
        "data/sitemap.json",
        "docs/tech-review.md",
    ]

    def test_all_required_files_exist(self):
        for filepath in self.REQUIRED_FILES:
            self.assertTrue(
                os.path.isfile(filepath),
                f"Required file missing: {filepath}",
            )

    def test_all_required_files_non_empty(self):
        for filepath in self.REQUIRED_FILES:
            if os.path.isfile(filepath):
                self.assertGreater(
                    os.path.getsize(filepath),
                    0,
                    f"File is empty: {filepath}",
                )

    def test_no_frontend_files_exist(self):
        """Document that no HTML/CSS/JS files exist (blocker for browser testing)."""
        frontend_extensions = (".html", ".css", ".js", ".jsx", ".tsx", ".ts", ".vue", ".svelte")
        frontend_files = []
        for root, dirs, files in os.walk("."):
            for f in files:
                if any(f.endswith(ext) for ext in frontend_extensions):
                    frontend_files.append(os.path.join(root, f))
        self.assertEqual(
            frontend_files,
            [],
            f"Unexpected frontend files found (if present, browser tests would apply): {frontend_files}",
        )

    def test_directories_exist(self):
        self.assertTrue(os.path.isdir("data"))
        self.assertTrue(os.path.isdir("docs"))


# ============================================================
# 2. JSON VALIDATION TESTS
# ============================================================

class TestJsonValidation(unittest.TestCase):
    """Verify all JSON files parse without errors."""

    JSON_FILES = [
        "club_website_content.json",
        "sitemap.json",
        "image_assets.json",
        "instagram_cabnaoficial.json",
        "tokens-style1.json",
        "tokens-style2.json",
        "tokens-style3.json",
        "data/club_website_content.json",
        "data/image_assets.json",
        "data/instagram_profile.json",
        "data/sitemap.json",
    ]

    def test_all_json_files_valid(self):
        for fpath in self.JSON_FILES:
            try:
                load_json(fpath)
            except (json.JSONDecodeError, FileNotFoundError) as e:
                self.fail(f"JSON parse error in {fpath}: {e}")

    def test_json_types_correct(self):
        self.assertIsInstance(load_json("club_website_content.json"), dict)
        self.assertIsInstance(load_json("sitemap.json"), dict)
        self.assertIsInstance(load_json("image_assets.json"), list)
        self.assertIsInstance(load_json("instagram_cabnaoficial.json"), dict)
        for i in range(1, 4):
            self.assertIsInstance(load_json(f"tokens-style{i}.json"), dict)


# ============================================================
# 3. DESIGN TOKEN TESTS
# ============================================================

class TestDesignTokenStructure(unittest.TestCase):
    """Validate structure and completeness of all 3 design token files."""

    REQUIRED_TOP_KEYS = [
        "name", "version", "colors", "typography",
        "spacing", "borderRadius", "shadows", "transitions", "components",
    ]
    REQUIRED_COLOR_KEYS = [
        "primary", "primaryLight", "secondary", "secondaryLight",
        "accent", "background", "backgroundAlt", "surface",
        "text", "textSecondary", "textMuted", "border", "borderFocus",
        "textOnPrimary", "textOnSecondary",
    ]
    REQUIRED_COMPONENTS = ["button", "card", "nav", "hero"]
    HEX_PATTERN = re.compile(r"^#[0-9A-Fa-f]{6}$")

    def _load_token(self, n):
        return load_json(f"tokens-style{n}.json")

    def test_style1_top_level_keys(self):
        tokens = self._load_token(1)
        for key in self.REQUIRED_TOP_KEYS:
            self.assertIn(key, tokens, f"Style 1 missing top-level key: {key}")

    def test_style2_top_level_keys(self):
        tokens = self._load_token(2)
        for key in self.REQUIRED_TOP_KEYS:
            self.assertIn(key, tokens, f"Style 2 missing top-level key: {key}")

    def test_style3_top_level_keys(self):
        tokens = self._load_token(3)
        for key in self.REQUIRED_TOP_KEYS:
            self.assertIn(key, tokens, f"Style 3 missing top-level key: {key}")

    def test_style1_required_colors(self):
        colors = self._load_token(1)["colors"]
        for key in self.REQUIRED_COLOR_KEYS:
            self.assertIn(key, colors, f"Style 1 missing color: {key}")

    def test_style2_required_colors(self):
        colors = self._load_token(2)["colors"]
        for key in self.REQUIRED_COLOR_KEYS:
            self.assertIn(key, colors, f"Style 2 missing color: {key}")

    def test_style3_required_colors(self):
        colors = self._load_token(3)["colors"]
        for key in self.REQUIRED_COLOR_KEYS:
            self.assertIn(key, colors, f"Style 3 missing color: {key}")

    def test_all_hex_values_valid(self):
        for i in range(1, 4):
            colors = self._load_token(i)["colors"]
            for key, val in colors.items():
                if isinstance(val, str) and val.startswith("#"):
                    self.assertRegex(
                        val, self.HEX_PATTERN,
                        f"Style {i} invalid hex for colors.{key}: {val}",
                    )

    def test_all_required_components_present(self):
        for i in range(1, 4):
            comps = self._load_token(i)["components"]
            for comp in self.REQUIRED_COMPONENTS:
                self.assertIn(comp, comps, f"Style {i} missing component: {comp}")

    def test_typography_has_font_families(self):
        for i in range(1, 4):
            typo = self._load_token(i)["typography"]
            self.assertIn("fontFamilyHeading", typo, f"Style {i} missing heading font")
            self.assertIn("fontFamilyBody", typo, f"Style {i} missing body font")

    def test_typography_has_size_scale(self):
        for i in range(1, 4):
            typo = self._load_token(i)["typography"]
            self.assertIn("sizeScale", typo)
            scale = typo["sizeScale"]
            self.assertGreaterEqual(len(scale), 10, f"Style {i} size scale too small")

    def test_spacing_has_entries(self):
        for i in range(1, 4):
            spacing = self._load_token(i)["spacing"]
            self.assertGreaterEqual(len(spacing), 8, f"Style {i} spacing too few entries")

    def test_versions_are_semver(self):
        semver = re.compile(r"^\d+\.\d+\.\d+$")
        for i in range(1, 4):
            version = self._load_token(i)["version"]
            self.assertRegex(version, semver, f"Style {i} version not semver: {version}")


class TestDesignTokenCrossStyleConsistency(unittest.TestCase):
    """Verify cross-style token key consistency."""

    def _get_all_keys(self, obj, prefix=""):
        keys = set()
        if isinstance(obj, dict):
            for k, v in obj.items():
                full = f"{prefix}.{k}" if prefix else k
                keys.add(full)
                keys.update(self._get_all_keys(v, full))
        return keys

    def test_common_keys_count(self):
        all_keys = {}
        for i in range(1, 4):
            tokens = load_json(f"tokens-style{i}.json")
            all_keys[i] = self._get_all_keys(tokens)
        common = all_keys[1] & all_keys[2] & all_keys[3]
        self.assertGreaterEqual(len(common), 120, f"Only {len(common)} common keys across 3 styles")

    def test_style1_is_baseline(self):
        """Style 1 should be the baseline with no unique keys."""
        all_keys = {}
        for i in range(1, 4):
            tokens = load_json(f"tokens-style{i}.json")
            all_keys[i] = self._get_all_keys(tokens)
        only1 = all_keys[1] - all_keys[2] - all_keys[3]
        self.assertEqual(len(only1), 0, f"Style 1 has unexpected unique keys: {only1}")


class TestDesignTokenValues(unittest.TestCase):
    """Verify token values match the style guide specification."""

    def test_style1_colors_match_guide(self):
        t = load_json("tokens-style1.json")
        self.assertEqual(t["colors"]["primary"], "#1A1A2E")
        self.assertEqual(t["colors"]["secondary"], "#E94560")
        self.assertEqual(t["colors"]["background"], "#FAFAFA")
        self.assertEqual(t["colors"]["accent"], "#0F3460")

    def test_style2_colors_match_guide(self):
        t = load_json("tokens-style2.json")
        self.assertEqual(t["colors"]["primary"], "#FF2D55")
        self.assertEqual(t["colors"]["secondary"], "#FFB800")
        self.assertEqual(t["colors"]["accent"], "#00D4AA")
        self.assertEqual(t["colors"]["background"], "#0D0D0D")

    def test_style3_colors_match_guide(self):
        t = load_json("tokens-style3.json")
        self.assertEqual(t["colors"]["primary"], "#1B3A4B")
        self.assertEqual(t["colors"]["secondary"], "#C8A951")
        self.assertEqual(t["colors"]["accent"], "#8B2E3B")
        self.assertEqual(t["colors"]["background"], "#FAF8F4")

    def test_style1_hero_height(self):
        t = load_json("tokens-style1.json")
        self.assertEqual(t["components"]["hero"]["minHeight"], "70vh")

    def test_style2_hero_height(self):
        t = load_json("tokens-style2.json")
        self.assertEqual(t["components"]["hero"]["minHeight"], "90vh")

    def test_style3_hero_height(self):
        t = load_json("tokens-style3.json")
        self.assertEqual(t["components"]["hero"]["minHeight"], "75vh")

    def test_style1_font_family(self):
        t = load_json("tokens-style1.json")
        self.assertIn("Inter", t["typography"]["fontFamilyHeading"])
        self.assertIn("Inter", t["typography"]["fontFamilyBody"])

    def test_style2_font_families(self):
        t = load_json("tokens-style2.json")
        self.assertIn("Bebas Neue", t["typography"]["fontFamilyHeading"])
        self.assertIn("Roboto", t["typography"]["fontFamilyBody"])

    def test_style3_font_families(self):
        t = load_json("tokens-style3.json")
        self.assertIn("Playfair Display", t["typography"]["fontFamilyHeading"])
        self.assertIn("Source Sans 3", t["typography"]["fontFamilyBody"])

    def test_style2_button_uppercase(self):
        t = load_json("tokens-style2.json")
        self.assertEqual(t["components"]["button"]["textTransform"], "uppercase")

    def test_style1_button_no_transform(self):
        t = load_json("tokens-style1.json")
        self.assertEqual(t["components"]["button"]["textTransform"], "none")

    def test_style3_gold_button_variant(self):
        t = load_json("tokens-style3.json")
        self.assertEqual(t["components"]["button"]["goldVariantBg"], "#C8A951")
        self.assertEqual(t["components"]["button"]["goldVariantText"], "#1B3A4B")

    def test_style2_card_accent_bar(self):
        t = load_json("tokens-style2.json")
        self.assertEqual(t["components"]["card"]["accentBar"], "3px solid #FF2D55")

    def test_style3_card_header_border(self):
        t = load_json("tokens-style3.json")
        self.assertEqual(t["components"]["card"]["headerBorder"], "2px solid #C8A951")


# ============================================================
# 4. WCAG ACCESSIBILITY TESTS
# ============================================================

class TestWCAGContrast(unittest.TestCase):
    """Verify WCAG 2.1 AA contrast ratios for all three themes."""

    AA_NORMAL = 4.5
    AA_LARGE = 3.0

    def test_style1_text_on_background(self):
        ratio = contrast_ratio("#1A1A2E", "#FAFAFA")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 1 text/bg: {ratio:.1f}")

    def test_style1_secondary_text_on_background(self):
        ratio = contrast_ratio("#6B6B80", "#FAFAFA")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 1 sec text/bg: {ratio:.1f}")

    def test_style1_button_text_passes_aa_large(self):
        ratio = contrast_ratio("#FFFFFF", "#E94560")
        self.assertGreaterEqual(ratio, self.AA_LARGE, f"Style 1 btn: {ratio:.1f}")

    def test_style1_button_text_fails_aa_normal(self):
        """Document: Style 1 coral button fails AA normal text (3.8:1 < 4.5:1)."""
        ratio = contrast_ratio("#FFFFFF", "#E94560")
        self.assertLess(ratio, self.AA_NORMAL, f"Expected < 4.5, got {ratio:.1f}")

    def test_style2_text_on_background(self):
        ratio = contrast_ratio("#FFFFFF", "#0D0D0D")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 2 text/bg: {ratio:.1f}")

    def test_style2_secondary_text_on_background(self):
        ratio = contrast_ratio("#B0B0B0", "#0D0D0D")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 2 sec text/bg: {ratio:.1f}")

    def test_style2_button_text_passes_aa_large(self):
        ratio = contrast_ratio("#FFFFFF", "#FF2D55")
        self.assertGreaterEqual(ratio, self.AA_LARGE, f"Style 2 btn: {ratio:.1f}")

    def test_style2_button_text_fails_aa_normal(self):
        """Document: Style 2 red button fails AA normal text (3.6:1 < 4.5:1)."""
        ratio = contrast_ratio("#FFFFFF", "#FF2D55")
        self.assertLess(ratio, self.AA_NORMAL, f"Expected < 4.5, got {ratio:.1f}")

    def test_style3_text_on_background(self):
        ratio = contrast_ratio("#2C2C2C", "#FAF8F4")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 3 text/bg: {ratio:.1f}")

    def test_style3_secondary_text_on_background(self):
        ratio = contrast_ratio("#5A5A5A", "#FAF8F4")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 3 sec text/bg: {ratio:.1f}")

    def test_style3_primary_button_passes_aa(self):
        ratio = contrast_ratio("#FAF8F4", "#1B3A4B")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 3 teal btn: {ratio:.1f}")

    def test_style3_gold_button_passes_aa(self):
        ratio = contrast_ratio("#1B3A4B", "#C8A951")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 3 gold btn: {ratio:.1f}")

    def test_style2_yellow_on_dark_passes(self):
        ratio = contrast_ratio("#FFB800", "#0D0D0D")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 2 yellow/dark: {ratio:.1f}")

    def test_style2_teal_on_dark_passes(self):
        ratio = contrast_ratio("#00D4AA", "#0D0D0D")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 2 teal/dark: {ratio:.1f}")

    def test_style3_accent_on_background_passes(self):
        ratio = contrast_ratio("#8B2E3B", "#FAF8F4")
        self.assertGreaterEqual(ratio, self.AA_NORMAL, f"Style 3 accent/bg: {ratio:.1f}")


# ============================================================
# 5. CONTENT DATA TESTS
# ============================================================

class TestClubWebsiteContent(unittest.TestCase):
    """Verify club website content structure and completeness."""

    @classmethod
    def setUpClass(cls):
        cls.content = load_json("club_website_content.json")

    def test_all_seven_sections_present(self):
        expected = ["home", "el-club", "deportes", "actividades", "novedades", "contacto", "hacete-socio"]
        for section in expected:
            self.assertIn(section, self.content, f"Missing section: {section}")

    def test_home_has_hero(self):
        self.assertIn("hero", self.content["home"])

    def test_home_has_about(self):
        self.assertIn("about", self.content["home"])

    def test_home_has_benefits(self):
        self.assertIn("benefits", self.content["home"])

    def test_home_has_testimonials(self):
        self.assertIn("testimonials", self.content["home"])

    def test_home_has_footer(self):
        self.assertIn("footer", self.content["home"])

    def test_home_has_social_links(self):
        self.assertIn("social_links", self.content["home"])

    def test_contacto_has_data(self):
        contacto = self.content["contacto"]
        self.assertTrue(len(contacto) > 0)

    def test_hacete_socio_has_plans(self):
        socio = self.content["hacete-socio"]
        self.assertTrue(len(socio) > 0)


class TestSitemapData(unittest.TestCase):
    """Verify sitemap structure, page counts, and URL validity."""

    @classmethod
    def setUpClass(cls):
        cls.sitemap = load_json("sitemap.json")

    def test_has_7_pages(self):
        self.assertEqual(len(self.sitemap.get("pages", [])), 7)

    def test_has_19_sports(self):
        self.assertEqual(len(self.sitemap.get("sports_pages", [])), 19)

    def test_has_3_activities(self):
        self.assertEqual(len(self.sitemap.get("activity_pages", [])), 3)

    def test_has_6_navigation_items(self):
        self.assertEqual(len(self.sitemap.get("navigation", [])), 6)

    def test_all_page_urls_https(self):
        for page in self.sitemap.get("pages", []):
            self.assertTrue(
                page["url"].startswith("https://"),
                f"Non-HTTPS URL: {page['url']}",
            )

    def test_all_sport_urls_https(self):
        for sport in self.sitemap.get("sports_pages", []):
            self.assertTrue(
                sport["url"].startswith("https://"),
                f"Non-HTTPS sport URL: {sport['url']}",
            )

    def test_all_activity_urls_https(self):
        for act in self.sitemap.get("activity_pages", []):
            self.assertTrue(
                act["url"].startswith("https://"),
                f"Non-HTTPS activity URL: {act['url']}",
            )

    def test_all_urls_valid_format(self):
        url_re = re.compile(r"^https?://[^\s]+$")
        for page in self.sitemap.get("pages", []):
            self.assertRegex(page["url"], url_re, f"Invalid URL: {page['url']}")

    def test_external_links_present(self):
        ext = self.sitemap.get("external_links", {})
        for key in ["instagram", "facebook", "whatsapp"]:
            self.assertIn(key, ext, f"Missing external link: {key}")

    def test_base_url_correct(self):
        self.assertEqual(self.sitemap["base_url"], "https://clubbanconacion.org.ar")


class TestImageAssets(unittest.TestCase):
    """Verify image asset inventory."""

    @classmethod
    def setUpClass(cls):
        cls.images = load_json("image_assets.json")

    def test_has_50_images(self):
        self.assertEqual(len(self.images), 50)

    def test_all_images_have_alt_text(self):
        for img in self.images:
            alt = img.get("alt", "")
            self.assertTrue(len(alt) > 0, f"Image missing alt text: {img.get('url', 'unknown')}")

    def test_all_images_have_url(self):
        for img in self.images:
            url = img.get("url", img.get("src", ""))
            self.assertTrue(len(url) > 0, "Image missing URL/src")

    def test_images_from_multiple_pages(self):
        pages = set()
        for img in self.images:
            page = img.get("source_page", img.get("page", ""))
            if page:
                pages.add(page)
        self.assertGreaterEqual(len(pages), 5, f"Images from only {len(pages)} pages")


class TestInstagramData(unittest.TestCase):
    """Verify Instagram data completeness."""

    @classmethod
    def setUpClass(cls):
        cls.insta = load_json("instagram_cabnaoficial.json")

    def test_has_profile(self):
        self.assertIn("profile", self.insta)

    def test_profile_has_username(self):
        profile = self.insta.get("profile", {})
        self.assertIn("username", profile)
        self.assertEqual(profile["username"], "cabnaoficial")

    def test_has_hashtags(self):
        self.assertIn("hashtags", self.insta)
        self.assertGreater(len(self.insta["hashtags"]), 0)

    def test_has_content_themes(self):
        self.assertIn("content_themes", self.insta)


# ============================================================
# 6. SITE COPY COVERAGE TESTS
# ============================================================

class TestSiteCopyCoverage(unittest.TestCase):
    """Verify site-copy.md covers all required sections."""

    @classmethod
    def setUpClass(cls):
        with open("site-copy.md") as f:
            cls.copy = f.read()

    def test_has_hero_section(self):
        self.assertIn("## 1. Hero Section", self.copy)

    def test_has_about_section(self):
        self.assertIn("## 2. About Section", self.copy)

    def test_has_membership_section(self):
        self.assertIn("## 3. Membership Section", self.copy)

    def test_has_events_section(self):
        self.assertIn("## 4. Events Section", self.copy)

    def test_has_gallery_section(self):
        self.assertIn("## 5. Gallery Section", self.copy)

    def test_has_news_section(self):
        self.assertIn("## 6. News Section", self.copy)

    def test_has_contact_section(self):
        self.assertIn("## 7. Contact Section", self.copy)

    def test_has_footer_section(self):
        self.assertIn("## 8. Footer", self.copy)

    def test_has_supplementary_sections(self):
        self.assertIn("## 9. Supplementary Sections", self.copy)

    def test_contact_form_fields_defined(self):
        self.assertIn("Full name", self.copy)
        self.assertIn("Email", self.copy)
        self.assertIn("Subject", self.copy)
        self.assertIn("Message", self.copy)

    def test_cta_buttons_defined(self):
        self.assertIn("Become a Member", self.copy)
        self.assertIn("Explore the Club", self.copy)
        self.assertIn("Send Message", self.copy)

    def test_membership_plans_present(self):
        self.assertIn("Cuota Única Individual", self.copy)
        self.assertIn("CABNA Individual", self.copy)
        self.assertIn("CABNA Plus Individual", self.copy)
        self.assertIn("CABNA Familiar", self.copy)

    def test_events_sample_data_present(self):
        self.assertIn("Event", self.copy)
        self.assertIn("Date", self.copy)
        self.assertIn("Location", self.copy)
        self.assertIn("Status", self.copy)

    def test_gallery_section_has_format(self):
        self.assertIn("Album Card Format", self.copy)

    def test_contact_details_present(self):
        self.assertIn("cabna@argentina.com", self.copy)
        self.assertIn("Zufriategui 1251", self.copy)


# ============================================================
# 7. STYLE GUIDE COVERAGE TESTS
# ============================================================

class TestStyleGuideCoverage(unittest.TestCase):
    """Verify style-guide.md covers all three themes completely."""

    @classmethod
    def setUpClass(cls):
        with open("style-guide.md") as f:
            cls.guide = f.read()

    def test_has_all_three_themes(self):
        self.assertIn("## Style 1: Estilo Puro", self.guide)
        self.assertIn("## Style 2: Cancha Viva", self.guide)
        self.assertIn("## Style 3: Tribuna Dorada", self.guide)

    def test_each_theme_has_buttons(self):
        self.assertEqual(self.guide.count("#### Buttons"), 3)

    def test_each_theme_has_cards(self):
        self.assertEqual(self.guide.count("#### Cards"), 3)

    def test_each_theme_has_navigation(self):
        self.assertEqual(self.guide.count("#### Navigation"), 3)

    def test_each_theme_has_hero(self):
        self.assertEqual(self.guide.count("#### Hero Section"), 3)

    def test_has_color_palettes(self):
        self.assertEqual(self.guide.count("### Color Palette"), 3)

    def test_has_typography_specs(self):
        self.assertEqual(self.guide.count("### Typography"), 3)

    def test_has_accessibility_section(self):
        self.assertIn("### Accessibility", self.guide)

    def test_has_font_loading_section(self):
        self.assertIn("### Font Loading", self.guide)

    def test_has_implementation_notes(self):
        self.assertIn("## Implementation Notes", self.guide)

    def test_has_quick_comparison(self):
        self.assertIn("## Quick Comparison", self.guide)


# ============================================================
# 8. DATA FILE CROSS-REFERENCE TESTS
# ============================================================

class TestDataCrossReference(unittest.TestCase):
    """Cross-reference data between different files for consistency."""

    def test_sitemap_pages_match_content_sections(self):
        sitemap = load_json("sitemap.json")
        content = load_json("club_website_content.json")
        page_slugs = {p["slug"] for p in sitemap["pages"]}
        content_sections = set(content.keys())
        self.assertTrue(
            page_slugs.issubset(content_sections),
            f"Sitemap pages not all in content: {page_slugs - content_sections}",
        )

    def test_sports_pages_subset_of_nav(self):
        """All sports_pages should appear in the DEPORTES nav dropdown.
        Nav has 20 children (19 sports + 'TODOS' overview link)."""
        sitemap = load_json("sitemap.json")
        sport_labels = {s["label"] for s in sitemap["sports_pages"]}
        nav_labels = set()
        for nav in sitemap["navigation"]:
            if nav["label"] == "DEPORTES":
                nav_labels = {c["label"] for c in nav.get("children", [])}
        self.assertTrue(
            sport_labels.issubset(nav_labels),
            f"Sports not in nav: {sport_labels - nav_labels}",
        )
        self.assertEqual(len(sitemap["sports_pages"]), 19)
        self.assertEqual(len(nav_labels), 20)  # 19 sports + TODOS

    def test_external_links_in_sitemap_and_content(self):
        sitemap = load_json("sitemap.json")
        content = load_json("club_website_content.json")
        ext = sitemap.get("external_links", {})
        self.assertIn("instagram", ext)
        home_social = content.get("home", {}).get("social_links", {})
        self.assertTrue(len(home_social) > 0, "Home section has no social links")


# ============================================================
# 9. PYTHON SOURCE TESTS
# ============================================================

class TestPythonSourceQuality(unittest.TestCase):
    """Basic quality checks on Python source files."""

    def test_scraper_compiles(self):
        with open("scraper.py") as f:
            source = f.read()
        compile(source, "scraper.py", "exec")

    def test_test_scraper_compiles(self):
        with open("test_scraper.py") as f:
            source = f.read()
        compile(source, "test_scraper.py", "exec")

    def test_no_eval_or_exec_in_scraper(self):
        with open("scraper.py") as f:
            source = f.read()
        self.assertNotIn("eval(", source)
        self.assertNotIn("exec(", source)
        self.assertNotIn("os.system(", source)

    def test_scraper_has_error_handling(self):
        with open("scraper.py") as f:
            source = f.read()
        self.assertIn("try:", source)
        self.assertIn("except", source)


if __name__ == "__main__":
    unittest.main()
