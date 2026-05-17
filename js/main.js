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

// Testimonials carousel (infinite loop)
function initCarousel() {
  const track = document.querySelector('.testimonials-track');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  if (!track) return;

  // Clone all cards and append for seamless looping
  const originalCards = Array.from(track.querySelectorAll('.testimonial-card'));
  originalCards.forEach(card => track.appendChild(card.cloneNode(true)));

  const allCards = track.querySelectorAll('.testimonial-card');
  const total = originalCards.length;
  const visibleCount = () => window.innerWidth <= 700 ? 1 : 3;
  let current = 0;
  let isTransitioning = false;

  // Build dots (mobile only)
  const dotsContainer = document.querySelector('.carousel-dots');
  const dots = originalCards.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => { resetAutoPlay(); current = i; update(); });
    dotsContainer.appendChild(dot);
    return dot;
  });

  function updateDots() {
    const idx = ((current % total) + total) % total;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
  }

  function cardWidth() {
    return allCards[0].offsetWidth + 28;
  }

  function update(animate = true) {
    track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)' : 'none';
    track.style.transform = `translateX(-${current * cardWidth()}px)`;
    updateDots();
  }

  // After animating to a clone, silently jump back to the real card
  track.addEventListener('transitionend', () => {
    if (current >= total) {
      current = current - total;
      update(false);
    } else if (current < 0) {
      current = current + total;
      update(false);
    }
    isTransitioning = false;
  });

  function next() {
    if (isTransitioning) return;
    isTransitioning = true;
    current++;
    update();
  }

  function prev() {
    if (isTransitioning) return;
    isTransitioning = true;
    current--;
    update();
  }

  nextBtn.addEventListener('click', () => { resetAutoPlay(); next(); });
  prevBtn.addEventListener('click', () => { resetAutoPlay(); prev(); });

  // Swipe support
  let startX = 0;
  track.addEventListener('pointerdown', (e) => { startX = e.clientX; track.classList.add('grabbing'); track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointerup', (e) => {
    track.classList.remove('grabbing');
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 50) { resetAutoPlay(); diff > 0 ? next() : prev(); }
  });

  // Auto-play: advance every 4 seconds, pause on hover
  let autoPlay = setInterval(next, 4000);
  function resetAutoPlay() {
    clearInterval(autoPlay);
    autoPlay = setInterval(next, 4000);
  }
  const wrap = document.querySelector('.testimonials-carousel-wrap');
  wrap.addEventListener('mouseenter', () => clearInterval(autoPlay));
  wrap.addEventListener('mouseleave', () => { autoPlay = setInterval(next, 4000); });

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
