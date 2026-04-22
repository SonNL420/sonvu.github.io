/* ── NAVIGATION ── */
const header = document.getElementById('top').closest('header') || document.querySelector('.site-header');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

// Sticky header shadow on scroll
window.addEventListener('scroll', () => {
  document.querySelector('.site-header').classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Mobile menu toggle
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

/* ── SCROLL ANIMATIONS ── */
const fadeEls = document.querySelectorAll(
  '.service-card, .why-card, .testimonial-card, .about-text, .about-image-wrap, .contact-info, .contact-form-wrap, .section-header'
);
fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
  { threshold: 0.12 }
);
fadeEls.forEach(el => observer.observe(el));

/* ── STAGGERED CARD ANIMATIONS ── */
document.querySelectorAll('.services-grid, .why-grid, .testimonials-grid').forEach(grid => {
  grid.querySelectorAll('.service-card, .why-card, .testimonial-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 80}ms`;
  });
});

/* ── CONTACT FORM ── */
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  if (!name || !email) return;

  // Simulate a brief async submission
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    form.hidden = true;
    formSuccess.hidden = false;
  }, 800);
});

/* ── SMOOTH ANCHOR OFFSET (accounts for fixed nav) ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = document.querySelector('.site-header').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
