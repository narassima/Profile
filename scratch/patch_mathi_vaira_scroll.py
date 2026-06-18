import re

# 1. Update css/style.css
css_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\css\style.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

old_grid_css = """.collab-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
}"""

new_grid_css = """.collab-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
    max-height: 260px;
    overflow-y: auto;
    padding-right: 0.5rem;
    padding-bottom: 0.5rem;
}

/* Custom Scrollbar for collab-grid */
.collab-grid::-webkit-scrollbar {
    width: 6px;
}
.collab-grid::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 4px;
}
.collab-grid::-webkit-scrollbar-thumb {
    background: rgba(10, 102, 194, 0.2);
    border-radius: 4px;
}
.collab-grid::-webkit-scrollbar-thumb:hover {
    background: rgba(10, 102, 194, 0.4);
}"""

if old_grid_css in css_content:
    css_content = css_content.replace(old_grid_css, new_grid_css)
    print("Successfully patched collab-grid scroll styles in css/style.css")
else:
    print("Error: collab-grid CSS block not found!")

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_content)


# 2. Update index.html
html_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Update Mathiyazhagan's affiliation
old_mathi = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. K. Mathiyazhagan</span>
                            <div class="collab-tooltip">
                                <strong>Dr. K. Mathiyazhagan</strong>
                                <p>Associate Professor, IIT Jammu, India</p>
                                <span class="tooltip-badge">Area: Supply Chain Resilience</span>
                            </div>
                        </div>"""

new_mathi = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. K. Mathiyazhagan</span>
                            <div class="collab-tooltip">
                                <strong>Dr. K. Mathiyazhagan</strong>
                                <p>Professor & Chairperson - Research, Thiagarajar School of Management (TSM), Madurai, India</p>
                                <span class="tooltip-badge">Area: Supply Chain Resilience</span>
                            </div>
                        </div>"""

if old_mathi in html_content:
    html_content = html_content.replace(old_mathi, new_mathi)
    print("Successfully updated Mathiyazhagan's affiliation in index.html")
else:
    print("Error: Mathiyazhagan's old chip not found!")

# Add Vaira Vignesh's chip next to SK Vasudevan's chip
old_vasu = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. S.K. Vasudevan</span>
                            <div class="collab-tooltip">
                                <strong>Dr. S.K. Vasudevan</strong>
                                <p>Senior Manager - Industrial AI, Accenture, India (Ex-Intel & Amrita)</p>
                                <span class="tooltip-badge">Area: Wearable Tech & Retail DL Models</span>
                            </div>
                        </div>"""

new_vasu_and_vignesh = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. S.K. Vasudevan</span>
                            <div class="collab-tooltip">
                                <strong>Dr. S.K. Vasudevan</strong>
                                <p>Senior Manager - Industrial AI, Accenture, India (Ex-Intel & Amrita)</p>
                                <span class="tooltip-badge">Area: Wearable Tech & Retail DL Models</span>
                            </div>
                        </div>
                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. R. Vaira Vignesh</span>
                            <div class="collab-tooltip">
                                <strong>Dr. R. Vaira Vignesh</strong>
                                <p>Assistant Professor, Dept. of Mechanical Engineering, Amrita School of Engineering, Coimbatore, India</p>
                                <span class="tooltip-badge">Area: Friction Stir Processing & Metallurgy</span>
                            </div>
                        </div>"""

if old_vasu in html_content:
    html_content = html_content.replace(old_vasu, new_vasu_and_vignesh)
    print("Successfully added Vaira Vignesh's chip in index.html")
else:
    print("Error: SK Vasudevan's chip not found to append Vaira Vignesh!")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)
