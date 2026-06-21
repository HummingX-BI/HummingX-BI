/**
 * ================================================================
 * HummingX-BI — Animations & Motion Layer v1.0
 * Carruseles, marquee infinito, microinteracciones y hero entrance
 * ================================================================
 * Respeta prefers-reduced-motion en todos los módulos.
 * Usa solo transform/opacity para evitar layout shifts (CLS=0).
 * ================================================================
 */

'use strict';

/* ── Detect reduced motion preference ────────────────────────── */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ================================================================
   A. HERO ENTRANCE ANIMATION
   Staggered fade+translateY on page load, after preloader.
   ================================================================ */
const HeroEntranceModule = (() => {
  function init() {
    if (REDUCED_MOTION) {
      // Skip animation — make everything immediately visible
      document.querySelectorAll('.hero__eyebrow, .hero__title, .hero__subtitle, .hero__cta-wrapper, .hero__context-pills')
        .forEach(el => el.style.opacity = '1');
      return;
    }

    const timeline = [
      { selector: '.hero__eyebrow',       delay: 100 },
      { selector: '.hero__title',          delay: 260 },
      { selector: '.hero__subtitle',       delay: 440 },
      { selector: '.hero__cta-wrapper',    delay: 580 },
      { selector: '.hero__context-pills',  delay: 700 },
    ];

    // Set initial state (CSS should also handle this, but JS ensures consistency)
    timeline.forEach(({ selector }) => {
      const el = document.querySelector(selector);
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'none';
    });

    // Trigger staggered entrance after a tiny delay (ensures paint)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timeline.forEach(({ selector, delay }) => {
          const el = document.querySelector(selector);
          if (!el) return;
          setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
        });
      });
    });
  }

  return { init };
})();


/* ================================================================
   B. FAQ SMOOTH ACCORDION — CSS grid-template-rows transition
   The CSS already uses grid-template-rows: 0fr → 1fr.
   We only need to ensure --transition-normal is defined.
   We also add a transition fix for browsers that need it.
   ================================================================ */
const FaqSmoothModule = (() => {
  function init() {
    // The CSS handles the animation via grid-template-rows.
    // We patch the transition variable if it's missing.
    const rootStyle = getComputedStyle(document.documentElement);
    const hasNormalTransition = rootStyle.getPropertyValue('--transition-normal').trim();

    if (!hasNormalTransition) {
      document.documentElement.style.setProperty(
        '--transition-normal',
        '350ms cubic-bezier(0.25, 1, 0.5, 1)'
      );
    }

    // Enhance: also update border color on open
    const faqHeaders = document.querySelectorAll('.faq-item__header');
    faqHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const faqItem = header.closest('.faq-item');
        const isExpanding = header.getAttribute('aria-expanded') !== 'true';
        // Close all siblings
        faqHeaders.forEach(h => {
          h.closest('.faq-item')?.classList.remove('is-open');
        });
        if (isExpanding) {
          faqItem?.classList.add('is-open');
        }
      });
    });
  }

  return { init };
})();


/* ================================================================
   C. MARQUEE INFINITO para sección de atributos/respaldo
   Auto-scroll continuo, pausa on hover (desktop), fade edges.
   Si no existe el elemento, no hace nada (graceful).
   ================================================================ */
const MarqueeModule = (() => {
  function buildMarquee(container) {
    if (!container || REDUCED_MOTION) return;

    // Clone children for seamless loop
    const track = container.querySelector('.marquee__track');
    if (!track) return;

    const items = track.querySelectorAll('.marquee__item');
    if (!items.length) return;

    // Duplicate items to create seamless loop
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    // Pause on hover (desktop only)
    container.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    container.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  }

  function init() {
    const marquees = document.querySelectorAll('.marquee');
    marquees.forEach(buildMarquee);
  }

  return { init };
})();


/* ================================================================
   D. ENHANCED CAROUSEL MODULE
   Replaces basic carousel with:
   - Keyboard navigation (arrow keys)
   - Touch swipe support (native scroll-snap + touch events)
   - Auto-width scroll calculation based on actual card width
   - Smooth progress bar updates
   - Peek effect: first/last card fade to indicate more content
   ================================================================ */
