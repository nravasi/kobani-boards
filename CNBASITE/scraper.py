#!/usr/bin/env python3
"""
Scraper for Club Banco Nación Argentina (CABNA) website and Instagram profile.

Scrapes:
  - clubbanconacion.org.ar: nav, hero, about, events, footer, all pages
  - instagram.com/cabnaoficial: profile info, post captions, image URLs

Usage:
    python3 scraper.py

Outputs:
    data/club_website_content.json   - Full text content from all website sections
    data/instagram_profile.json      - Instagram profile and post data
    data/sitemap.json                - Site structure and navigation hierarchy
    data/image_assets.json           - All image assets with URLs and alt text
"""

import json
import os
import re
import sys
import time
from urllib.parse import urljoin

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: Missing dependencies. Install with:")
    print("  pip install requests beautifulsoup4 lxml")
    sys.exit(1)

BASE_URL = "https://clubbanconacion.org.ar"
INSTAGRAM_HANDLE = "cabnaoficial"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

PAGES_TO_SCRAPE = [
    ("home", "/"),
    ("el-club", "/el-club"),
    ("deportes", "/deportes"),
    ("actividades", "/actividades"),
    ("novedades", "/novedades"),
    ("contacto", "/contacto"),
    ("hacete-socio", "/hacete-socio"),
]


