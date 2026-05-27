import re

html_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\index.html"
css_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\css\style.css"
js_path = r"C:\Users\narassima.s\.gemini\antigravity\scratch\academic_website\js\script.js"

# 1. Update index.html to remove the static Preview Box
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Locate and remove collab-preview-box block
preview_box_pattern = """\s*<!-- Premium Interactive Details Preview Box -->\s*<div id="collab-preview-box" style="[^"]+">.*?</div>"""
html_content = re.sub(preview_box_pattern, "", html_content, flags=re.DOTALL)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)
print("Successfully removed collab-preview-box from index.html")


# 2. Update css/style.css to style the new body floating tooltip
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

# Locate old hidden tooltip design and append floating window popup style
old_tooltip_style = """/* Tooltip design - hidden for absolute rendering to prevent overflow clipping */
.collab-chip .collab-tooltip {
    display: none;
}"""

new_tooltip_style = """/* Tooltip design - hidden for absolute rendering to prevent overflow clipping */
.collab-chip .collab-tooltip {
    display: none;
}

/* Premium Floating Body Tooltip */
#collab-floating-tooltip {
    position: fixed;
    z-index: 99999;
    pointer-events: none;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(10, 102, 194, 0.25);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
    box-shadow: var(--shadow-lg), 0 10px 30px rgba(0, 0, 0, 0.15);
    width: 270px;
    font-family: var(--font-main);
    color: var(--text-primary);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s ease;
    line-height: 1.4;
    font-size: 0.8rem;
}

#collab-floating-tooltip strong {
    display: block;
    color: var(--primary-color);
    margin-bottom: 0.25rem;
    font-size: 0.88rem;
    font-weight: 700;
}

#collab-floating-tooltip p {
    margin: 0;
    color: var(--text-secondary);
}

#collab-floating-tooltip .tooltip-badge {
    display: inline-block;
    margin-top: 0.4rem;
    padding: 0.15rem 0.4rem;
    background: rgba(10, 102, 194, 0.08);
    color: var(--primary-color);
    border-radius: 4px;
    font-size: 0.72rem;
    font-weight: 700;
}

/* Dark theme support for floating tooltip */
body.dark-theme #collab-floating-tooltip {
    background: rgba(30, 41, 59, 0.96);
    border-color: rgba(255, 255, 255, 0.15);
    color: #f1f5f9;
}

body.dark-theme #collab-floating-tooltip strong {
    color: #38bdf8;
}

body.dark-theme #collab-floating-tooltip p {
    color: #cbd5e1;
}

body.dark-theme #collab-floating-tooltip .tooltip-badge {
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
}"""

if old_tooltip_style in css_content:
    css_content = css_content.replace(old_tooltip_style, new_tooltip_style)
    print("Successfully added floating tooltip styles in css/style.css")
else:
    # Try normalized spacing
    pattern = re.escape(old_tooltip_style.strip()).replace(r'\ ', r'\s+')
    match = re.search(pattern, css_content)
    if match:
        css_content = css_content[:match.start()] + new_tooltip_style + css_content[match.end():]
        print("Successfully added floating tooltip styles via regex in css/style.css")
    else:
        print("Error: Could not update css/style.css with floating styles")

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_content)


# 3. Update js/script.js to create the floating tooltip element and position it dynamically on mouse move
with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

old_js_switcher = """    // ── Research Collaborators Tab Switcher & Dynamic Preview Box ──────
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

new_js_switcher = """    // ── Research Collaborators Tab Switcher & Dynamic Floating Tooltip ──
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

        // ── Dynamic Floating Tooltip positioning on Document Body ──
        let floatingTooltip = document.getElementById('collab-floating-tooltip');
        if (!floatingTooltip) {
            floatingTooltip = document.createElement('div');
            floatingTooltip.id = 'collab-floating-tooltip';
            document.body.appendChild(floatingTooltip);
        }

        const chips = document.querySelectorAll('.collab-chip');
        chips.forEach(chip => {
            const tooltipSource = chip.querySelector('.collab-tooltip');
            if (!tooltipSource) return;

            chip.addEventListener('mouseenter', () => {
                floatingTooltip.innerHTML = tooltipSource.innerHTML;
                floatingTooltip.style.visibility = 'visible';
                floatingTooltip.style.opacity = '1';
            });

            chip.addEventListener('mousemove', (e) => {
                // Get viewport dimensions
                const tooltipWidth = 270;
                const tooltipHeight = floatingTooltip.offsetHeight || 80;
                
                // Position offset
                let left = e.clientX + 15;
                let top = e.clientY + 15;
                
                // Keep tooltip inside horizontal viewport boundaries
                if (left + tooltipWidth > window.innerWidth) {
                    left = e.clientX - tooltipWidth - 15;
                }
                
                // Keep tooltip inside vertical viewport boundaries
                if (top + tooltipHeight > window.innerHeight) {
                    top = e.clientY - tooltipHeight - 15;
                }
                
                floatingTooltip.style.left = left + 'px';
                floatingTooltip.style.top = top + 'px';
            });

            chip.addEventListener('mouseleave', () => {
                floatingTooltip.style.opacity = '0';
                floatingTooltip.style.visibility = 'hidden';
            });
        });
    };

    // Run collaborators switcher initialization
    initCollaboratorsTabs();"""

if old_js_switcher in js_content:
    js_content = js_content.replace(old_js_switcher, new_js_switcher)
    print("Successfully updated js/script.js for floating body tooltip")
else:
    print("Error: Old JS Switcher block not found!")

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js_content)
