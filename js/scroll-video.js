/**
 * ================================================================
 * HummingX-BI — Controlador de Video (Refactorizado v3.0)
 * ================================================================
 *
 * OPTIMIZACIÓN DE PERFORMANCE:
 * Se eliminó el "scroll-scrubbing" (cambiar video.currentTime por scroll)
 * ya que decodificar deltas de MP4 en tiempo real bloqueaba el hilo
 * principal y generaba lag ("trabado").
 * 
 * Nueva aproximación "Apple-tier":
 * 1. Autoplay inteligente: El video corre de forma natural y fluida,
 *    pero se PAUSA automáticamente cuando el Hero sale de pantalla.
 * 2. Parallax Lerp: En lugar de frotar los frames del video, desplazamos
 *    físicamente el contenedor (transform: translateY) usando Lerp
 *    para crear la sensación de profundidad a 60fps constantes.
 * ================================================================
 */

'use strict';

(function initScrollVideo() {
  const container = document.getElementById('video-container');
  const video = container ? container.querySelector('video') : null;

  if (!video) return;

  let isVideoLoaded = false;

  // ─── FASE 1: Lazy-Load y Autoplay Inteligente ───────────────────
  const playbackObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Si es la primera vez, cargar el src real
          const dataSrc = video.getAttribute('data-src');
          if (dataSrc) {
            video.src = dataSrc;
            video.removeAttribute('data-src');
            video.load();
            
            // Revelar suavemente una vez que los datos carguen
            video.addEventListener('canplay', () => {
              if (!isVideoLoaded) {
                isVideoLoaded = true;
                container.style.opacity = '1';
                video.play().catch(e => console.warn('Autoplay evitado por el navegador:', e));
              }
            }, { once: true });
          } else if (isVideoLoaded) {
            // Ya estaba cargado, solo reanudar
            video.play().catch(e => {});
          }
        } else {
          // Si salió de pantalla, pausar para ahorrar batería y CPU
          if (isVideoLoaded) {
            video.pause();
          }
        }
      });
    },
    { rootMargin: '200px' }
  );

  playbackObserver.observe(container);

  // ─── FASE 2: Efecto Parallax con Lerp (60fps) ────────────────────
  let scrollY = window.scrollY;
  let currentTranslateY = 0;
  const parallaxFactor = 0.4; // Qué tan rápido se mueve el fondo respecto al scroll
  const lerpFactor = 0.08;
  let rafId = null;

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  function renderParallax() {
    // Si el scroll pasó el primer 100vh, detener el cálculo
    if (scrollY <= window.innerHeight * 1.5) {
      const targetTranslateY = scrollY * parallaxFactor;
      currentTranslateY += (targetTranslateY - currentTranslateY) * lerpFactor;
      
      // Aplicar el transform a la etiqueta video dentro del contenedor
      // Usamos translate3d para forzar aceleración por hardware (GPU)
      if (Math.abs(targetTranslateY - currentTranslateY) > 0.1) {
        video.style.transform = `translate3d(0, ${currentTranslateY}px, 0)`;
      }
    }
    rafId = requestAnimationFrame(renderParallax);
  }

  // Iniciar el render loop de parallax
  renderParallax();

  // Pausar el cálculo si la pestaña no es visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      video.pause();
    } else {
      if (!rafId) renderParallax();
      if (isVideoLoaded && scrollY < window.innerHeight) video.play();
    }
  });

})();
