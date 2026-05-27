import re

file_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Anbuudayasankar Collaborator Chip
old_anbu = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. S.P. Anbuudayasankar</span>
                            <div class="collab-tooltip">
                                <strong>Dr. S.P. Anbuudayasankar</strong>
                                <p>Professor, Amrita School of Engineering, Coimbatore, India</p>
                                <span class="tooltip-badge">Area: Operations & Supply Chain</span>
                            </div>
                        </div>"""

new_anbu = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. S.P. Anbuudayasankar</span>
                            <div class="collab-tooltip">
                                <strong>Dr. S.P. Anbuudayasankar</strong>
                                <p>Professor, Dept. of Mechanical Engineering, Guru Ghasidas Vishwavidyalaya (Central University), Bilaspur, India</p>
                                <span class="tooltip-badge">Area: Operations & Supply Chain</span>
                            </div>
                        </div>"""

# 2. Update S.K. Vasudevan Collaborator Chip
old_vasu = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. S.K. Vasudevan</span>
                            <div class="collab-tooltip">
                                <strong>Dr. S.K. Vasudevan</strong>
                                <p>Academic & Consultant, Amrita Vishwa Vidyapeetham</p>
                                <span class="tooltip-badge">Area: Wearable Tech & Retail DL Models</span>
                            </div>
                        </div>"""

new_vasu = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. S.K. Vasudevan</span>
                            <div class="collab-tooltip">
                                <strong>Dr. S.K. Vasudevan</strong>
                                <p>Senior Manager - Industrial AI, Accenture, India (Ex-Intel & Amrita)</p>
                                <span class="tooltip-badge">Area: Wearable Tech & Retail DL Models</span>
                            </div>
                        </div>"""

# Apply replacements
replacements = [
    (old_anbu, new_anbu, "Anbuudayasankar Collaborator"),
    (old_vasu, new_vasu, "SK Vasudevan Collaborator")
]

for old_str, new_str, label in replacements:
    if old_str in content:
        content = content.replace(old_str, new_str)
        print(f"Successfully replaced {label}")
    else:
        # Try normalized spacing
        print(f"Warning: Exact string for {label} not found, trying normalized search...")
        pattern = re.escape(old_str.strip()).replace(r'\ ', r'\s+')
        match = re.search(pattern, content)
        if match:
            content = content[:match.start()] + new_str + content[match.end():]
            print(f"Successfully replaced {label} via regex normalization")
        else:
            print(f"Error: Could not find match for {label}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
