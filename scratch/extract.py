import re

with open(r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\js\data.js", "r", encoding="utf-8") as f:
    content = f.read()

# Extract all "authors" fields
author_fields = re.findall(r'"authors":\s*"([^"]+)"', content)

# Set of standard mappings or clean authors
all_authors = set()
for line in author_fields:
    # clean "and", "&"
    line = re.sub(r'\b(?:and|&)\b', ',', line)
    # split by comma or semicolon
    parts = re.split(r'[,;]', line)
    for p in parts:
        p = p.strip()
        p = re.sub(r'\s+', ' ', p)
        p = p.strip('.')
        # Remove empty, self, or placeholder
        p_lower = p.lower()
        if not p:
            continue
        if any(x in p_lower for x in ["narassima", "seshadri", "et al", "others"]):
            continue
        all_authors.add(p)

print(f"Found {len(all_authors)} authors:")
for a in sorted(all_authors):
    print(a)
