document.addEventListener('DOMContentLoaded', () => {
    // Load Resume
    const resumeContent = document.getElementById('resume-content');

    fetch('assets/resume.md')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            resumeContent.innerHTML = marked.parse(text);
        })
        .catch(error => {
            console.error('Error loading resume:', error);
            resumeContent.innerHTML = '<p>Error loading resume. Please try again later.</p>';
        });

    // Scroll Animations
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
        threshold: 0.5 // Play when 50% visible
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

        // Show controls on hover
        video.addEventListener('mouseenter', () => {
            video.setAttribute('controls', 'true');
        });

        video.addEventListener('mouseleave', () => {
            video.removeAttribute('controls');
        });
    });
});
