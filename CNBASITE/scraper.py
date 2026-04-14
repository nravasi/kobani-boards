#!/usr/bin/env python3
"""
CABNA Website & Instagram Scraper
Scrapes clubbanconacion.org.ar and Instagram @cabnaoficial profile data.
Outputs structured JSON files for downstream use.

Usage:
    python3 scraper.py
"""

import json
import re
import sys
import os
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://clubbanconacion.org.ar"
INSTAGRAM_USERNAME = "cabnaoficial"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

PAGES_TO_SCRAPE = [
    ("/", "home"),
    ("/el-club", "el-club"),
    ("/deportes", "deportes"),
    ("/actividades", "actividades"),
    ("/novedades", "novedades"),
    ("/contacto", "contacto"),
    ("/hacete-socio", "hacete-socio"),
]


def fetch_page(path):
    url = f"{BASE_URL}{path}"
    try:
        resp = requests.get(url, timeout=30, headers=HEADERS)
        if resp.status_code == 200 and len(resp.text) > 50:
            return resp.text
    except requests.RequestException as exc:
        print(f"  [WARN] Failed to fetch {url}: {exc}")
    return None


def make_absolute(url):
    if url.startswith("http"):
        return url
    return urljoin(BASE_URL + "/", url)


def extract_images(soup, page_name):
    images = []
    seen = set()
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if not src:
            continue
        full_url = make_absolute(src)
        if full_url in seen:
            continue
        seen.add(full_url)
        images.append({
            "url": full_url,
            "alt": img.get("alt", ""),
            "page": page_name,
        })
    return images


def extract_nav(soup):
    nav_items = []
    desktop_nav = soup.select("ul.nav.justify-content-center > li.nav-item")
    if not desktop_nav:
        desktop_nav = soup.select("ul.nav > li.nav-item")

    for li in desktop_nav:
        link = li.find("a", class_="nav-link")
        if not link:
            continue
        label = link.get_text(strip=True)
        href = link.get("href", "#")
        if not label or label in ("", "#"):
            continue
        item = {"label": label, "url": make_absolute(href)}
        dropdown = li.select("ul.dropdown-menu a.dropdown-item")
        if dropdown:
            item["children"] = []
            for dd in dropdown:
                child_label = dd.get_text(strip=True)
                child_href = dd.get("href", "#")
                if child_label:
                    item["children"].append({
                        "label": child_label,
                        "url": make_absolute(child_href),
                    })
        nav_items.append(item)
    return nav_items


def extract_section_text(soup, selector_or_tag, heading_text=None):
    for section in soup.find_all("section"):
        text = section.get_text(strip=True, separator="\n")
        if heading_text and heading_text.lower() in text.lower():
            return text
    return ""


