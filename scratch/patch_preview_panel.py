import re

html_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\index.html"
css_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\css\style.css"
js_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\js\script.js"

# 1. Update index.html to insert the Preview Box right below the description and before the tabs
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

old_desc = '<p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0 0 1.5rem; line-height: 1.5;">Dr. Narassima actively collaborates with a distinguished global network of research scholars and world-class academic institutions. Explore notable co-authors and institutional partnerships by toggling the sub-tabs below. Hover over any chip to view collaboration details.</p>'

new_desc_with_preview = old_desc + """

                <!-- Premium Interactive Details Preview Box -->
                <div id="collab-preview-box" style="background: rgba(10, 102, 194, 0.04); border: 1px solid rgba(10, 102, 194, 0.15); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem; min-height: 85px; display: flex; align-items: center; gap: 1rem; transition: all 0.3s ease;">
                    <div style="background: #e8f4fd; color: var(--primary-color); width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.3rem;">
                        <i class="fas fa-info-circle" id="collab-preview-icon" style="transition: all 0.2s;"></i>
                    </div>
                    <div style="flex-grow: 1;">
                        <strong id="collab-preview-title" style="display: block; color: var(--primary-color); font-size: 1rem; margin-bottom: 0.25rem; font-weight: 700;">Collaboration Highlights</strong>
                        <p id="collab-preview-desc" style="margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.45;">Hover over any collaborator or institution chip below to view their detailed profile, location, and research area.</p>
                    </div>
                </div>"""

if old_desc in html_content:
    html_content = html_content.replace(old_desc, new_desc_with_preview)
    print("Successfully added Collaborations Preview Box in index.html")
else:
    print("Error: Description block not found in index.html!")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)


# 2. Update css/style.css to hide the old absolute popups (display: none)
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

# Locate .collab-chip .collab-tooltip
old_tooltip_style = """/* Tooltip design */
.collab-chip .collab-tooltip {
    visibility: hidden;
    width: 260px;
    background-color: var(--surface-color);
    color: var(--text-primary);
    text-align: left;
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
    position: absolute;
    z-index: 100;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    box-shadow: var(--shadow-lg), 0 8px 24px rgba(0, 0, 0, 0.12);
    border: 1px solid var(--border-color);
    font-size: 0.8rem;
    line-height: 1.4;
    pointer-events: none;
    white-space: normal;
}

.collab-chip:hover .collab-tooltip {
    visibility: visible;
    opacity: 1;
    transform: translateX(-50%) translateY(-5px);
}"""

new_tooltip_style = """/* Tooltip design - hidden for absolute rendering to prevent overflow clipping */
.collab-chip .collab-tooltip {
    display: none;
}"""

if old_tooltip_style in css_content:
    css_content = css_content.replace(old_tooltip_style, new_tooltip_style)
    print("Successfully hid absolute tooltips in css/style.css")
else:
    print("Warning: Old tooltip CSS block not found! Trying normalized search...")
    # Clean whitespace and try to find
    pattern = re.escape(old_tooltip_style.strip()).replace(r'\ ', r'\s+')
    match = re.search(pattern, css_content)
    if match:
        css_content = css_content[:match.start()] + new_tooltip_style + css_content[match.end():]
        print("Successfully hid absolute tooltips via regex in css/style.css")
    else:
        print("Error: Could not hide tooltips in css/style.css")

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_content)


# 3. Update js/script.js to handle hover updates dynamically
with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

old_js_switcher = """    // ── Research Collaborators Tab Switcher ───────────────────────────
    const initCollaboratorsTabs = () => {
        const btnNames = document.getElementById('btn-collab-names');
        const btnInsts = document.getElementById('btn-collab-institutions');
        const tabNames = document.getElementById('collab-tab-names');
        const tabInsts = document.getElementById('collab-tab-institutions');

        if (!btnNames || !btnInsts || !tabNames || !tabInsts) return;

        btnNames.addEventListener('click', () => {
            btnNames.classList.add('active');
            btnInsts.classList.remove('active');
            tabNames.classList.add('active');
            tabInsts.classList.remove('active');
        });

        btnInsts.addEventListener('click', () => {
            btnInsts.classList.add('active');
            btnNames.classList.remove('active');
            tabInsts.classList.add('active');
            tabNames.classList.remove('active');
        });
    };

    // Run collaborators switcher initialization
    initCollaboratorsTabs();"""

