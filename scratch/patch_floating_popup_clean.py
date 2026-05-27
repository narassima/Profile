file_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target_str = """                <!-- Premium Interactive Details Preview Box -->
                <div id="collab-preview-box" style="background: rgba(10, 102, 194, 0.04); border: 1px solid rgba(10, 102, 194, 0.15); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem; min-height: 85px; display: flex; align-items: center; gap: 1rem; transition: all 0.3s ease;">
                    <div style="background: #e8f4fd; color: var(--primary-color); width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.3rem;">
                        <i class="fas fa-info-circle" id="collab-preview-icon" style="transition: all 0.2s;"></i>
                    </div>
                    <div style="flex-grow: 1;">
                        <strong id="collab-preview-title" style="display: block; color: var(--primary-color); font-size: 1rem; margin-bottom: 0.25rem; font-weight: 700;">Collaboration Highlights</strong>
                        <p id="collab-preview-desc" style="margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.45;">Hover over any collaborator or institution chip below to view their detailed profile, location, and research area.</p>
                    </div>
                </div>"""

if target_str in content:
    content = content.replace(target_str, "")
    print("Successfully removed collab-preview-box cleanly from index.html")
else:
    print("Error: Could not find exact collab-preview-box string in index.html")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
