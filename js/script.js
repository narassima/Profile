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
            return (pub.title || '').toLowerCase().includes(query) ||
                   (pub.authors || '').toLowerCase().includes(query) ||
                   (pub.journal || '').toLowerCase().includes(query) ||
                   (pub.year || '').toLowerCase().includes(query);
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
        const colors = ['#0A66C2', '#004182', '#444444', '#137333', '#2a2a2a'];
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
                <div style="background:rgba(255,255,255,0.7);padding:1.5rem;border-radius:var(--radius-md);border-left:4px solid var(--primary-color);display:flex;align-items:center;justify-content:center;min-height:90px;">
                    <p style="font-style:italic;color:var(--text-primary);margin:0;text-align:center;line-height:1.6;">"${test.text}"</p>
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
        portfolioData.roles.forEach(role => {
            rolesGrid.innerHTML += `
                <div class="role-card" style="box-shadow: none; font-size: 0.85rem; line-height: 1.3;">
                    <i class="fas ${role.icon} role-icon"></i>
                    <div>
                        <strong style="display: block; font-weight: 600; color: var(--text-primary);">${role.name}</strong>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">${role.detail}</span>
                    </div>
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

    // ── Theme Switcher ──────────────────────────────────────────
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    // Check if user has a preference set
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
            themeIcon.style.color = '#F9AB00'; // Golden sun color
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            let theme = 'light';
            if (document.body.classList.contains('dark-theme')) {
                theme = 'dark';
                if (themeIcon) {
                    themeIcon.className = 'fas fa-sun';
                    themeIcon.style.color = '#F9AB00';
                }
            } else {
                if (themeIcon) {
                    themeIcon.className = 'fas fa-moon';
                    themeIcon.style.color = '';
                }
            }
            localStorage.setItem('theme', theme);
        });
    }

    // ── GLIM Clicks Collapsible Toggle ───────────────────────────
    // Exposed globally so the inline onclick can reach it
    window.toggleGlimClicks = function () {
        const panel = document.getElementById('glim-grid-panel');
        const chevron = document.getElementById('glim-chevron');
        const btn = document.getElementById('glim-toggle-btn');
        const isOpen = panel && panel.style.maxHeight !== '0px' && panel.style.maxHeight !== '';

        if (!panel) return;

        if (isOpen) {
            panel.style.maxHeight = '0px';
            panel.style.opacity = '0';
            if (chevron) chevron.style.transform = 'rotate(0deg)';
            if (btn) btn.style.borderColor = 'var(--border-color)';
        } else {
            panel.style.maxHeight = panel.scrollHeight + 'px';
            panel.style.opacity = '1';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
            if (btn) btn.style.borderColor = 'var(--primary-color)';
        }
    };

    // Google Maps card: animate arrow on hover
    const gmapsCard = document.getElementById('gmaps-photo-card');
    const gmapsCta = document.getElementById('gmaps-cta');
    if (gmapsCard && gmapsCta) {
        gmapsCard.addEventListener('mouseenter', () => { gmapsCta.style.transform = 'scale(1.12) translateX(3px)'; });
        gmapsCard.addEventListener('mouseleave', () => { gmapsCta.style.transform = ''; });
    }

}); // end DOMContentLoaded