new_js_switcher = """    // ── Research Collaborators Tab Switcher & Dynamic Preview Box ──────
    const initCollaboratorsTabs = () => {
        const btnNames = document.getElementById('btn-collab-names');
        const btnInsts = document.getElementById('btn-collab-institutions');
        const tabNames = document.getElementById('collab-tab-names');
        const tabInsts = document.getElementById('collab-tab-institutions');

        if (!btnNames || !btnInsts || !tabNames || !tabInsts) return;

        btnNames.addEventListener('click', () => {
            btnNames.classList.add('active');
            btnInsts.classList.remove('active');
            tabNames.classList.add('active');
            tabInsts.classList.remove('active');
            resetPreview();
        });

        btnInsts.addEventListener('click', () => {
            btnInsts.classList.add('active');
            btnNames.classList.remove('active');
            tabInsts.classList.add('active');
            tabNames.classList.remove('active');
            resetPreview();
        });

        // Dynamic Hover Preview Logic
        const previewBox = document.getElementById('collab-preview-box');
        const previewTitle = document.getElementById('collab-preview-title');
        const previewDesc = document.getElementById('collab-preview-desc');
        const previewIcon = document.getElementById('collab-preview-icon');

        const defaultTitle = "Collaboration Highlights";
        const defaultDesc = "Hover over any collaborator or institution chip below to view their detailed profile, location, and research area.";
        const defaultIconClass = "fas fa-info-circle";

        const resetPreview = () => {
            if (previewTitle) previewTitle.textContent = defaultTitle;
            if (previewDesc) previewDesc.textContent = defaultDesc;
            if (previewIcon) {
                previewIcon.className = defaultIconClass;
                previewIcon.style.color = "var(--primary-color)";
            }
            if (previewBox) previewBox.style.background = "rgba(10, 102, 194, 0.04)";
        };

        const setupHoverListeners = () => {
            const chips = document.querySelectorAll('.collab-chip');
            chips.forEach(chip => {
                const tooltip = chip.querySelector('.collab-tooltip');
                if (!tooltip) return;

                chip.addEventListener('mouseenter', () => {
                    const titleText = tooltip.querySelector('strong') ? tooltip.querySelector('strong').textContent : "";
                    const descText = tooltip.querySelector('p') ? tooltip.querySelector('p').textContent : "";
                    const badge = tooltip.querySelector('.tooltip-badge');
                    const badgeText = badge ? badge.textContent : "";
                    
                    if (previewTitle) previewTitle.textContent = titleText;
                    if (previewDesc) {
                        previewDesc.innerHTML = `${descText}${badgeText ? ` <br><span style="display:inline-block; margin-top:0.4rem; font-weight:700; color:var(--primary-color); font-size:0.8rem; background:rgba(10, 102, 194, 0.08); padding: 0.15rem 0.4rem; border-radius: 4px;">${badgeText}</span>` : ""}`;
                    }
                    
                    if (previewIcon) {
                        if (chip.querySelector('.fa-university')) {
                            previewIcon.className = "fas fa-university";
                            previewIcon.style.color = "#137333";
                            if (previewBox) previewBox.style.background = "rgba(19, 115, 51, 0.03)";
                        } else {
                            previewIcon.className = "fas fa-user-circle";
                            previewIcon.style.color = "var(--primary-color)";
                            if (previewBox) previewBox.style.background = "rgba(10, 102, 194, 0.06)";
                        }
                    }
                });

                chip.addEventListener('mouseleave', resetPreview);
            });
        };

        setupHoverListeners();
    };

    // Run collaborators switcher initialization
    initCollaboratorsTabs();"""

if old_js_switcher in js_content:
    js_content = js_content.replace(old_js_switcher, new_js_switcher)
    print("Successfully updated js/script.js for preview hover box")
else:
    print("Error: Old JS Switcher block not found!")

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js_content)
