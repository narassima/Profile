document.addEventListener('DOMContentLoaded', () => {

    // ── Mobile/Tabs Menu Dropdown Toggle ────────────────────────
    const tabsDropdownToggle = document.getElementById('tabs-dropdown-toggle');
    const navDropdownMenu = document.getElementById('nav-dropdown-menu');
    
    if (tabsDropdownToggle && navDropdownMenu) {
        tabsDropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navDropdownMenu.style.display === 'block';
            navDropdownMenu.style.display = isOpen ? 'none' : 'block';
        });
        
        document.addEventListener('click', (e) => {
            if (!navDropdownMenu.contains(e.target) && e.target !== tabsDropdownToggle) {
                navDropdownMenu.style.display = 'none';
            }
        });
    }

    // ── Page Navigation (Syncing Horizontal & Dropdown links) ─────
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownLinks = document.querySelectorAll('.dropdown-link');
    const sections = document.querySelectorAll('.page-section');

    const activateTab = (targetId) => {
        // Sync active class on nav links
        navLinks.forEach(l => {
            if (l.getAttribute('data-target') === targetId) {
                l.classList.add('active');
                // Scroll horizontal container to keep it in view
                const navScrollLinks = document.getElementById('nav-links-scrollable');
                if (navScrollLinks) {
                    const containerWidth = navScrollLinks.clientWidth;
                    const linkLeft = l.offsetLeft;
                    const linkWidth = l.clientWidth;
                    const targetScroll = linkLeft - (containerWidth / 2) + (linkWidth / 2);
                    navScrollLinks.scrollTo({ left: targetScroll, behavior: 'smooth' });
                }
            } else {
                l.classList.remove('active');
            }
        });

        // Sync active class on dropdown links
        dropdownLinks.forEach(dl => {
            if (dl.getAttribute('data-target') === targetId) {
                dl.classList.add('active');
            } else {
                dl.classList.remove('active');
            }
        });

        // Toggle active section
        sections.forEach(sec => {
            if (sec.id === targetId) {
                sec.classList.add('active-section');
            } else {
                sec.classList.remove('active-section');
            }
        });

        // Hide dropdown menu
        if (navDropdownMenu) {
            navDropdownMenu.style.display = 'none';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Bind horizontal links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            if (targetId) {
                e.preventDefault();
                activateTab(targetId);
            }
        });
    });

    // Bind dropdown links
    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            if (targetId) {
                e.preventDefault();
                activateTab(targetId);
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

    // ── Simulations Search & Filtering ───────────────────
    const simSearch = document.getElementById('sim-search');
    const simSearchClear = document.getElementById('sim-search-clear');
    const simGrid = document.getElementById('simulations-grid');
    
    if (simSearch && simGrid) {
        const simCards = simGrid.querySelectorAll('a');
        
        const filterSimulations = () => {
            const query = simSearch.value.toLowerCase().trim();
            if (simSearchClear) {
                simSearchClear.style.display = query.length > 0 ? 'block' : 'none';
            }
            
            let anyVisible = false;
            simCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                const matches = title.includes(query) || desc.includes(query);
                
                if (matches) {
                    card.style.display = 'flex';
                    anyVisible = true;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Handle "No results" message
            let noResultsMsg = document.getElementById('sim-no-results');
            if (!anyVisible) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('p');
                    noResultsMsg.id = 'sim-no-results';
                    noResultsMsg.style.cssText = 'color:var(--text-secondary);padding:3rem;text-align:center;font-style:italic;grid-column: 1 / -1;';
                    noResultsMsg.innerHTML = '<i class="fas fa-search-minus" style="font-size:1.8rem;display:block;margin-bottom:0.75rem;color:var(--primary-color);"></i> No simulations matching your search.';
                    simGrid.appendChild(noResultsMsg);
                }
            } else {
                if (noResultsMsg) {
                    noResultsMsg.remove();
                }
            }
        };
        
        simSearch.addEventListener('input', filterSimulations);
        if (simSearchClear) {
            simSearchClear.addEventListener('click', () => {
                simSearch.value = '';
                filterSimulations();
                simSearch.focus();
            });
        }
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
                <li style="margin-bottom: 0.6rem; display: flex; align-items: flex-start;">
                    <i class="fas fa-check-circle" style="font-size: 0.85rem; color: var(--primary-color); margin-top: 0.35rem; flex-shrink: 0; margin-right: 0.6rem !important;"></i>
                    <span style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">${detail}</span>
                </li>
            `).join('');

            rolesGrid.innerHTML += `
                <div class="glass-card role-list-card" style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: rgba(255, 255, 255, 0.45); box-shadow: var(--shadow-sm); display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; margin-bottom: 1rem; border-bottom: 1.5px solid rgba(26, 115, 232, 0.15); padding-bottom: 0.75rem;">
                        <i class="fas ${group.icon}" style="font-size: 1.3rem; color: var(--primary-color); margin-right: 0.75rem !important;"></i>
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
        contributionsList.innerHTML = '';
        portfolioData.contributions.forEach(contrib => {
            contributionsList.innerHTML += `
                <div style="background: rgba(255, 255, 255, 0.6); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem 1.25rem; display: flex; align-items: flex-start; transition: var(--transition);" class="hover-lift contribution-item-card">
                    <div style="background: #e8f4fd; color: var(--primary-color); width: 36px; height: 36px; border-radius: 0px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.1rem; margin-right: 0.75rem !important;">
                        <i class="fas ${contrib.icon}" style="margin: 0 !important;"></i>
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
    const galleryItems = document.querySelectorAll('.gallery-item img, .gallery-item-card img');

    if (modal && modalImg && closeBtn && downloadBtn) {
        galleryItems.forEach(img => {
            img.addEventListener('click', function (e) {
                // Prevent navigation to link if lightbox is desired, or let it work?
                // Let's open lightbox modal
                e.preventDefault();
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

    // ── Microsoft Lumia Theme Accent Picker (Metro Tile Picker) ─────
    const colorTiles = document.querySelectorAll('.color-tile');
    
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
        
        // Highlight active tile
        colorTiles.forEach(tile => {
            if (tile.getAttribute('data-color').toLowerCase() === colorHex.toLowerCase()) {
                tile.style.outline = '2px solid var(--text-primary)';
                tile.style.transform = 'scale(1.1)';
            } else {
                tile.style.outline = 'none';
                tile.style.transform = 'scale(1)';
            }
        });

        // Save state
        localStorage.setItem('theme-accent-color', colorHex);
    };

    const colorNameDisplay = document.getElementById('theme-color-name');

    colorTiles.forEach(tile => {
        tile.addEventListener('click', (e) => {
            updateAccentColor(e.currentTarget.getAttribute('data-color'));
        });
        
        tile.addEventListener('mouseenter', () => {
            if (colorNameDisplay) {
                const title = tile.getAttribute('title') || 'Color';
                colorNameDisplay.textContent = title;
            }
        });
        
        tile.addEventListener('mouseleave', () => {
            if (colorNameDisplay) {
                colorNameDisplay.textContent = 'Hover a color';
            }
        });
    });

    // Initialize from localStorage (Cobalt #0050ef as default)
    let savedAccent = localStorage.getItem('theme-accent-color');
    if (!savedAccent || savedAccent === '#0067b8' || savedAccent === 'rainbow' || savedAccent === '#8d9096' || savedAccent === '#3f4448') {
        savedAccent = '#0050ef';
    }
    updateAccentColor(savedAccent);

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
    // ── Dynamic CV Viewer Logic ──────────────────────────────────
    const viewCvBtn = document.getElementById('view-cv-btn');
    const cvModal = document.getElementById('cv-viewer-modal');
    const closeCvBtn = document.getElementById('close-cv-btn');
    const printCvBtn = document.getElementById('print-cv-btn');
    const cvContent = document.getElementById('cv-content-body');
    const customizePanel = document.getElementById('cv-customize-panel');
    
    if (viewCvBtn && cvModal && closeCvBtn && printCvBtn && cvContent && customizePanel) {
        // Shared CV customizer configuration state
        let cvConfig = {
            theme: 'modern',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            sections: {
                education: true,
                experience: true,
                roles: true,
                contributions: true,
                publications: true,
                certifications: true
            },
            selectedPubIndices: (allPublications || []).slice(0, 10).map((_, idx) => idx)
        };

        const updateCVPreview = () => {
            let themeStyles = '';
            let titleColor = 'var(--primary-color)';
            let sectionSpacing = '1.75rem';
            
            // Adjust styling based on theme
            if (cvConfig.theme === 'modern') {
                titleColor = 'var(--primary-color)';
                themeStyles = `
                    .cv-section-title {
                        font-size: 1.15rem;
                        font-weight: 700;
                        color: ${titleColor};
                        border-left: 4px solid ${titleColor};
                        padding-left: 0.6rem;
                        margin: 0 0 1rem 0;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .cv-header-title {
                        color: ${titleColor};
                    }
                `;
            } else if (cvConfig.theme === 'academic') {
                titleColor = '#1a1a1a';
                themeStyles = `
                    .cv-section-title {
                        font-size: 1.15rem;
                        font-weight: 700;
                        color: ${titleColor};
                        border-bottom: 2px solid #333;
                        padding-bottom: 0.25rem;
                        margin: 0 0 1rem 0;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .cv-header-title {
                        color: #1a1a1a;
                    }
                `;
            } else if (cvConfig.theme === 'minimal') {
                titleColor = '#475569';
                themeStyles = `
                    .cv-section-title {
                        font-size: 1.05rem;
                        font-weight: 600;
                        color: ${titleColor};
                        border-bottom: 1px dashed #cbd5e1;
                        padding-bottom: 0.2rem;
                        margin: 0 0 0.85rem 0;
                        text-transform: capitalize;
                        letter-spacing: 0.25px;
                    }
                    .cv-header-title {
                        color: #1e293b;
                    }
                `;
                sectionSpacing = '1.25rem';
            }

            // Generate content blocks
            let eduHtml = '';
            if (cvConfig.sections.education && portfolioData.education && portfolioData.education.length > 0) {
                eduHtml = `
                    <div class="cv-section" style="margin-bottom: ${sectionSpacing}; page-break-inside: auto;">
                        <h2 class="cv-section-title">Education</h2>
                        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem;">
                            ${portfolioData.education.map(edu => `
                                <li>
                                    <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.92rem; color: #1e293b;">
                                        <span>${edu.degree}</span>
                                        <span>${edu.duration || ''}</span>
                                    </div>
                                    <div style="font-size: 0.85rem; color: #475569; font-weight: 600;">${edu.institution}</div>
                                    ${edu.details ? `<div style="font-size: 0.82rem; color: #64748b; font-style: italic; margin-top: 0.1rem;">${edu.details}</div>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }

            let expHtml = '';
            if (cvConfig.sections.experience && portfolioData.experience && portfolioData.experience.length > 0) {
                expHtml = `
                    <div class="cv-section" style="margin-bottom: ${sectionSpacing}; page-break-inside: auto;">
                        <h2 class="cv-section-title">Work Experience</h2>
                        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.85rem;">
                            ${portfolioData.experience.map(exp => `
                                <li>
                                    <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.92rem; color: #1e293b;">
                                        <span>${exp.title}</span>
                                        <span>${exp.duration}</span>
                                    </div>
                                    <div style="font-size: 0.85rem; color: #475569; font-weight: 600;">${exp.organization}</div>
                                    <p style="font-size: 0.82rem; color: #475569; margin: 0.2rem 0 0 0; text-align: justify; line-height: 1.45;">${exp.description}</p>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }

            let rolesHtml = '';
            if (cvConfig.sections.roles && portfolioData.roles && portfolioData.roles.length > 0) {
                rolesHtml = `
                    <div class="cv-section" style="margin-bottom: ${sectionSpacing}; page-break-inside: auto;">
                        <h2 class="cv-section-title">Review &amp; Editorial Boards</h2>
                        <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.6rem 1.25rem; font-size: 0.82rem; color: #334155;">
                            ${portfolioData.roles.map(role => `
                                <li style="border-left: 2px solid ${titleColor}; padding-left: 0.5rem; margin-bottom: 0.1rem;">
                                    <div style="font-weight: 700; color: #1e293b;">${role.name}</div>
                                    <div style="color: #475569; font-size: 0.78rem;">${role.detail}</div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }

            let contributionsHtml = '';
            if (cvConfig.sections.contributions && portfolioData.contributions && portfolioData.contributions.length > 0) {
                contributionsHtml = `
                    <div class="cv-section" style="margin-bottom: ${sectionSpacing}; page-break-inside: auto;">
                        <h2 class="cv-section-title">Academic Contributions &amp; Invited Talks</h2>
                        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.82rem; color: #334155;">
                            ${portfolioData.contributions.map(contrib => `
                                <li style="text-align: justify; line-height: 1.4;">
                                    <span style="font-weight: 700; color: #1e293b; display: inline-block; min-width: 130px;">[${contrib.type}]</span>
                                    <span>${contrib.description}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }

            let pubHtml = '';
            if (cvConfig.sections.publications && cvConfig.selectedPubIndices.length > 0) {
                pubHtml = `
                    <div class="cv-section" style="margin-bottom: ${sectionSpacing}; page-break-inside: auto;">
                        <h2 class="cv-section-title">Publications</h2>
                        <ol style="list-style: decimal; padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.82rem; color: #334155;">
                            ${cvConfig.selectedPubIndices.map(idx => {
                                const pub = allPublications[idx];
                                return `
                                    <li style="margin-bottom: 0.1rem; text-align: justify; line-height: 1.4;">
                                        <strong>${pub.title}</strong> (${pub.year}). 
                                        <span style="color: #475569;">${pub.authors}</span>. 
                                        ${pub.journal ? `<span style="font-style: italic; color: #64748b;">${pub.journal}</span>` : ''}
                                    </li>
                                `;
                            }).join('')}
                        </ol>
                    </div>
                `;
            }

            let certHtml = '';
            if (cvConfig.sections.certifications) {
                const hasCerts = portfolioData.certifications && portfolioData.certifications.length > 0;
                const hasAwards = portfolioData.achievements && portfolioData.achievements.length > 0;
                
                if (hasCerts || hasAwards) {
                    let certListHtml = '';
                    if (hasCerts) {
                        certListHtml = portfolioData.certifications.map(cert => `
                            <li style="border-left: 2px solid ${titleColor}; padding-left: 0.5rem; margin-bottom: 0.1rem;">
                                <div style="font-weight: 700; color: #1e293b;">${cert.name}</div>
                                <div style="color: #475569; font-size: 0.78rem;">${cert.issuer}</div>
                            </li>
                        `).join('');
                    }
                    
                    let awardsListHtml = '';
                    if (hasAwards) {
                        awardsListHtml = portfolioData.achievements.map(ach => `
                            <li style="border-left: 2px solid ${titleColor}; padding-left: 0.5rem; margin-bottom: 0.1rem;">
                                <div style="font-weight: 700; color: #1e293b;">${ach.name}</div>
                                <div style="color: #475569; font-size: 0.78rem;">${ach.issuer}</div>
                            </li>
                        `).join('');
                    }
                    
                    certHtml = `
                        <div class="cv-section" style="margin-bottom: ${sectionSpacing}; page-break-inside: auto;">
                            <h2 class="cv-section-title">Certifications &amp; Awards</h2>
                            <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.6rem 1.25rem; font-size: 0.82rem; color: #334155;">
                                ${certListHtml}
                                ${awardsListHtml}
                            </ul>
                        </div>
                    `;
                }
            }

            let previewHtml = `
                <style>
                    ${themeStyles}
                    #cv-content-body ul, #cv-content-body ol {
                        color: #334155;
                    }
                    @media print {
                        #cv-content-body {
                            padding: 0 !important;
                            box-shadow: none !important;
                            border-radius: 0 !important;
                            width: 100% !important;
                            max-width: 100% !important;
                        }
                    }
                </style>
                <div style="font-family: ${cvConfig.fontFamily}; color: #334155; line-height: 1.45;">
                    <!-- HEADER SECTION -->
                    <div style="text-align: center; border-bottom: 2px solid ${titleColor}; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                        <h1 style="font-size: 1.9rem; font-weight: 800; color: #1e293b; margin: 0 0 0.25rem 0; text-transform: uppercase; letter-spacing: 0.5px;">Dr. Narassima M.S.</h1>
                        <p style="font-size: 1rem; color: ${titleColor}; font-weight: 700; margin: 0 0 0.35rem 0; letter-spacing: 0.25px;" class="cv-header-title">Assistant Professor of Operations</p>
                        <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.65rem 0; font-weight: 500;">Great Lakes Institute of Management, Chennai, India</p>
                        <p style="font-size: 0.8rem; color: #64748b; margin: 0; display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; font-weight: 500;">
                            <span><i class="fas fa-envelope" style="color: ${titleColor};"></i> msnarassima@gmail.com</span>
                            <span>|</span>
                            <span><i class="fab fa-linkedin" style="color: ${titleColor};"></i> linkedin.com/in/narassima</span>
                            <span>|</span>
                            <span><i class="fas fa-graduation-cap" style="color: ${titleColor};"></i> Scholar ID: RDFCAzYAAAAJ</span>
                        </p>
                    </div>

                    <!-- BODY SECTIONS -->
                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                        ${eduHtml}
                        ${expHtml}
                        ${rolesHtml}
                        ${contributionsHtml}
                        ${pubHtml}
                        ${certHtml}
                    </div>
                </div>
            `;
            
            cvContent.innerHTML = previewHtml;
        };

        const renderCustomizer = () => {
            let html = `
                <div style="font-family:'Outfit',sans-serif; display: flex; flex-direction: column; gap: 1.25rem;">
                    <div>
                        <h4 style="margin:0 0 0.75rem 0;font-size:0.88rem;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--border-color);padding-bottom:0.4rem;"><i class="fas fa-palette" style="margin-right:0.5rem;color:var(--primary-color);"></i>CV Style &amp; Theme</h4>
                        <div style="display:flex;flex-direction:column;gap:0.5rem;">
                            <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;font-weight:600;">
                                <input type="radio" name="cv-theme" value="modern" ${cvConfig.theme === 'modern' ? 'checked' : ''} style="cursor:pointer;accent-color:var(--primary-color);"> Modern Professional
                            </label>
                            <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;font-weight:600;">
                                <input type="radio" name="cv-theme" value="academic" ${cvConfig.theme === 'academic' ? 'checked' : ''} style="cursor:pointer;accent-color:var(--primary-color);"> Classic Academic
                            </label>
                            <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;font-weight:600;">
                                <input type="radio" name="cv-theme" value="minimal" ${cvConfig.theme === 'minimal' ? 'checked' : ''} style="cursor:pointer;accent-color:var(--primary-color);"> Minimal Clean
                            </label>
                        </div>
                    </div>

                    <div>
                        <h4 style="margin:0 0 0.75rem 0;font-size:0.88rem;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--border-color);padding-bottom:0.4rem;"><i class="fas fa-font" style="margin-right:0.5rem;color:var(--primary-color);"></i>Font Family</h4>
                        <select id="cv-font" style="width:100%;padding:0.4rem 0.5rem;border-radius:0;border:1px solid var(--border-color);background:var(--surface-color);color:var(--text-primary);font-size:0.8rem;font-weight:600;outline:none;cursor:pointer;">
                            <option value="'Outfit', 'Inter', sans-serif" ${cvConfig.fontFamily.includes('Outfit') ? 'selected' : ''}>Sans-Serif (Outfit / Inter)</option>
                            <option value="'Georgia', 'Times New Roman', serif" ${cvConfig.fontFamily.includes('Georgia') ? 'selected' : ''}>Serif (Georgia / Times)</option>
                            <option value="'Roboto', 'Helvetica', Arial, sans-serif" ${cvConfig.fontFamily.includes('Roboto') ? 'selected' : ''}>Clean (Roboto / Helvetica)</option>
                        </select>
                    </div>

                    <div>
                        <h4 style="margin:0 0 0.75rem 0;font-size:0.88rem;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--border-color);padding-bottom:0.4rem;"><i class="fas fa-th-list" style="margin-right:0.5rem;color:var(--primary-color);"></i>Included Sections</h4>
                        <div style="display:flex;flex-direction:column;gap:0.5rem;">
                            <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;font-weight:600;">
                                <input type="checkbox" id="sec-education" ${cvConfig.sections.education ? 'checked' : ''} style="cursor:pointer;accent-color:var(--primary-color);"> Education
                            </label>
                            <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;font-weight:600;">
                                <input type="checkbox" id="sec-experience" ${cvConfig.sections.experience ? 'checked' : ''} style="cursor:pointer;accent-color:var(--primary-color);"> Work Experience
                            </label>
                            <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;font-weight:600;">
                                <input type="checkbox" id="sec-roles" ${cvConfig.sections.roles ? 'checked' : ''} style="cursor:pointer;accent-color:var(--primary-color);"> Editorial &amp; Review Boards
                            </label>
                            <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;font-weight:600;">
                                <input type="checkbox" id="sec-contributions" ${cvConfig.sections.contributions ? 'checked' : ''} style="cursor:pointer;accent-color:var(--primary-color);"> Talks &amp; Contributions
                            </label>
                            <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;font-weight:600;">
                                <input type="checkbox" id="sec-publications" ${cvConfig.sections.publications ? 'checked' : ''} style="cursor:pointer;accent-color:var(--primary-color);"> Publications
                            </label>
                            <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;font-weight:600;">
                                <input type="checkbox" id="sec-certifications" ${cvConfig.sections.certifications ? 'checked' : ''} style="cursor:pointer;accent-color:var(--primary-color);"> Certifications &amp; Awards
                            </label>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <h4 style="margin:0;font-size:0.88rem;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.5px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-color);padding-bottom:0.4rem;">
                            <span><i class="fas fa-book" style="margin-right:0.5rem;color:var(--primary-color);"></i>Publications</span>
                            <span style="font-size:0.72rem;color:var(--primary-color);text-transform:none;font-weight:600;">(${cvConfig.selectedPubIndices.length} Selected)</span>
                        </h4>
                        <div style="display:flex;gap:0.35rem;margin-bottom:0.25rem;">
                            <button id="pub-all" style="flex:1;background:var(--border-color);color:var(--text-primary);border:none;padding:0.25rem;font-size:0.72rem;font-weight:700;border-radius:4px;cursor:pointer;transition:var(--transition);">All</button>
                            <button id="pub-none" style="flex:1;background:var(--border-color);color:var(--text-primary);border:none;padding:0.25rem;font-size:0.72rem;font-weight:700;border-radius:4px;cursor:pointer;transition:var(--transition);">None</button>
                            <button id="pub-top10" style="flex:1.5;background:var(--border-color);color:var(--text-primary);border:none;padding:0.25rem;font-size:0.72rem;font-weight:700;border-radius:4px;cursor:pointer;transition:var(--transition);">Top 10</button>
                        </div>
                        <div id="pubs-checklist-container" style="max-height:200px;overflow-y:auto;border:1px solid var(--border-color);border-radius:6px;padding:0.4rem;background:var(--bg-color);display:flex;flex-direction:column;gap:0.4rem;">
                            ${(allPublications || []).map((pub, idx) => `
                                <label style="display:flex;align-items:flex-start;gap:0.35rem;font-size:0.72rem;color:var(--text-secondary);cursor:pointer;line-height:1.3;font-weight:500;padding:0.15rem;border-radius:3px;transition:var(--transition);" class="pub-check-item">
                                    <input type="checkbox" class="pub-select-check" data-idx="${idx}" ${cvConfig.selectedPubIndices.includes(idx) ? 'checked' : ''} style="margin-top:0.1rem;cursor:pointer;accent-color:var(--primary-color);">
                                    <span><strong>${pub.title}</strong> (${pub.year})</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            customizePanel.innerHTML = html;

            // Bind Customizer Events
            customizePanel.querySelectorAll('input[name="cv-theme"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    cvConfig.theme = e.target.value;
                    updateCVPreview();
                });
            });

            const fontSelect = customizePanel.querySelector('#cv-font');
            if (fontSelect) {
                fontSelect.addEventListener('change', (e) => {
                    cvConfig.fontFamily = e.target.value;
                    updateCVPreview();
                });
            }

            ['education', 'experience', 'roles', 'contributions', 'publications', 'certifications'].forEach(sec => {
                const chk = customizePanel.querySelector(`#sec-${sec}`);
                if (chk) {
                    chk.addEventListener('change', (e) => {
                        cvConfig.sections[sec] = e.target.checked;
                        updateCVPreview();
                    });
                }
            });

            const btnAll = customizePanel.querySelector('#pub-all');
            const btnNone = customizePanel.querySelector('#pub-none');
            const btnTop10 = customizePanel.querySelector('#pub-top10');

            if (btnAll) {
                btnAll.addEventListener('click', () => {
                    cvConfig.selectedPubIndices = (allPublications || []).map((_, i) => i);
                    renderCustomizer();
                    updateCVPreview();
                });
            }
            if (btnNone) {
                btnNone.addEventListener('click', () => {
                    cvConfig.selectedPubIndices = [];
                    renderCustomizer();
                    updateCVPreview();
                });
            }
            if (btnTop10) {
                btnTop10.addEventListener('click', () => {
                    cvConfig.selectedPubIndices = (allPublications || []).slice(0, 10).map((_, i) => i);
                    renderCustomizer();
                    updateCVPreview();
                });
            }

            customizePanel.querySelectorAll('.pub-select-check').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-idx'));
                    if (e.target.checked) {
                        if (!cvConfig.selectedPubIndices.includes(idx)) {
                            cvConfig.selectedPubIndices.push(idx);
                        }
                    } else {
                        cvConfig.selectedPubIndices = cvConfig.selectedPubIndices.filter(i => i !== idx);
                    }
                    const countEl = customizePanel.querySelector('h4 span');
                    if (countEl) countEl.textContent = `(${cvConfig.selectedPubIndices.length} Selected)`;
                    updateCVPreview();
                });
            });
        };

        viewCvBtn.addEventListener('click', () => {
            renderCustomizer();
            updateCVPreview();
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

    // ── Floating Navbar Horizontal Scroll Logic ──────────────────
    const navScrollLinks = document.getElementById('nav-links-scrollable');
    const scrollLeftBtn = document.getElementById('nav-scroll-left');
    const scrollRightBtn = document.getElementById('nav-scroll-right');
    
    if (navScrollLinks && scrollLeftBtn && scrollRightBtn) {
        const updateScrollArrows = () => {
            const scrollLeft = navScrollLinks.scrollLeft;
            const maxScrollLeft = navScrollLinks.scrollWidth - navScrollLinks.clientWidth;
            
            // Transition controls
            scrollLeftBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            scrollRightBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            // Show/hide left arrow based on scroll position
            if (scrollLeft <= 2) {
                scrollLeftBtn.style.opacity = '0';
                scrollLeftBtn.style.pointerEvents = 'none';
            } else {
                scrollLeftBtn.style.opacity = '1';
                scrollLeftBtn.style.pointerEvents = 'auto';
            }
            
            // Show/hide right arrow based on scroll position
            if (scrollLeft >= maxScrollLeft - 2) {
                scrollRightBtn.style.opacity = '0';
                scrollRightBtn.style.pointerEvents = 'none';
            } else {
                scrollRightBtn.style.opacity = '1';
                scrollRightBtn.style.pointerEvents = 'auto';
            }
        };

        // Scroll actions
        scrollLeftBtn.addEventListener('click', () => {
            navScrollLinks.scrollBy({ left: -200, behavior: 'smooth' });
        });

        scrollRightBtn.addEventListener('click', () => {
            navScrollLinks.scrollBy({ left: 200, behavior: 'smooth' });
        });

        navScrollLinks.addEventListener('scroll', updateScrollArrows);
        window.addEventListener('resize', updateScrollArrows);
        
        // Dynamic initial checks
        setTimeout(updateScrollArrows, 300);
        
        // Auto-center active link on click
        navScrollLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const linkElement = e.currentTarget;
                setTimeout(() => {
                    const containerWidth = navScrollLinks.clientWidth;
                    const linkLeft = linkElement.offsetLeft;
                    const linkWidth = linkElement.clientWidth;
                    const targetScroll = linkLeft - (containerWidth / 2) + (linkWidth / 2);
                    navScrollLinks.scrollTo({ left: targetScroll, behavior: 'smooth' });
                }, 50);
            });
        });
    }

    // ── Lumia Theme Palette Dropdown Toggle ──────────────────────
    const themePickerToggle = document.getElementById('theme-picker-toggle');
    const themePaletteDropdown = document.getElementById('theme-palette-dropdown');
    
    if (themePickerToggle && themePaletteDropdown) {
        themePickerToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = themePaletteDropdown.style.display === 'block';
            themePaletteDropdown.style.display = isOpen ? 'none' : 'block';
        });
        
        document.addEventListener('click', (e) => {
            if (!themePaletteDropdown.contains(e.target) && e.target !== themePickerToggle) {
                themePaletteDropdown.style.display = 'none';
            }
        });
    }

}); // end DOMContentLoaded
