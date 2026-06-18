import re

file_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Angappa Gunasekaran Collaborator Chip
old_angappa = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. Angappa Gunasekaran</span>
                            <div class="collab-tooltip">
                                <strong>Dr. Angappa Gunasekaran</strong>
                                <p>Professor, California State University, Bakersfield, USA</p>
                                <span class="tooltip-badge">Area: Lean Manufacturing & BI</span>
                            </div>
                        </div>"""

new_angappa = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. Angappa Gunasekaran</span>
                            <div class="collab-tooltip">
                                <strong>Dr. Angappa Gunasekaran</strong>
                                <p>Professor of Supply Chain Management, Pennsylvania State University, Harrisburg, USA</p>
                                <span class="tooltip-badge">Area: Lean Manufacturing & BI</span>
                            </div>
                        </div>"""

# 2. Update K.V. Shriram Collaborator Chip
old_shriram = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. K.V. Shriram</span>
                            <div class="collab-tooltip">
                                <strong>Dr. K.V. Shriram</strong>
                                <p>Associate Professor, Amrita Vishwa Vidyapeetham</p>
                                <span class="tooltip-badge">Area: Blockchain & Job Shop Scheduling</span>
                            </div>
                        </div>"""

new_shriram = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. K.V. Shriram</span>
                            <div class="collab-tooltip">
                                <strong>Dr. K.V. Shriram</strong>
                                <p>Principal Consultant, Huawei Technologies, India (Ex-Amrita School of Engineering)</p>
                                <span class="tooltip-badge">Area: Blockchain & Job Shop Scheduling</span>
                            </div>
                        </div>"""

# 3. Update Vidyadhar Gedam Collaborator Chip
old_gedam = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. Vidyadhar V. Gedam</span>
                            <div class="collab-tooltip">
                                <strong>Dr. Vidyadhar V. Gedam</strong>
                                <p>Researcher, NITIE, Mumbai, India</p>
                                <span class="tooltip-badge">Area: Closed-Loop Supply Chain</span>
                            </div>
                        </div>"""

new_gedam = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-user-circle"></i>
                            <span>Dr. Vidyadhar V. Gedam</span>
                            <div class="collab-tooltip">
                                <strong>Dr. Vidyadhar V. Gedam</strong>
                                <p>Assistant Professor, Indian Institute of Management (IIM) Mumbai, India</p>
                                <span class="tooltip-badge">Area: Closed-Loop Supply Chain</span>
                            </div>
                        </div>"""

# 4. Update California State University Institution Chip
old_csu = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-university"></i>
                            <span>California State University, Bakersfield, USA</span>
                            <div class="collab-tooltip">
                                <strong>California State University</strong>
                                <p>Bakersfield, California, USA</p>
                                <span class="tooltip-badge">Key Co-author: Dr. Angappa Gunasekaran</span>
                            </div>
                        </div>"""

new_csu = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-university"></i>
                            <span>Pennsylvania State University, Harrisburg, USA</span>
                            <div class="collab-tooltip">
                                <strong>Pennsylvania State University</strong>
                                <p>Harrisburg, Pennsylvania, USA</p>
                                <span class="tooltip-badge">Key Co-author: Dr. Angappa Gunasekaran</span>
                            </div>
                        </div>"""

# 5. Update NITIE Institution Chip
old_nitie = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-university"></i>
                            <span>NITIE, Mumbai, India</span>
                            <div class="collab-tooltip">
                                <strong>National Institute of Industrial Engineering</strong>
                                <p>Mumbai, Maharashtra, India</p>
                                <span class="tooltip-badge">Key Co-author: Dr. Vidyadhar V. Gedam</span>
                            </div>
                        </div>"""

new_nitie = """                        <div class="collab-chip hover-lift">
                            <i class="fas fa-university"></i>
                            <span>IIM Mumbai (Ex-NITIE), India</span>
                            <div class="collab-tooltip">
                                <strong>Indian Institute of Management Mumbai</strong>
                                <p>Mumbai, Maharashtra, India</p>
                                <span class="tooltip-badge">Key Co-author: Dr. Vidyadhar V. Gedam</span>
                            </div>
                        </div>"""

# Apply replacements
replacements = [
    (old_angappa, new_angappa, "Angappa Collaborator"),
    (old_shriram, new_shriram, "Shriram Collaborator"),
    (old_gedam, new_gedam, "Gedam Collaborator"),
    (old_csu, new_csu, "Penn State Institution"),
    (old_nitie, new_nitie, "IIM Mumbai Institution")
]

for old_str, new_str, label in replacements:
    if old_str in content:
        content = content.replace(old_str, new_str)
        print(f"Successfully replaced {label}")
    else:
        # Try normalizing whitespace to ensure match
        print(f"Warning: Exact string for {label} not found, trying normalized search...")
        # Match using normalized spacing
        pattern = re.escape(old_str.strip()).replace(r'\ ', r'\s+')
        match = re.search(pattern, content)
        if match:
            content = content[:match.start()] + new_str + content[match.end():]
            print(f"Successfully replaced {label} via regex normalization")
        else:
            print(f"Error: Could not find match for {label}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
