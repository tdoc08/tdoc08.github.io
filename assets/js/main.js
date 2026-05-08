/* ============================================
   EVERMORE PERMANENT JEWELRY
   main.js — Interactive Components v2.0
   ============================================ */

'use strict';

/* ---- Utility ---- */
function qs(sel, ctx = document)  { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

/* ---- Analytics helpers ---- */
window.dataLayer = window.dataLayer || [];

/* Derive a stable cta_location label from a clicked element by walking up
   the DOM and matching the nearest known wrapper. Used for book_cta_click
   and call_now_click events so we can see WHICH CTA placement was used. */
function getCtaLocation(el) {
  if (!el) return 'unknown';
  if (el.closest('.nav-cta-wrap, .nav-cta-dropdown-trigger, .nav-cta-dropdown')) return 'nav_dropdown';
  if (el.closest('.sticky-book-bar')) return 'sticky_bar';
  if (el.closest('.floating-book-btn')) return 'floating_btn';
  if (el.closest('.book-chooser')) return 'chooser_modal';
  if (el.closest('.cta-strip')) return 'cta_strip';
  if (el.closest('.acuity-booking-section')) return 'booking_section';
  if (el.closest('.booking-card')) return 'booking_card';
  if (el.closest('.pricing-carousel-section, .pricing-grid')) return 'pricing';
  if (el.closest('.services-grid, .service-card')) return 'services';
  if (el.closest('.about-grid, .about-text')) return 'about';
  if (el.closest('.gallery-grid, .portfolio-grid')) return 'gallery';
  if (el.closest('.location-events-section, .private-events-section')) return 'private_events';
  if (el.closest('.cta-row')) return 'cta_row';
  if (el.closest('header, .site-header')) return 'header';
  if (el.closest('footer, .site-footer')) return 'footer';
  if (el.closest('.hero, [class*="hero"]')) return 'hero';
  return 'unknown';
}

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

  /* Debounced analytics event so we don't fire one push per keystroke */
  let searchTimer = null;
  const reportSearch = (term, hasResults) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (term.length < 3) return;  // ignore noise
      window.dataLayer.push({
        event: 'faq_search',
        search_term: term,
        has_results: hasResults,
        page_path: window.location.pathname
      });
    }, 600);
  };

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

    /* ANALYTICS: report search term (debounced) */
    if (q) reportSearch(q, anyVisible);
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

      /* ANALYTICS: which gallery filters are people exploring? */
      window.dataLayer.push({
        event: 'gallery_filter_click',
        gallery_category: filter || 'all',
        page_path: window.location.pathname
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

    /* ANALYTICS: which gallery images are getting opened? */
    window.dataLayer.push({
      event: 'gallery_lightbox_open',
      image_src: img ? (img.src.split('/').pop() || '') : '',
      gallery_category: item.dataset.category || 'unknown',
      page_path: window.location.pathname
    });
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
  let firedImpression = false;

  window.addEventListener('scroll', () => {
    const visible = window.scrollY > SHOW_AFTER;
    btn.classList.toggle('visible', visible);

    /* ANALYTICS: one-shot impression for funnel — did this CTA actually appear? */
    if (visible && !firedImpression) {
      firedImpression = true;
      window.dataLayer.push({
        event: 'book_cta_impression',
        cta_location: 'floating_btn',
        page_path: window.location.pathname
      });
    }
  }, { passive: true });
}

/* ============================================================
   8b. Sticky Book Bar (mobile only — slides up after scroll)
   ============================================================ */
function initStickyBookBar() {
  const bar = qs('.sticky-book-bar');
  if (!bar) return;

  const SHOW_AFTER = 120; // px — appears after first scroll gesture
  let firedImpression = false;

  window.addEventListener('scroll', () => {
    const visible = window.scrollY > SHOW_AFTER;
    bar.classList.toggle('is-visible', visible);

    /* ANALYTICS: one-shot impression for funnel */
    if (visible && !firedImpression) {
      firedImpression = true;
      window.dataLayer.push({
        event: 'book_cta_impression',
        cta_location: 'sticky_bar',
        page_path: window.location.pathname
      });
    }
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
/* ============================================================
   17. Acuity Widget — dataLayer Events + Fallback
   ============================================================ */
function initAcuityWidget() {
  const wrapper = qs('.acuity-widget-wrapper');
  if (!wrapper) return;

  const location = wrapper.dataset.location || 'unknown';
  const dl = window.dataLayer = window.dataLayer || [];

  /* 1. Fire `acuity_widget_view` when widget enters viewport */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          dl.push({ event: 'acuity_widget_view', acuity_location: location });
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(wrapper);
  }

  /* 1b. Hide the mobile sticky-book-bar while the widget is in viewport
        (it covers the bottom of the iframe — Continue button, time slots, etc.). */
  const stickyBar = qs('.sticky-book-bar');
  if (stickyBar && 'IntersectionObserver' in window) {
    const stickyObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        stickyBar.classList.toggle('is-hidden-by-widget', e.isIntersecting);
      });
    }, { threshold: 0.05 });
    stickyObserver.observe(wrapper);
  }

  /* 2. Listen for postMessage from Acuity iframe.
        Acuity dispatches: 'acuityClick' (interactions), 'acuityConfirm' (booking complete) */
  window.addEventListener('message', (event) => {
    if (!event.origin.includes('acuityscheduling.com')) return;
    const msg = event.data;
    if (typeof msg !== 'string') return;

    if (msg === 'acuityClick' || msg.indexOf('acuityClick') === 0) {
      dl.push({ event: 'acuity_booking_started', acuity_location: location });
    }
    if (msg === 'acuityConfirm' || msg.indexOf('acuityConfirm') === 0) {
      dl.push({ event: 'acuity_booking_client_confirmed', acuity_location: location });
      /* Server-side webhook is the authoritative conversion source.
         This client event is for funnel tracking only — sGTM dedupes via appointment_id. */
    }
  });

  /* 3. Fallback if iframe never loads */
  const iframe = wrapper.querySelector('iframe');
  if (iframe) {
    iframe.addEventListener('load', () => { iframe.dataset.loaded = 'true'; });
    setTimeout(() => {
      if (iframe.dataset.loaded !== 'true') {
        const fb = document.createElement('div');
        fb.className = 'acuity-widget-fallback';
        const fallbackUrl = wrapper.dataset.fallbackUrl || '#';
        fb.innerHTML = '<p>Booking widget is taking longer than expected. ' +
          'Call <a href="tel:+16305967306">(630) 596-7306</a> or ' +
          '<a href="' + fallbackUrl + '" target="_blank" rel="noopener">book directly</a>.</p>';
        wrapper.appendChild(fb);
        dl.push({ event: 'acuity_widget_load_failed', acuity_location: location });
      }
    }, 10000);
  }
}