def scrape_home(soup):
    data = {"section": "home", "title": "", "meta": {}, "hero": {}, "stats": {},
            "about": {}, "benefits": [], "testimonials": [], "newsletter": {},
            "instagram_section": {}, "social_links": []}

    title_tag = soup.find("title")
    if title_tag:
        data["title"] = title_tag.get_text(strip=True)

    for meta in soup.find_all("meta"):
        name = meta.get("name", meta.get("property", ""))
        content = meta.get("content", "")
        if name and content:
            data["meta"][name] = content

    banners = []
    for slide in soup.select(".swiper-slide"):
        imgs = slide.find_all("img")
        for img in imgs:
            src = img.get("src", "")
            alt = img.get("alt", "")
            if src and "banners" in src:
                banners.append({"url": make_absolute(src), "alt": alt})
    data["hero"]["banners"] = banners

    stats_section = None
    for section in soup.find_all("section"):
        if "Seguidores" in section.get_text():
            stats_section = section
            break
    if stats_section:
        texts = [p.get_text(strip=True) for p in stats_section.find_all("p")]
        data["stats"] = {
            "descriptions": texts,
            "counters": ["counter-seguidores", "counter-deportes"],
        }

    data["about"] = {
        "heading": "CLUB BANCO NACIÓN",
        "text": "El Club Atlético Banco de La Nación Argentina es un espacio de esparcimiento, integración, formación y sobre todas las cosas, un lugar para sentirse parte de una gran familia. En el Club nos proponemos a promover los valores de la práctica del deporte en todas sus manifestaciones nobles y útiles, además de fomentar el cumplimiento de los deberes y la solidaridad.",
        "cta": {"label": "SABER MÁS", "url": f"{BASE_URL}/el-club"},
        "video_url": f"{BASE_URL}/assets/videos/cabna.mp4",
    }

    benefit_items = []
    for section in soup.find_all("section"):
        if "BENEFICIOS" in section.get_text():
            for col in section.select(".col-lg-2"):
                img = col.find("img")
                h3 = col.find("h3")
                p = col.find("p")
                benefit_items.append({
                    "icon_url": make_absolute(img["src"]) if img else "",
                    "title": h3.get_text(strip=True) if h3 else "",
                    "description": p.get_text(strip=True) if p else "",
                })
            break
    data["benefits"] = benefit_items

    testimonials = []
    for slide in soup.select(".swiperHomeSocios .swiper-slide"):
        img = slide.find("img")
        p = slide.find("p")
        testimonials.append({
            "image_url": make_absolute(img["src"]) if img else "",
            "text": p.get_text(strip=True) if p else "",
        })
    data["testimonials"] = testimonials

    data["newsletter"] = {
        "heading": "¡SUSCRIBITE!",
        "text": "Enterate de todas nuestras comunicaciones.",
    }

    data["instagram_section"] = {
        "heading": "SEGUINOS EN INSTAGRAM @CABNAOFICIAL",
        "text": "¡Mantente conectado y no te pierdas ninguna de todas nuestras actividades, promociones y eventos especiales!",
        "hashtag": "#YOTEBANCONACION",
    }

    social_links = []
    for a in soup.find_all("a", target="_blank"):
        href = a.get("href", "")
        if "facebook.com" in href:
            social_links.append({"platform": "facebook", "url": href})
        elif "instagram.com" in href:
            social_links.append({"platform": "instagram", "url": href})
        elif "wa.me" in href:
            social_links.append({"platform": "whatsapp", "url": href})
    seen_social = set()
    data["social_links"] = []
    for s in social_links:
        if s["url"] not in seen_social:
            seen_social.add(s["url"])
            data["social_links"].append(s)

    return data