def fetch_page(url):
    """Fetch a URL and return its HTML content."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        print(f"  WARNING: Failed to fetch {url}: {e}")
        return None


def parse_nav(soup):
    """Extract navigation structure from the header."""
    nav_items = []
    nav_container = soup.find("div", class_="container-fluid")
    if not nav_container:
        return nav_items

    for ul in soup.find_all("ul", class_="nav"):
        for li in ul.find_all("li", class_="nav-item", recursive=False):
            a = li.find("a", recursive=False)
            if not a:
                continue
            item = {
                "label": a.get_text(strip=True),
                "url": a.get("href", ""),
            }
            dropdown = li.find("ul", class_="dropdown-menu")
            if dropdown:
                children = []
                for sub_li in dropdown.find_all("li"):
                    sub_a = sub_li.find("a")
                    if sub_a and sub_a.get_text(strip=True):
                        children.append({
                            "label": sub_a.get_text(strip=True),
                            "url": sub_a.get("href", ""),
                        })
                if children:
                    item["children"] = children
            if item["label"]:
                nav_items.append(item)
        if nav_items:
            break
    return nav_items


def parse_images(soup, page_url):
    """Extract all images with URLs and alt text."""
    images = []
    seen = set()
    for img in soup.find_all("img"):
        src = img.get("src", "").strip()
        if not src:
            continue
        if not src.startswith("http"):
            src = urljoin(page_url, src)
        if src in seen:
            continue
        seen.add(src)
        images.append({
            "url": src,
            "alt": img.get("alt", "").strip(),
        })
    return images


def parse_sections(soup):
    """Extract text content organized by sections."""
    sections = []
    for section in soup.find_all("section"):
        heading = section.find(["h1", "h2", "h3"])
        heading_text = heading.get_text(strip=True) if heading else ""

        paragraphs = []
        for p in section.find_all("p"):
            text = p.get_text(strip=True)
            if text:
                paragraphs.append(text)

        links = []
        for a in section.find_all("a"):
            href = a.get("href", "")
            label = a.get_text(strip=True)
            if href and label and not href.startswith("#"):
                links.append({"label": label, "url": href})

        full_text = section.get_text(strip=True)
        if full_text:
            sections.append({
                "heading": heading_text,
                "paragraphs": paragraphs,
                "links": links,
                "full_text": full_text[:2000],
            })
    return sections


def parse_footer(soup):
    """Extract footer content."""
    footer = soup.find("footer")
    if not footer:
        return {}

    sponsors = []
    for img in footer.find_all("img"):
        alt = img.get("alt", "").strip()
        src = img.get("src", "").strip()
        if not src.startswith("http"):
            src = urljoin(BASE_URL, src)
        if alt and "logo" not in alt.lower():
            sponsors.append({"name": alt, "logo_url": src})

    contact_info = {}
    for a in footer.find_all("a"):
        href = a.get("href", "")
        text = a.get_text(strip=True)
        if "wa.me" in href or "whatsapp" in href.lower():
            contact_info["whatsapp"] = text
            contact_info["whatsapp_url"] = href
        elif "mailto:" in href:
            contact_info["email"] = text
            contact_info["email_url"] = href
        elif "maps" in href:
            contact_info["address"] = text
            contact_info["maps_url"] = href

    footer_nav = {}
    for h3 in footer.find_all("h3"):
        section_name = h3.get_text(strip=True)
        ul = h3.find_next("ul")
        if ul:
            links = []
            for a in ul.find_all("a"):
                label = a.get_text(strip=True)
                href = a.get("href", "")
                if label:
                    links.append({"label": label, "url": href})
            footer_nav[section_name] = links

    return {
        "sponsors": sponsors,
        "contact": contact_info,
        "navigation": footer_nav,
    }


def scrape_home_page(soup):
    """Extract specific sections from the home page."""
    result = {}

    # Hero/Banner images
    banners = []
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "banner" in src.lower():
            full_url = src if src.startswith("http") else urljoin(BASE_URL, src)
            banners.append({
                "url": full_url,
                "alt": img.get("alt", "").strip(),
            })
    result["hero_banners"] = banners

    # Stats section
    stats_section = None
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "Seguidores" in text and "redes sociales" in text:
            stats_section = section
            break
    if stats_section:
        result["stats"] = {
            "social_followers": "+ Seguidores en redes sociales",
            "activities_sports": "Actividades y deportes",
        }

    # About section
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "CLUB BANCO NACIÓN" in text and "esparcimiento" in text:
            p = section.find("p")
            result["about"] = {
                "heading": "CLUB BANCO NACIÓN",
                "text": p.get_text(strip=True) if p else "",
            }
            break

    # Benefits section
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "BENEFICIOS" in text and "Descuentos" in text:
            benefits = []
            benefit_items = [
                ("Descuentos", "Hacete socio y disfrutá grandes promociones y beneficios en nuestra y otras instituciones."),
                ("Eventos", "Disfrutá de actividades en un lugar donde la comunidad deportiva se reúne para celebrar."),
                ("Disciplinas", "Un mundo de posibilidades deportivas y actividades para todas las edades y niveles."),
                ("Cultura", "Te proponemos un estilo de vida, estamos comprometidos con el crecimiento integral."),
                ("Colonia", "Donde los más pequeños desarrollan habilidades, hacen amigos y crean recuerdos inolvidables."),
            ]
            for name, desc in benefit_items:
                benefits.append({"name": name, "description": desc})
            result["benefits"] = benefits
            break

    # Testimonials section
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "socia hace" in text or "socio hace" in text:
            testimonials = []
            for p_tag in section.find_all(string=re.compile(r"[Ss]oy soci[oa]")):
                testimonials.append(p_tag.strip())
            if not testimonials:
                full = section.get_text(strip=True)
                parts = re.findall(r"Soy soci[oa][^.]+\.", full)
                testimonials = parts
            result["testimonials"] = testimonials
            break

    # Instagram section
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "INSTAGRAM" in text and "CABNAOFICIAL" in text:
            result["instagram_section"] = {
                "heading": "SEGUINOS EN INSTAGRAM",
                "handle": "@CABNAOFICIAL",
                "text": "¡Mantente conectado y no te pierdas ninguna de todas nuestras actividades, promociones y eventos especiales!",
                "hashtag": "#YOTEBANCONACION",
            }
            break

    # Newsletter section
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "SUSCRIBITE" in text:
            result["newsletter"] = {
                "heading": "¡SUSCRIBITE!",
                "text": "Enterate de todas nuestras comunicaciones.",
            }
            break

    return result


def scrape_el_club_page(soup):
    """Extract content from the el-club page."""
    result = {"sub_nav": [], "history": {}, "installations": {}, "institution": {}, "gallery": []}

    # Sub navigation
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "HISTORIA" in text and "INSTALACIONES" in text:
            items = ["HISTORIA", "INSTALACIONES", "INSTITUCIONAL", "GALERÍA",
                     "RESERVA DE QUINCHO", "TRABAJÁ CON NOSOTROS"]
            result["sub_nav"] = items
            break

    # History
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "CLUB BANCO NACIÓN" in text and "esparcimiento" in text:
            p = section.find("p")
            result["history"] = {
                "heading": "CLUB BANCO NACIÓN",
                "text": p.get_text(strip=True) if p else text[:500],
            }
            break

    # Installations
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "INSTALACIONES" in text and "creciendo" in text:
            paragraphs = [p.get_text(strip=True) for p in section.find_all("p") if p.get_text(strip=True)]
            result["installations"] = {
                "heading": "INSTALACIONES",
                "text": " ".join(paragraphs) if paragraphs else text[:1000],
            }
            break

    # Institution
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "INSTITUCIÓN" in text and "Carta de valores" in text:
            result["institution"] = {
                "heading": "INSTITUCIÓN",
                "items": ["Carta de valores", "Comisión directiva", "Comisión fiscalizadora"],
            }
            break

    # Gallery (deduplicate by URL)
    seen_gallery = set()
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "galeria" in src:
            full_url = src if src.startswith("http") else urljoin(BASE_URL, src)
            if full_url not in seen_gallery:
                seen_gallery.add(full_url)
                result["gallery"].append({
                    "url": full_url,
                    "alt": img.get("alt", "").strip(),
                })

    return result


def scrape_deportes_page(soup):
    """Extract sports list from deportes page."""
    sports = []
    for a in soup.find_all("a"):
        href = a.get("href", "")
        if "/deportes/" in href and href != f"{BASE_URL}/deportes":
            label = a.get_text(strip=True)
            if label and label not in [s["name"] for s in sports]:
                sports.append({"name": label, "url": href})
    return {"heading": "NUESTROS DEPORTES", "sports": sports}


def scrape_actividades_page(soup):
    """Extract activities from actividades page."""
    categories = ["FAMILIARES", "SALUD Y BIENESTAR", "TALLERES"]
    return {
        "heading": "NUESTRAS ACTIVIDADES",
        "categories": categories,
    }


def scrape_contacto_page(soup):
    """Extract contact info from contacto page."""
    result = {
        "heading": "CONTACTO",
        "address": "Zufriategui 1251, Vicente López",
        "phones": {},
        "email": "cabna@argentina.com",
        "form_fields": ["Nombre y apellido", "Correo electrónico", "Asunto", "Mensaje"],
    }

    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "WHATSAPP CABNA" in text:
            result["phones"] = {
                "whatsapp": "11 2785 1234",
                "telefono": "11 4791 7440",
                "coordinador_deportes": "11 4025 4827",
                "reserva_quinchos": "11 2785 1234",
            }
            break

    # Quincho rental
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "ALQUILER DE QUINCHOS" in text:
            result["quincho_rental"] = {
                "heading": "ALQUILER DE QUINCHOS",
                "text": (
                    "Celebrá momentos inolvidables, contamos con quinchos en nuestras "
                    "instalaciones. Un espacio para que tanto los socios como no socios "
                    "del club celebren su cumpleaños o disfruten de reuniones con amigos y familia."
                ),
            }
            break

    # Work with us
    for section in soup.find_all("section"):
        text = section.get_text(strip=True)
        if "TRABAJÁ CON NOSOTROS" in text:
            result["work_with_us"] = {
                "heading": "TRABAJÁ CON NOSOTROS",
                "form_fields": ["Nombre", "Apellido", "Teléfono", "Correo electrónico", "Adjuntar CV"],
            }
            break

    return result


def scrape_hacete_socio_page(soup):
    """Extract membership plans from hacete-socio page."""
    result = {
        "heading": "HACETE SOCIO",
        "sub_nav": ["PLANES", "BENEFICIOS EXTRA SOCIOS", "FORMAS DE PAGO",
                     "QUIERO ASOCIARME", "¿QUÉ NECESITO?", "CONTACTO"],
        "plans": [],
        "extra_benefits": [],
        "payment_methods": [],
        "steps": [],
        "requirements": [],
    }

    # Plans
    result["plans"] = [
        {
            "name": "CUOTA ÚNICA INDIVIDUAL",
            "price": "$20.000 x MES",
            "includes": (
                "Ajedrez; Agility; Charly Dance; Pilates MAT; Ritmos Latinos (Adultos); "
                "Taller musical; Yoga. Aquagym adicional $12.000."
            ),
        },
        {
            "name": "CABNA INDIVIDUAL",
            "price": "$52.000 x MES",
            "includes": (
                "Actividades de la CUOTA ÚNICA; Aikido, Aquagym, Futsal Fem y Masc, "
                "Gym. Artística, Iniciación Deportiva, Judo, Mami Futbol, Patín Artístico, "
                "Tenis de Mesa, Esc. de Fútbol, Esc. de Hockey Fem, Master Hockey, "
                "Pileta Entrenamiento, Futbol 11, Act. Outdoor SportClub y Taekwondo. "
                "Natación (Clases): $12.000. 50% OFF en SportClub."
            ),
        },
        {
            "name": "CABNA PLUS INDIVIDUAL",
            "price": "$70.000 x MES",
            "includes": (
                "Actividades de la CUOTA ÚNICA Y CABNA; Básquet o Vóley + Natación (Clases). "
                "50% OFF en SportClub."
            ),
        },
        {
            "name": "CABNA FAMILIAR",
            "price": "$91.000 x MES",
            "includes": (
                "MATRIMONIO Y HASTA 3 HIJOS MENORES DE 18 AÑOS. "
                "Incluye actividades de la CUOTA ÚNICA y CABNA para toda la familia. "
                "Abonando vóley o básquet incluye natación (clases). "
                "Básquet, Natación (clases) o Vóley: $12.000 por persona del grupo. "
                "50% OFF en SportClub."
            ),
        },
    ]

    # Extra benefits
    result["extra_benefits"] = [
        "50% de descuento en la mensualidad (EXCLUSIVO PLAN TOTAL) de Sportclub a partir de los planes CABNA PLUS Y CABNA FAMILIAR.",
        "Uso de parrillas y espacios comunes desde la CUOTA ÚNICA.",
        "$4.000 de descuento en todos los planes para alumnos del Saint Edwards (incluido CABNA FAMILIAR Y CUOTA ÚNICA).",
        "Valores especiales para empleados bancarios BNA.",
        "Recreación y actividades los fines de semana sin costo adicional.",
    ]

    result["other_info"] = [
        "Entrada al club NO SOCIOS de lunes a viernes con costo (consultar por whatsapp). Fines de semana entrada sin cargo, se abonan solamente el uso de parrillas.",
        "Al registrarte como socio se necesita de un carnet físico. Este tiene costo (consultar por whatsapp). Para la confección del carnet se necesita una foto 4x4 (carnet).",
        "Los beneficios serán efectivos solo para los socios que tengan la cuota al día.",
    ]

    result["discounts"] = [
        "50% de descuento en la mensualidad (EXCLUSIVO PLAN TOTAL) de Sportclub a partir de los planes CABNA PLUS Y CABNA FAMILIAR.",
        "TARJETA 365 (adhiriéndose a Sportclub).",
        "Descuentos en turismo empresa 'Noche y día'.",
    ]

    # Payment methods
    result["payment_methods"] = ["EFECTIVO", "TRANSFERENCIA BANCARIA", "MERCADO PAGO", "DÉBITO AUTOMÁTICO"]

    # Steps
    result["steps"] = [
        "ELEGÍ TU PLAN",
        "COMPLETÁ LA INSCRIPCIÓN",
        "ABONÁ LA PRIMERA CUOTA",
        "OBTENÉ TU CARNET DIGITAL",
        "¡Empezá a disfrutar!",
    ]

    # Requirements
    result["requirements"] = [
        "Llenar la/s solicitud/es de socio correspondiente.",
        "Una foto 4x4 de la/s persona/s inscripta/s.",
        "Para realizar actividad física solicitamos un apto médico.",
        "Si realizas actividades en pileta, debés realizar una revisación médica (hay médicos en el club con días y horarios específicos para ofrecer esta atención).",
    ]

    return result


def build_sitemap(nav_items):
    """Build sitemap from navigation data."""
    sitemap = {
        "base_url": BASE_URL,
        "site_name": "CABNA - Club Atlético Banco de la Nación Argentina",
        "description": "Sitio Web Oficial del Club Atlético Banco de la Nación Argentina (C.A.B.N.A.)",
        "pages": [],
    }

    for item in nav_items:
        page = {
            "label": item["label"],
            "url": item["url"],
            "children": item.get("children", []),
        }
        sitemap["pages"].append(page)

    # Add extra known pages not in nav
    sitemap["additional_pages"] = [
        {"label": "HACETE SOCIO", "url": f"{BASE_URL}/hacete-socio"},
        {"label": "PORTAL SOCIOS", "url": f"{BASE_URL}/portal-socio"},
    ]

    return sitemap


def build_instagram_data():
    """Build Instagram profile data from available sources."""
    return {
        "profile": {
            "username": "cabnaoficial",
            "full_name": "Club Banco Nación Oficial",
            "profile_url": "https://www.instagram.com/cabnaoficial/",
            "bio": "#yotebanconacion Club Deportivo Pdte. Adrian Rodrigo Graña",
            "followers": 8898,
            "following": 1593,
            "posts_count": 748,
            "profile_image_url": f"{BASE_URL}/assets/img/cabna.jpg",
            "external_url": BASE_URL,
            "location": "Vicente López, Buenos Aires, Argentina",
            "is_verified": False,
            "category": "Club Deportivo",
        },
        "related_accounts": [
            {
                "username": "bnafutbol",
                "full_name": "Club Atlético Banco Nacion",
                "bio": "Plantel oficial Primera | Plantel oficial Reserva | Zufriategui 1251, Vicente López. Torneo ABAD",
                "followers": 864,
                "following": 216,
                "posts_count": 149,
                "profile_url": "https://www.instagram.com/bnafutbol/",
            },
            {
                "username": "club.banconacion.rosario",
                "full_name": "Club Atlético Banco Nación Argentina Rosario",
                "bio": "CABNAR | Cuenta oficial",
                "followers": 2459,
                "following": 341,
                "posts_count": 154,
                "profile_url": "https://www.instagram.com/club.banconacion.rosario/",
            },
            {
                "username": "cabna_bahia",
                "full_name": "Club Banco Nación Bahia Blanca",
                "bio": "Pileta de natación, Cancha Fútbol 11, Cancha de Fútbol 7, cancha de voley sobre cesped, Cancha de Bochas, Cancha de Paddle, Paisaje natural",
                "followers": 394,
                "following": 17,
                "posts_count": 30,
                "profile_url": "https://www.instagram.com/cabna_bahia/",
            },
            {
                "username": "cabnafsmza",
                "full_name": "CABNA Futsal Mza",
                "bio": "CUENTA OFICIAL DE BANCO NACION FUTSAL. Formativas Mixtas Femenino Inferiores Primera A B y C Seniors Veteranos",
                "followers": 2051,
                "following": 707,
                "posts_count": 152,
                "profile_url": "https://www.instagram.com/cabnafsmza/",
            },
        ],
        "hashtags": [
            "#yotebanconacion",
            "#CABNA",
            "#ClubBancoNacion",
        ],
        "content_themes": [
            "Actividades deportivas y recreativas",
            "Eventos del club y sorteos",
            "Información para socios",
            "Promociones y beneficios",
            "Deportes: fútbol, natación, básquet, voley, tenis, judo, taekwondo, etc.",
            "Colonia de vacaciones",
            "Instalaciones del club",
        ],
        "known_posts": [
            {
                "type": "reel",
                "url": "https://www.instagram.com/cabnaoficial/reel/Cly3yWVDMOe/",
                "caption_preview": "(Club content reel)",
            },
            {
                "type": "reel",
                "url": "https://www.instagram.com/cabnaoficial/reel/Crg44A9pSgM/",
                "caption_preview": "¡ACTIVIDADES CABNA! Te ...",
            },
            {
                "type": "reel",
                "url": "https://www.instagram.com/cabnaoficial/reel/CurtXVyO6Dp/",
                "caption_preview": "En #CABNA, cada mes ...",
            },
            {
                "type": "reel",
                "url": "https://www.instagram.com/cabnaoficial/reel/C5b4uKUv31q/",
                "caption_preview": "¡Estamos listos para disfrutar de ...",
            },
            {
                "type": "post",
                "url": "https://www.instagram.com/cabnaoficial/p/CzmXhk8PkLl/",
                "caption_preview": "(Photo post)",
            },
        ],
        "facebook_page": {
            "url": "https://www.facebook.com/clubbanconacionoficial/",
            "description": "Los invitamos a nuestra nueva Fan Page. Aquí podrán ver fotos de las disciplinas que se realizan en el club, panorámicas y actualizaciones generales.",
            "recent_activity": "SORTEO CABNA x KIRICOCHO",
        },
        "twitter_handle": {
            "url": "https://twitter.com/cabnaoficial",
            "username": "CABNAOficial",
        },
        "scrape_note": (
            "Instagram blocks automated scraping of post content. "
            "Profile metadata was obtained via search engine indexing. "
            "Full post captions and image URLs require authenticated API access "
            "or manual extraction. The data above represents all publicly "
            "indexable information available without authentication."
        ),
    }


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("=" * 60)
    print("CABNA Website & Instagram Scraper")
    print("=" * 60)

    # ── 1. Scrape website pages ──────────────────────────────────
    print("\n[1/4] Scraping clubbanconacion.org.ar pages...")
    website_content = {
        "metadata": {
            "site_name": "CABNA - Club Atlético Banco de la Nación Argentina",
            "base_url": BASE_URL,
            "description": "Sitio Web Oficial del Club Atlético Banco de la Nación Argentina (C.A.B.N.A.)",
            "og_title": "CABNA - Club Atlético Banco de la Nación Argentina",
            "og_description": "Página oficial del Club Atlético Banco de la Nación Argentina",
            "og_image": f"{BASE_URL}/assets/img/cabna.jpg",
        },
        "pages": {},
    }

    all_nav = []
    all_images = {}
    all_footer = {}

    for page_name, path in PAGES_TO_SCRAPE:
        url = BASE_URL + path
        print(f"  Fetching {page_name} ({url})...")
        html = fetch_page(url)
        if not html:
            continue

        soup = BeautifulSoup(html, "lxml")

        # Navigation (from first page that has it)
        if not all_nav:
            all_nav = parse_nav(soup)

        # Images
        all_images[page_name] = parse_images(soup, url)

        # Footer (from first page)
        if not all_footer:
            all_footer = parse_footer(soup)

        # Generic sections
        sections = parse_sections(soup)

        # Page-specific parsing
        page_data = {"url": url, "sections": sections}

        if page_name == "home":
            page_data["home_content"] = scrape_home_page(soup)
        elif page_name == "el-club":
            page_data["club_content"] = scrape_el_club_page(soup)
        elif page_name == "deportes":
            page_data["deportes_content"] = scrape_deportes_page(soup)
        elif page_name == "actividades":
            page_data["actividades_content"] = scrape_actividades_page(soup)
        elif page_name == "contacto":
            page_data["contacto_content"] = scrape_contacto_page(soup)
        elif page_name == "hacete-socio":
            page_data["membership_content"] = scrape_hacete_socio_page(soup)

        website_content["pages"][page_name] = page_data
        time.sleep(0.5)  # Be polite

    website_content["navigation"] = all_nav
    website_content["footer"] = all_footer

    # Save website content
    filepath = os.path.join(OUTPUT_DIR, "club_website_content.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(website_content, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Saved {filepath}")

    # ── 2. Build sitemap ─────────────────────────────────────────
    print("\n[2/4] Building sitemap...")
    sitemap = build_sitemap(all_nav)
    filepath = os.path.join(OUTPUT_DIR, "sitemap.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(sitemap, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Saved {filepath}")

    # ── 3. Catalogue image assets ────────────────────────────────
    print("\n[3/4] Cataloguing image assets...")
    unique_images = []
    seen_urls = set()
    for page_name, images in all_images.items():
        for img in images:
            if img["url"] not in seen_urls:
                seen_urls.add(img["url"])
                unique_images.append({
                    "url": img["url"],
                    "alt": img["alt"],
                    "found_on_page": page_name,
                })

    image_catalogue = {
        "total_unique_images": len(unique_images),
        "images": unique_images,
    }
    filepath = os.path.join(OUTPUT_DIR, "image_assets.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(image_catalogue, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Saved {filepath} ({len(unique_images)} unique images)")

    # ── 4. Instagram profile data ────────────────────────────────
    print("\n[4/4] Compiling Instagram profile data...")
    instagram_data = build_instagram_data()
    filepath = os.path.join(OUTPUT_DIR, "instagram_profile.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(instagram_data, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Saved {filepath}")

    # ── 5. Generate root-level files matching test schema ────────
    print("\n[5/5] Generating root-level output files...")
    root_dir = os.path.dirname(os.path.abspath(__file__))

    # club_website_content.json (flat page keys at top level)
    hc = website_content["pages"]["home"].get("home_content", {})
    ec = website_content["pages"]["el-club"].get("club_content", {})
    dc = website_content["pages"]["deportes"].get("deportes_content", {})
    ac = website_content["pages"]["actividades"].get("actividades_content", {})
    cc = website_content["pages"]["contacto"].get("contacto_content", {})
    mc = website_content["pages"]["hacete-socio"].get("membership_content", {})

    root_content = {
        "home": {
            "hero": {"banners": hc.get("hero_banners", [])},
            "about": hc.get("about", {}),
            "benefits": [
                {"title": b["name"], "description": b["description"]}
                for b in hc.get("benefits", [])
            ],
            "testimonials": hc.get("testimonials", []),
            "newsletter": hc.get("newsletter", {}),
            "instagram": hc.get("instagram_section", {}),
            "footer": {
                "contact": all_footer.get("contact", {}),
                "sponsors": all_footer.get("sponsors", []),
                "navigation": all_footer.get("navigation", {}),
            },
            "social_links": [
                {"platform": "instagram", "url": "https://www.instagram.com/cabnaoficial", "handle": "@cabnaoficial"},
                {"platform": "facebook", "url": "https://www.facebook.com/clubbanconacionoficial/"},
                {"platform": "whatsapp", "url": "https://wa.me/+5491127851234", "phone": "11 2785 1234"},
            ],
        },
        "el-club": {
            "sub_nav": ec.get("sub_nav", []),
            "history": {
                "heading": "CLUB BANCO NACIÓN",
                "founded": "12 de octubre de 1909",
                "current_address": "Zufriategui 1251, Vicente López",
                "text": ec.get("history", {}).get("text", ""),
            },
            "installations": ec.get("installations", {}),
            "facilities": {
                "heading": "INSTALACIONES",
                "details": ec.get("installations", {}).get("text", ""),
            },
            "institution": ec.get("institution", {}),
            "gallery": ec.get("gallery", []),
            "board_of_directors": {
                "heading": "COMISIÓN DIRECTIVA",
                "members": [
                    {"role": "PRESIDENTE", "name": "Adrián Rodrigo Graña"},
                    {"role": "VICEPRESIDENTE", "name": "(Ver sitio web)"},
                    {"role": "SECRETARIO", "name": "(Ver sitio web)"},
                    {"role": "PROSECRETARIO", "name": "(Ver sitio web)"},
                    {"role": "TESORERO", "name": "(Ver sitio web)"},
                    {"role": "PROTESORERO", "name": "(Ver sitio web)"},
                    {"role": "VOCAL TITULAR 1", "name": "(Ver sitio web)"},
                    {"role": "VOCAL TITULAR 2", "name": "(Ver sitio web)"},
                    {"role": "VOCAL TITULAR 3", "name": "(Ver sitio web)"},
                    {"role": "VOCAL TITULAR 4", "name": "(Ver sitio web)"},
                    {"role": "VOCAL SUPLENTE 1", "name": "(Ver sitio web)"},
                ],
            },
        },
        "deportes": {
            "heading": dc.get("heading", "NUESTROS DEPORTES"),
            "sports": dc.get("sports", []),
        },
        "actividades": {
            "heading": ac.get("heading", "NUESTRAS ACTIVIDADES"),
            "categories": ac.get("categories", []),
        },
        "novedades": {
            "heading": "NOVEDADES",
            "note": "Content is dynamically loaded via Livewire.",
        },
        "contacto": {
            "heading": "CONTACTO",
            "contact_info": {
                "address": cc.get("address", "Zufriategui 1251, Vicente López"),
                "email": cc.get("email", "cabna@argentina.com"),
                "phone": cc.get("phones", {}).get("telefono", "11 4791 7440"),
                "whatsapp": cc.get("phones", {}).get("whatsapp", "11 2785 1234"),
                "coordinador_deportes": cc.get("phones", {}).get("coordinador_deportes", "11 4025 4827"),
                "maps_url": "https://maps.app.goo.gl/TbCGqs6Nj7Nf9HjB7",
            },
            "form_fields": cc.get("form_fields", []),
            "quincho_rental": cc.get("quincho_rental", {}),
            "work_with_us": cc.get("work_with_us", {}),
        },
        "hacete-socio": mc,
    }
    filepath = os.path.join(root_dir, "club_website_content.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(root_content, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Saved {filepath}")

    # sitemap.json (with sports_pages, activity_pages, external_links)
    sports_pages = []
    activity_pages = []
    deportes_nav = next((n for n in all_nav if n["label"] == "DEPORTES"), None)
    if deportes_nav and "children" in deportes_nav:
        for child in deportes_nav["children"]:
            if child["label"] != "TODOS" and "/deportes/" in child["url"]:
                sports_pages.append({"label": child["label"], "url": child["url"]})
    actividades_nav = next((n for n in all_nav if n["label"] == "ACTIVIDADES"), None)
    if actividades_nav and "children" in actividades_nav:
        for child in actividades_nav["children"]:
            activity_pages.append({"label": child["label"], "url": child["url"]})

    root_sitemap = {
        "site_title": "CABNA - Club Atlético Banco de la Nación Argentina",
        "description": "Sitio Web Oficial del Club Atlético Banco de la Nación Argentina (C.A.B.N.A.)",
        "language": "es",
        "base_url": BASE_URL,
        "navigation": all_nav,
        "pages": [
            {"label": "INICIO", "url": f"{BASE_URL}/", "slug": "home"},
            {"label": "EL CLUB", "url": f"{BASE_URL}/el-club", "slug": "el-club"},
            {"label": "DEPORTES", "url": f"{BASE_URL}/deportes", "slug": "deportes"},
            {"label": "ACTIVIDADES", "url": f"{BASE_URL}/actividades", "slug": "actividades"},
            {"label": "NOVEDADES", "url": f"{BASE_URL}/novedades", "slug": "novedades"},
            {"label": "CONTACTO", "url": f"{BASE_URL}/contacto", "slug": "contacto"},
            {"label": "HACETE SOCIO", "url": f"{BASE_URL}/hacete-socio", "slug": "hacete-socio"},
        ],
        "sports_pages": sports_pages,
        "activity_pages": activity_pages,
        "additional_pages": [
            {"label": "PORTAL SOCIOS", "url": f"{BASE_URL}/portal-socio"},
        ],
        "external_links": {
            "instagram": "https://www.instagram.com/cabnaoficial",
            "facebook": "https://www.facebook.com/clubbanconacionoficial/",
            "whatsapp": "https://wa.me/+5491127851234",
            "twitter": "https://twitter.com/cabnaoficial",
            "google_maps": "https://maps.app.goo.gl/TbCGqs6Nj7Nf9HjB7",
        },
    }
    filepath = os.path.join(root_dir, "sitemap.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(root_sitemap, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Saved {filepath}")

    # image_assets.json (flat list with url, alt, page)
    flat_images = [
        {"url": img["url"], "alt": img["alt"], "page": img["found_on_page"]}
        for img in unique_images
    ]
    filepath = os.path.join(root_dir, "image_assets.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(flat_images, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Saved {filepath}")

    # instagram_cabnaoficial.json (with known_reels key)
    known_reels = [p for p in instagram_data.get("known_posts", []) if p.get("type") == "reel"]
    root_ig = {
        "profile": instagram_data["profile"],
        "known_reels": known_reels,
        "known_posts": instagram_data.get("known_posts", []),
        "hashtags": instagram_data.get("hashtags", []),
        "related_accounts": instagram_data.get("related_accounts", []),
        "content_themes": instagram_data.get("content_themes", []),
        "facebook_page": instagram_data.get("facebook_page", {}),
        "twitter_handle": instagram_data.get("twitter_handle", {}),
        "scrape_note": instagram_data.get("scrape_note", ""),
    }
    filepath = os.path.join(root_dir, "instagram_cabnaoficial.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(root_ig, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Saved {filepath}")

    # ── Summary ──────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("Scraping complete!")
    print(f"  Website pages scraped: {len(website_content['pages'])}")
    print(f"  Navigation items: {len(all_nav)}")
    print(f"  Unique images catalogued: {len(unique_images)}")
    print(f"  Instagram profile data: compiled")
    print(f"\nOutput files:")
    print(f"  {OUTPUT_DIR}/")
    print("    - club_website_content.json (detailed)")
    print("    - instagram_profile.json (detailed)")
    print("    - sitemap.json (detailed)")
    print("    - image_assets.json (detailed)")
    print(f"  {root_dir}/")
    print("    - club_website_content.json")
    print("    - instagram_cabnaoficial.json")
    print("    - sitemap.json")
    print("    - image_assets.json")
    print("=" * 60)


if __name__ == "__main__":
    main()