const EnhancedCarouselModule = (() => {
  function initCarousel(wrapper) {
    const container = wrapper.querySelector('.carousel-container');
    const prevBtn   = wrapper.querySelector('.carousel-prev');
    const nextBtn   = wrapper.querySelector('.carousel-next');
    const progressBar = wrapper.querySelector('.carousel-progress-bar');

    if (!container) return;

    /* ── Progress bar update ────────────────────────── */
    function updateProgress() {
      if (!progressBar) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const progress  = maxScroll > 0 ? (container.scrollLeft / maxScroll) * 100 : 0;
      // Min 8% width so bar is always visible
      progressBar.style.width = Math.max(8, Math.min(100, progress)) + '%';
    }

    container.addEventListener('scroll', updateProgress, { passive: true });

    /* ── Button navigation ──────────────────────────── */
    function scrollByCard(direction) {
      // Use actual card width for precise snapping
      const firstCard = container.querySelector('.solution-card, .project-card');
      const cardWidth = firstCard
        ? firstCard.getBoundingClientRect().width + 24 // 24 = gap
        : 320;
      container.scrollBy({ left: direction * cardWidth, behavior: REDUCED_MOTION ? 'instant' : 'smooth' });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollByCard(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByCard(1));

    /* ── Keyboard navigation ────────────────────────── */
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollByCard(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1);  }
    });

    /* ── Button state: disable at edges ─────────────── */
    function updateBtnState() {
      if (!prevBtn || !nextBtn) return;
      const atStart = container.scrollLeft <= 2;
      const atEnd   = container.scrollLeft >= container.scrollWidth - container.clientWidth - 2;
      prevBtn.style.opacity = atStart ? '0.3' : '1';
      nextBtn.style.opacity = atEnd   ? '0.3' : '1';
    }

    container.addEventListener('scroll', updateBtnState, { passive: true });

    /* ── Init ─────────────────────────────────────── */
    setTimeout(() => {
      updateProgress();
      updateBtnState();
    }, 150);
  }

  function init() {
    const wrappers = document.querySelectorAll('.carousel-wrapper');
    wrappers.forEach(initCarousel);
  }

  return { init };
})();


/* ================================================================
   E. PROCESS STEPPER — Progressive line draw on scroll
   Uses IntersectionObserver to mark steps active.
   A CSS pseudo-element `::after` animates its `scaleX`.
   ================================================================ */
const ProcessStepperEnhancedModule = (() => {
  function init() {
    const steps = document.querySelectorAll('.process-step');
    if (!steps.length || REDUCED_MOTION) {
      // On reduced motion, just make all steps fully visible
      steps.forEach(s => s.classList.add('is-active'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Activate with a small delay per step index for cascade effect
          const stepIndex = Array.from(steps).indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('is-active');
          }, stepIndex * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '-10% 0px -20% 0px',
      threshold: 0.3
    });

    steps.forEach(step => observer.observe(step));
  }

  return { init };
})();


/* ================================================================
   F. CARD HOVER ENHANCEMENT
   Adds subtle border-accent glow on hover to cards.
   Pure CSS is preferred; this JS layer adds dynamic shadow.
   ================================================================ */
const CardHoverModule = (() => {
  function init() {
    if (REDUCED_MOTION) return;

    const cards = document.querySelectorAll(
      '.team-profile, .project-card, .solution-card, .process-step, .philosophy-card'
    );

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-3px)';
        card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,229,160,0.15)';
        card.style.borderColor = 'rgba(0,229,160,0.3)';
        card.style.transition = 'transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease, border-color 200ms ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.borderColor = '';
      });
    });
  }

  return { init };
})();


/* ================================================================
   G. SCROLL REVEAL — Enhanced (one-shot, staggered children)
   Ensures every section has reveal-up classes applied uniformly.
   ================================================================ */
const ScrollRevealEnhancedModule = (() => {
  function init() {
    if (REDUCED_MOTION) {
      // Instantly reveal everything
      document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
        .forEach(el => el.classList.add('is-visible'));
      return;
    }

    const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (!elements.length || !('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // one-shot only
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '-30px 0px -30px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ================================================================
   INICIALIZACIÓN GLOBAL
   ================================================================ */
function initAnimations() {
  const onReady = () => {
    // Hero entrance fires on load, after preloader timeout
    // We wait for preloader to finish (~1s) then trigger entrance
    const PRELOADER_DURATION = 1000;
    setTimeout(() => HeroEntranceModule.init(), PRELOADER_DURATION);

    FaqSmoothModule.init();
    MarqueeModule.init();
    EnhancedCarouselModule.init();
    ProcessStepperEnhancedModule.init();
    CardHoverModule.init();
    ScrollRevealEnhancedModule.init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
}

initAnimations();
