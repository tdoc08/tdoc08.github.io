/* ============================================
   EVERMORE PERMANENT JEWELRY
   main.js — Interactive Components v2.0
   ============================================ */

'use strict';

/* ---- Utility ---- */
function qs(sel, ctx = document)  { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

/* ============================================================
   1. Navigation
   ============================================================ */
function initNav() {
  const header = qs('.site-header');
  const nav    = qs('.site-nav');
  const toggle = qs('#nav-toggle');
  const links  = qs('#nav-links');
  if (!nav) return;

  // Scroll shadow
  window.addEventListener('scroll', () => {
    const s = window.scrollY > 30;
    nav.classList.toggle('scrolled', s);
    if (header) header.classList.toggle('scrolled', s);
  }, { passive: true });

  if (toggle && links) {
    // Open / close mobile menu
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('open', !open);
    });

    // Close when a nav link is tapped (mobile)
    qsa('a', links).forEach(a => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      });
    });

    // Close on outside tap
    document.addEventListener('click', e => {
      if (!header.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
        toggle.focus();
      }
    });
  }
}

/* ============================================================
   2. Reviews Carousel
   ============================================================ */
function initReviews() {
  const carousel = qs('.reviews-carousel');
  const track    = qs('.reviews-track');
  if (!track) return;

  const cards   = qsa('.review-card', track);
  const dots    = qsa('.reviews-dot');
  const prevBtn = qs('.reviews-prev');
  const nextBtn = qs('.reviews-next');
  if (!cards.length) return;

  let current  = 0;
  let timer    = null;
  const INTERVAL = 4500;

  function maxIndex() { return Math.max(0, cards.length - 1); }

  function cardWidth() {
    // Measure the first card directly — avoids any mismatch between
    // carousel container width and actual rendered card width on iOS Safari
    return cards[0] ? cards[0].offsetWidth : (carousel ? carousel.offsetWidth : 0);
  }

  function goTo(idx) {
    current = Math.min(Math.max(idx, 0), maxIndex());
    track.style.transform = `translateX(-${current * cardWidth()}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current >= maxIndex() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? maxIndex() : current - 1); }

  function start() { stop(); timer = setInterval(next, INTERVAL); }
  function stop()  { clearInterval(timer); }

  if (nextBtn) nextBtn.addEventListener('click', () => { stop(); next(); start(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { stop(); prev(); start(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { stop(); goTo(i); start(); }));

  if (carousel) {
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    let touchStartX = 0;
    let touchStartY = 0;
    carousel.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = touchStartY - e.changedTouches[0].clientY;
      // Only trigger swipe if horizontal movement dominates (not a scroll)
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? next() : prev();
        start();
      }
    }, { passive: true });
  }

  window.addEventListener('resize', () => goTo(current));
  goTo(0);
  start();
}

/* ============================================================
   3. FAQ Accordion
   ============================================================ */
function initFAQ() {
  const questions = qsa('.faq-question');
  if (!questions.length) return;

  questions.forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer   = answerId ? qs('#' + answerId) : null;

      // Close all
      questions.forEach(q => {
        q.setAttribute('aria-expanded', 'false');
        const a = q.getAttribute('aria-controls');
        if (a) {
          const el = qs('#' + a);
          if (el) el.classList.remove('open');
        }
        // Remove open class from parent faq-item
        q.closest('.faq-item')?.classList.remove('is-open');
      });

      // Open clicked (if was closed)
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.classList.add('open');
        // Add gold left-border to open item
        btn.closest('.faq-item')?.classList.add('is-open');
      }
    });
  });
}

/* ============================================================
   4. FAQ Search / Filter
   ============================================================ */
function initFAQSearch() {
  const input = qs('#faq-search');
  if (!input) return;

  const items    = qsa('.faq-item');
  const groups   = qsa('.faq-group');
  const noResult = qs('.faq-no-results');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let anyVisible = false;

    // Close all open answers
    qsa('.faq-answer.open').forEach(a => a.classList.remove('open'));
    qsa('.faq-question[aria-expanded="true"]').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.closest('.faq-item')?.classList.remove('is-open');
    });

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const show = !q || text.includes(q);
      item.style.display = show ? '' : 'none';
      if (show) anyVisible = true;
    });

    groups.forEach(group => {
      const visible = group.querySelectorAll('.faq-item:not([style*="none"])').length;
      group.style.display = visible ? '' : 'none';
    });

    if (noResult) noResult.style.display = anyVisible ? 'none' : 'block';
  });
}

/* ============================================================
   5. Gallery Filter + Lightbox
   ============================================================ */
function initGallery() {
  const filterBtns = qsa('.gallery-filter-btn');
  const items      = qsa('.gallery-item');
  const lightbox   = qs('.lightbox');
  const lbImg      = qs('.lightbox-img');
  const lbClose    = qs('.lightbox-close');
  const lbPrev     = qs('.lightbox-prev');
  const lbNext     = qs('.lightbox-next');

  // --- Filter ---
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach(item => {
        item.style.display = (filter === 'all' || item.dataset.category === filter) ? '' : 'none';
      });
    });
  });

  // --- Lightbox ---
  if (!lightbox || !lbImg) return;

  let currentItems = [];
  let currentIndex = 0;

  function getVisibleItems() {
    return items.filter(i => i.style.display !== 'none');
  }

  function openLightbox(item) {
    currentItems = getVisibleItems();
    currentIndex = currentItems.indexOf(item);
    const img = item.querySelector('img');
    if (img) { lbImg.src = img.src; lbImg.alt = img.alt; }
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function showAdjacentItem(dir) {
    currentIndex = (currentIndex + dir + currentItems.length) % currentItems.length;
    const img = currentItems[currentIndex]?.querySelector('img');
    if (img) { lbImg.src = img.src; lbImg.alt = img.alt; }
  }

  items.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); }
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', () => showAdjacentItem(-1));
  lbNext?.addEventListener('click', () => showAdjacentItem(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showAdjacentItem(-1);
    if (e.key === 'ArrowRight') showAdjacentItem(1);
  });

  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', e => {
    lbTouchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) showAdjacentItem(diff > 0 ? 1 : -1);
  });
}

/* ============================================================
   6. Scroll Reveal (Intersection Observer)
   ============================================================ */
function initReveal() {
  const els = qsa('.reveal');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

/* ============================================================
   7. Active Nav Link Highlight (CSS class-based)
   ============================================================ */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  qsa('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.split('/').pop() === path) {
      a.classList.add('is-active');
    }
  });
}

/* ============================================================
   8. Floating Book Now Button (Mobile)
   ============================================================ */
function initFloatingBookBtn() {
  const btn = qs('.floating-book-btn');
  if (!btn) return;

  const SHOW_AFTER = 200; // px from top

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > SHOW_AFTER);
  }, { passive: true });
}

/* ============================================================
   8b. Sticky Book Bar (mobile only — slides up after scroll)
   ============================================================ */
function initStickyBookBar() {
  const bar = qs('.sticky-book-bar');
  if (!bar) return;

  const SHOW_AFTER = 120; // px — appears after first scroll gesture

  window.addEventListener('scroll', () => {
    bar.classList.toggle('is-visible', window.scrollY > SHOW_AFTER);
  }, { passive: true });
}

/* ============================================================
   9. Back to Top Button
   ============================================================ */
function initBackToTop() {
  const btn = qs('.back-to-top');
  if (!btn) return;

  const SHOW_AFTER = 400; // px from top

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > SHOW_AFTER);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   11. Generic Card Carousel
   ============================================================ */
function initCardCarousel(carouselEl) {
  if (!carouselEl) return;

  const track   = qs('.card-carousel-track', carouselEl);
  const items   = track ? qsa('.carousel-item', track) : [];
  const dotsWrap = qs('.carousel-dots', carouselEl);
  const prevBtn  = qs('.carousel-prev', carouselEl);
  const nextBtn  = qs('.carousel-next', carouselEl);

  if (!track || !items.length) return;

  /* Build dots */
  if (dotsWrap) {
    items.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Go to item ' + (i + 1));
      d.setAttribute('role', 'tab');
      dotsWrap.appendChild(d);
    });
  }

  let current = 0;

  function itemsVisible() {
    if (!items[0]) return 1;
    const trackW = track.offsetWidth;
    const itemW  = items[0].offsetWidth;
    return Math.max(1, Math.round(trackW / itemW));
  }

  function maxIndex() {
    return Math.max(0, items.length - itemsVisible());
  }

  function goTo(idx) {
    current = Math.min(Math.max(idx, 0), maxIndex());
    if (!items[current]) return;
    const trackRect = track.getBoundingClientRect();
    const itemRect  = items[current].getBoundingClientRect();
    const offset    = track.scrollLeft + (itemRect.left - trackRect.left);
    track.scrollTo({ left: offset, behavior: 'smooth' });

    if (dotsWrap) {
      qsa('.carousel-dot', dotsWrap).forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }
  }

  function next() { goTo(current >= maxIndex() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? maxIndex() : current - 1); }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  if (dotsWrap) {
    qsa('.carousel-dot', dotsWrap).forEach((d, i) => {
      d.addEventListener('click', () => goTo(i));
    });
  }

  /* Touch swipe */
  let touchStartX = 0, touchStartY = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      dx > 0 ? next() : prev();
    }
  }, { passive: true });

  /* Sync dot on native scroll */
  track.addEventListener('scroll', () => {
    if (!dotsWrap) return;
    const scrollLeft = track.scrollLeft;
    let closest = 0, minDist = Infinity;
    items.forEach((item, i) => {
      const dist = Math.abs(item.offsetLeft - scrollLeft);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    current = closest;
    qsa('.carousel-dot', dotsWrap).forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }, { passive: true });

  window.addEventListener('resize', () => goTo(current));
}

/* ============================================================
   12. Pricing Carousel — 3D Card Switching
   ============================================================ */
function initPricingCarousel() {
  const stage = document.getElementById('pricing-stage');
  if (!stage) return;

  const cards   = Array.from(stage.querySelectorAll('.pricing-carousel-card'));
  const panels  = Array.from(document.querySelectorAll('.pricing-carousel-panel'));
  const prevBtn = document.querySelector('.pricing-carousel-prev');
  const nextBtn = document.querySelector('.pricing-carousel-next');
  if (!cards.length) return;

  const total = cards.length;
  let active  = 0; // 14k Gold Filled starts center

  function getPos(cardIdx) {
    const diff = (cardIdx - active + total) % total;
    if (diff === 0)         return 'pos-center';
    if (diff === 1)         return 'pos-right';
    if (diff === total - 1) return 'pos-left';
    return 'pos-hidden';
  }

  function goTo(newActive) {
    active = (newActive + total) % total;
    cards.forEach((card, i) => {
      card.classList.remove('pos-center', 'pos-left', 'pos-right', 'pos-hidden');
      card.classList.add(getPos(i));
    });
    const mat = cards[active].dataset.material;
    panels.forEach(p => {
      p.classList.toggle('active', p.id === 'pcp-' + mat);
    });
  }

  prevBtn?.addEventListener('click', () => goTo(active - 1));
  nextBtn?.addEventListener('click', () => goTo(active + 1));

  // Clicking a side card navigates to it
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i !== active) goTo(i);
    });
  });
}

/* ============================================================
   13. Services 3D Carousel
   ============================================================ */
function initServicesCarousel() {
  const stage = document.getElementById('services-stage');
  if (!stage) return;
  const cards    = Array.from(stage.querySelectorAll('.service-card'));
  const prevBtn  = document.querySelector('.services-carousel-prev');
  const nextBtn  = document.querySelector('.services-carousel-next');
  const dotsWrap = document.getElementById('services-dots');
  if (!cards.length) return;

  const total = cards.length;
  let active  = 0;

  const dots = [];
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'services-carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Service ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
      dots.push(d);
    });
  }

  function getPos(idx) {
    const diff = (idx - active + total) % total;
    if (diff === 0)         return 'pos-center';
    if (diff === 1)         return 'pos-right';
    if (diff === total - 1) return 'pos-left';
    return 'pos-hidden';
  }

  function goTo(newActive) {
    active = (newActive + total) % total;
    cards.forEach((card, i) => {
      card.classList.remove('pos-center', 'pos-left', 'pos-right', 'pos-hidden');
      card.classList.add(getPos(i));
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  }

  prevBtn?.addEventListener('click', () => goTo(active - 1));
  nextBtn?.addEventListener('click', () => goTo(active + 1));
  cards.forEach((card, i) => {
    card.addEventListener('click', () => { if (i !== active) goTo(i); });
  });
}

/* ============================================================
   14. Reviews 3D Carousel
   ============================================================ */
function initReviewsCarousel() {
  const stage = document.getElementById('reviews-stage');
  if (!stage) return;
  const cards    = Array.from(stage.querySelectorAll('.review-3d-card'));
  const prevBtn  = document.querySelector('.reviews-carousel-prev');
  const nextBtn  = document.querySelector('.reviews-carousel-next');
  const dotsWrap = document.getElementById('reviews-dots');
  if (!cards.length) return;

  const total = cards.length;
  let active  = 0;

  const dots = [];
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'reviews-carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Review ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
      dots.push(d);
    });
  }

  function getPos(idx) {
    const diff = (idx - active + total) % total;
    if (diff === 0)         return 'pos-center';
    if (diff === 1)         return 'pos-right';
    if (diff === total - 1) return 'pos-left';
    return 'pos-hidden';
  }

  function goTo(newActive) {
    active = (newActive + total) % total;
    cards.forEach((card, i) => {
      card.classList.remove('pos-center', 'pos-left', 'pos-right', 'pos-hidden');
      card.classList.add(getPos(i));
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  }

  prevBtn?.addEventListener('click', () => goTo(active - 1));
  nextBtn?.addEventListener('click', () => goTo(active + 1));
  cards.forEach((card, i) => {
    card.addEventListener('click', () => { if (i !== active) goTo(i); });
  });
}

/* ============================================================
   14. Category View — Tab Switching
   ============================================================ */
function initCategoryView() {
  const section = qs('.category-view-section');
  if (!section) return;

  const tabs   = qsa('.category-tab', section);
  const panels = qsa('.category-panel', section);
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.panel;

      tabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });

      panels.forEach(p => {
        p.classList.toggle('active', p.id === 'panel-' + target);
      });
    });
  });
}

/* ============================================================
   Init — DOM Ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReviews();
  initFAQ();
  initFAQSearch();
  initGallery();
  initReveal();
  initActiveNav();
  initFloatingBookBtn();
  initStickyBookBar();
  initBackToTop();
  /* Card Carousels */
  qsa('.card-carousel').forEach(initCardCarousel);
  /* Pricing Carousel */
  initPricingCarousel();
  /* Services 3D Carousel */
  initServicesCarousel();
  /* Reviews 3D Carousel */
  initReviewsCarousel();
  /* Category View */
  initCategoryView();
  /* Footer year */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