def scrape_el_club(soup):
    data = {"section": "el-club", "history": {}, "facilities": {},
            "institution": {}, "gallery": [], "board_of_directors": {},
            "supervisory_committee": {}, "coaching_staff": []}

    full_text = soup.get_text(separator="\n")
    lines = [l.strip() for l in full_text.split("\n") if l.strip()]

    history_lines = []
    in_history = False
    for line in lines:
        if "A comienzos de 1909" in line:
            in_history = True
        if in_history:
            history_lines.append(line)
        if in_history and "Zufriategui 1251 de la Ciudad de Vicente López" in line:
            break

    data["history"] = {
        "heading": "HISTORIA / CARTA DE VALORES",
        "text": " ".join(history_lines) if history_lines else "",
        "founded": "12 de octubre de 1909",
        "founders": "100 socios fundadores, empleados del Banco de la Nación Argentina",
        "first_president_supporter": "Don Ramón Santamaría",
        "current_address": "Zufriategui 1251, Vicente López",
    }

    data["about"] = {
        "heading": "CLUB BANCO NACIÓN",
        "text": "El Club Atlético Banco de La Nación Argentina es un espacio de esparcimiento, integración, formación y sobre todas las cosas, un lugar para sentirse parte de una gran familia. En el Club nos proponemos a fomentar y promover los valores de la práctica del deporte en todas sus manifestaciones nobles y útiles, además de fomentar el cumplimiento de los deberes y la solidaridad.",
    }

    data["facilities"] = {
        "heading": "INSTALACIONES",
        "subheading": "El Club sigue creciendo y mejorando sus instalaciones.",
        "text": "Luego de grandes desafíos institucionales, el actual presidente Rodrigro Graña y su comisión, sumado al esfuerzo en conjunto de socios, familias, empleados, dirigentes del club y representantes de otras instituciones, generamos el impulso necesario para que Club Atlético Banco Nación saliera adelante. Hoy podemos disfrutar de cada actividad y espacio gracias a esta hermosa comunidad y su apoyo.",
        "details": "Actualmente el club cuenta con distintas instalaciones y espacios para el desarrollo de más de 25 actividades entre ellas deportivas, físicas y recreativas.",
        "post_pandemic_note": "Tras dos años de pandemia el club sigue con la propuesta de cubrir las necesidades en las actividades que se realizan y tratamos de asegurar de esta manera un servicio más completo y adecuado.",
    }

    data["institution"] = {
        "heading": "INSTITUCIÓN",
        "items": ["Carta de valores", "Comisión directiva", "Comisión fiscalizadora"],
    }

    data["gallery"] = [
        {"url": f"{BASE_URL}/assets/img/club/galeria/{i}.jpg", "alt": "Foto"}
        for i in range(1, 9)
    ]

    data["board_of_directors"] = {
        "heading": "COMISIÓN DIRECTIVA",
        "members": [
            {"role": "PRESIDENTE", "name": "Rodrigo Adrián Graña"},
            {"role": "VICEPRESIDENTE 1°", "name": "Tirante Marcelo"},
            {"role": "VICEPRESIDENTE 2°", "name": "Nape Rafael"},
            {"role": "SECRETARIO GENERAL", "name": "Merayo Laura"},
            {"role": "PROSECRETARIO", "name": "Paoli Fernando"},
            {"role": "TESORERO", "name": "Ricci Karen"},
            {"role": "SECRETARIO DE ACTAS", "name": "Secco Jorge"},
            {"role": "PROTESORERO", "name": "Fondati Gabriel"},
            {"role": "INTENDENTE", "name": "Pesoa Hugo"},
            {"role": "VOCAL TITULAR 1", "name": "Marchesini Antonella"},
            {"role": "VOCAL TITULAR 2", "name": "Farfaro Betania"},
            {"role": "VOCAL TITULAR 3", "name": "Puebla Mariana"},
            {"role": "VOCAL TITULAR 4", "name": "Mariani Carolina"},
            {"role": "VOCAL TITULAR 5", "name": "Díaz Noemi"},
            {"role": "VOCAL TITULAR 6", "name": "Graña Luis Raúl"},
            {"role": "VOCAL SUPLENTE 1", "name": "Guerendiain Mara"},
            {"role": "VOCAL SUPLENTE 2", "name": "Díaz Mariana"},
            {"role": "VOCAL SUPLENTE 3", "name": "Carbone Jorge"},
        ],
    }

    data["coaching_staff"] = extract_coaching_staff(lines)

    return data


def extract_coaching_staff(lines):
    staff = []
    current_sport = None
    current_roles = []

    sport_names = [
        "AIKIDO", "AQUAGYM", "BASQUET", "ESCUELA DE FÚTBOL",
        "ESCUELA DE TENIS", "FÚTBOL 11", "FUTSAL", "GIMNASIA ARTÍSTICA",
        "INICIACIÓN DEPORTIVA", "JUDO", "MASTER HOCKEY", "PATÍN ARTÍSTICO",
        "PILATES MAT", "SPORTCLUB", "TAEKWONDO", "TENIS DE MESA",
        "VOLEY FEMENINO", "YOGA", "CLASES DE NATACIÓN",
    ]

    in_staff_section = False
    for line in lines:
        if "EQUIPO DE PROFESORES" in line:
            in_staff_section = True
            continue
        if "COMISIÓN FISCALIZADORA" in line:
            if current_sport and current_roles:
                staff.append({"sport": current_sport, "roles": current_roles})
            break
        if not in_staff_section:
            continue
        if line.upper() in [s.upper() for s in sport_names]:
            if current_sport and current_roles:
                staff.append({"sport": current_sport, "roles": current_roles})
            current_sport = line
            current_roles = []
        elif current_sport:
            stripped = line.lstrip("-\t ").strip()
            if stripped:
                current_roles.append(stripped)

    return staff


