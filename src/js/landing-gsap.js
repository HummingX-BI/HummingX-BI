/**
 * =========================================================================
 * HummingX BI — Módulos GSAP Seleccionados
 * 1. Física de Inclinación 3D en Tarjetas (Servicios, Soluciones, Metodología, Afíliate)
 * 2. Acordeón FAQ fluido (Animación de altura matemática pura con GSAP)
 * =========================================================================
 */

import gsap from 'gsap';

export function initSelectedGsap() {
  setupCardTiltPhysics();
  setupFaqGsapAccordion();

  console.log('✨ HummingX BI: GSAP activo en Física 3D y Acordeón FAQ');
}

/* =========================================================================
   1. FÍSICA DE INCLINACIÓN 3D EN TARJETAS (Sin incluir Valores)
   ========================================================================= */
function setupCardTiltPhysics() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Omitir en táctiles

  // Excluye explícitamente #valores
  const cards = document.querySelectorAll(
    '#servicios .grid > div, #soluciones .grid > div, #metodologia .grid > div, #afiliate .grid > div'
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
        ease: 'power2.out',
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

    gsap.set(content, { height: 0, opacity: 0, overflow: 'hidden' });
    content.classList.remove('hidden');

    btn.onclick = (e) => {
      e.preventDefault();
      const isOpen = card.classList.contains('is-open');

      // Cerrar otros acordeones
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

// Iniciar automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSelectedGsap);
} else {
  initSelectedGsap();
}