/* ============================================================
   18. Book Now Dropdown (homepage nav CTA)
   ============================================================ */
function initBookDropdown() {
  const wrap = qs('.nav-cta-wrap');
  if (!wrap) return;

  const trigger = wrap.querySelector('.nav-cta-dropdown-trigger');
  if (!trigger) return;

  const close = () => {
    wrap.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = wrap.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  });

  /* Close when clicking outside */
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) close();
  });

  /* Close on Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  /* Close after selecting an option */
  wrap.querySelectorAll('.nav-cta-dropdown a').forEach(link => {
    link.addEventListener('click', close);
  });
}

/* ============================================================
   19. Shared Book Chooser (any [data-book-cta] button)
   Click any homepage Book Now button -> small popover appears
   with two location choices. On mobile: slides up as bottom sheet.
   ============================================================ */
function initBookChooser() {
  const triggers = qsa('[data-book-cta]');
  if (!triggers.length) return;

  /* Build the shared chooser element (single instance, appended to body) */
  let chooser = qs('#book-chooser');
  if (!chooser) {
    chooser = document.createElement('ul');
    chooser.id = 'book-chooser';
    chooser.className = 'book-chooser';
    chooser.setAttribute('role', 'menu');
    chooser.setAttribute('aria-label', 'Choose your booking location');
    chooser.innerHTML =
      '<li role="none"><a href="book-gulf-shores.html#book" role="menuitem">' +
      '<i class="fa-solid fa-location-dot" aria-hidden="true"></i> Gulf Shores, AL</a></li>' +
      '<li role="none"><a href="book-west-palm-beach.html#book" role="menuitem">' +
      '<i class="fa-solid fa-location-dot" aria-hidden="true"></i> West Palm Beach, FL</a></li>';
    document.body.appendChild(chooser);
  }

  let activeTrigger = null;

  const close = () => {
    chooser.classList.remove('is-open');
    document.body.classList.remove('book-chooser-open');
    if (activeTrigger) {
      activeTrigger.setAttribute('aria-expanded', 'false');
      activeTrigger = null;
    }
  };

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

  const clearInlinePosition = () => {
    chooser.style.removeProperty('top');
    chooser.style.removeProperty('left');
    chooser.style.removeProperty('right');
    chooser.style.removeProperty('bottom');
    chooser.style.removeProperty('width');
    chooser.style.removeProperty('position');
  };

  const positionChooser = (trigger) => {
    /* Always clear stale inline styles first so a desktop→mobile resize
       doesn't leave the chooser stranded at the old absolute position. */
    clearInlinePosition();

    /* On mobile, CSS @media (max-width: 600px) handles the bottom-sheet
       layout (position: fixed; bottom: 1rem; left/right: 1rem). */
    if (isMobile()) return;

    /* Desktop: position absolutely below (or above) the trigger button. */
    const rect = trigger.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const chooserH = 132;
    const chooserW = 260;

    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < chooserH + 20;

    if (showAbove) {
      chooser.style.top = (rect.top + scrollY - chooserH - 10) + 'px';
    } else {
      chooser.style.top = (rect.bottom + scrollY + 8) + 'px';
    }

    let left = rect.left + (rect.width / 2) - (chooserW / 2);
    left = Math.max(10, Math.min(left, window.innerWidth - chooserW - 10));
    chooser.style.left = left + 'px';
    chooser.style.right = 'auto';
    chooser.style.width = chooserW + 'px';
  };

  const open = (trigger) => {
    if (activeTrigger && activeTrigger !== trigger) {
      activeTrigger.setAttribute('aria-expanded', 'false');
    }
    activeTrigger = trigger;
    positionChooser(trigger);
    chooser.classList.add('is-open');
    document.body.classList.add('book-chooser-open');
    trigger.setAttribute('aria-expanded', 'true');

    /* ANALYTICS: chooser opened */
    window.dataLayer.push({
      event: 'book_chooser_opened',
      cta_location: getCtaLocation(trigger),
      page_path: window.location.pathname
    });
  };

  triggers.forEach(trigger => {
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      /* ANALYTICS: every Book Now click — the answer to "where are people clicking?" */
      window.dataLayer.push({
        event: 'book_cta_click',
        cta_location: getCtaLocation(trigger),
        cta_destination: trigger.getAttribute('href') || 'chooser_only',
        page_path: window.location.pathname
      });

      if (activeTrigger === trigger && chooser.classList.contains('is-open')) {
        close();
      } else {
        open(trigger);
      }
    });
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (!chooser.contains(e.target) && !e.target.closest('[data-book-cta]')) {
      close();
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  /* Close after selecting a location + fire location selection event */
  chooser.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href') || '';
      const selectedLocation = href.includes('gulf-shores') ? 'gulf_shores'
        : href.includes('west-palm-beach') ? 'west_palm_beach'
        : 'unknown';

      /* ANALYTICS: which location did they pick? */
      window.dataLayer.push({
        event: 'book_location_selected',
        selected_location: selectedLocation,
        cta_location: activeTrigger ? getCtaLocation(activeTrigger) : 'unknown',
        page_path: window.location.pathname
      });

      close();
    });
  });

  /* Reposition / close on scroll or resize */
  window.addEventListener('scroll', () => {
    if (chooser.classList.contains('is-open')) close();
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (chooser.classList.contains('is-open')) close();
  });
}