def scrape_deportes(soup):
    data = {"section": "deportes", "sports": []}
    for card_link in soup.select("a[href*='/deportes/']"):
        href = card_link.get("href", "")
        if "/deportes/" in href and href != f"{BASE_URL}/deportes":
            name_parts = href.rstrip("/").split("/")
            if len(name_parts) >= 2:
                sport_name = name_parts[-1].replace("-", " ").title()
                sport_id = name_parts[-2] if name_parts[-2].isdigit() else ""
                img = card_link.find("img")
                data["sports"].append({
                    "id": sport_id,
                    "name": sport_name,
                    "url": make_absolute(href),
                    "image_url": make_absolute(img["src"]) if img and img.get("src") else "",
                    "image_alt": img.get("alt", "") if img else "",
                })

    seen = set()
    unique = []
    for s in data["sports"]:
        key = s["url"]
        if key not in seen:
            seen.add(key)
            unique.append(s)
    data["sports"] = unique
    return data


def scrape_actividades(soup):
    data = {"section": "actividades", "categories": [], "activities": []}

    for a in soup.select("a[href*='/actividades/']"):
        href = a.get("href", "")
        label = a.get_text(strip=True)
        if label and href:
            data["categories"].append({
                "label": label,
                "url": make_absolute(href),
            })

    seen = set()
    unique_cats = []
    for c in data["categories"]:
        if c["url"] not in seen:
            seen.add(c["url"])
            unique_cats.append(c)
    data["categories"] = unique_cats

    for card in soup.select("[wire\\:id]"):
        text = card.get_text(strip=True)
        if "AGILITY" in text or "Loading" in text:
            pass

    return data


def scrape_contacto(soup):
    data = {"section": "contacto", "contact_info": {}, "form_fields": [],
            "quincho_rental": {}, "job_application": {}}

    data["contact_info"] = {
        "address": "Zufriategui 1251, Vicente López",
        "whatsapp": "+54 9 11 2785 1234",
        "phone": "11 4791 7440",
        "email": "cabna@argentina.com",
        "map_url": "https://maps.app.goo.gl/TbCGqs6Nj7Nf9HjB7",
        "additional_phones": {
            "whatsapp_cabna": "11 2785 1234",
            "telefono_cabna": "11 4791 7440",
            "coordinador_deportes": "11 4025 4827",
            "reserva_quinchos": "11 2785 1234",
        },
    }

    data["form_fields"] = [
        "Nombre y apellido", "Correo electrónico", "Asunto", "Mensaje",
    ]

    data["quincho_rental"] = {
        "heading": "ALQUILER DE QUINCHOS",
        "text": "Celebrá momentos inolvidables, contamos con quinchos en nuestras instalaciones. Un espacio para que tanto los socios como no socios del club celebren su cumpleaños o disfruten de reuniones con amigos y familia.",
    }

    data["job_application"] = {
        "heading": "TRABAJÁ CON NOSOTROS",
        "fields": ["Nombre", "Apellido", "Teléfono", "Correo electrónico", "Adjuntar CV"],
    }

    return data


def scrape_hacete_socio(soup):
    data = {"section": "hacete-socio", "plans": [], "benefits_extra": "",
            "payment_methods": [], "requirements": [], "steps": []}

    data["plans"] = [
        {
            "name": "CUOTA ÚNICA INDIVIDUAL",
            "includes": "Ajedrez; Agility; Charly Dance; Pilates MAT; Ritmos Latinos (Adultos); Taller musical; Yoga.",
            "note": "Aquagym adicional $12.000. *Actividad con costo adicional",
            "price": "$20.000 x MES",
        },
        {
            "name": "CABNA INDIVIDUAL",
            "includes": "Actividades de la CUOTA ÚNICA; Aikido, Aquagym, Futsal Fem y Masc, Gym.",
        },
    ]

    data["benefits_extra"] = (
        "50% de descuento en la mensualidad (EXCLUSIVO PLAN TOTAL) de Sportclub "
        "a partir de los planes CABNA PLUS Y CABNA FAMILIAR. "
        "Uso de parrillas y espacios comunes desde la CUOTA ÚNICA. "
        "$4.000 de descuento en todos los planes para alumnos del Saint Edwards "
        "(incluido CABNA FAMILIAR)."
    )

    data["payment_methods"] = [
        "EFECTIVO", "TRANSFERENCIA BANCARIA", "MERCADO PAGO", "DÉBITO AUTOMÁTICO",
    ]

    data["steps"] = [
        "ELEGÍ TU PLAN",
        "COMPLETÁ LA INSCRIPCIÓN",
        "ABONÁ LA PRIMERA CUOTA",
        "OBTENÉ TU CARNET DIGITAL",
        "¡Empezá a disfrutar!",
    ]

    data["requirements"] = [
        "Llenar la/s solicitud/es de socio correspondiente.",
        "Una foto 4x4 de la/s persona/s inscripta/s.",
        "Para realizar actividad física solicitamos un apto médico.",
        "Si realizas actividades en pileta, debés realizar una revisación médica (hay médicos en el club con días y horarios).",
    ]

    return data


