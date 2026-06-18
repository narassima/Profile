document.addEventListener('DOMContentLoaded', () => {

    // ── Mobile Menu Toggle ──────────────────────────────────────
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksContainer.classList.toggle('show');
        });
    }

    // ── Page Navigation ─────────────────────────────────────────
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            if (targetId) {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                sections.forEach(sec => sec.classList.remove('active-section'));
                const target = document.getElementById(targetId);
                if (target) target.classList.add('active-section');
                if (navLinksContainer) navLinksContainer.classList.remove('show');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // ── Publications Inner Tabs ──────────────────────────────────
    const pubTabs = document.querySelectorAll('.tab-btn');
    const pubContents = document.querySelectorAll('.tab-content');

    pubTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetContent = tab.getAttribute('data-tab');
            pubTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            pubContents.forEach(c => c.classList.remove('active'));
            const tc = document.getElementById(`tab-${targetContent}`);
            if (tc) tc.classList.add('active');
        });
    });

    // ── Helper: render one publication in APA style ──────────────
    const renderPublication = (pub, index) => {
        const url = (pub.url || '').trim();
        const authors = (pub.authors || '').trim();
        const year    = (pub.year    || '').trim();
        const title   = (pub.title   || '').trim();
        const journal = (pub.journal || '').trim();
        const journalFormatted = journal.endsWith('.') ? journal : journal + '.';
        
        const hasValidUrl = url.startsWith('http');
        const titleHtml = hasValidUrl 
            ? `<a href="${url}" target="_blank" class="pub-link">${title}</a>` 
            : `<strong class="pub-title-plain" style="color: var(--text-primary); font-weight: 600;">${title}</strong>`;

        return `
            <div class="publication-item hover-lift">
                <p class="pub-apa">
                    <strong>${index}.</strong> ${authors} (${year}).
                    ${titleHtml}.
                    <i>${journalFormatted}</i>
                </p>
            </div>`;
    };

    // ── Publications Search, Filtering & Render ──────────────────
    // publications is an object: { journals: [], conferences: [], books: [], bookChapters: [], copyrights: [] }
    const pubs = portfolioData.publications || {};
    
    // Hold raw data globally for search filter access
    const rawJournals = Array.isArray(pubs.journals) ? pubs.journals : [];
    const sortedJournals = [...rawJournals].sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    const rawConfs = Array.isArray(pubs.conferences) ? pubs.conferences : [];
    const rawBooks = Array.isArray(pubs.books) ? pubs.books : [];
    const rawChapters = Array.isArray(pubs.bookChapters) ? pubs.bookChapters : [];
    const rawCopyrights = Array.isArray(pubs.copyrights) ? pubs.copyrights : [];

    const allPublications = [
        ...rawJournals,
        ...rawConfs,
        ...rawBooks,
        ...rawChapters,
        ...rawCopyrights
    ];

    const journalsList = document.getElementById('journal-list');
    const journalPagination = document.getElementById('journal-pagination');
    const conferenceList = document.getElementById('conference-list');
    const bookList = document.getElementById('book-list');
    const bookChaptersList = document.getElementById('bookChapters-list');
    const copyrightsList = document.getElementById('copyrights-list');
    
    const pubSearch = document.getElementById('pub-search');
    const pubSearchClear = document.getElementById('pub-search-clear');

    if (journalPagination) journalPagination.style.display = 'none';

    // Core Dynamic Filter and Rendering function
    const filterAndRenderPublications = () => {
        const query = (pubSearch ? pubSearch.value : '').toLowerCase().trim();
        
        if (pubSearchClear) {
            pubSearchClear.style.display = query.length > 0 ? 'block' : 'none';
        }

        const matchesQuery = (pub) => {
            if (query.startsWith('year:')) {
                const targetYear = query.replace('year:', '').trim();
                return String(pub.year || '') === targetYear;
            }
            return (pub.title || '').toLowerCase().includes(query) ||
                   (pub.authors || '').toLowerCase().includes(query) ||
                   (pub.journal || '').toLowerCase().includes(query) ||
                   String(pub.year || '').toLowerCase().includes(query);
        };

        // 1. Journals tab
        if (journalsList) {
            const filtered = sortedJournals.filter(matchesQuery);
            if (filtered.length === 0) {
                journalsList.innerHTML = '<p style="color:var(--text-secondary);padding:3rem;text-align:center;font-style:italic;"><i class="fas fa-search-minus" style="font-size:1.8rem;display:block;margin-bottom:0.75rem;color:var(--primary-color);"></i> No journals matching your search.</p>';
            } else {
                journalsList.innerHTML = '';
                filtered.forEach((pub, i) => { journalsList.innerHTML += renderPublication(pub, i + 1); });
            }
        }

        // 2. Conferences tab
        if (conferenceList) {
            const filtered = rawConfs.filter(matchesQuery);
            if (filtered.length === 0) {
                conferenceList.innerHTML = '<p style="color:var(--text-secondary);padding:3rem;text-align:center;font-style:italic;"><i class="fas fa-search-minus" style="font-size:1.8rem;display:block;margin-bottom:0.75rem;color:var(--primary-color);"></i> No conferences matching your search.</p>';
            } else {
                conferenceList.innerHTML = '';
                filtered.forEach((pub, i) => { conferenceList.innerHTML += renderPublication(pub, i + 1); });
            }
        }

        // 3. Books tab
        if (bookList) {
            const filtered = rawBooks.filter(matchesQuery);
            if (filtered.length === 0) {
                bookList.innerHTML = '<p style="color:var(--text-secondary);padding:3rem;text-align:center;font-style:italic;"><i class="fas fa-search-minus" style="font-size:1.8rem;display:block;margin-bottom:0.75rem;color:var(--primary-color);"></i> No books matching your search.</p>';
            } else {
                bookList.innerHTML = '';
                filtered.forEach((pub, i) => { bookList.innerHTML += renderPublication(pub, i + 1); });
            }
        }

        // 4. Book Chapters tab
        if (bookChaptersList) {
            const filtered = rawChapters.filter(matchesQuery);
            if (filtered.length === 0) {
                bookChaptersList.innerHTML = '<p style="color:var(--text-secondary);padding:3rem;text-align:center;font-style:italic;"><i class="fas fa-search-minus" style="font-size:1.8rem;display:block;margin-bottom:0.75rem;color:var(--primary-color);"></i> No book chapters matching your search.</p>';
            } else {
                bookChaptersList.innerHTML = '';
                filtered.forEach((pub, i) => { bookChaptersList.innerHTML += renderPublication(pub, i + 1); });
            }
        }

        // 5. Copyrights tab
        if (copyrightsList) {
            const filtered = rawCopyrights.filter(matchesQuery);
            if (filtered.length === 0) {
                copyrightsList.innerHTML = '<p style="color:var(--text-secondary);padding:3rem;text-align:center;font-style:italic;"><i class="fas fa-search-minus" style="font-size:1.8rem;display:block;margin-bottom:0.75rem;color:var(--primary-color);"></i> No copyrights matching your search.</p>';
            } else {
                copyrightsList.innerHTML = '';
                filtered.forEach((pub, i) => { copyrightsList.innerHTML += renderPublication(pub, i + 1); });
            }
        }
    };

    // Initial load
    filterAndRenderPublications();

    // Hook search event listeners
    if (pubSearch) {
        pubSearch.addEventListener('input', filterAndRenderPublications);
    }
    if (pubSearchClear) {
        pubSearchClear.addEventListener('click', () => {
            pubSearch.value = '';
            filterAndRenderPublications();
            pubSearch.focus();
        });
    }

    // ── Render Course Outlines (Teaching tab) ────────────────────
    const courseTopicsList = document.getElementById('course-topics-list');
    if (courseTopicsList && portfolioData.courseOutlines) {
        portfolioData.courseOutlines.forEach(outline => {
            const topicsHtml = (outline.topics || []).map(t => `<li>${t}</li>`).join('');
            const descHtml = outline.description
                ? `<p class="course-topic-desc" style="font-style:italic;color:var(--text-secondary);margin-bottom:0.75rem;font-size:0.95rem;">${outline.description}</p>`
                : '';
            courseTopicsList.innerHTML += `
                <div class="course-topic-card">
                    <h4>${outline.course}</h4>
                    ${descHtml}
                    <ul class="course-topics-list">${topicsHtml}</ul>
                </div>`;
        });
    }

    // ── Render Teaching Courses Table & Dropdown Filter ──────────
    const coursesTable = document.querySelector('#courses-table tbody');
    const courseFilter = document.getElementById('course-filter');
    if (coursesTable && portfolioData.teaching) {
        const groupedCourses = {};
        portfolioData.teaching.forEach(course => {
            if (!groupedCourses[course.course]) groupedCourses[course.course] = [];
            groupedCourses[course.course].push(course);
        });

        // 1. Populate Dropdown Select Menu
        if (courseFilter) {
            Object.keys(groupedCourses).sort().forEach(courseName => {
                const opt = document.createElement('option');
                opt.value = courseName;
                opt.textContent = courseName;
                courseFilter.appendChild(opt);
            });
        }

        // 2. Render Function
        const renderCoursesTable = (selectedCourse) => {
            coursesTable.innerHTML = '';
            
            if (selectedCourse === 'select') {
                coursesTable.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; color: var(--text-secondary); font-style: italic; padding: 2rem; font-size: 0.95rem;">
                            <i class="fas fa-hand-pointer" style="margin-right: 0.5rem; color: var(--primary-color);"></i> Please select a course from the dropdown menu to view term feedback scores.
                        </td>
                    </tr>`;
                return;
            }
            
            Object.keys(groupedCourses).forEach(courseName => {
                if (selectedCourse !== 'all' && courseName !== selectedCourse) {
                    return; // Skip if filter is set and doesn't match
                }
                
                const feedbacks = groupedCourses[courseName];
                feedbacks.forEach((course, index) => {
                    if (index === 0) {
                        coursesTable.innerHTML += `
                            <tr>
                                <td rowspan="${feedbacks.length}"><strong>${courseName}</strong></td>
                                <td>${course.term}</td>
                                <td><span class="score-badge">${course.score}</span></td>
                            </tr>`;
                    } else {
                        coursesTable.innerHTML += `
                            <tr>
                                <td>${course.term}</td>
                                <td><span class="score-badge">${course.score}</span></td>
                            </tr>`;
                    }
                });
            });
        };

        // Initial Render
        renderCoursesTable('select');

        // Dropdown Event Listener
        if (courseFilter) {
            courseFilter.addEventListener('change', (e) => {
                renderCoursesTable(e.target.value);
            });
        }
    }

    // ── Render Word Cloud ────────────────────────────────────────
    const wordCloud = document.getElementById('word-cloud');
    if (wordCloud && portfolioData.feedbackWords) {
        const maxCount = Math.max(...portfolioData.feedbackWords.map(w => w.count));
        const minCount = Math.min(...portfolioData.feedbackWords.map(w => w.count));
        const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#202124'];
        portfolioData.feedbackWords.forEach(wordObj => {
            const scale = (wordObj.count - minCount) / (maxCount - minCount || 1);
            const fontSize = (scale * 1.6) + 0.9;
            const span = document.createElement('span');
            span.className = 'word-tag';
            span.textContent = wordObj.text;
            span.style.fontSize = `${fontSize}rem`;
            span.style.color = colors[Math.floor(Math.random() * colors.length)];
            span.style.opacity = Math.random() * 0.3 + 0.7;
            span.style.animationDelay = `${Math.random() * 0.8}s`;
            wordCloud.appendChild(span);
        });
    }

    // ── Render Testimonials ──────────────────────────────────────
    const testimonialsContainer = document.getElementById('testimonials-container');
    if (testimonialsContainer && portfolioData.testimonials) {
        portfolioData.testimonials.forEach(test => {
            testimonialsContainer.innerHTML += `
                <div class="testimonial-card">
                    <p class="testimonial-text">"${test.text}"</p>
                    <span class="testimonial-author">— ${test.author}</span>
                </div>`;
        });
    }

    // ── Render Projects Mentored (with Search) ───────────────────
    const projectsContainer = document.getElementById('projects-container');
    const mentorshipSearch = document.getElementById('mentorship-search');
    const mentorshipSearchClear = document.getElementById('mentorship-search-clear');
    const rawEmpiricalStudies = (portfolioData.empiricalStudies || []);

    const filterAndRenderMentorship = () => {
        if (!projectsContainer) return;
        const query = (mentorshipSearch ? mentorshipSearch.value : '').toLowerCase().trim();

        if (mentorshipSearchClear) {
            mentorshipSearchClear.style.display = query.length > 0 ? 'block' : 'none';
        }

        projectsContainer.innerHTML = '';
        let anyVisible = false;

        rawEmpiricalStudies.forEach(batchData => {
            const batchMatches = (batchData.batch || '').toLowerCase().includes(query);
            const filteredProjects = (batchData.projects || []).filter(p =>
                batchMatches || p.toLowerCase().includes(query)
            );

            if (filteredProjects.length === 0) return;
            anyVisible = true;

            const projectsHtml = filteredProjects
                .map(p => `<li style="margin-bottom:0.5rem;"><i class="fas fa-check-circle" style="color:var(--primary-color);margin-right:0.5rem;"></i>${p}</li>`)
                .join('');
            projectsContainer.innerHTML += `
                <div class="glass-card content-card" style="margin-bottom:2rem;">
                    <div class="card-header">
                        <i class="fas fa-users"></i>
                        <h3>Batch: ${batchData.batch}</h3>
                    </div>
                    <ul style="list-style:none;padding-left:1rem;">${projectsHtml}</ul>
                </div>`;
        });

        if (!anyVisible) {
            projectsContainer.innerHTML = '<p style="color:var(--text-secondary);padding:3rem;text-align:center;font-style:italic;"><i class="fas fa-search-minus" style="font-size:1.8rem;display:block;margin-bottom:0.75rem;color:var(--primary-color);"></i> No mentorship projects matching your search.</p>';
        }
    };

    filterAndRenderMentorship();

    if (mentorshipSearch) {
        mentorshipSearch.addEventListener('input', filterAndRenderMentorship);
    }
    if (mentorshipSearchClear) {
        mentorshipSearchClear.addEventListener('click', () => {
            mentorshipSearch.value = '';
            filterAndRenderMentorship();
            mentorshipSearch.focus();
        });
    }


    // ── Render Experience Timeline (Horizontal Roadmap) ──────────
    const expTimeline = document.getElementById('experience-timeline');
    if (expTimeline && portfolioData.experience) {
        expTimeline.className = 'horizontal-roadmap-container';
        expTimeline.innerHTML = '';
        const newestFirstExp = [...portfolioData.experience];
        newestFirstExp.forEach(exp => {
            expTimeline.innerHTML += `
                <div class="roadmap-item">
                    <div class="roadmap-dot"></div>
                    <div class="roadmap-date">${exp.duration}</div>
                    <div class="roadmap-card">
                        <div class="roadmap-title">${exp.title}</div>
                        <div class="roadmap-subtitle">${exp.organization}</div>
                        <div class="roadmap-desc">${exp.description}</div>
                    </div>
                </div>`;
        });
    }

    // ── Render Education Timeline ────────────────────────────────
    const eduTimeline = document.getElementById('education-timeline');
    if (eduTimeline && portfolioData.education) {
        portfolioData.education.forEach(edu => {
            eduTimeline.innerHTML += `
                <div class="timeline-item">
                    <div class="timeline-date">${edu.duration}</div>
                    <div class="timeline-title">${edu.degree}</div>
                    <div class="timeline-subtitle">${edu.institution}</div>
                    <div class="timeline-desc">${edu.details}</div>
                </div>`;
        });
    }

    // ── Render Certifications ────────────────────────────────────
    const certList = document.getElementById('certification-list');
    if (certList && portfolioData.certifications) {
        portfolioData.certifications.forEach(cert => {
            certList.innerHTML += `
                <li>
                    <i class="fas fa-award cert-icon"></i>
                    <div>
                        <strong>${cert.name}</strong>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">${cert.issuer}</div>
                    </div>
                </li>`;
        });
    }

    // ── Render Review & Editorial Roles ──────────────────────────
    const rolesGrid = document.getElementById('roles-grid');
    if (rolesGrid && portfolioData.roles) {
        // Group roles by name (role type)
        const groupedRoles = {};
        portfolioData.roles.forEach(role => {
            if (!groupedRoles[role.name]) {
                groupedRoles[role.name] = {
                    icon: role.icon,
                    details: []
                };
            }
            groupedRoles[role.name].details.push(role.detail);
        });

        rolesGrid.innerHTML = ''; // Clear original grid
        
        // Customize grid structure for lists
        rolesGrid.style.display = 'grid';
        rolesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
        rolesGrid.style.gap = '1.5rem';

        Object.keys(groupedRoles).forEach(roleName => {
            const group = groupedRoles[roleName];
            const listItems = group.details.map(detail => `
                <li style="margin-bottom: 0.6rem; display: flex; align-items: flex-start; gap: 0.6rem;">
                    <i class="fas fa-check-circle" style="font-size: 0.85rem; color: var(--primary-color); margin-top: 0.35rem; flex-shrink: 0;"></i>
                    <span style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">${detail}</span>
                </li>
            `).join('');

            rolesGrid.innerHTML += `
                <div class="glass-card role-list-card" style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: rgba(255, 255, 255, 0.45); box-shadow: var(--shadow-sm); display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; border-bottom: 1.5px solid rgba(26, 115, 232, 0.15); padding-bottom: 0.75rem;">
                        <i class="fas ${group.icon}" style="font-size: 1.3rem; color: var(--primary-color);"></i>
                        <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0;">${roleName}</h4>
                    </div>
                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column;">
                        ${listItems}
                    </ul>
                </div>`;
        });
    }

    // ── Render Academic Contributions ────────────────────────────
    const contributionsList = document.getElementById('contributions-list');
    if (contributionsList && portfolioData.contributions) {
        portfolioData.contributions.forEach(contrib => {
            contributionsList.innerHTML += `
                <div style="background: rgba(255, 255, 255, 0.6); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem 1.25rem; display: flex; align-items: flex-start; gap: 1rem; transition: var(--transition);" class="hover-lift">
                    <div style="background: #e8f4fd; color: var(--primary-color); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.1rem;">
                        <i class="fas ${contrib.icon}"></i>
                    </div>
                    <div>
                        <strong style="display: block; font-size: 0.95rem; color: var(--primary-color); margin-bottom: 0.25rem;">${contrib.type}</strong>
                        <p style="font-size: 0.9rem; color: var(--text-primary); margin: 0; line-height: 1.45;">${contrib.description}</p>
                    </div>
                </div>`;
        });
    }

    // ── Render Achievements & Awards ──────────────────────────────
    const achievementsList = document.getElementById('achievements-list');
    if (achievementsList && portfolioData.achievements) {
        portfolioData.achievements.forEach(ach => {
            achievementsList.innerHTML += `
                <li>
                    <i class="fas fa-trophy" style="color: #ffb300; font-size: 1.25rem; margin-top: 0.25rem;"></i>
                    <div>
                        <strong>${ach.name}</strong>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">${ach.issuer}</div>
                    </div>
                </li>`;
        });
    }



    // ── Image Lightbox ───────────────────────────────────────────
    const modal       = document.getElementById('image-lightbox');
    const modalImg    = document.getElementById('lightbox-img');
    const downloadBtn = document.getElementById('lightbox-download');
    const closeBtn    = document.querySelector('.lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item img');

    if (modal && modalImg && closeBtn && downloadBtn) {
        galleryItems.forEach(img => {
            img.addEventListener('click', function () {
                modal.style.display = 'block';
                modalImg.src = this.src;
                downloadBtn.href = this.src;
                downloadBtn.setAttribute('download', this.src.substring(this.src.lastIndexOf('/') + 1));
            });
        });
        closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }

    // ── Research Collaborators Tab Switcher & Dynamic Floating Tooltip ──
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
    initCollaboratorsTabs();

    // ── Count-Up Animation for Stats on Scroll ──────────────────
    const runCountUpAnimation = () => {
        const stats = document.querySelectorAll('.stat-number');
        if (stats.length === 0) return;
        
        const countUp = (el) => {
            const target = parseInt(el.getAttribute('data-target') || '0', 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 1500; // ms
            const startTime = performance.now();
            
            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out quad
                const easeProgress = progress * (2 - progress);
                const currentValue = Math.floor(easeProgress * target);
                
                if (target >= 1000) {
                    el.textContent = currentValue.toLocaleString() + suffix;
                } else {
                    el.textContent = currentValue + suffix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    if (target >= 1000) {
                        el.textContent = target.toLocaleString() + suffix;
                    } else {
                        el.textContent = target + suffix;
                    }
                }
            };
            
            requestAnimationFrame(updateCount);
        };
        
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    obs.unobserve(entry.target); // Run once
                }
            });
        }, { threshold: 0.1 });
        
        stats.forEach(stat => {
            const suffix = stat.getAttribute('data-suffix') || '';
            stat.textContent = '0' + suffix;
            observer.observe(stat);
        });
    };
    
    runCountUpAnimation();

    // ── Material You Theme Accent Picker (Custom Color Input) ─────
    const colorInput = document.getElementById('theme-color-input');
    if (colorInput) {
        const hexToRgb = (hex) => {
            let c = hex.substring(1);
            if (c.length === 3) {
                c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
            }
            let rgb = parseInt(c, 16);
            let r = (rgb >> 16) & 0xff;
            let g = (rgb >> 8) & 0xff;
            let b = rgb & 0xff;
            return `${r}, ${g}, ${b}`;
        };

        const darkenColor = (hex, percent) => {
            let num = parseInt(hex.replace("#",""), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) - amt,
            G = (num >> 8 & 0x00FF) - amt,
            B = (num & 0x0000FF) - amt;
            return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
        };

        const updateAccentColor = (colorHex) => {
            const primary = colorHex;
            const hover = darkenColor(colorHex, 15);
            const rgb = hexToRgb(colorHex);
            const hoverRgb = hexToRgb(hover);
            
            document.documentElement.style.setProperty('--primary-color', primary);
            document.documentElement.style.setProperty('--primary-hover', hover);
            document.documentElement.style.setProperty('--primary-rgb', rgb);
            document.documentElement.style.setProperty('--primary-hover-rgb', hoverRgb);
            document.documentElement.style.setProperty('--primary-light-bg', `rgba(${rgb}, 0.08)`);
            document.documentElement.style.setProperty('--primary-border', `rgba(${rgb}, 0.2)`);
            document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${primary}, ${hover})`);
            
            // Save state
            localStorage.setItem('theme-accent-color', primary);
            colorInput.value = primary;
        };

        colorInput.addEventListener('input', (e) => {
            updateAccentColor(e.target.value);
        });

        // Initialize from localStorage
        const savedAccent = localStorage.getItem('theme-accent-color') || '#1a73e8';
        updateAccentColor(savedAccent);
    }

    // ── Publications Timeline SVG Chart ──────────────────────────
    const chartContainer = document.getElementById('publication-chart-container');
    const resetChartFilterBtn = document.getElementById('reset-timeline-filter');
    
    if (chartContainer && allPublications.length > 0) {
        // Collect years from all publications
        const yearsMap = {};
        allPublications.forEach(pub => {
            if (pub.year) {
                yearsMap[pub.year] = (yearsMap[pub.year] || 0) + 1;
            }
        });
        
        // Sort years ascending
        const sortedYears = Object.keys(yearsMap).map(Number).sort((a,b) => a - b);
        const maxPubs = Math.max(...Object.values(yearsMap));
        
        if (sortedYears.length > 0) {
            let chartHtml = `<div class="timeline-chart-html" style="display: flex; align-items: flex-end; justify-content: space-between; height: 125px; padding: 20px 10px 25px 25px; border-bottom: 1.5px solid var(--border-color); border-left: 1.5px solid var(--border-color); position: relative; margin-top: 1rem; width: 100%;">`;
            
            sortedYears.forEach((year, index) => {
                const count = yearsMap[year];
                const percentHeight = Math.max(15, Math.floor((count / maxPubs) * 75));
                
                chartHtml += `
                    <div class="timeline-bar-group" data-year="${year}" style="display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; position: relative; cursor: pointer; padding: 0 4px;">
                        <!-- Count text -->
                        <span class="timeline-bar-count" style="font-family: var(--font-main); font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px; pointer-events: none; -webkit-font-smoothing: antialiased;">${count}</span>
                        <!-- Bar -->
                        <div class="timeline-bar" style="width: 100%; max-width: 32px; height: ${percentHeight}%; background: var(--primary-color); border-radius: 4px 4px 0 0; transition: var(--transition);" data-year="${year}"></div>
                        <!-- Year label -->
                        <span class="timeline-bar-year" style="position: absolute; bottom: -22px; font-family: var(--font-main); font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); pointer-events: none; -webkit-font-smoothing: antialiased;">${year}</span>
                    </div>
                `;
            });
            
            chartHtml += `</div>`;
            chartContainer.innerHTML = chartHtml;
            
            const barGroups = chartContainer.querySelectorAll('.timeline-bar-group');
            
            const filterPublicationsByYear = (year) => {
                barGroups.forEach(g => {
                    const bar = g.querySelector('.timeline-bar');
                    if (g.getAttribute('data-year') === String(year)) {
                        bar.classList.add('active-bar');
                    } else {
                        bar.classList.remove('active-bar');
                    }
                });
                
                if (resetChartFilterBtn) resetChartFilterBtn.style.display = 'inline-block';
                
                const pubSearchInput = document.getElementById('pub-search');
                if (pubSearchInput) {
                    pubSearchInput.value = `year: ${year}`;
                    pubSearchInput.dispatchEvent(new Event('input'));
                }
            };
            
            barGroups.forEach(g => {
                g.addEventListener('click', () => {
                    const year = g.getAttribute('data-year');
                    filterPublicationsByYear(year);
                });
            });
            
            if (resetChartFilterBtn) {
                resetChartFilterBtn.addEventListener('click', () => {
                    barGroups.forEach(g => {
                        const bar = g.querySelector('.timeline-bar');
                        bar.classList.remove('active-bar');
                    });
                    resetChartFilterBtn.style.display = 'none';
                    const pubSearchInput = document.getElementById('pub-search');
                    if (pubSearchInput) {
                        pubSearchInput.value = '';
                        pubSearchInput.dispatchEvent(new Event('input'));
                    }
                });
            }
        }
    }

    // ── Material Ink Ripple Effect ────────────────────────────────
    const applyRippleEffect = () => {
        const rippleTargets = document.querySelectorAll('.nav-link, .tab-btn, .collab-tab-btn, .color-dot, .contact-item, #view-cv-btn, #print-cv-btn, .page-btn');
        rippleTargets.forEach(el => {
            el.classList.add('ripple-effect');
            el.addEventListener('click', function(e) {
                const circle = document.createElement('span');
                circle.classList.add('ripple');
                
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                
                circle.style.width = circle.style.height = `${size}px`;
                
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                circle.style.left = `${x}px`;
                circle.style.top = `${y}px`;
                
                const oldRipples = this.querySelectorAll('.ripple');
                oldRipples.forEach(r => r.remove());
                
                this.appendChild(circle);
                
                setTimeout(() => circle.remove(), 500);
            });
        });
    };
    applyRippleEffect();

    // ── Dynamic CV Viewer Logic ──────────────────────────────────
    const viewCvBtn = document.getElementById('view-cv-btn');
    const cvModal = document.getElementById('cv-viewer-modal');
    const closeCvBtn = document.getElementById('close-cv-btn');
    const printCvBtn = document.getElementById('print-cv-btn');
    const cvContent = document.getElementById('cv-content-body');
    
    if (viewCvBtn && cvModal && closeCvBtn && printCvBtn && cvContent) {
        viewCvBtn.addEventListener('click', () => {
            let cvHtml = `
                <div style="font-family:'Outfit',sans-serif;color:#333;line-height:1.5;max-width:800px;margin:0 auto;">
                    <!-- HEADER SECTION -->
                    <div style="text-align:center;border-bottom:2px solid var(--primary-color);padding-bottom:1.5rem;margin-bottom:2rem;">
                        <h1 style="font-size:2.2rem;font-weight:800;color:#202124;margin:0 0 0.25rem 0;text-transform:uppercase;letter-spacing:0.5px;">Dr. Narassima M.S.</h1>
                        <p style="font-size:1.1rem;color:var(--primary-color);font-weight:700;margin:0 0 0.5rem 0;letter-spacing:0.25px;">Assistant Professor of Operations</p>
                        <p style="font-size:0.9rem;color:#5f6368;margin:0 0 0.75rem 0;font-weight:500;">Great Lakes Institute of Management, Chennai, India</p>
                        <p style="font-size:0.85rem;color:#5f6368;margin:0;display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap;font-weight:500;">
                            <span><i class="fas fa-envelope" style="color:var(--primary-color);"></i> msnarassima@gmail.com</span>
                            <span>|</span>
                            <span><i class="fab fa-linkedin" style="color:var(--primary-color);"></i> linkedin.com/in/narassima</span>
                            <span>|</span>
                            <span><i class="fas fa-graduation-cap" style="color:var(--primary-color);"></i> Scholar ID: RDFCAzYAAAAJ</span>
                        </p>
                    </div>

                    <!-- DOUBLE COLUMN LAYOUT -->
                    <div style="display:flex;flex-direction:column;gap:2rem;">
                        
                        <!-- EDUCATION -->
                        <div class="cv-section" style="margin-bottom:1rem;">
                            <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary-color);border-bottom:1.5px solid var(--border-color);padding-bottom:0.4rem;margin:0 0 1rem 0;text-transform:uppercase;letter-spacing:0.5px;">Education</h2>
                            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.75rem;">
                                ${(portfolioData.education || []).map(edu => `
                                    <li>
                                        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:0.95rem;color:#202124;">
                                            <span>${edu.degree}</span>
                                            <span>${edu.year || ''}</span>
                                        </div>
                                        <div style="font-size:0.88rem;color:#5f6368;font-weight:600;">${edu.institution}</div>
                                        ${edu.details ? `<div style="font-size:0.85rem;color:#5f6368;font-style:italic;margin-top:0.1rem;">${edu.details}</div>` : ''}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <!-- EXPERIENCE -->
                        <div class="cv-section" style="margin-bottom:1rem;">
                            <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary-color);border-bottom:1.5px solid var(--border-color);padding-bottom:0.4rem;margin:0 0 1rem 0;text-transform:uppercase;letter-spacing:0.5px;">Experience</h2>
                            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;">
                                ${(portfolioData.experience || []).map(exp => `
                                    <li>
                                        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:0.95rem;color:#202124;">
                                            <span>${exp.title}</span>
                                            <span>${exp.duration}</span>
                                        </div>
                                        <div style="font-size:0.88rem;color:#5f6368;font-weight:600;">${exp.company}</div>
                                        <p style="font-size:0.85rem;color:#5f6368;margin:0.25rem 0 0 0;text-align:justify;line-height:1.4;">${exp.description}</p>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <!-- PUBLICATIONS SUMMARY -->
                        <div class="cv-section" style="margin-bottom:1rem;">
                            <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary-color);border-bottom:1.5px solid var(--border-color);padding-bottom:0.4rem;margin:0 0 1rem 0;text-transform:uppercase;letter-spacing:0.5px;">Selected Publications</h2>
                            <ul style="list-style:decimal;padding-left:1.2rem;margin:0;display:flex;flex-direction:column;gap:0.75rem;font-size:0.85rem;color:#333;">
                                ${(allPublications || []).slice(0, 10).map(pub => `
                                    <li style="margin-bottom:0.25rem;text-align:justify;line-height:1.4;">
                                        <strong>${pub.title}</strong> (${pub.year}). 
                                        <span style="color:#5f6368;">${pub.authors}</span>. 
                                        ${pub.journal ? `<span style="font-style:italic;">Published in: ${pub.journal}</span>` : ''}
                                    </li>
                                `).join('')}
                            </ul>
                            ${allPublications && allPublications.length > 10 ? `
                                <p style="font-size:0.8rem;color:#5f6368;font-style:italic;margin-top:0.5rem;text-align:center;">And ${allPublications.length - 10} other publications listed on Google Scholar / website</p>
                            ` : ''}
                        </div>

                        <!-- CERTIFICATIONS -->
                        <div class="cv-section" style="margin-bottom:1rem;">
                            <h2 style="font-size:1.2rem;font-weight:700;color:var(--primary-color);border-bottom:1.5px solid var(--border-color);padding-bottom:0.4rem;margin:0 0 1rem 0;text-transform:uppercase;letter-spacing:0.5px;">Certifications</h2>
                            <ul style="list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(2, 1fr);gap:0.75rem 1rem;font-size:0.85rem;color:#333;">
                                ${(portfolioData.certifications || []).map(cert => `
                                    <li style="border-left:2.5px solid var(--primary-color);padding-left:0.6rem;margin-bottom:0.25rem;">
                                        <div style="font-weight:700;color:#202124;">${cert.name}</div>
                                        <div style="color:#5f6368;">${cert.issuer}</div>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        
                    </div>
                </div>
            `;
            
            cvContent.innerHTML = cvHtml;
            cvModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
        
        closeCvBtn.addEventListener('click', () => {
            cvModal.style.display = 'none';
            document.body.style.overflow = '';
        });
        
        cvModal.addEventListener('click', (e) => {
            if (e.target === cvModal) {
                cvModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        
        printCvBtn.addEventListener('click', () => {
            window.print();
        });
    }

}); // end DOMContentLoaded
