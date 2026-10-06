/**
 * =========================================================================
 * HummingX BI — Módulos GSAP Seleccionados
 * 1. Física de Inclinación 3D en Tarjetas (3D Card Tilt Physics)
 * 2. Acordeón FAQ fluido (Animación pura de altura con GSAP)
 * 3. Menú Lateral de Navegación (Apertura suave y escalonada de enlaces)
 * =========================================================================
 */

import gsap from 'gsap';

export function initSelectedGsap() {
  setupCardTiltPhysics();
  setupFaqGsapAccordion();
  setupLuxuryNavExperience();

  console.log('✨ HummingX BI: Módulos GSAP activados (Física 3D, FAQ y Menú Lateral)');
}

/* =========================================================================
   1. FÍSICA DE INCLINACIÓN 3D EN TARJETAS (3D Card Tilt Physics)
   ========================================================================= */
function setupCardTiltPhysics() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Omitir en pantallas táctiles

  const cards = document.querySelectorAll(
    '#servicios .grid > div, #soluciones .grid > div, #metodologia .grid > div, #afiliate .grid > div, #valores .flex.flex-col > div'
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

      // Cálculo angular según distancia al centro
      const rotateX = ((y - centerY) / centerY) * -5.5;
      const rotateY = ((x - centerX) / centerX) * 5.5;

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
        duration: 0.65,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  });
}

/* =========================================================================
   2. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ) CON GSAP
   ========================================================================= */
function setupFaqGsapAccordion() {
  const faqButtons = document.querySelectorAll('#faq-accordion button');
  if (!faqButtons.length) return;

  faqButtons.forEach((btn) => {
    const card = btn.parentElement;
    const content = card.querySelector('div');
    const icon = btn.querySelector('.material-symbols-outlined');

    if (!content) return;

    // Asegurar estado inicial para animación fluida
    gsap.set(content, { height: 0, opacity: 0, overflow: 'hidden' });
    content.classList.remove('hidden');

    btn.onclick = (e) => {
      e.preventDefault();
      const isOpen = card.classList.contains('is-open');

      // Cerrar otros acordeones abiertos
      faqButtons.forEach((otherBtn) => {
        const otherCard = otherBtn.parentElement;
        const otherContent = otherCard.querySelector('div');
        const otherIcon = otherBtn.querySelector('.material-symbols-outlined');

        if (otherCard !== card && otherCard.classList.contains('is-open')) {
          otherCard.classList.remove('is-open', 'border-royal-blue', 'bg-white', 'shadow-md');
          otherCard.classList.add('bg-surface-saas', 'border-slate-200');

          gsap.to(otherContent, { height: 0, opacity: 0, duration: 0.38, ease: 'power2.inOut' });
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
          duration: 0.38,
          ease: 'power2.inOut'
        });
        gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power2.out' });
      }
    };
  });
}

/* =========================================================================
   3. MENÚ LATERAL DE NAVEGACIÓN MEJORADO CON GSAP
   ========================================================================= */
function setupLuxuryNavExperience() {
  const hamburger = document.getElementById('luxury-hamburger-btn');
  const backdrop = document.getElementById('luxury-nav-backdrop');
  const panel = document.getElementById('luxury-nav-panel');

  if (!hamburger || !backdrop || !panel) return;

  // Asegurar que el botón hamburguesa sea 100% visible de inmediato
  hamburger.style.opacity = '1';
  hamburger.style.visibility = 'visible';
  hamburger.style.transform = 'translateY(0)';

  let closeTimer = null;

  window.toggleLuxuryMenu = function() {
    const isClosed = panel.classList.contains('hidden') || panel.classList.contains('-translate-x-full');
    const links = panel.querySelectorAll('nav a');

    if (!isClosed) {
      // Cerrar menú suavemente
      panel.classList.add('-translate-x-full', 'opacity-0', 'pointer-events-none');
      panel.classList.remove('translate-x-0', 'opacity-100', 'pointer-events-auto');
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      hamburger.classList.remove('is-open');
      document.body.style.overflow = '';

      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        backdrop.classList.add('hidden');
        panel.classList.add('hidden');
      }, 500);
    } else {
      // Abrir menú con cascada GSAP en los enlaces
      clearTimeout(closeTimer);
      backdrop.classList.remove('hidden');
      panel.classList.remove('hidden');
      void panel.offsetWidth; // Reflow

      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
      panel.classList.remove('-translate-x-full', 'opacity-0', 'pointer-events-none');
      panel.classList.add('translate-x-0', 'opacity-100', 'pointer-events-auto');
      hamburger.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      // Animación en cascada de los enlaces de navegación
      if (links.length) {
        gsap.fromTo(links, 
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: 'power3.out', delay: 0.08 }
        );
      }
    }
  };

  window.navigateToSection = function(targetId, e) {
    if (e) e.preventDefault();
    window.toggleLuxuryMenu();
    const target = document.querySelector(targetId);
    if (target) {
      setTimeout(() => {
        if (targetId === '#inicio') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const rect = target.getBoundingClientRect();
        const targetY = rect.top + window.pageYOffset;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }, 80);
    }
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (panel && !panel.classList.contains('hidden') && !panel.classList.contains('-translate-x-full')) {
        window.toggleLuxuryMenu();
      }
    }
  });
}

// Iniciar automáticamente
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSelectedGsap);
} else {
  initSelectedGsap();
}