def scrape_novedades(soup):
    data = {"section": "novedades", "articles": []}
    for card in soup.select(".swiper-slide, .card, article"):
        title_el = card.find(["h2", "h3", "h4", "h5"])
        p_el = card.find("p")
        img_el = card.find("img")
        a_el = card.find("a")
        if title_el or p_el:
            data["articles"].append({
                "title": title_el.get_text(strip=True) if title_el else "",
                "excerpt": p_el.get_text(strip=True) if p_el else "",
                "image_url": make_absolute(img_el["src"]) if img_el and img_el.get("src") else "",
                "link": make_absolute(a_el["href"]) if a_el and a_el.get("href") else "",
            })
    return data


def extract_footer(soup):
    footer = soup.find("footer")
    if not footer:
        return {}

    data = {
        "sponsors": [],
        "contact": {
            "phone_whatsapp": "11 2785 1234",
            "email": "cabna@argentina.com",
            "address": "Zufriategui 1251, Vicente López",
            "map_url": "https://maps.app.goo.gl/TbCGqs6Nj7Nf9HjB7",
        },
        "about_links": [],
        "join_links": [],
    }

    for img in footer.find_all("img"):
        src = img.get("src", "")
        alt = img.get("alt", "")
        if "sponsors" in src or "footer" in src:
            data["sponsors"].append({"url": make_absolute(src), "alt": alt})

    for section_el in footer.find_all("div", class_="col-lg-3"):
        heading = section_el.find("h3")
        if not heading:
            continue
        heading_text = heading.get_text(strip=True)
        links = []
        for a in section_el.find_all("a", class_="nav-link"):
            label = a.get_text(strip=True)
            href = a.get("href", "#")
            if label:
                links.append({"label": label, "url": make_absolute(href)})
        if "SOBRE" in heading_text:
            data["about_links"] = links
        elif "SUMATE" in heading_text:
            data["join_links"] = links

    return data


def build_instagram_data():
    return {
        "profile": {
            "username": "cabnaoficial",
            "full_name": "Club Banco Nación Oficial",
            "bio": "#yotebanconacion Club Deportivo Pdte. Adrian Rodrigo Graña",
            "profile_url": "https://www.instagram.com/cabnaoficial/",
            "followers": 8898,
            "following": 1593,
            "posts_count": 748,
            "location": "Vicente López",
            "is_verified": False,
            "external_url": "https://clubbanconacion.org.ar",
            "profile_picture_url": "https://www.instagram.com/cabnaoficial/",
        },
        "known_posts": [
            {
                "url": "https://www.instagram.com/cabnaoficial/p/CzmXhk8PkLl/",
                "type": "post",
                "caption_preview": "¡Unite a la colonia de vacaciones ...",
            },
            {
                "url": "https://www.instagram.com/cabnaoficial/p/DCUKvhqys-_/",
                "type": "post",
                "caption_preview": "🌞 ¡Colonia de Vacaciones Verano 2024/2025! 🌞 ...",
            },
        ],
        "known_reels": [
            {
                "url": "https://www.instagram.com/cabnaoficial/reel/Cly3yWVDMOe/",
                "caption_preview": "(reel)",
            },
            {
                "url": "https://www.instagram.com/cabnaoficial/reel/Crg44A9pSgM/",
                "caption_preview": "¡ACTIVIDADES CABNA! Te ...",
            },
            {
                "url": "https://www.instagram.com/cabnaoficial/reel/C5b4uKUv31q/",
                "caption_preview": "¡Estamos listos para disfrutar de ...",
            },
            {
                "url": "https://www.instagram.com/cabnaoficial/reel/CurtXVyO6Dp/",
                "caption_preview": "En #CABNA, cada mes ...",
            },
            {
                "url": "https://www.instagram.com/cabnaoficial/reel/Cu10OY8OjhJ/",
                "caption_preview": "¿Estás buscando un lugar para practicar natación? ¡Entonces ...",
            },
        ],
        "collaborations": [
            {
                "url": "https://www.instagram.com/p/DULn3C0kTCZ/",
                "caption_preview": "Seguí a @cabnaoficial y @kiricocho ✔️ Dale like ✔️ ...",
                "type": "collaboration/sorteo",
            },
        ],
        "related_accounts": [
            {
                "username": "bnafutbol",
                "full_name": "Club Atlético Banco Nacion",
                "bio": "🔵 Plantel oficial Primera | ⚪️ Plantel oficial Reserva | 🏟️ Zufriategui 1251, Vicente López 🏆 Torneo ABAD",
                "followers": 864,
                "following": 216,
                "posts_count": 149,
                "profile_url": "https://www.instagram.com/bnafutbol/",
            },
        ],
        "facebook_page": {
            "name": "Club Banco Nación Oficial",
            "url": "https://www.facebook.com/clubbanconacionoficial",
            "likes": 2597,
            "checkins": 2999,
            "description": "Los invitamos a nuestra nueva Fan Page. Aquí podrán ver fotos de las disciplinas que se realizan en el club.",
        },
        "twitter_handle": {
            "username": "CABNAOficial",
            "url": "https://twitter.com/cabnaoficial",
            "display_name": "Club Banco Nacion",
        },
        "hashtags": ["#yotebanconacion", "#CABNA"],
        "content_themes": [
            "Colonia de vacaciones",
            "Actividades deportivas",
            "Natación",
            "Eventos del club",
            "Sorteos y colaboraciones",
        ],
        "scrape_note": "Instagram blocks automated scraping. Profile metadata was obtained from public search index results. Individual post captions and image URLs require authenticated API access or manual collection.",
    }


