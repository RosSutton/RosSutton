// Sections to load in order
const sections = [
  'sections/hero.html',
  'sections/approach.html',
  'sections/services.html',
  'sections/testimonials.html',
  'sections/bio.html',
  'sections/contact.html',
  'sections/blogs.html',
];

async function loadSections() {
  const container = document.getElementById('page-content');

  for (const path of sections) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to load ${path}`);
      const html = await res.text();
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      container.appendChild(wrapper.firstElementChild);
    } catch (err) {
      console.error(err);
    }
  }

  initAnimations();
  initNavHighlight();
}

// IntersectionObserver: add .visible when element enters viewport
function initAnimations() {
  const targets = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger'
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

// Highlight the active nav link as user scrolls
function initNavHighlight() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const sectionEls = document.querySelectorAll('section[id]');

  const highlightObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.style.color = '';
          });
          const active = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          if (active) active.style.color = 'var(--orange)';
        }
      });
    },
    { threshold: 0.4 }
  );

  sectionEls.forEach((el) => highlightObserver.observe(el));
}

// Footer year
document.getElementById('footer-year').textContent = new Date().getFullYear();

loadSections();
