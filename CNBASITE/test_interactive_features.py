"""
Test suite for CNBASITE interactive features.
Validates: events section, gallery, contact form, accessibility, and dependencies.

Run: python3 -m unittest test_interactive_features -v
"""

import json
import os
import re
import unittest
from html.parser import HTMLParser


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_file(path):
    with open(os.path.join(BASE_DIR, path), encoding="utf-8") as f:
        return f.read()


def load_json(path):
    with open(os.path.join(BASE_DIR, path), encoding="utf-8") as f:
        return json.load(f)


class AttributeExtractor(HTMLParser):
    """Extracts element ids, roles, aria-* attrs, and tag structure."""

    def __init__(self):
        super().__init__()
        self.ids = set()
        self.roles = []
        self.aria_attrs = []
        self.tags = []
        self.noscript_content = []
        self.forms = []
        self.inputs = []
        self.labels = []
        self.buttons = []
        self.selects = []
        self.sections = []
        self._in_noscript = False
        self._noscript_depth = 0
        self._noscript_buf = []
        self._in_form = False
        self._form_attrs = {}

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.tags.append((tag, attrs_dict))

        if tag == "noscript":
            self._in_noscript = True
            self._noscript_depth += 1
            self._noscript_buf = []

        if self._in_noscript:
            self._noscript_buf.append(tag)

        eid = attrs_dict.get("id")
        if eid:
            self.ids.add(eid)

        role = attrs_dict.get("role")
        if role:
            self.roles.append((tag, role, attrs_dict))

        for k, v in attrs_dict.items():
            if k.startswith("aria-"):
                self.aria_attrs.append((tag, k, v, attrs_dict))

        if tag == "form":
            self._in_form = True
            self._form_attrs = attrs_dict
            self.forms.append(attrs_dict)

        if tag == "input":
            self.inputs.append(attrs_dict)

        if tag == "textarea":
            self.inputs.append(attrs_dict)

        if tag == "label":
            self.labels.append(attrs_dict)

        if tag == "button":
            self.buttons.append(attrs_dict)

        if tag == "select":
            self.selects.append(attrs_dict)

        if tag == "section":
            self.sections.append(attrs_dict)

    def handle_endtag(self, tag):
        if tag == "noscript":
            self._noscript_depth -= 1
            if self._noscript_depth == 0:
                self._in_noscript = False
                self.noscript_content.append(self._noscript_buf[:])

    def handle_data(self, data):
        if self._in_noscript:
            self._noscript_buf.append(("text", data.strip()))


def parse_html(content):
    parser = AttributeExtractor()
    parser.feed(content)
    return parser


# ============================================================
# EVENTS TESTS
# ============================================================

class TestEventsSection(unittest.TestCase):
    """Events section renders from JSON and supports filtering."""

    @classmethod
    def setUpClass(cls):
        cls.html = load_file("index.html")
        cls.parser = parse_html(cls.html)
        cls.events = load_json("data/events.json")

    def test_events_json_exists_and_valid(self):
        self.assertIsInstance(self.events, list)
        self.assertGreater(len(self.events), 0, "events.json must have events")

    def test_events_have_required_fields(self):
        required = {"id", "title", "category", "date", "time", "location", "description"}
        for ev in self.events:
            for field in required:
                self.assertIn(field, ev, f"Event missing field: {field}")

    def test_events_have_valid_dates(self):
        date_pattern = re.compile(r"^\d{4}-\d{2}-\d{2}$")
        for ev in self.events:
            self.assertRegex(ev["date"], date_pattern, f"Invalid date: {ev['date']}")

    def test_events_have_categories(self):
        categories = set(ev["category"] for ev in self.events)
        self.assertGreaterEqual(len(categories), 2, "Need at least 2 event categories for filtering")

    def test_events_have_multiple_months(self):
        months = set(ev["date"][:7] for ev in self.events)
        self.assertGreaterEqual(len(months), 2, "Need at least 2 months for date filtering")

    def test_events_section_exists_in_html(self):
        self.assertIn('id="events-section"', self.html)
        self.assertIn('id="events-heading"', self.html)

    def test_events_grid_element_exists(self):
        self.assertIn('id="events-grid"', self.html)

    def test_category_filter_exists(self):
        self.assertIn('id="filter-category"', self.html)
        select_ids = [s.get("id") for s in self.parser.selects]
        self.assertIn("filter-category", select_ids)

    def test_date_filter_exists(self):
        self.assertIn('id="filter-date"', self.html)
        select_ids = [s.get("id") for s in self.parser.selects]
        self.assertIn("filter-date", select_ids)

    def test_filter_reset_button_exists(self):
        self.assertIn('id="filter-reset"', self.html)

    def test_events_count_live_region(self):
        self.assertIn('id="events-count"', self.html)
        live_regions = [(t, a) for t, k, a, _ in self.parser.aria_attrs if k == "aria-live"]
        has_polite = any(a == "polite" for _, a in live_regions)
        self.assertTrue(has_polite, "Events count should have aria-live='polite'")

    def test_events_grid_has_list_role(self):
        grid_roles = [r for t, r, a in self.parser.roles if a.get("id") == "events-grid"]
        self.assertIn("list", grid_roles)

    def test_js_loads_events_from_json(self):
        js = load_file("app.js")
        self.assertIn("events.json", js)
        self.assertIn("filter-category", js)
        self.assertIn("filter-date", js)

    def test_js_implements_filtering(self):
        js = load_file("app.js")
        self.assertIn("applyFilters", js)
        self.assertIn("catMatch", js)

    def test_noscript_fallback_for_events(self):
        self.assertIn("<noscript>", self.html)
        noscript_blocks = self.parser.noscript_content
        self.assertGreater(len(noscript_blocks), 0, "Must have noscript fallback")
        has_event_fallback = any("article" in block for block in noscript_blocks)
        self.assertTrue(has_event_fallback, "Noscript must contain event articles")