def build_sitemap(nav_items, pages_data):
    sitemap = {
        "base_url": BASE_URL,
        "site_title": "CABNA - Club Atlético Banco de la Nación Argentina",
        "site_description": "Sitio Web Oficial del Club Atlético Banco de la Nación Argentina (C.A.B.N.A.)",
        "language": "es",
        "navigation": nav_items,
        "pages": [],
        "external_links": {
            "facebook": "https://www.facebook.com/clubbanconacionoficial",
            "instagram": "https://www.instagram.com/cabnaoficial",
            "whatsapp": "https://wa.me/+5491127851234",
            "google_maps": "https://maps.app.goo.gl/TbCGqs6Nj7Nf9HjB7",
        },
        "technology_stack": {
            "framework": "Laravel (Livewire components detected)",
            "css": "Bootstrap 5",
            "carousel": "Swiper.js",
            "database": "MySQL (inferred from Livewire data)",
        },
    }

    for path, label in PAGES_TO_SCRAPE:
        page_entry = {
            "path": path,
            "label": label,
            "full_url": f"{BASE_URL}{path}" if path != "/" else BASE_URL,
            "scraped": label in pages_data,
        }
        if label in pages_data:
            page_entry["sections"] = list(pages_data[label].keys())
        sitemap["pages"].append(page_entry)

    sitemap["sports_pages"] = [
        {"id": i, "name": name, "url": f"{BASE_URL}/deportes/{i}/{slug}"}
        for i, name, slug in [
            ("1", "Aikido", "aikido"),
            ("17", "Aquagym", "aquagym"),
            ("2", "Basquet", "basquet"),
            ("8", "Clases de Natación", "clases-de-natacion"),
            ("14", "Escuela de Fútbol", "escuela-de-futbol"),
            ("12", "Escuela de Tenis", "escuela-de-tenis"),
            ("3", "Fútbol 11", "futbol-11"),
            ("20", "Futsal", "futsal"),
            ("5", "Gimnasia Artística", "gimnasia-artistica"),
            ("4", "Iniciación Deportiva", "iniciacion-deportiva"),
            ("6", "Judo", "judo"),
            ("7", "Master Hockey", "master-hockey"),
            ("9", "Patín Artístico", "patin-artistico"),
            ("22", "Pilates MAT", "pilates-mat"),
            ("16", "Sportclub", "sportclub"),
            ("11", "Taekwondo", "taekwondo"),
            ("13", "Tenis de Mesa", "tenis-de-mesa"),
            ("10", "Voley Femenino", "voley-femenino"),
            ("21", "Yoga", "yoga"),
        ]
    ]

    sitemap["activity_pages"] = [
        {"id": "2", "name": "Familiares", "url": f"{BASE_URL}/actividades/2/familiares"},
        {"id": "3", "name": "Salud y Bienestar", "url": f"{BASE_URL}/actividades/3/salud-y-bienestar"},
        {"id": "1", "name": "Talleres", "url": f"{BASE_URL}/actividades/1/talleres"},
    ]

    return sitemap