/* ============================================================
   20. Call Now Tracking — every tel: link site-wide
   ============================================================ */
function initCallNowTracking() {
  const telLinks = qsa('a[href^="tel:"]');
  if (!telLinks.length) return;

  telLinks.forEach(link => {
    /* Use pointerdown so the event reliably fires on iOS even when the
       phone dialer takes over before the click event propagates. */
    const handler = () => {
      window.dataLayer.push({
        event: 'call_now_click',
        cta_location: getCtaLocation(link),
        phone_number: (link.getAttribute('href') || '').replace('tel:', ''),
        page_path: window.location.pathname
      });
    };
    link.addEventListener('pointerdown', handler, { passive: true });
    /* Fallback for browsers without pointer events */
    link.addEventListener('click', handler);
  });
}

/* ============================================================
   21. Engagement Tracking — scroll depth + engaged time
   ============================================================ */
function initEngagementTracking() {
  const dl = window.dataLayer;
  const path = window.location.pathname;

  /* ---- Scroll depth: 25 / 50 / 75 / 100 ---- */
  const thresholds = [25, 50, 75, 100];
  const fired = new Set();
  let scrollTicking = false;

  const checkScroll = () => {
    scrollTicking = false;
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    ) - window.innerHeight;
    if (docHeight <= 0) return;

    const pct = Math.round(((window.scrollY || window.pageYOffset) / docHeight) * 100);

    thresholds.forEach(t => {
      if (pct >= t && !fired.has(t)) {
        fired.add(t);
        dl.push({
          event: 'scroll_depth',
          scroll_pct: t,
          page_path: path
        });
      }
    });
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(checkScroll);
      scrollTicking = true;
    }
  }, { passive: true });

  /* ---- Engaged time: 15s / 30s / 60s of active engagement ---- */
  const timeMilestones = [15, 30, 60];
  const timeFired = new Set();
  let elapsedSeconds = 0;
  let timerId = null;

  const tick = () => {
    elapsedSeconds += 1;
    timeMilestones.forEach(t => {
      if (elapsedSeconds >= t && !timeFired.has(t)) {
        timeFired.add(t);
        dl.push({
          event: 'engaged_time',
          engagement_seconds: t,
          page_path: path
        });
      }
    });
    if (timeFired.size === timeMilestones.length) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  const startTimer = () => {
    if (timerId == null && timeFired.size < timeMilestones.length) {
      timerId = setInterval(tick, 1000);
    }
  };

  const stopTimer = () => {
    if (timerId != null) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  /* Pause timer when tab is hidden, resume when visible */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTimer(); else startTimer();
  });

  if (!document.hidden) startTimer();
}

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
  /* Acuity Widget */
  initAcuityWidget();
  /* Book Now Nav Dropdown */
  initBookDropdown();
  /* Book Now Inline Chooser (data-book-cta) */
  initBookChooser();
  /* Analytics: Call Now tel: link tracking */
  initCallNowTracking();
  /* Analytics: scroll depth + engaged time */
  initEngagementTracking();
  /* Footer year */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
