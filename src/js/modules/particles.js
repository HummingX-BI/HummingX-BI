/**
 * ================================================================
 * MÓDULO: PARTÍCULAS (Canvas del Hero)
 * Sistema de partículas minimalistas que flota sutilmente,
 * simulando datos en movimiento.
 * ================================================================
 */
export const ParticlesModule = (() => {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return { init: () => { } };

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId = null;
  let W, H;

  // Detectar si es un dispositivo móvil / táctil
  const IS_MOBILE_DEVICE = ('ontouchstart' in window) || (window.innerWidth <= 768);

  const PARTICLE_CONFIG = {
    count: IS_MOBILE_DEVICE ? 120 : 60,   // Saturación en móvil sin ruido
    maxRadius: 1.8,
    speed: IS_MOBILE_DEVICE ? 0.08 : 0.20,
    connectDist: IS_MOBILE_DEVICE ? 50 : 120, // Distancia corta en móvil para menos líneas (menos ruido visual) pero más nodos
    color: 'rgba(201, 169, 110, 0.45)',  // --color-gold base
    maxZ: IS_MOBILE_DEVICE ? 200 : 100, // Mayor Z en móvil da más efecto 3D borroso y profundidad
  };


  class Particle {
    constructor() {
      this.reset();
      // Asignar una profundidad aleatoria (Z) para el efecto parallax 3D
      this.z = Math.random() * 0.5 + 0.1;
    }

    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * PARTICLE_CONFIG.speed;
      this.vy = (Math.random() - 0.5) * PARTICLE_CONFIG.speed;
      this.r = Math.random() * PARTICLE_CONFIG.maxRadius + 0.5;
      this.alpha = Math.random() * 0.5 + 0.4; // Nodos más brillantes (0.4 a 0.9)
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Rebotar en los bordes
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = PARTICLE_CONFIG.color;
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < PARTICLE_CONFIG.connectDist) {
          const alpha = (1 - dist / PARTICLE_CONFIG.connectDist) * 0.25; /* Conexiones más sutiles */
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201, 169, 110, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnections();
    animId = requestAnimationFrame(loop);
  }

  function init() {
    // Inicialización: dimensiones reales del canvas
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;

    for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
      particles.push(new Particle());
    }

    // FIX BUG MÓVIL: En navegadores móviles, la barra de URL aparece/desaparece
    // al hacer scroll, disparando eventos 'resize' con cambio de altura.
    // Esto causaba que las partículas saltaran agresivamente.
    // Solución: solo responder a cambios de ANCHO (orientación real del dispositivo).
    let lastWidth = W;
    window.addEventListener('resize', () => {
      const currentWidth = canvas.offsetWidth;
      if (IS_MOBILE_DEVICE) {
        if (currentWidth !== lastWidth) {
          // Cambio real de orientación — sí actualizar
          lastWidth = currentWidth;
          W = canvas.width = canvas.offsetWidth;
          H = canvas.height = canvas.offsetHeight;
          // Reposicionar solo partículas que quedaron fuera del área
          particles.forEach(p => {
            if (p.x > W) p.x = Math.random() * W;
            if (p.y > H) p.y = Math.random() * H;
          });
        }
        // Si solo cambió la altura (barra del browser al scroll): ignorar completamente
      } else {
        // Desktop: resize normal con reinicio de posiciones
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
        particles.forEach(p => p.reset());
      }
    }, { passive: true });

    // Pausar animación cuando la pestaña está en segundo plano
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        loop();
      }
    });

    // Efecto parallax 3D en nodos al hacer scroll
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Calcular en toda la página para el efecto global
      particles.forEach(p => {
        // Nodos con mayor profundidad (z) se mueven más rápido
        p.y -= deltaY * (p.z * 0.8);

        // Reaparecer en los bordes opuestos si se salen por el scroll
        if (p.y < 0) p.y += H;
        if (p.y > H) p.y -= H;
      });
    }, { passive: true });

    loop();
  }

  return { init };
})();
