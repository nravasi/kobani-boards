"""
HTML5 structural validation for San Lorenzo website.
Checks for critical W3C HTML validation errors.
"""
import os
import re
import sys

BASE = os.path.join(os.path.dirname(__file__), '..')
errors = []
warnings = []
file_count = 0

def get_html_files():
    files = []
    for root, dirs, filenames in os.walk(BASE):
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'test')]
        for f in filenames:
            if f.endswith('.html'):
                files.append(os.path.join(root, f))
    return sorted(files)

def validate_file(filepath):
    global file_count
    file_count += 1
    relpath = os.path.relpath(filepath, BASE)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    lines = content.split('\n')
    
    # 1. DOCTYPE
    if not content.strip().startswith('<!DOCTYPE html>'):
        errors.append(f'{relpath}: Missing or incorrect DOCTYPE')
    
    # 2. <html lang="es">
    if not re.search(r'<html\s+lang="es"', content):
        errors.append(f'{relpath}: Missing lang attribute on <html>')
    
    # 3. <meta charset="UTF-8">
    if not re.search(r'<meta\s+charset="UTF-8"', content, re.IGNORECASE):
        errors.append(f'{relpath}: Missing charset meta tag')
    
    # 4. <meta viewport>
    if 'viewport' not in content:
        errors.append(f'{relpath}: Missing viewport meta tag')
    
    # 5. <title> present and not empty
    title_match = re.search(r'<title>(.*?)</title>', content)
    if not title_match or not title_match.group(1).strip():
        errors.append(f'{relpath}: Missing or empty <title>')
    
    # 6. Closing </html>
    if '</html>' not in content:
        errors.append(f'{relpath}: Missing closing </html>')
    
    # 7. Closing </body>
    if '</body>' not in content:
        errors.append(f'{relpath}: Missing closing </body>')
    
    # 8. Closing </head>
    if '</head>' not in content:
        errors.append(f'{relpath}: Missing closing </head>')
    
    # 9. Head and body present
    if '<head>' not in content:
        errors.append(f'{relpath}: Missing <head>')
    if '<body>' not in content:
        errors.append(f'{relpath}: Missing <body>')
    
    # 10. No duplicate IDs
    ids = re.findall(r'\bid="([^"]+)"', content)
    seen = set()
    for id_val in ids:
        if id_val in seen:
            errors.append(f'{relpath}: Duplicate id="{id_val}"')
        seen.add(id_val)
    
    # 11. All images have alt attribute
    img_tags = re.findall(r'<img\b[^>]*>', content)
    for img in img_tags:
        if 'alt=' not in img:
            errors.append(f'{relpath}: <img> missing alt attribute: {img[:80]}')
    
    # 12. No unclosed void elements with wrong syntax
    # (Not critical for HTML5 but check for obvious issues)
    
    # 13. aria-controls reference existing IDs
    aria_controls = re.findall(r'aria-controls="([^"]+)"', content)
    for ctrl in aria_controls:
        if ctrl not in seen:
            warnings.append(f'{relpath}: aria-controls="{ctrl}" references non-existent id')
    
    # 14. Required elements: header, main, footer
    if '<header' not in content:
        errors.append(f'{relpath}: Missing <header>')
    if '<main' not in content:
        errors.append(f'{relpath}: Missing <main>')
    if '<footer' not in content:
        errors.append(f'{relpath}: Missing <footer>')
    
    # 15. Form elements have labels or aria-labels
    inputs = re.findall(r'<input\b[^>]*>', content)
    for inp in inputs:
        if 'type="hidden"' in inp or 'type="submit"' in inp:
            continue
        id_match = re.search(r'id="([^"]+)"', inp)
        if id_match:
            input_id = id_match.group(1)
            if f'for="{input_id}"' not in content and 'aria-label' not in inp:
                warnings.append(f'{relpath}: input#{input_id} may lack a label')
    
    # 16. No empty href
    if 'href=""' in content:
        warnings.append(f'{relpath}: Empty href attribute found')
    
    # 17. External links have rel="noopener"
    ext_links = re.findall(r'<a\b[^>]*target="_blank"[^>]*>', content)
    for link in ext_links:
        if 'noopener' not in link:
            errors.append(f'{relpath}: target="_blank" without rel="noopener": {link[:100]}')


files = get_html_files()
for f in files:
    validate_file(f)

print(f"\nValidated {file_count} HTML files")
print(f"Errors: {len(errors)}")
print(f"Warnings: {len(warnings)}")

if errors:
    print("\n=== ERRORS ===")
    for e in errors:
        print(f"  ✗ {e}")

if warnings:
    print("\n=== WARNINGS ===")
    for w in warnings:
        print(f"  ⚠ {w}")

if not errors:
    print("\n✓ All files pass HTML5 validation with no critical errors.")
    
sys.exit(1 if errors else 0)
