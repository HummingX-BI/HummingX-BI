/**
 * =========================================================================
 * HummingX BI — Experiencia Interactiva Ultra-Premium con GSAP & ScrollTrigger
 * Versión: 4.0.0 (Rama: prueba-gsap)
 * =========================================================================
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar plugins oficiales
gsap.registerPlugin(ScrollTrigger);
window.__GSAP_ACTIVE__ = true;

// Variable para controlar el menú
let luxuryNavTimeline = null;

/* =========================================================================
   1. INICIALIZADOR PRINCIPAL
   ========================================================================= */
export function initGsapExperience() {
  setupScrollProgressBar();
  setupCursorSpotlight();
  setupMagneticButtons();
  setupCardTiltPhysics();
  setupHeroSequence();
  setupCounterAnimations();
  setupScrollReveals();
  setupParallaxLights();
  setupFaqGsapAccordion();
  setupLuxuryNavGsap();
  
  console.log('🚀 HummingX BI: GSAP & ScrollTrigger activados al 100%');
}

/* =========================================================================
   2. BARRA DE PROGRESO DE LECTURA (Top Neon Progress Bar)
   ========================================================================= */
function setupScrollProgressBar() {
  let bar = document.getElementById('gsap-scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'gsap-scroll-progress';
    bar.className = 'fixed top-0 left-0 right-0 h-[3px] z-[200] origin-left bg-gradient-to-r from-[#00C4CC] via-[#00E5FF] to-[#0A58A3] shadow-[0_0_15px_rgba(0,196,204,0.9)] pointer-events-none';
    document.body.prepend(bar);
  }

  gsap.fromTo(bar, 
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.2
      }
    }
  );
}

/* =========================================================================
   3. CURSOR SPOTLIGHT AMBIENTAL (Efecto Linterna Suave)
   ========================================================================= */
function setupCursorSpotlight() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Omitir en móviles touch

  let spotlight = document.getElementById('gsap-cursor-spotlight');
  if (!spotlight) {
    spotlight = document.createElement('div');
    spotlight.id = 'gsap-cursor-spotlight';
    spotlight.className = 'fixed w-[500px] h-[500px] rounded-full pointer-events-none z-[40] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-700';
    spotlight.style.background = 'radial-gradient(circle, rgba(0, 196, 204, 0.08) 0%, rgba(75, 29, 111, 0.03) 40%, transparent 70%)';
    document.body.appendChild(spotlight);
  }

  const setX = gsap.quickTo(spotlight, 'x', { duration: 0.6, ease: 'power3.out' });
  const setY = gsap.quickTo(spotlight, 'y', { duration: 0.6, ease: 'power3.out' });

  window.addEventListener('mousemove', (e) => {
    setX(e.clientX);
    setY(e.clientY);
    spotlight.style.opacity = '1';
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
}

/* =========================================================================
   4. BOTONES MAGNÉTICOS (Atracción suave al cursor)
   ========================================================================= */
function setupMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const magneticElements = document.querySelectorAll(
    '#luxury-hamburger-btn, .hero-cta-btn, .gsap-magnetic, a[href="#contacto"], a[href="https://wa.me/525575084267"]'
  );

  magneticElements.forEach((el) => {
    el.style.willChange = 'transform';

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * 0.28,
        y: y * 0.28,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1.1, 0.4)',
        overwrite: 'auto'
      });
    });
  });
}

/* =========================================================================
   5. FÍSICA DE INCLINACIÓN 3D EN TARJETAS (Card Tilt Physics)
   ========================================================================= */
function setupCardTiltPhysics() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll(
    '#servicios .group, #soluciones .grid > div, #metodologia .grid > div, #afiliate .grid > div'
  );

  cards.forEach((card) => {
    card.style.transformStyle = 'preserve-3d';
    card.style.perspective = '1000px';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5.5; // Inclinación vertical
      const rotateY = ((x - centerX) / centerX) * 5.5;  // Inclinación horizontal

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.018,
        duration: 0.35,
        ease: 'power2.out',
        transformPerspective: 1000,
        overwrite: 'auto'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  });
}

