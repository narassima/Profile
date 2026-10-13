"""
Refresh Google Scholar metrics (citations, h-index, i10-index) for the site.

The page (js/script.js) reads data/scholar.json on every load, so updating that
one file is enough to change the Home stat card and the Research Impact tiles.
The numbers hard-coded in index.html are only the fallback shown if the JSON
cannot be read; this script keeps them in step too.

Usage (from the repo root):
    python scripts/update_citations.py

Google Scholar has no API and blocks datacentre IPs, so the scheduled GitHub
Action (.github/workflows/update_scholar.yml) often cannot get through. Running
this by hand from a normal home/office connection works. The script fails
*softly*: if it cannot get a clean read it says why and exits 0, leaving the
files untouched, so a block never fails the workflow.
"""

import datetime
import gzip
import io
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

SCHOLAR_ID = "RDFCAzYAAAAJ"
URL = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en&oi=sra"
ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "scholar.json"
INDEX_FILE = ROOT / "index.html"
ATTEMPTS = 3

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    # Pre-accept the EU consent screen so we get the profile page, not the wall.
    "Cookie": "CONSENT=YES+cb.20240101-00-p0.en+FX+000",
}


def _fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read()
        if resp.headers.get("Content-Encoding") == "gzip":
            raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
        return raw.decode("utf-8", errors="replace")


def get_metrics():
    """Return {'citations','hindex','i10index'} as ints (all-time), or None."""
    for attempt in range(1, ATTEMPTS + 1):
        try:
            html = _fetch(URL)
        except Exception as e:  # noqa: BLE001 - log and retry whatever goes wrong
            print(f"[attempt {attempt}/{ATTEMPTS}] fetch error: {e}")
            time.sleep(5 * attempt)
            continue

        if "gsc_rsb_std" not in html:
            snippet = "consent" if "consent" in html.lower() else "no metrics table"
            print(f"[attempt {attempt}/{ATTEMPTS}] blocked or unexpected page ({snippet})")
            time.sleep(5 * attempt)
            continue

        # Table order: [cites_all, cites_5y, h_all, h_5y, i10_all, i10_5y]
        nums = re.findall(r'<td class="gsc_rsb_std">([\d,]+)</td>', html)
        if len(nums) >= 5:
            clean = [int(n.replace(",", "")) for n in nums]
            return {"citations": clean[0], "hindex": clean[2], "i10index": clean[4]}

        print(f"[attempt {attempt}/{ATTEMPTS}] metrics table found but only {len(nums)} values")
        time.sleep(5 * attempt)

    return None


def looks_sane(new, old):
    """Guard an unattended bot against publishing a mis-parsed page."""
    if new["citations"] <= 0 or new["hindex"] > new["citations"]:
        return False
    # Citation totals only grow; a drop of >10% means the page was mis-read.
    if old and new["citations"] < old.get("citations", 0) * 0.9:
        return False
    return True


def write_data(metrics):
    old = None
    try:
        old = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        pass

    if old and all(old.get(k) == metrics[k] for k in metrics):
        print("data/scholar.json already current - nothing to write.")
        return False
    if not looks_sane(metrics, old):
        print(f"Refusing implausible read {metrics} (previous: {old}); leaving files untouched.")
        return False

    out = dict(metrics)
    out["updated"] = datetime.date.today().isoformat()
    out["source"] = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en"
    DATA_FILE.parent.mkdir(exist_ok=True)
    DATA_FILE.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {DATA_FILE.relative_to(ROOT)}: {out}")
    return True


def sync_html_fallback(metrics):
    """Keep the numbers hard-coded in index.html in step (bytes, so CRLF survives)."""
    if not INDEX_FILE.exists():
        return
    c, h, i10 = (str(metrics[k]).encode() for k in ("citations", "hindex", "i10index"))
    raw = INDEX_FILE.read_bytes()
    new = raw
    # Home stat card carries the number twice: data-target and the visible text.
    new = re.sub(
        rb'(<h4 id="scholar-citations" class="stat-number" data-target=")\d+("[^>]*>)\d+(</h4>)',
        rb"\g<1>" + c + rb"\g<2>" + c + rb"\g<3>", new,
    )
    for el_id, val in (("scholar-citations-impact", c), ("scholar-hindex-impact", h), ("scholar-i10index-impact", i10)):
        new = re.sub(
            rb'(<div id="' + el_id.encode() + rb'"[^>]*>)\d+(</div>)',
            rb"\g<1>" + val + rb"\g<2>", new,
        )
    stamp = datetime.date.today().strftime("%d %b %Y").lstrip("0").encode()
    new = re.sub(rb'(<div id="scholar-updated"[^>]*>)[^<]*(</div>)', rb"\g<1>Updated " + stamp + rb"\g<2>", new)
    if new != raw:
        INDEX_FILE.write_bytes(new)
        print("Synced fallback numbers in index.html")


if __name__ == "__main__":
    print("Fetching Google Scholar metrics...")
    metrics = get_metrics()
    if not metrics:
        print("Could not read metrics this run; leaving files unchanged.")
        sys.exit(0)

    print(f"Got citations={metrics['citations']}, h-index={metrics['hindex']}, i10-index={metrics['i10index']}")
    if write_data(metrics):
        sync_html_fallback(metrics)
    sys.exit(0)