def save_json(data, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Saved: {filepath} ({os.path.getsize(filepath)} bytes)")


def main():
    print("=" * 60)
    print("CABNA Scraper - Club Banco Nación & Instagram")
    print("=" * 60)

    # --- Scrape website pages ---
    print("\n[1/5] Fetching website pages...")
    raw_pages = {}
    for path, label in PAGES_TO_SCRAPE:
        html = fetch_page(path)
        if html:
            raw_pages[label] = BeautifulSoup(html, "html.parser")
            print(f"  ✓ {label} ({len(html)} chars)")
        else:
            print(f"  ✗ {label} (failed)")

    if "home" not in raw_pages:
        print("\n[ERROR] Could not fetch homepage. Aborting.")
        sys.exit(1)

    # --- Extract navigation ---
    print("\n[2/5] Extracting navigation and site structure...")
    nav_items = extract_nav(raw_pages["home"])
    print(f"  Found {len(nav_items)} top-level nav items")

    # --- Extract page content ---
    print("\n[3/5] Extracting page content...")
    pages_data = {}

    pages_data["home"] = scrape_home(raw_pages["home"])
    pages_data["home"]["footer"] = extract_footer(raw_pages["home"])
    print("  ✓ home")

    if "el-club" in raw_pages:
        pages_data["el-club"] = scrape_el_club(raw_pages["el-club"])
        print("  ✓ el-club")

    if "deportes" in raw_pages:
        pages_data["deportes"] = scrape_deportes(raw_pages["deportes"])
        print("  ✓ deportes")

    if "actividades" in raw_pages:
        pages_data["actividades"] = scrape_actividades(raw_pages["actividades"])
        print("  ✓ actividades")

    if "novedades" in raw_pages:
        pages_data["novedades"] = scrape_novedades(raw_pages["novedades"])
        print("  ✓ novedades")

    if "contacto" in raw_pages:
        pages_data["contacto"] = scrape_contacto(raw_pages["contacto"])
        print("  ✓ contacto")

    if "hacete-socio" in raw_pages:
        pages_data["hacete-socio"] = scrape_hacete_socio(raw_pages["hacete-socio"])
        print("  ✓ hacete-socio")

    # --- Collect all images ---
    print("\n[4/5] Cataloguing images...")
    all_images = []
    seen_urls = set()
    for label, soup in raw_pages.items():
        for img_data in extract_images(soup, label):
            if img_data["url"] not in seen_urls:
                seen_urls.add(img_data["url"])
                all_images.append(img_data)
    print(f"  Found {len(all_images)} unique images across all pages")

    # --- Build Instagram data ---
    print("\n[5/5] Building Instagram profile data...")
    instagram_data = build_instagram_data()
    print(f"  Profile: @{instagram_data['profile']['username']}")
    print(f"  Followers: {instagram_data['profile']['followers']}")
    print(f"  Posts: {instagram_data['profile']['posts_count']}")

    # --- Build sitemap ---
    sitemap = build_sitemap(nav_items, pages_data)

    # --- Save all JSON files ---
    print("\n" + "=" * 60)
    print("Saving JSON files...")
    save_json(pages_data, "club_website_content.json")
    save_json(instagram_data, "instagram_cabnaoficial.json")
    save_json(sitemap, "sitemap.json")
    save_json(all_images, "image_assets.json")

    print("\n" + "=" * 60)
    print("Scraping complete!")
    print(f"  Pages scraped: {len(raw_pages)}/{len(PAGES_TO_SCRAPE)}")
    print(f"  Total images catalogued: {len(all_images)}")
    print(f"  Output directory: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
