// Canvas Background Animation with Anti-Banding
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

// Set canvas size (Debounced)
let resizeTimeout;
let bgGradient; // Cache gradient

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create gradient once on resize
    bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#2a2550');
    bgGradient.addColorStop(0.25, '#3a3570');
    bgGradient.addColorStop(0.5, '#433D8B');
    bgGradient.addColorStop(0.75, '#3a3570');
    bgGradient.addColorStop(1, '#2a2550');
}
resizeCanvas();

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 200);
});

// Circle configuration
const circles = [
    { x: 0.2, y: 0.2, size: 800, color: [129, 140, 248], speed: 0.0001, angle: 0, radius: 0.3 },
    { x: 0.8, y: 0.3, size: 700, color: [168, 85, 247], speed: 0.00012, angle: Math.PI / 4, radius: 0.35 },
    { x: 0.3, y: 0.7, size: 750, color: [236, 72, 153], speed: 0.00008, angle: Math.PI / 2, radius: 0.32 },
    { x: 0.7, y: 0.75, size: 650, color: [99, 102, 241], speed: 0.00015, angle: Math.PI, radius: 0.28 },
    { x: 0.5, y: 0.5, size: 900, color: [34, 211, 238], speed: 0.0001, angle: Math.PI * 1.5, radius: 0.4 },
    { x: 0.6, y: 0.4, size: 600, color: [251, 146, 60], speed: 0.00013, angle: Math.PI / 3, radius: 0.25 },
];

// Generate static noise texture for overlay (Optimized)
function generateNoiseOverlay() {
    const noiseCanvas = document.createElement('canvas');
    const noiseCtx = noiseCanvas.getContext('2d');
    noiseCanvas.width = 200; // Small pattern size
    noiseCanvas.height = 200;

    const imageData = noiseCtx.createImageData(200, 200);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;     // R
        data[i + 1] = noise; // G
        data[i + 2] = noise; // B
        data[i + 3] = 30;    // Alpha (Low opacity)
    }

    noiseCtx.putImageData(imageData, 0, 0);

    const noiseOverlay = document.getElementById('noise-overlay');
    noiseOverlay.style.backgroundImage = `url(${noiseCanvas.toDataURL()})`;
}

// Render gradient circles (Optimized - No pixel manipulation)
function render(time) {
    // Use cached background gradient
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated circles
    circles.forEach((circle, index) => {
        const offsetX = Math.cos(circle.angle + time * circle.speed) * circle.radius * canvas.width;
        const offsetY = Math.sin(circle.angle + time * circle.speed) * circle.radius * canvas.height;

        const x = circle.x * canvas.width + offsetX;
        const y = circle.y * canvas.height + offsetY;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, circle.size);

        const [r, g, b] = circle.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.35)`);
        gradient.addColorStop(0.15, `rgba(${r}, ${g}, ${b}, 0.28)`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.2)`);
        gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.12)`);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.06)`);
        gradient.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, 0.02)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    requestAnimationFrame(render);
}

// Initialize
generateNoiseOverlay();
requestAnimationFrame(render);

// Existing code below
document.addEventListener('DOMContentLoaded', () => {
    // Load and Parse Resume.md to Timeline
    loadResumeTimeline();

    // Smooth Scrolling with User Interruption Handling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (!targetElement) return;

            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 800; // ms
            let start = null;
            let animationId;

            // Cancel scroll on user interaction
            const cancelScroll = () => {
                cancelAnimationFrame(animationId);
                window.removeEventListener('wheel', cancelScroll);
                window.removeEventListener('touchstart', cancelScroll);
                window.removeEventListener('keydown', cancelScroll);
            };

            window.addEventListener('wheel', cancelScroll);
            window.addEventListener('touchstart', cancelScroll);
            window.addEventListener('keydown', cancelScroll);

            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const percentage = Math.min(progress / duration, 1);

                // Ease-in-out cubic function
                const ease = percentage < 0.5
                    ? 4 * percentage * percentage * percentage
                    : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

                window.scrollTo(0, startPosition + distance * ease);

                if (progress < duration) {
                    animationId = requestAnimationFrame(step);
                } else {
                    cancelScroll(); // Cleanup listeners after completion
                }
            }

            animationId = requestAnimationFrame(step);
        });
    });

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