/* =========================================================================
   6. SECUENCIA CINEMATOGRÁFICA DEL HERO CON GSAP TIMELINE
   ========================================================================= */
function setupHeroSequence() {
  const loader = document.getElementById('page-loader');
  const hero = document.getElementById('inicio');
  if (!hero) return;

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' }
  });

  // 1. Desvanecer loader
  if (loader) {
    tl.to(loader, {
      opacity: 0,
      scale: 1.05,
      filter: 'blur(8px)',
      duration: 0.75,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  // 2. Luces ambientales despiertan con resplandor
  tl.fromTo(['.hero-glow-pink', '.hero-glow-blue'], 
    { opacity: 0, scale: 0.75 },
    { opacity: 1, scale: 1, duration: 1.4, stagger: 0.2, ease: 'power2.out' },
    '-=0.3'
  );

  // 3. Logo Colibrí: Entrada con rebote y física elástica
  tl.fromTo('.hero-item-logo',
    { opacity: 0, scale: 0.7, y: 40 },
    { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'back.out(1.4)' },
    '-=1.0'
  );

  // Levitación continua del colibrí (loop infinito suave)
  gsap.to('.hero-item-logo img', {
    y: -9,
    rotation: 1,
    duration: 3.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  // 4. Título Principal "HummingX BI"
  tl.fromTo('.hero-item-title',
    { opacity: 0, y: 35, filter: 'blur(6px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.95, ease: 'power3.out' },
    '-=0.7'
  );

  // 5. Badge Editorial "Consultoría e Ingeniería de Software"
  tl.fromTo('.hero-item-badge',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8 },
    '-=0.6'
  );

  // 6. Slogan
  tl.fromTo('.hero-item-slogan',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.85 },
    '-=0.5'
  );

  // 7. Botones de acción y barra de métricas (si existen)
  if (document.querySelector('.hero-actions-group')) {
    tl.fromTo('.hero-actions-group',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.4'
    );
  }

  if (document.querySelector('.hero-metrics-bar')) {
    tl.fromTo('.hero-metrics-bar',
      { opacity: 0, y: 30, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'back.out(1.2)' },
      '-=0.4'
    );
  }

  // 8. Botón hamburguesa y scroll indicator
  tl.fromTo('#luxury-hamburger-btn',
    { opacity: 0, x: -25, scale: 0.85 },
    { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'back.out(1.3)' },
    '-=0.6'
  );

  tl.fromTo('.hero-item-scroll',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.8 },
    '-=0.4'
  );
}

/* =========================================================================
   7. CONTADORES NUMÉRICOS DINÁMICOS (Count-Up con GSAP)
   ========================================================================= */
function setupCounterAnimations() {
  const counterElements = document.querySelectorAll('[data-counter-target]');
  if (!counterElements.length) return;

  counterElements.forEach((el) => {
    const targetValue = parseFloat(el.getAttribute('data-counter-target')) || 0;
    const prefix = el.getAttribute('data-counter-prefix') || '';
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);

    const counterObj = { value: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(counterObj, {
          value: targetValue,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${prefix}${counterObj.value.toFixed(decimals)}${suffix}`;
          }
        });
      }
    });
  });
}

/* =========================================================================
   8. ENTRADAS COREOGRAFIADAS CON SCROLLTRIGGER EN CADA SECCIÓN
   ========================================================================= */
function setupScrollReveals() {
  // Desactivamos la clase vieja si existía para que GSAP tome el control total
  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    el.classList.remove('reveal-on-scroll');
    el.classList.add('gsap-reveal-item');
  });

  // A. Encabezados de Apartado y Títulos
  const sectionHeaders = document.querySelectorAll('section > div > div:first-child, section h2');
  sectionHeaders.forEach((header) => {
    gsap.fromTo(header,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 88%',
          once: true
        }
      }
    );
  });

  // B. Cuadrícula de Servicios (Stagger 2x2)
  const serviciosGrid = document.querySelector('#servicios .grid');
  if (serviciosGrid) {
    const cards = serviciosGrid.querySelectorAll(':scope > div');
    gsap.fromTo(cards,
      { opacity: 0, y: 60, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.95,
        stagger: 0.16,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: serviciosGrid,
          start: 'top 82%',
          once: true
        }
      }
    );
  }

  // C. Soluciones Bento Grid (Stagger 3 columnas)
  const solucionesGrid = document.querySelector('#soluciones .grid');
  if (solucionesGrid) {
    const items = solucionesGrid.querySelectorAll(':scope > div');
    gsap.fromTo(items,
      { opacity: 0, y: 50, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: solucionesGrid,
          start: 'top 82%',
          once: true
        }
      }
    );
  }

  // D. Metodología en 6 Pasos
  const metodologiaGrid = document.querySelector('#metodologia .grid');
  if (metodologiaGrid) {
    const steps = metodologiaGrid.querySelectorAll(':scope > div');
    gsap.fromTo(steps,
      { opacity: 0, y: 45, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: metodologiaGrid,
          start: 'top 82%',
          once: true
        }
      }
    );
  }

  // E. Valores Editoriales (Filas horizontales en cascada)
  const valoresContainer = document.querySelector('#valores .flex.flex-col.gap-4');
  if (valoresContainer) {
    const values = valoresContainer.querySelectorAll(':scope > div');
    gsap.fromTo(values,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: valoresContainer,
          start: 'top 82%',
          once: true
        }
      }
    );
  }

  // F. Sección Afíliate (Dinámica y Niveles)
  const afiliateGrid = document.querySelector('#afiliate .grid');
  if (afiliateGrid) {
    const cols = afiliateGrid.querySelectorAll(':scope > div');
    gsap.fromTo(cols,
      { opacity: 0, y: 45 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.18,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: afiliateGrid,
          start: 'top 80%',
          once: true
        }
      }
    );
  }

  // G. Banner Final de Contacto
  const contactoCard = document.querySelector('#contacto .rounded-3xl.bg-\\[\\#0b0b0e\\]');
  if (contactoCard) {
    gsap.fromTo(contactoCard,
      { opacity: 0, y: 50, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contactoCard,
          start: 'top 82%',
          once: true
        }
      }
    );
  }
}

/* =========================================================================
   9. PARALLAX EN LUCES AMBIENTALES
   ========================================================================= */
function setupParallaxLights() {
  const ambientOrbs = document.querySelectorAll(
    '#inicio .hero-glow-pink, #inicio .hero-glow-blue, #afiliate .blur-\\[130px\\], #afiliate .blur-\\[140px\\], #contacto .blur-3xl'
  );

  ambientOrbs.forEach((orb) => {
    gsap.to(orb, {
      y: 80,
      ease: 'none',
      scrollTrigger: {
        trigger: orb.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  });
}

/* =========================================================================
   10. ACORDEÓN FAQ CON ANIMACIÓN FLUIDA GSAP
   ========================================================================= */
function setupFaqGsapAccordion() {
  const faqButtons = document.querySelectorAll('#faq-accordion button');
  if (!faqButtons.length) return;

  faqButtons.forEach((btn) => {
    const card = btn.parentElement;
    const content = card.querySelector('div');
    const icon = btn.querySelector('.material-symbols-outlined');

    if (!content) return;

    // Inicializar estilos de GSAP
    gsap.set(content, { height: 0, opacity: 0, overflow: 'hidden' });
    content.classList.remove('hidden');

    btn.onclick = (e) => {
      e.preventDefault();
      const isOpen = card.classList.contains('is-open');

      // Cerrar los demás acordeones
      faqButtons.forEach((otherBtn) => {
        const otherCard = otherBtn.parentElement;
        const otherContent = otherCard.querySelector('div');
        const otherIcon = otherBtn.querySelector('.material-symbols-outlined');

        if (otherCard !== card && otherCard.classList.contains('is-open')) {
          otherCard.classList.remove('is-open', 'border-royal-blue', 'bg-white', 'shadow-md');
          otherCard.classList.add('bg-surface-saas', 'border-slate-200');

          gsap.to(otherContent, { height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut' });
          gsap.to(otherIcon, { rotate: 0, duration: 0.35, ease: 'power2.out' });
        }
      });

      if (!isOpen) {
        card.classList.add('is-open', 'border-royal-blue', 'bg-white', 'shadow-md');
        card.classList.remove('bg-surface-saas', 'border-slate-200');

        gsap.to(content, {
          height: 'auto',
          opacity: 1,
          duration: 0.45,
          ease: 'power3.out'
        });
        gsap.to(icon, { rotate: 180, duration: 0.4, ease: 'power2.out' });
      } else {
        card.classList.remove('is-open', 'border-royal-blue', 'bg-white', 'shadow-md');
        card.classList.add('bg-surface-saas', 'border-slate-200');

        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut'
        });
        gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power2.out' });
      }
    };
  });
}

/* =========================================================================
   11. MENÚ DRAWER LATERAL CON GSAP TIMELINE
   ========================================================================= */
function setupLuxuryNavGsap() {
  const hamburger = document.getElementById('luxury-hamburger-btn');
  const backdrop = document.getElementById('luxury-nav-backdrop');
  const panel = document.getElementById('luxury-nav-panel');
  if (!hamburger || !backdrop || !panel) return;

  const links = panel.querySelectorAll('nav a');

  // Inicializar estado de elementos
  gsap.set(panel, { xPercent: -100, opacity: 0 });
  gsap.set(backdrop, { opacity: 0 });
  gsap.set(links, { x: -35, opacity: 0 });

  function openMenu() {
    backdrop.classList.remove('hidden', 'pointer-events-none');
    panel.classList.remove('hidden', 'pointer-events-none');
    hamburger.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    if (luxuryNavTimeline) luxuryNavTimeline.kill();

    luxuryNavTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    luxuryNavTimeline
      .to(backdrop, { opacity: 1, duration: 0.4 })
      .to(panel, { xPercent: 0, opacity: 1, duration: 0.55, ease: 'power4.out' }, '-=0.35')
      .to(links, { x: 0, opacity: 1, duration: 0.45, stagger: 0.045 }, '-=0.35');
  }

  function closeMenu() {
    hamburger.classList.remove('is-open');
    document.body.style.overflow = '';

    if (luxuryNavTimeline) luxuryNavTimeline.kill();

    luxuryNavTimeline = gsap.timeline({
      defaults: { ease: 'power3.in' },
      onComplete: () => {
        backdrop.classList.add('hidden', 'pointer-events-none');
        panel.classList.add('hidden', 'pointer-events-none');
      }
    });

    luxuryNavTimeline
      .to(links, { x: -20, opacity: 0, duration: 0.25, stagger: 0.02 })
      .to(panel, { xPercent: -100, opacity: 0, duration: 0.35, ease: 'power3.inOut' }, '-=0.15')
      .to(backdrop, { opacity: 0, duration: 0.3 }, '-=0.2');
  }

  window.toggleLuxuryMenu = function() {
    const isClosed = panel.classList.contains('hidden') || panel.style.opacity === '0';
    if (isClosed) {
      openMenu();
    } else {
      closeMenu();
    }
  };

  window.navigateToSection = function(targetId, e) {
    if (e) e.preventDefault();
    closeMenu();

    const target = document.querySelector(targetId);
    if (target) {
      setTimeout(() => {
        if (targetId === '#inicio') {
          gsap.to(window, { scrollTo: 0, duration: 1, ease: 'power3.inOut' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const rect = target.getBoundingClientRect();
        const targetY = rect.top + window.pageYOffset;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }, 150);
    }
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
      closeMenu();
    }
  });
}

// Iniciar automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGsapExperience);
} else {
  initGsapExperience();
}