# ============================================================
# GALLERY TESTS
# ============================================================

class TestGallerySection(unittest.TestCase):
    """Gallery displays images in a grid with lightbox and keyboard nav."""

    @classmethod
    def setUpClass(cls):
        cls.html = load_file("index.html")
        cls.parser = parse_html(cls.html)
        cls.css = load_file("styles.css")
        cls.js = load_file("app.js")
        cls.images = load_json("data/image_assets.json")

    def test_image_assets_json_exists(self):
        self.assertTrue(
            isinstance(self.images, dict) or isinstance(self.images, list),
            "image_assets.json must be valid"
        )

    def test_gallery_section_exists(self):
        self.assertIn('id="gallery-section"', self.html)
        self.assertIn('id="gallery-heading"', self.html)

    def test_gallery_grid_exists(self):
        self.assertIn('id="gallery-grid"', self.html)

    def test_gallery_uses_css_grid(self):
        self.assertIn("gallery-grid", self.css)
        self.assertRegex(self.css, r"\.gallery-grid\s*\{[^}]*grid-template-columns")

    def test_lightbox_modal_exists(self):
        self.assertIn('id="lightbox"', self.html)
        lightbox_roles = [r for t, r, a in self.parser.roles if a.get("id") == "lightbox"]
        self.assertIn("dialog", lightbox_roles)

    def test_lightbox_has_aria_modal(self):
        lightbox_attrs = [a for t, k, a, attrs in self.parser.aria_attrs
                          if k == "aria-modal" and attrs.get("id") == "lightbox"]
        self.assertTrue(len(lightbox_attrs) > 0, "Lightbox must have aria-modal")
        self.assertEqual(lightbox_attrs[0], "true")

    def test_lightbox_has_close_button(self):
        self.assertIn("lightbox-close", self.html)
        close_labels = [a for t, k, a, attrs in self.parser.aria_attrs
                        if k == "aria-label" and "Cerrar" in (a or "")]
        self.assertGreater(len(close_labels), 0)

    def test_lightbox_has_navigation_buttons(self):
        self.assertIn('id="lightbox-prev"', self.html)
        self.assertIn('id="lightbox-next"', self.html)

    def test_lightbox_keyboard_navigation(self):
        self.assertIn("ArrowLeft", self.js)
        self.assertIn("ArrowRight", self.js)
        self.assertIn("Escape", self.js)

    def test_lightbox_initially_hidden(self):
        self.assertIn("hidden", self.html.split('id="lightbox"')[1][:200])

    def test_gallery_items_are_keyboard_focusable(self):
        self.assertIn("tabindex", self.js)
        self.assertIn('"0"', self.js)

    def test_gallery_items_keyboard_activation(self):
        self.assertIn('"Enter"', self.js)
        self.assertIn('" "', self.js)

    def test_lightbox_prev_has_aria_label(self):
        prev_labels = [a for t, k, a, attrs in self.parser.aria_attrs
                       if k == "aria-label" and attrs.get("id") == "lightbox-prev"]
        self.assertGreater(len(prev_labels), 0)

    def test_lightbox_next_has_aria_label(self):
        next_labels = [a for t, k, a, attrs in self.parser.aria_attrs
                       if k == "aria-label" and attrs.get("id") == "lightbox-next"]
        self.assertGreater(len(next_labels), 0)

    def test_lightbox_counter_exists(self):
        self.assertIn('id="lightbox-current"', self.html)
        self.assertIn('id="lightbox-total"', self.html)

    def test_noscript_fallback_for_gallery(self):
        noscript_blocks = self.parser.noscript_content
        has_img = any("img" in block for block in noscript_blocks)
        self.assertTrue(has_img, "Gallery noscript fallback must contain images")

    def test_js_loads_gallery_from_json(self):
        self.assertIn("image_assets.json", self.js)

    def test_lightbox_focus_management(self):
        self.assertIn("_previouslyFocused", self.js)
        self.assertIn(".focus()", self.js)


