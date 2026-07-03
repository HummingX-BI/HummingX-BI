/**
 * ================================================================
 * HummingX-BI — JavaScript Principal (orquestador)
 * Versión: 3.0.0  (Refactorizado — Fase 3: modular ES)
 * Descripción: Importa cada módulo (una responsabilidad por archivo)
 *              e inicializa todo en el orden de arranque correcto.
 * ================================================================
 */

'use strict';

/* ── Utils ────────────────────────────────────────────────────── */
import { injectSVGs } from './utils/svgInject.js';
import { setFooterYear } from './utils/dom.js';

/* ── Módulos base (DOM listo + SVGs inyectados) ──────────────── */
import { PreloaderModule } from './modules/preloader.js';
import { NavbarModule } from './modules/navbar.js';
// import { ParticlesModule } from './modules/particles.js';
import { ServicesMasterDetailModule } from './modules/servicesTabs.js';
import { MagneticCursorModule } from './modules/magneticCursor.js';
import { FormModule } from './modules/form.js';
import { SendButtonsModule } from './modules/sendButtons.js';
import { LeadIngestionModule } from './modules/leadIngestion.js';

/* ── Módulos de animación / motion ────────────────────────────── */
import { initHeroAnimation } from './modules/heroEntrance-v2.js';
import { FaqSmoothModule } from './modules/faq.js';
import { MarqueeModule } from './modules/marquee.js';
import { EnhancedCarouselModule } from './modules/carousel.js';
import { ProcessStepperEnhancedModule } from './modules/processStepper.js';
import { CardHoverModule } from './modules/cardHover.js';
import { ScrollRevealEnhancedModule } from './modules/scrollReveal.js';


/* ================================================================
   INICIALIZACIÓN GLOBAL
   Arranca todos los módulos en el orden correcto.
   ================================================================ */
function initApp() {
  // Preloader: primero en iniciar
  PreloaderModule.init();

  // El resto se inicializa después de que el DOM esté completamente listo
  const onReady = () => {
    // Inyectar SVGs dinámicamente antes de arrancar módulos que interactúan con ellos
    injectSVGs().then(() => {
      NavbarModule.init();
      // ParticlesModule.init();
      ServicesMasterDetailModule.init();
      MagneticCursorModule.init();
      FormModule.init();
      SendButtonsModule.init();
      LeadIngestionModule.init();
      setFooterYear();
    });

    // Capa de animaciones (antes en animations.js)
    // Hero entrance dispara tras el timeout del preloader (~1s)
    const PRELOADER_DURATION = 1000;
    setTimeout(() => initHeroAnimation(), PRELOADER_DURATION);

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

// ¡Aceleramos!
initApp();
