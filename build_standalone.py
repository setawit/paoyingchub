#!/usr/bin/env python3
"""Build double-clickable standalone HTML files.

Reads the server-based site (index.html / salak.html + assets + data/*.json) and
produces fully self-contained pages in ./standalone/ where CSS, JS and data are all
inlined. These open directly from the filesystem (file://) with no server, because:
  * data is embedded as window.__DEPOSITS__ / window.__SALAK__ (no fetch), and
  * ES-module imports are stripped and scripts concatenated into one plain <script>.

The server-based site under assets/ + data/ stays the source of truth; re-run this
script after changing data or JS:  python build_standalone.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "standalone"


def read(p: str) -> str:
    return (ROOT / p).read_text(encoding="utf-8")


def strip_module(js: str) -> str:
    """Remove `import ... from './data.js';` lines and `export ` keywords."""
    js = re.sub(r"^\s*import\s+.*?from\s+['\"].*?['\"];\s*$", "", js, flags=re.MULTILINE)
    js = re.sub(r"\bexport\s+", "", js)
    return js


def make_data_js() -> str:
    """data.js with fetch-based loaders swapped for the embedded globals."""
    js = strip_module(read("assets/js/data.js"))
    js = js.replace("loadJSON('data/deposits.json')", "Promise.resolve(window.__DEPOSITS__)")
    js = js.replace("loadJSON('data/salak.json')", "Promise.resolve(window.__SALAK__)")
    return js


def build(page_html: str, page_js: str) -> str:
    css = read("assets/css/style.css")
    deposits = read("data/deposits.json")
    salak = read("data/salak.json")
    bundle = "\n".join([make_data_js(), strip_module(read(page_js))])

    html = read(page_html)
    # inline CSS
    html = html.replace(
        '<link rel="stylesheet" href="assets/css/style.css">',
        f"<style>\n{css}\n</style>",
    )
    # inline data + bundled script in place of the module script tag
    script_tag = re.search(r'<script type="module"[^>]*></script>', html).group(0)
    embedded = (
        "<script>\n"
        f"window.__DEPOSITS__ = {deposits};\n"
        f"window.__SALAK__ = {salak};\n"
        f"{bundle}\n"
        "</script>"
    )
    html = html.replace(script_tag, embedded)
    return html


def main() -> None:
    OUT.mkdir(exist_ok=True)
    pages = [
        ("index.html", "assets/js/compare.js"),
        ("salak.html", "assets/js/salak.js"),
    ]
    for page, js in pages:
        out = OUT / page
        out.write_text(build(page, js), encoding="utf-8")
        print(f"  wrote {out.relative_to(ROOT)}  ({out.stat().st_size:,} bytes)")
    print("standalone build complete — double-click standalone/index.html")


if __name__ == "__main__":
    main()