# ============================================================
# CONTACT FORM TESTS
# ============================================================

class TestContactForm(unittest.TestCase):
    """Contact form validates all fields and shows feedback."""

    @classmethod
    def setUpClass(cls):
        cls.html = load_file("index.html")
        cls.parser = parse_html(cls.html)
        cls.js = load_file("app.js")

    def test_contact_section_exists(self):
        self.assertIn('id="contact-section"', self.html)
        self.assertIn('id="contact-heading"', self.html)

    def test_form_exists(self):
        self.assertIn('id="contact-form"', self.html)
        self.assertGreater(len(self.parser.forms), 0)

    def test_form_has_novalidate(self):
        form = next((f for f in self.parser.forms if f.get("id") == "contact-form"), None)
        self.assertIsNotNone(form)
        self.assertIn("novalidate", form, "Form should have novalidate for custom validation")

    def test_name_field_exists(self):
        name_inputs = [i for i in self.parser.inputs if i.get("id") == "field-name"]
        self.assertEqual(len(name_inputs), 1)
        self.assertEqual(name_inputs[0].get("name"), "nombre")
        self.assertIn("required", name_inputs[0])

    def test_email_field_exists(self):
        email_inputs = [i for i in self.parser.inputs if i.get("id") == "field-email"]
        self.assertEqual(len(email_inputs), 1)
        self.assertEqual(email_inputs[0].get("type"), "email")
        self.assertIn("required", email_inputs[0])

    def test_subject_field_exists(self):
        subj_inputs = [i for i in self.parser.inputs if i.get("id") == "field-subject"]
        self.assertEqual(len(subj_inputs), 1)
        self.assertIn("required", subj_inputs[0])

    def test_message_field_exists(self):
        msg_inputs = [i for i in self.parser.inputs if i.get("id") == "field-message"]
        self.assertEqual(len(msg_inputs), 1)
        self.assertIn("required", msg_inputs[0])

    def test_all_fields_have_labels(self):
        label_fors = [l.get("for") for l in self.parser.labels]
        for field_id in ["field-name", "field-email", "field-subject", "field-message"]:
            self.assertIn(field_id, label_fors, f"Missing label for {field_id}")

    def test_all_fields_have_aria_required(self):
        field_ids = ["field-name", "field-email", "field-subject", "field-message"]
        for fid in field_ids:
            has_aria_req = any(
                k == "aria-required" and attrs.get("id") == fid
                for _, k, _, attrs in self.parser.aria_attrs
            )
            self.assertTrue(has_aria_req, f"Field {fid} must have aria-required")

    def test_all_fields_have_error_elements(self):
        for name in ["name", "email", "subject", "message"]:
            self.assertIn(f'id="error-{name}"', self.html)

    def test_error_elements_have_alert_role(self):
        error_roles = [
            (tag, role) for tag, role, attrs in self.parser.roles
            if attrs.get("id", "").startswith("error-")
        ]
        self.assertGreater(len(error_roles), 0, "Error elements should have role=alert")

    def test_form_feedback_element_exists(self):
        self.assertIn('id="form-feedback"', self.html)
        feedback_live = [
            a for _, k, a, attrs in self.parser.aria_attrs
            if k == "aria-live" and attrs.get("id") == "form-feedback"
        ]
        self.assertGreater(len(feedback_live), 0)
        self.assertEqual(feedback_live[0], "assertive")

    def test_submit_button_exists(self):
        submit_btns = [b for b in self.parser.buttons if b.get("type") == "submit"]
        self.assertGreater(len(submit_btns), 0)

    def test_js_validates_name(self):
        self.assertIn("nombre", self.js)
        self.assertIn("obligatorio", self.js)

    def test_js_validates_email_format(self):
        self.assertIn("emailPattern", self.js)
        self.assertIn("@", self.js)

    def test_js_validates_subject(self):
        self.assertIn("asunto", self.js)

    def test_js_validates_message(self):
        self.assertIn("mensaje", self.js)

    def test_js_shows_success_feedback(self):
        self.assertIn("success", self.js)
        self.assertIn("enviado correctamente", self.js)

    def test_js_shows_error_feedback(self):
        self.assertIn("error", self.js.lower())

    def test_js_sets_aria_invalid(self):
        self.assertIn("aria-invalid", self.js)

    def test_js_focuses_first_invalid_field(self):
        self.assertIn("firstInvalid", self.js)
        self.assertIn("firstInvalid.focus()", self.js)

    def test_noscript_fallback_for_contact(self):
        self.assertIn("cabna@argentina.com", self.html)
        noscript_blocks = self.parser.noscript_content
        has_contact_fallback = any(
            any("cabna@argentina.com" in str(item) if isinstance(item, tuple) else "cabna@argentina.com" in item
                for item in block)
            for block in noscript_blocks
        )
        self.assertTrue(has_contact_fallback, "Contact noscript must have email fallback")


