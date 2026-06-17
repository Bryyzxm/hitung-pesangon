#!/usr/bin/env python3
"""Lightweight static-site validator for HitungPesangon.

Checks (stdlib only, no external deps):
  1. All 11 canonical pages exist.
  2. Each page has required metadata tags (canonical, OG, Twitter Card,
     theme-color, robots).
  3. Every <script type="application/ld+json"> block is valid JSON.
  4. sitemap.xml contains exactly the expected 11 canonical URLs.
  5. robots.txt points to https://hitungpesangon.my.id/sitemap.xml.
  6. No page contains 'github.io' or 'http://hitungpesangon' (http, not https).
"""

import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

DOMAIN = "https://hitungpesangon.my.id"
CANONICAL_PAGES = [
    "index.html",
    "pesangon.html",
    "jkp-jht.html",
    "klaim-jkp-2025.html",
    "bhr-ojol.html",
    "kompensasi-pkwt.html",
    "burn-rate.html",
    "thr.html",
    "pph21.html",
    "bpjs-kesehatan.html",
    "gaji-bersih.html",
    "dana-darurat.html",
    "simulasi-pensiun.html",
    "uang-sakit-cuti.html",
]

# The index page uses "/" for the canonical URL; calculators use "/<file>".
SITEMAP_PATHS = [
    "/",
    "/pesangon.html",
    "/jkp-jht.html",
    "/klaim-jkp-2025.html",
    "/bhr-ojol.html",
    "/kompensasi-pkwt.html",
    "/burn-rate.html",
    "/thr.html",
    "/pph21.html",
    "/bpjs-kesehatan.html",
    "/gaji-bersih.html",
    "/dana-darurat.html",
    "/simulasi-pensiun.html",
    "/uang-sakit-cuti.html",
]

REQUIRED_META = [
    'rel="canonical"',
    'property="og:title"',
    'property="og:description"',
    'property="og:type"',
    'property="og:url"',
    'property="og:image"',
    'property="og:image:width"',
    'property="og:image:height"',
    'name="twitter:card"',
    'name="twitter:title"',
    'name="twitter:description"',
    'name="twitter:image"',
    'name="theme-color"',
    'name="robots"',
]

JSON_LD_RE = re.compile(
    r'<script\s+type="application/ld\+json">(.*?)</script>', re.DOTALL
)

errors: list[str] = []


def fail(msg: str) -> None:
    errors.append(msg)
    print(f"  FAIL: {msg}")


def check_pages_exist() -> None:
    """Check that every canonical page file exists on disk."""
    print("Checking page files exist ...")
    for page in CANONICAL_PAGES:
        if not Path(page).is_file():
            fail(f"Missing page: {page}")


def check_metadata() -> None:
    """Check required metadata tags are present in each page."""
    print("Checking metadata tags ...")
    for page in CANONICAL_PAGES:
        path = Path(page)
        if not path.is_file():
            fail(f"Metadata skip (missing file): {page}")
            continue
        html = path.read_text(encoding="utf-8")
        missing = [tok for tok in REQUIRED_META if tok not in html]
        if missing:
            fail(f"{page}: missing metadata: {missing}")
        if DOMAIN not in html:
            fail(f"{page}: does not contain domain {DOMAIN}")


def check_jsonld() -> None:
    """Verify every JSON-LD block parses as valid JSON."""
    print("Checking JSON-LD blocks ...")
    for page in CANONICAL_PAGES:
        path = Path(page)
        if not path.is_file():
            continue
        html = path.read_text(encoding="utf-8")
        blocks = JSON_LD_RE.findall(html)
        if not blocks:
            fail(f"{page}: no JSON-LD blocks found")
            continue
        for idx, block in enumerate(blocks):
            try:
                json.loads(block)
            except json.JSONDecodeError as exc:
                fail(f"{page}: JSON-LD block {idx} parse error: {exc}")


def check_sitemap() -> None:
    """Validate sitemap.xml contains the expected canonical URLs."""
    print("Checking sitemap.xml ...")
    sitemap_path = Path("sitemap.xml")
    if not sitemap_path.is_file():
        fail("sitemap.xml not found")
        return

    try:
        tree = ET.parse(str(sitemap_path))
    except ET.ParseError as exc:
        fail(f"sitemap.xml: XML parse error: {exc}")
        return

    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [loc.text or "" for loc in tree.findall(".//s:loc", ns)]
    expected = [f"{DOMAIN}{p}" for p in SITEMAP_PATHS]

    if sorted(urls) != sorted(expected):
        extra = set(urls) - set(expected)
        missing = set(expected) - set(urls)
        if extra:
            fail(f"sitemap.xml: unexpected URLs: {extra}")
        if missing:
            fail(f"sitemap.xml: missing URLs: {missing}")


def check_robots() -> None:
    """Verify robots.txt references the correct sitemap URL."""
    print("Checking robots.txt ...")
    robots_path = Path("robots.txt")
    if not robots_path.is_file():
        fail("robots.txt not found")
        return
    content = robots_path.read_text(encoding="utf-8")
    expected_line = f"Sitemap: {DOMAIN}/sitemap.xml"
    if expected_line not in content:
        fail(f"robots.txt: expected '{expected_line}' not found")


def check_forbidden_patterns() -> None:
    """Ensure no page references github.io or http://hitungpesangon."""
    print("Checking forbidden URL patterns ...")
    forbidden = ["github.io", "http://hitungpesangon"]
    for page in CANONICAL_PAGES:
        path = Path(page)
        if not path.is_file():
            continue
        html = path.read_text(encoding="utf-8")
        for pattern in forbidden:
            if pattern in html:
                fail(f"{page}: contains forbidden pattern '{pattern}'")


def main() -> int:
    print(f"=== validate-static.py — {DOMAIN} ===\n")
    check_pages_exist()
    check_metadata()
    check_jsonld()
    check_sitemap()
    check_robots()
    check_forbidden_patterns()

    print()
    if errors:
        print(f"VALIDATION FAILED — {len(errors)} error(s)")
        for e in errors:
            print(f"  - {e}")
        return 1
    else:
        print("ALL CHECKS PASSED")
        return 0


if __name__ == "__main__":
    sys.exit(main())
