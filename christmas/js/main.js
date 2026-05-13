const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: -1000, y: -1000 }; // Start off-screen

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

resize();

class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * height;
    }

    reset() {
        this.x = Math.random() * width;
        this.y = -10;
        // Varied sizes: some small, some larger flakes
        this.size = Math.random() * 3.5 + 0.5;

        // Falling speed depends on size (larger falls slightly faster)
        this.speedY = Math.random() * 1 + 0.5 + (this.size * 0.1);
        this.speedX = Math.random() * 0.5 - 0.25;

        // Opacity varies
        this.opacity = Math.random() * 0.6 + 0.2;

        // Flutter properties for natural motion
        this.flutterSpeed = Math.random() * 0.02 + 0.005;
        this.flutterOffset = Math.random() * Math.PI * 2;
        this.flutterAmp = Math.random() * 0.5 + 0.2;
    }

    update() {
        // Local Interaction Only
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 120; // Slightly larger radius

        if (distance < interactionRadius) {
            // Subtle nudge away from mouse
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (interactionRadius - distance) / interactionRadius;

            // Gentle force
            this.x += forceDirectionX * force * 1.5;
            this.y += forceDirectionY * force * 1.5;
        }

        // Natural flutter (Sine wave)
        this.x += Math.sin(this.y * this.flutterSpeed + this.flutterOffset) * this.flutterAmp;

        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around
        if (this.y > height) {
            this.reset();
        }
        if (this.x > width) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = width;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    particles = [];
    const particleCount = Math.min(width * 0.3, 350); // Good amount of snow
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

init();
animate();

// Version Switcher with Scroll
const versionButtons = document.querySelectorAll('.version-btn');
const sections = document.querySelectorAll('.version-section');

// Button click - scroll to section
versionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const version = btn.dataset.version;
        const targetSection = document.querySelector(`.version-section[data-version="${version}"]`);

        // Immediately update active button
        versionButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active section
        sections.forEach(s => s.classList.remove('active'));
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Update active button based on scroll position
function updateActiveSection() {
    let currentSection = null;
    let minDistance = Infinity;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top);

        // Find the section closest to the top
        if (distance < minDistance) {
            minDistance = distance;
            currentSection = section;
        }
    });

    if (currentSection) {
        const version = currentSection.dataset.version;

        // Update active button
        versionButtons.forEach(btn => {
            if (btn.dataset.version === version) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update active section
        sections.forEach(s => {
            if (s === currentSection) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    }
}

// Use IntersectionObserver for better scroll detection
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const version = entry.target.dataset.version;

            // Update active button
            versionButtons.forEach(btn => {
                if (btn.dataset.version === version) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Update active section
            sections.forEach(s => {
                if (s === entry.target) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        }
    });
}, observerOptions);

// Observe all sections
sections.forEach(section => {
    observer.observe(section);
});

// Also keep scroll listener as backup
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        updateActiveSection();
    }, 100);
});

// Initialize on load
window.addEventListener('load', () => {
    setTimeout(() => {
        updateActiveSection();
    }, 100);
});
