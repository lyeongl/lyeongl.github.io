'use strict';

// AOS
AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 80 });

// Scroll progress
const scrollProgress = document.getElementById('scroll-progress');
function updateScrollProgress() {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (window.scrollY / docH * 100) + '%';
}

// Nav scroll effect
const navbar = document.getElementById('navbar');
function onScroll() {
  updateScrollProgress();
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('back-to-top').classList.toggle('visible', window.scrollY > 400);
}
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Back to top
document.getElementById('back-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Typing effect
const phrases = ['Backend Engineer', 'AI Workflow Architect', 'Problem Solver'];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typingEl = document.getElementById('typing-text');

function type() {
  const phrase = phrases[phraseIdx];
  if (!deleting) {
    typingEl.textContent = phrase.slice(0, ++charIdx);
    if (charIdx === phrase.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    typingEl.textContent = phrase.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
  }
  setTimeout(type, deleting ? 60 : 90);
}
type();

// Project card accordion (global for inline onclick)
window.toggleCard = function toggleCard(header) {
  const card = header.closest('.project-card');
  card.classList.toggle('open');
}
