import urllib.request
import re
import sys
import os

SCHOLAR_ID = 'RDFCAzYAAAAJ'
URL = f'https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en'

def get_citations():
    req = urllib.request.Request(
        URL, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            # The total citations is typically the first <td class="gsc_rsb_std"> value
            match = re.search(r'<td class="gsc_rsb_std">(\d+)</td>', html)
            if match:
                return match.group(1)
            else:
                print("Could not find citation count in HTML.")
                return None
    except Exception as e:
        print(f"Error fetching Google Scholar: {e}")
        return None

def update_html(citations):
    file_path = 'index.html'
    if not os.path.exists(file_path):
        print(f"{file_path} not found!")
        return False
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find the citation target and replace it
    pattern = r'(<h4 id="scholar-citations" class="stat-number" data-target=")\d+("[^>]*>)\d+(</h4>)'
    
    new_content = re.sub(pattern, rf'\g<1>{citations}\g<2>{citations}\g<3>', content)
    
    if new_content == content:
        print("No changes made to HTML (either already up to date or regex didn't match).")
        return False
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully updated citations to {citations} in index.html")
    return True

if __name__ == '__main__':
    print("Fetching citations...")
    citations = get_citations()
    if citations:
        print(f"Found citations: {citations}")
        updated = update_html(citations)
        if not updated:
            sys.exit(0) # Exit gracefully so Action doesn't fail
    else:
        sys.exit(1) # Fail the action if we can't fetch
