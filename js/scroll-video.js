/**
 * HummingX-BI — Controlador de Video por Scroll
 * Versión: 1.0.0
 * 
 * Vincula el desplazamiento (scroll) vertical con la posición temporal (currentTime)
 * de un video de fondo, utilizando interpolación lineal (Lerp) en un bucle
 * de requestAnimationFrame para un efecto ultra suave (estilo Apple).
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('video-container');
  const video = container ? container.querySelector('video') : null;

  if (!video) {
    console.warn('[ScrollVideo] No se encontró el contenedor o elemento de video.');
    return;
  }

  let targetTime = 0;
  let currentTime = 0;
  const lerpFactor = 0.08; // Factor de suavizado (menor = más suave/lento)
  let videoDuration = 0;
  let isReady = false;

  // Intentar obtener la duración del video de forma robusta
  function checkDuration() {
    if (video.duration && video.duration > 0) {
      videoDuration = video.duration;
      if (!isReady) {
        isReady = true;
        // Mostrar el contenedor de video suavemente
        container.style.opacity = '1';
        console.info(`[ScrollVideo] Video listo. Duración: ${videoDuration}s`);
      }
    }
  }

  // Eventos para detectar que los metadatos y duración están disponibles
  video.addEventListener('loadedmetadata', checkDuration);
  video.addEventListener('loadeddata', checkDuration);
  video.addEventListener('canplay', checkDuration);

  // Intervalo de seguridad por si los eventos se disparan antes de la suscripción
  const safetyCheck = setInterval(() => {
    checkDuration();
    if (videoDuration > 0) {
      clearInterval(safetyCheck);
    }
  }, 200);

  // Escuchar el scroll para calcular el tiempo objetivo
  window.addEventListener('scroll', () => {
    if (!videoDuration) return;

    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll <= 0) return;

    // Calcular qué fracción del scroll total se ha recorrido
    const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));

    // Mapear esa fracción a la duración total del video
    targetTime = scrollFraction * videoDuration;
  }, { passive: true });

  // Bucle de animación suave (Lerp)
  function renderLoop() {
    if (videoDuration && isReady) {
      // Lerp formula: current = current + (target - current) * factor
      currentTime += (targetTime - currentTime) * lerpFactor;

      // Mantener dentro de los límites
      if (currentTime < 0) currentTime = 0;
      if (currentTime > videoDuration - 0.02) currentTime = videoDuration - 0.02; // Evitar el final exacto por posibles bugs de loop/paro

      // Actualizar el tiempo actual del video (ignorar si es un cambio infinitesimal)
      if (Math.abs(video.currentTime - currentTime) > 0.005) {
        video.currentTime = currentTime;
      }
    }

    requestAnimationFrame(renderLoop);
  }

  // Arrancar el render loop
  requestAnimationFrame(renderLoop);
});