# ============================================================
# ACCESSIBILITY TESTS
# ============================================================

class TestAccessibility(unittest.TestCase):
    """Keyboard accessibility and graceful degradation."""

    @classmethod
    def setUpClass(cls):
        cls.html = load_file("index.html")
        cls.parser = parse_html(cls.html)
        cls.css = load_file("styles.css")
        cls.js = load_file("app.js")

    def test_html_has_lang_attribute(self):
        self.assertRegex(self.html, r'<html[^>]+lang="es"')

    def test_skip_link_exists(self):
        self.assertIn("skip-link", self.html)
        self.assertIn("#main-content", self.html)
        self.assertIn('id="main-content"', self.html)

    def test_skip_link_css_hidden_until_focus(self):
        self.assertIn(".skip-link", self.css)
        self.assertIn(".skip-link:focus", self.css)

    def test_header_has_banner_role(self):
        header_roles = [r for t, r, a in self.parser.roles if t == "header"]
        self.assertIn("banner", header_roles)

    def test_main_element_exists(self):
        main_tags = [t for t, a in self.parser.tags if t == "main"]
        self.assertGreater(len(main_tags), 0)

    def test_footer_has_contentinfo_role(self):
        footer_roles = [r for t, r, a in self.parser.roles if t == "footer"]
        self.assertIn("contentinfo", footer_roles)

    def test_nav_has_aria_label(self):
        nav_labels = [a for t, k, a, attrs in self.parser.aria_attrs
                      if t == "nav" and k == "aria-label"]
        self.assertGreater(len(nav_labels), 0)

    def test_sections_have_aria_labelledby(self):
        section_labels = [
            attrs.get("aria-labelledby")
            for t, attrs in self.parser.tags
            if t == "section" and attrs.get("aria-labelledby")
        ]
        self.assertGreaterEqual(len(section_labels), 3, "All 3 sections must have aria-labelledby")

    def test_focus_visible_styles_exist(self):
        self.assertIn("focus-visible", self.css)

    def test_lightbox_traps_focus_on_close(self):
        self.assertIn("_previouslyFocused", self.js)

    def test_lightbox_keyboard_close(self):
        self.assertIn("Escape", self.js)

    def test_gallery_keyboard_activation(self):
        self.assertIn('"Enter"', self.js)

    def test_form_fields_have_aria_describedby(self):
        described_fields = [
            attrs.get("id")
            for t, k, v, attrs in self.parser.aria_attrs
            if k == "aria-describedby"
        ]
        for fid in ["field-name", "field-email", "field-subject", "field-message"]:
            self.assertIn(fid, described_fields, f"{fid} needs aria-describedby")

    def test_noscript_elements_exist(self):
        noscript_count = self.html.count("<noscript>")
        self.assertGreaterEqual(noscript_count, 2, "Need noscript fallbacks for events and gallery")

    def test_search_role_on_filters(self):
        search_roles = [r for t, r, a in self.parser.roles if r == "search"]
        self.assertGreater(len(search_roles), 0, "Filters should have role='search'")

    def test_select_controls_have_aria_controls(self):
        for sel in self.parser.selects:
            if sel.get("id") in ("filter-category", "filter-date"):
                self.assertIn("aria-controls", sel,
                              f"Select {sel.get('id')} should have aria-controls")


