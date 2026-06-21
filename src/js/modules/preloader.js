/**
 * ================================================================
 * MÓDULO: PRELOADER (Barra de progreso minimalista)
 * Barra de 2px en la parte superior + logo centrado.
 * Se completa al 100% con la carga de la página y desaparece.
 * ================================================================
 */
export const PreloaderModule = (() => {
  const preloader = document.getElementById('preloader');
  const mainContent = document.getElementById('main-content');
  const ringFill = document.getElementById('preloader-ring-fill');

  let hasHidden = false;
  let progress = 0;
  let animId = null;

  /** Anima el anillo de progreso circular SVG */
  function setProgress(target) {
    const animate = () => {
      progress += (target - progress) * 0.08;
      if (ringFill) {
        // Circunferencia del círculo (r=46): 2 * PI * 46 ≈ 289
        const circumference = 289;
        const offset = circumference - (circumference * Math.min(progress, 100)) / 100;
        ringFill.style.strokeDashoffset = offset;
      }
      if (Math.abs(target - progress) > 0.5) {
        animId = requestAnimationFrame(animate);
      }
    };
    if (animId) cancelAnimationFrame(animId);
    animate();
  }

  /** Oculta el preloader con fade */
  function hidePreloader() {
    if (hasHidden) return;
    hasHidden = true;

    // Completar al 100%
    setProgress(100);

    document.body.classList.remove('loading');
    if (mainContent) {
      mainContent.setAttribute('aria-hidden', 'false');
      mainContent.classList.add('is-visible');
    }

    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('is-hidden');
      }
    }, 350); // Esperar a que el círculo se complete

    setTimeout(() => {
      if (preloader) {
        preloader.style.display = 'none';
        preloader.setAttribute('aria-hidden', 'true');
      }
    }, 1000);
  }

  function init() {
    document.body.classList.add('loading');

    // Simular progreso escalonado para feedback visual
    setProgress(30);
    setTimeout(() => setProgress(65), 200);
    setTimeout(() => setProgress(90), 500);

    if (document.readyState === 'complete') {
      setTimeout(hidePreloader, 400);
    } else {
      window.addEventListener('load', () => {
        setTimeout(hidePreloader, 300);
      }, { once: true });
    }

    // Fallback de seguridad
    setTimeout(hidePreloader, 2200);
  }

  return { init, hide: hidePreloader };
})();
