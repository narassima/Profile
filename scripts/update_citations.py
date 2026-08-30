"""
Update Google Scholar metrics (citations, h-index, i10-index) in index.html.

Run by .github/workflows/update_scholar.yml on a schedule. Google Scholar has
no API and actively rate-limits / serves a consent interstitial to datacentre
IPs (which GitHub Actions runners use), so this script is written to fail
*softly*: if it cannot get a clean read it logs why and exits 0, leaving
index.html untouched. That way an occasional block never fails the workflow
(a workflow that fails for 60 days straight gets its schedule auto-disabled).
"""

import gzip
import io
import re
import sys
import time
import urllib.request

SCHOLAR_ID = "RDFCAzYAAAAJ"
URL = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en&oi=sra"
INDEX_FILE = "index.html"
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
    """Return {'citations','hindex','i10index'} as strings, or None on failure."""
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
            clean = [n.replace(",", "") for n in nums]
            return {"citations": clean[0], "hindex": clean[2], "i10index": clean[4]}

        print(f"[attempt {attempt}/{ATTEMPTS}] metrics table found but only {len(nums)} values")
        time.sleep(5 * attempt)

    return None


def update_html(metrics):
    try:
        with open(INDEX_FILE, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"{INDEX_FILE} not found")
        return False

    c, h, i10 = metrics["citations"], metrics["hindex"], metrics["i10index"]
    new = content

    # 1. Homepage citations stat card
    new = re.sub(
        r'(<h4 id="scholar-citations" class="stat-number" data-target=")\d+("[^>]*>)\d+(</h4>)',
        rf"\g<1>{c}\g<2>{c}\g<3>", new,
    )
    # 2-4. Research page "Research Impact" tiles
    new = re.sub(r'(<div id="scholar-citations-impact"[^>]*>)\d+(</div>)', rf"\g<1>{c}\g<2>", new)
    new = re.sub(r'(<div id="scholar-hindex-impact"[^>]*>)\d+(</div>)', rf"\g<1>{h}\g<2>", new)
    new = re.sub(r'(<div id="scholar-i10index-impact"[^>]*>)\d+(</div>)', rf"\g<1>{i10}\g<2>", new)

    if new == content:
        print("Metrics already current — nothing to write.")
        return False

    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        f.write(new)
    print(f"Updated {INDEX_FILE}: citations={c}, h-index={h}, i10-index={i10}")
    return True


if __name__ == "__main__":
    print("Fetching Google Scholar metrics...")
    metrics = get_metrics()
    if not metrics:
        # Soft-fail: leave the site as-is, don't break the scheduled workflow.
        print("Could not read metrics this run; leaving index.html unchanged.")
        sys.exit(0)

    print(f"Got citations={metrics['citations']}, h-index={metrics['hindex']}, i10-index={metrics['i10index']}")
    update_html(metrics)
    sys.exit(0)
