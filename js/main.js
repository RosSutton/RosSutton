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
  initCardFlip();
  initCarousel();
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

// Testimonials carousel
function initCarousel() {
  const track = document.querySelector('.testimonials-track');
  if (!track) return;

  const original = Array.from(track.querySelectorAll('.testimonial-card'));
  const total = original.length;
  const visibleCount = () => window.innerWidth <= 700 ? 1 : 3;

  // Prepend and append clones for seamless looping
  original.forEach(c => track.appendChild(c.cloneNode(true)));
  original.slice().reverse().forEach(c => track.prepend(c.cloneNode(true)));

  const allCards = track.querySelectorAll('.testimonial-card');
  let current = total; // start at first real card (after prepended clones)

  function cardWidth() {
    return allCards[0].offsetWidth + 28;
  }

  function jumpTo(idx, animate) {
    track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)' : 'none';
    track.style.transform = `translateX(-${idx * cardWidth()}px)`;
    current = idx;
  }

  // After each animated move, silently snap if we're on a clone
  track.addEventListener('transitionend', () => {
    if (current >= total * 2) jumpTo(total, false);
    if (current < total) jumpTo(total * 2 - visibleCount(), false);
  });

  function next() { jumpTo(current + 1, true); }
  function prev() { jumpTo(current - 1, true); }

  // Initialise position without animation
  jumpTo(current, false);

  document.querySelector('.carousel-btn-prev').addEventListener('click', prev);
  document.querySelector('.carousel-btn-next').addEventListener('click', next);

  const prevMobile = document.querySelector('.carousel-btn-prev-mobile');
  const nextMobile = document.querySelector('.carousel-btn-next-mobile');
  if (prevMobile) prevMobile.addEventListener('click', prev);
  if (nextMobile) nextMobile.addEventListener('click', next);

  // Swipe support
  let startX = 0;
  track.addEventListener('pointerdown', (e) => { startX = e.clientX; track.classList.add('grabbing'); track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointerup', (e) => {
    track.classList.remove('grabbing');
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  });

  window.addEventListener('resize', () => jumpTo(current, false));

  window.addEventListener('resize', () => update(false));

  update(false);
}

// Tap to flip on touch devices
function initCardFlip() {
  if (!window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.service-card-wrap').forEach((card) => {
    let touchMoved = false;

    card.addEventListener('touchstart', () => { touchMoved = false; }, { passive: true });
    card.addEventListener('touchmove', () => { touchMoved = true; }, { passive: true });
    card.addEventListener('touchend', (e) => {
      if (touchMoved) return;
      if (e.target.closest('a')) return;
      e.preventDefault();
      card.classList.toggle('flipped');
    });
  });
}

// Footer year
const footerYear = document.getElementById('footer-year');
if (footerYear) footerYear.textContent = new Date().getFullYear();

loadSections();
