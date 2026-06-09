/**
 * ================================================================
 * HummingX-BI — Controlador de Video por Scroll (Refactorizado v2.0)
 * ================================================================
 *
 * FASE 1 — OPTIMIZACIÓN DE PERFORMANCE (LCP / TTI):
 *
 * Patrón: Lazy-load con IntersectionObserver
 * -------------------------------------------------
 * El video NO se carga en el arranque. En su lugar:
 *
 *  1. El HTML usa data-src (no src) + preload="metadata" + poster.
 *  2. Un IntersectionObserver con rootMargin="200px" detecta cuando
 *     el contenedor está a 200px de entrar en el viewport.
 *  3. En ese momento se asigna el src real desde data-src, se llama
 *     video.load() y se inicia el bucle de renderizado Lerp.
 *  4. El observer se desconecta inmediatamente tras la asignación
 *     para no consumir recursos de observación.
 *
 * Esto libera el hilo principal durante la carga inicial y mejora
 * drásticamente los scores de FCP, LCP y TTI en Lighthouse.
 *
 * Patrón: Scroll-Scrubbing con Lerp
 * -------------------------------------------------
 * Vincula el desplazamiento vertical con el currentTime del video
 * usando interpolación lineal en un bucle requestAnimationFrame
 * para un efecto ultra suave (estilo Apple).
 * ================================================================
 */

'use strict';

(function initScrollVideo() {

  // ─── Referencias al DOM ───────────────────────────────────────────
  const container = document.getElementById('video-container');
  const video = container ? container.querySelector('video') : null;

  if (!video) {
    console.warn('[ScrollVideo] No se encontró el elemento <video> en #video-container.');
    return;
  }

  // ─── Estado interno ───────────────────────────────────────────────
  let targetTime   = 0;
  let currentTime  = 0;
  const LERP_FACTOR = 0.05; // Suavizado (menor = más fluido / lento)
  let videoDuration = 0;
  let isReady       = false;
  let rafId         = null;

  // ─── FASE 1A: Verificación de duración robusta ────────────────────
  /**
   * Verifica que el video tenga duración cargada y lo marca como listo.
   * Se llama desde múltiples eventos para garantizar el dato en cualquier
   * estado de buffering del navegador.
   */
  function checkDuration() {
    if (video.duration && video.duration > 0 && !isReady) {
      videoDuration = video.duration;
      isReady = true;

      // Revelar el contenedor con fade-in suave
      container.style.opacity = '1';
      console.info(`[ScrollVideo] ✓ Video listo. Duración: ${videoDuration.toFixed(2)}s`);

      // Iniciar el bucle de renderizado
      startRenderLoop();
    }
  }

  // ─── FASE 1B: IntersectionObserver para lazy-load del src ────────
  /**
   * Solo cuando el contenedor se acerca al viewport se asigna el src
   * real del video (desde data-src). Esto evita que el navegador inicie
   * la descarga durante la carga inicial, mejorando TTI y liberando
   * el hilo principal para el renderizado crítico.
   *
   * rootMargin: "200px" → Dispara 200px antes de entrar al viewport,
   * dando tiempo suficiente para que el video bufferice el inicio.
   */
  const videoObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const dataSrc = video.getAttribute('data-src');

        if (dataSrc && !video.src) {
          // Asignar src real — el navegador iniciará la descarga ahora
          video.src = dataSrc;
          video.removeAttribute('data-src'); // Limpiar el atributo data-src

          // Suscribir eventos de metadatos ANTES de video.load()
          video.addEventListener('loadedmetadata', checkDuration, { once: false });
          video.addEventListener('loadeddata',     checkDuration, { once: false });
          video.addEventListener('canplay',        checkDuration, { once: false });

          // Iniciar la carga
          video.load();

          console.info('[ScrollVideo] → src asignado. Iniciando descarga de video.');
        }

        // Desconectar el observer: la tarea de inicialización ya terminó
        observer.unobserve(entry.target);
        observer.disconnect();
      });
    },
    {
      root: null,        // viewport
      rootMargin: '200px', // Pre-cargar 200px antes de entrar en pantalla
      threshold: 0,
    }
  );

  // Intervalo de seguridad para detectar duración si los eventos
  // se disparan antes de que los listeners estén registrados
  const safetyInterval = setInterval(() => {
    checkDuration();
    if (isReady) clearInterval(safetyInterval);
  }, 250);

  // Comenzar a observar el contenedor
  videoObserver.observe(container);

  // ─── Listener de scroll (pasivo para no bloquear el hilo) ────────
  window.addEventListener('scroll', () => {
    if (!videoDuration) return;

    const scrollTop  = window.scrollY;
    const maxScroll  = document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll <= 0) return;

    // Mapear la fracción del scroll total a la duración del video
    const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
    targetTime = scrollFraction * videoDuration;
  }, { passive: true });

  // ─── Bucle de renderizado con Lerp ───────────────────────────────
  /**
   * Fórmula Lerp: current = current + (target - current) * factor
   * Produce un suavizado exponencial que nunca llega al objetivo de
   * forma abrupta, creando el efecto "cinético" característico de Apple.
   */
  function renderLoop() {
    if (isReady) {
      // Interpolación lineal
      currentTime += (targetTime - currentTime) * LERP_FACTOR;

      // Clamp para evitar bugs de reproducción en el frame final
      if (currentTime < 0) currentTime = 0;
      if (currentTime > videoDuration - 0.02) {
        currentTime = videoDuration - 0.02;
      }

      // Solo actualizar si el delta es perceptible (evita escrituras innecesarias)
      if (Math.abs(video.currentTime - currentTime) > 0.005) {
        try {
          video.currentTime = currentTime;
        } catch (_e) {
          // Silenciar errores de currentTime en estado HAVE_NOTHING
        }
      }
    }

    rafId = requestAnimationFrame(renderLoop);
  }

  function startRenderLoop() {
    if (rafId) return; // Prevenir múltiples bucles
    renderLoop();
  }

  // ─── Gestión de visibilidad de pestaña ───────────────────────────
  // Pausar el bucle cuando la pestaña está en segundo plano para
  // no consumir recursos de CPU/GPU innecesariamente.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (isReady) {
      startRenderLoop();
    }
  });

})();