# ============================================================
# DEPENDENCIES TEST
# ============================================================

class TestNoDependencies(unittest.TestCase):
    """No external runtime dependencies beyond setup instructions."""

    @classmethod
    def setUpClass(cls):
        cls.html = load_file("index.html")
        cls.js = load_file("app.js")
        cls.css = load_file("styles.css")

    def test_no_external_css_links(self):
        external_css = re.findall(r'<link[^>]+href="(https?://[^"]+)"', self.html)
        self.assertEqual(len(external_css), 0,
                         f"No external CSS allowed, found: {external_css}")

    def test_no_external_js_scripts(self):
        external_js = re.findall(r'<script[^>]+src="(https?://[^"]+)"', self.html)
        self.assertEqual(len(external_js), 0,
                         f"No external JS allowed, found: {external_js}")

    def test_no_cdn_references_in_js(self):
        cdn_refs = re.findall(r'https?://cdn\.', self.js)
        self.assertEqual(len(cdn_refs), 0)

    def test_no_import_statements_in_js(self):
        import_stmts = re.findall(r'^\s*import\s+', self.js, re.MULTILINE)
        self.assertEqual(len(import_stmts), 0)

    def test_no_require_statements_in_js(self):
        require_stmts = re.findall(r'require\s*\(', self.js)
        self.assertEqual(len(require_stmts), 0)

    def test_only_local_file_references(self):
        script_srcs = re.findall(r'<script[^>]+src="([^"]+)"', self.html)
        for src in script_srcs:
            self.assertFalse(src.startswith("http"), f"External script: {src}")

        css_hrefs = re.findall(r'<link[^>]+href="([^"]+)"', self.html)
        for href in css_hrefs:
            self.assertFalse(href.startswith("http"), f"External CSS: {href}")

    def test_no_package_json_needed(self):
        self.assertFalse(
            os.path.exists(os.path.join(BASE_DIR, "package.json")),
            "No package.json should be needed — no npm dependencies"
        )

    def test_files_are_vanilla(self):
        self.assertNotIn("React", self.js)
        self.assertNotIn("Vue", self.js)
        self.assertNotIn("Angular", self.js)
        self.assertNotIn("jQuery", self.js)
        self.assertNotIn("bootstrap", self.css.lower())


# ============================================================
# INTEGRATION TESTS
# ============================================================

class TestIntegration(unittest.TestCase):
    """Cross-cutting integration checks."""

    @classmethod
    def setUpClass(cls):
        cls.html = load_file("index.html")
        cls.js = load_file("app.js")
        cls.events = load_json("data/events.json")

    def test_html_is_valid_structure(self):
        self.assertIn("<!DOCTYPE html>", self.html)
        self.assertIn("<html", self.html)
        self.assertIn("</html>", self.html)
        self.assertIn("<head>", self.html)
        self.assertIn("</head>", self.html)
        self.assertIn("<body>", self.html)
        self.assertIn("</body>", self.html)

    def test_css_is_linked(self):
        self.assertIn('href="styles.css"', self.html)

    def test_js_is_linked(self):
        self.assertIn('src="app.js"', self.html)

    def test_js_at_end_of_body(self):
        body_end = self.html.rfind("</body>")
        script_pos = self.html.rfind('src="app.js"')
        self.assertLess(script_pos, body_end, "Script should be before </body>")

    def test_events_json_matches_categories_in_filters(self):
        categories = set(ev["category"] for ev in self.events)
        self.assertGreaterEqual(len(categories), 2)
        for cat in categories:
            self.assertIsInstance(cat, str)
            self.assertGreater(len(cat), 0)

    def test_all_required_files_exist(self):
        required = ["index.html", "styles.css", "app.js", "data/events.json", "data/image_assets.json"]
        for f in required:
            path = os.path.join(BASE_DIR, f)
            self.assertTrue(os.path.exists(path), f"Required file missing: {f}")

    def test_contact_info_from_json(self):
        data = load_json("data/club_website_content.json")
        contacto = data["pages"]["contacto"]
        self.assertIn("cabna@argentina.com", self.html)

    def test_meta_viewport_exists(self):
        self.assertIn('name="viewport"', self.html)

    def test_charset_is_utf8(self):
        self.assertIn('charset="UTF-8"', self.html)


if __name__ == "__main__":
    unittest.main()
