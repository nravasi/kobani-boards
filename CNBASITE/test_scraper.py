#!/usr/bin/env python3
"""Tests for the CABNA scraper output files."""

import json
import os
import unittest

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class TestClubWebsiteContent(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        with open(os.path.join(BASE_DIR, "club_website_content.json")) as f:
            cls.data = json.load(f)

    def test_all_sections_present(self):
        expected = {"home", "el-club", "deportes", "actividades", "novedades", "contacto", "hacete-socio"}
        self.assertEqual(set(self.data.keys()), expected)

    def test_home_nav_and_hero(self):
        home = self.data["home"]
        self.assertIn("hero", home)
        self.assertGreater(len(home["hero"]["banners"]), 0)

    def test_home_about(self):
        about = self.data["home"]["about"]
        self.assertIn("Club Atlético Banco", about["text"])
        self.assertEqual(about["heading"], "CLUB BANCO NACIÓN")

    def test_home_benefits(self):
        benefits = self.data["home"]["benefits"]
        self.assertEqual(len(benefits), 5)
        titles = {b["title"] for b in benefits}
        self.assertIn("Descuentos", titles)
        self.assertIn("Eventos", titles)
        self.assertIn("Disciplinas", titles)
        self.assertIn("Cultura", titles)
        self.assertIn("Colonia", titles)

    def test_home_testimonials(self):
        self.assertGreater(len(self.data["home"]["testimonials"]), 0)

    def test_home_footer(self):
        footer = self.data["home"]["footer"]
        self.assertIn("contact", footer)
        self.assertEqual(footer["contact"]["email"], "cabna@argentina.com")

    def test_home_social_links(self):
        social = self.data["home"]["social_links"]
        platforms = {s["platform"] for s in social}
        self.assertIn("facebook", platforms)
        self.assertIn("instagram", platforms)
        self.assertIn("whatsapp", platforms)

    def test_el_club_history(self):
        el_club = self.data["el-club"]
        self.assertEqual(el_club["history"]["founded"], "12 de octubre de 1909")
        self.assertIn("Zufriategui 1251", el_club["history"]["current_address"])

    def test_el_club_board(self):
        board = self.data["el-club"]["board_of_directors"]
        self.assertGreater(len(board["members"]), 10)
        president = board["members"][0]
        self.assertEqual(president["role"], "PRESIDENTE")
        self.assertIn("Graña", president["name"])

    def test_el_club_facilities(self):
        facilities = self.data["el-club"]["facilities"]
        self.assertIn("25 actividades", facilities["details"])

    def test_el_club_gallery(self):
        gallery = self.data["el-club"]["gallery"]
        self.assertEqual(len(gallery), 8)

    def test_contacto_info(self):
        contacto = self.data["contacto"]
        info = contacto["contact_info"]
        self.assertEqual(info["email"], "cabna@argentina.com")
        self.assertIn("Zufriategui", info["address"])
        self.assertIn("4791 7440", info["phone"])

    def test_hacete_socio_plans(self):
        socio = self.data["hacete-socio"]
        self.assertGreater(len(socio["plans"]), 0)
        self.assertGreater(len(socio["payment_methods"]), 0)
        self.assertGreater(len(socio["requirements"]), 0)

    def test_deportes_sports(self):
        deportes = self.data["deportes"]
        self.assertGreater(len(deportes["sports"]), 0)

    def test_events_section_exists(self):
        self.assertIn("novedades", self.data)


class TestInstagramData(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        with open(os.path.join(BASE_DIR, "instagram_cabnaoficial.json")) as f:
            cls.data = json.load(f)

    def test_profile_info(self):
        profile = self.data["profile"]
        self.assertEqual(profile["username"], "cabnaoficial")
        self.assertEqual(profile["full_name"], "Club Banco Nación Oficial")
        self.assertGreater(profile["followers"], 0)
        self.assertGreater(profile["posts_count"], 0)

    def test_profile_bio(self):
        self.assertIn("yotebanconacion", self.data["profile"]["bio"])

    def test_profile_url(self):
        self.assertIn("instagram.com/cabnaoficial", self.data["profile"]["profile_url"])

    def test_known_reels(self):
        self.assertGreater(len(self.data["known_reels"]), 0)
        for reel in self.data["known_reels"]:
            self.assertIn("url", reel)
            self.assertIn("instagram.com", reel["url"])

    def test_hashtags(self):
        self.assertIn("#yotebanconacion", self.data["hashtags"])

    def test_related_accounts(self):
        self.assertGreater(len(self.data["related_accounts"]), 0)


class TestSitemap(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        with open(os.path.join(BASE_DIR, "sitemap.json")) as f:
            cls.data = json.load(f)

    def test_site_metadata(self):
        self.assertIn("CABNA", self.data["site_title"])
        self.assertEqual(self.data["language"], "es")
        self.assertEqual(self.data["base_url"], "https://clubbanconacion.org.ar")

    def test_navigation_structure(self):
        nav = self.data["navigation"]
        self.assertGreater(len(nav), 0)
        labels = {n["label"] for n in nav}
        self.assertIn("INICIO", labels)
        self.assertIn("EL CLUB", labels)
        self.assertIn("NOVEDADES", labels)
        self.assertIn("CONTACTO", labels)

    def test_deportes_dropdown(self):
        nav = self.data["navigation"]
        deportes = next((n for n in nav if n["label"] == "DEPORTES"), None)
        self.assertIsNotNone(deportes)
        self.assertIn("children", deportes)
        self.assertGreater(len(deportes["children"]), 10)

    def test_sports_pages(self):
        self.assertEqual(len(self.data["sports_pages"]), 19)

    def test_activity_pages(self):
        self.assertEqual(len(self.data["activity_pages"]), 3)

    def test_external_links(self):
        links = self.data["external_links"]
        self.assertIn("facebook", links)
        self.assertIn("instagram", links)
        self.assertIn("whatsapp", links)

    def test_pages_list(self):
        self.assertEqual(len(self.data["pages"]), 7)


class TestImageAssets(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        with open(os.path.join(BASE_DIR, "image_assets.json")) as f:
            cls.data = json.load(f)

    def test_images_exist(self):
        self.assertGreater(len(self.data), 30)

    def test_image_structure(self):
        for img in self.data:
            self.assertIn("url", img)
            self.assertIn("alt", img)
            self.assertIn("page", img)
            self.assertTrue(img["url"].startswith("https://"))

    def test_images_from_multiple_pages(self):
        pages = {img["page"] for img in self.data}
        self.assertIn("home", pages)
        self.assertIn("el-club", pages)

    def test_logo_present(self):
        logos = [img for img in self.data if "logo" in img["url"].lower()]
        self.assertGreater(len(logos), 0)

    def test_alt_texts_present(self):
        with_alt = [img for img in self.data if img["alt"]]
        self.assertGreater(len(with_alt), len(self.data) * 0.5)


if __name__ == "__main__":
    unittest.main(verbosity=2)
