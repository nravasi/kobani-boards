# CNBASITE — Club Banco Nación Website & Instagram Scraper

Scrapes publicly available content from [clubbanconacion.org.ar](https://clubbanconacion.org.ar/) and the [@cabnaoficial](https://www.instagram.com/cabnaoficial/) Instagram profile. Outputs structured JSON files for downstream use by other agents.

## Quick Start

```bash
pip install requests beautifulsoup4
python3 scraper.py
```

## Output Files

| File | Description |
|---|---|
| `club_website_content.json` | All text content from clubbanconacion.org.ar — home, el-club, deportes, actividades, novedades, contacto, hacete-socio sections |
| `instagram_cabnaoficial.json` | Instagram profile info, known post/reel captions, hashtags, related accounts |
| `sitemap.json` | Site structure, navigation hierarchy, sports/activity pages, external links, tech stack |
| `image_assets.json` | All image assets catalogued with URLs, alt text, and source page |

## Tests

```bash
python3 -m unittest test_scraper -v
```

## Dependencies

- Python 3.8+
- `requests`
- `beautifulsoup4`
