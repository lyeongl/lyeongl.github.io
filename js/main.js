document.addEventListener('DOMContentLoaded', () => {
    // Load and Parse Resume.md to Timeline
    loadResumeTimeline();

    // Scroll Animations for general fade-in elements
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Video Autoplay on Scroll
    const videoObserverOptions = {
        threshold: 0.5
    };

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(e => console.log("Autoplay prevented:", e));
            } else {
                video.pause();
            }
        });
    }, videoObserverOptions);

    document.querySelectorAll('video').forEach(video => {
        videoObserver.observe(video);

        video.addEventListener('mouseenter', () => {
            video.setAttribute('controls', 'true');
        });

        video.addEventListener('mouseleave', () => {
            video.removeAttribute('controls');
        });
    });
});

function loadResumeTimeline() {
    fetch('assets/resume.md')
        .then(response => response.text())
        .then(markdown => {
            const timeline = document.querySelector('.timeline');
            if (!timeline) return;

            timeline.innerHTML = parseResumeToTimeline(markdown);

            // Re-observe timeline items after creation
            const timelineObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, index * 100);
                        timelineObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            document.querySelectorAll('.timeline-item').forEach(item => {
                timelineObserver.observe(item);
            });
        })
        .catch(error => console.error('Error loading resume:', error));
}

function parseResumeToTimeline(markdown) {
    const lines = markdown.split('\n');
    let html = '';
    let currentSection = null;
    let currentCompany = null;
    let currentPeriod = null;
    let currentRole = null;
    let currentItems = [];
    let currentTechStack = '';
    let sideToggle = true; // Alternate between left and right
    let isEducation = false;

    const flushCurrent = () => {
        if (currentCompany && currentPeriod) {
            const side = sideToggle ? 'left' : 'right';
            const dotClass = isEducation ? 'education' : '';

            // Generate list HTML with nested items
            let listHtml = '';
            if (currentItems.length > 0) {
                listHtml = '<ul>';
                currentItems.forEach(item => {
                    if (typeof item === 'string') {
                        listHtml += `<li>${item}</li>`;
                    } else {
                        listHtml += `<li>${item.text}`;
                        if (item.children && item.children.length > 0) {
                            listHtml += '<ul>';
                            item.children.forEach(child => {
                                listHtml += `<li>${child}</li>`;
                            });
                            listHtml += '</ul>';
                        }
                        listHtml += '</li>';
                    }
                });
                listHtml += '</ul>';
            }

            html += `
                <div class="timeline-item fade-in" data-side="${side}">
                    <div class="timeline-dot ${dotClass}"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">${currentPeriod}</div>
                        <h3>${currentCompany}</h3>
                        ${currentRole ? `<h4>${currentRole}</h4>` : ''}
                        ${listHtml}
                        ${currentTechStack ? `<div class="tech-stack">${currentTechStack}</div>` : ''}
                    </div>
                </div>`;

            sideToggle = !sideToggle;

            // Reset only period-specific data, keep company name
            currentPeriod = null;
            currentRole = null;
            currentItems = [];
            currentTechStack = '';
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Section headers
        if (line.startsWith('## Experience')) {
            flushCurrent();
            currentSection = 'experience';
            isEducation = false;
            currentCompany = null;
            continue;
        }
        if (line.startsWith('## Education')) {
            flushCurrent();
            currentSection = 'education';
            isEducation = true;
            currentCompany = null;
            continue;
        }

        // Company/School name (### heading)
        if (line.startsWith('###')) {
            flushCurrent();
            currentCompany = line.replace(/^###\s*/, '');
            continue;
        }

        // Period and role (italic line starting with *)
        if (line.startsWith('*') && line.includes('~')) {
            // Flush previous period if exists
            flushCurrent();

            const match = line.match(/\*(.+?)\s*\|\s*(.+?)\*/);
            if (match) {
                currentPeriod = match[1].trim();
                currentRole = match[2].trim();
            }
            continue;
        }

        // Tech stack (blockquote with Tech Stack)
        if (line.startsWith('>') && line.includes('Tech Stack')) {
            currentTechStack = line.replace(/^>\s*\*\*Tech Stack\*\*:\s*/, '');
            continue;
        }

        // Nested list items (4 spaces + -)
        if (line.match(/^    -\s+/)) {
            const item = line.replace(/^\s+-\s+/, '').replace(/^\*\*(.+?)\*\*/, '<strong>$1</strong>');
            if (currentItems.length > 0) {
                currentItems[currentItems.length - 1].children.push(item);
            }
            continue;
        }

        // Parent list items (- at the beginning)
        if (line.match(/^-\s+/)) {
            const item = line.replace(/^-\s+/, '').replace(/^\*\*(.+?)\*\*/, '<strong>$1</strong>');
            currentItems.push({ text: item, children: [] });
            continue;
        }

        // Separator (---)
        if (line.startsWith('---')) {
            flushCurrent();
            currentCompany = null; // Reset company on separator
            continue;
        }
    }

    // Flush last item
    flushCurrent();

    return html;
}
