import urllib.request
import re
import sys
import os

SCHOLAR_ID = 'RDFCAzYAAAAJ'
URL = f'https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en'

def get_metrics():
    req = urllib.request.Request(
        URL, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            matches = re.findall(r'<td class="gsc_rsb_std">(\d+)</td>', html)
            if len(matches) >= 5:
                return {
                    'citations': matches[0],
                    'hindex': matches[2],
                    'i10index': matches[4]
                }
            else:
                print("Could not find all metrics in HTML. Matches found:", matches)
                return None
    except Exception as e:
        print(f"Error fetching Google Scholar: {e}")
        return None

def update_html(metrics):
    file_path = 'index.html'
    if not os.path.exists(file_path):
        print(f"{file_path} not found!")
        return False
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    citations = metrics['citations']
    hindex = metrics['hindex']
    i10index = metrics['i10index']
    
    # 1. Homepage citations widget
    pattern_sidebar = r'(<h4 id="scholar-citations" class="stat-number" data-target=")\d+("[^>]*>)\d+(</h4>)'
    new_content = re.sub(pattern_sidebar, rf'\g<1>{citations}\g<2>{citations}\g<3>', content)
    
    # 2. Research page impact stats: Citations
    pattern_citations = r'(<div id="scholar-citations-impact" style="[^"]*">)\d+(</div>)'
    new_content = re.sub(pattern_citations, rf'\g<1>{citations}\g<2>', new_content)
    
    # 3. Research page impact stats: h-index
    pattern_hindex = r'(<div id="scholar-hindex-impact" style="[^"]*">)\d+(</div>)'
    new_content = re.sub(pattern_hindex, rf'\g<1>{hindex}\g<2>', new_content)
    
    # 4. Research page impact stats: i10-index
    pattern_i10index = r'(<div id="scholar-i10index-impact" style="[^"]*">)\d+(</div>)'
    new_content = re.sub(pattern_i10index, rf'\g<1>{i10index}\g<2>', new_content)
    
    if new_content == content:
        print("No changes made to HTML (either already up to date or regex didn't match).")
        return False
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully updated metrics in index.html to Citations: {citations}, h-index: {hindex}, i10-index: {i10index}")
    return True

if __name__ == '__main__':
    print("Fetching citations and metrics...")
    metrics = get_metrics()
    if metrics:
        print(f"Found metrics: Citations: {metrics['citations']}, h-index: {metrics['hindex']}, i10-index: {metrics['i10index']}")
        updated = update_html(metrics)
        if not updated:
            sys.exit(0) # Exit gracefully so Action doesn't fail
    else:
        sys.exit(1) # Fail the action if we can't fetch
