/**
 * ================================================================
 * MÓDULO: HERO ENTRANCE v2 — Partículas + Vórtice + Efecto magnético
 * Lógica del canvas: SOLO partículas y red. Sin cubos (el fondo es
 * una textura real via CSS). Efecto magnético apunta al <img> logo.
 * ================================================================
 */
import { REDUCED_MOTION } from '../utils/reducedMotion.js';

class HummingXBIHero {
  constructor() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Refs del DOM
    this.root = document.getElementById('hero-banner-root');
    this.trCorner = document.getElementById('tr-corner-accent');
    this.blCorner = document.getElementById('bl-corner-accent');
    this.logoContainer = document.getElementById('logo-container');
    this.typoContainer = document.getElementById('typography-container');
    this.lightBurst = document.getElementById('light-burst-fx');
    this.logoImg = document.getElementById('hummingbird-logo');

    // Paleta de marca
    this.colors = {
      primary: '#00C1CF',
      secondary: '#0066CC',
      tertiary: '#5D3FD3',
    };

    // Estado
    this.particles = [];
    this.width = 0;
    this.height = 0;
    this.phase = 'MATERIALIZE';
    this.networkOpacity = 0;
    this.animFrameId = null;

    // Interacción con cursor
    this.mouse = { x: 0, y: 0, active: false };
    this.magneticOffset = { x: 0, y: 0 };

    this.init();
  }

  init() {
    this.resize();
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);

    // Listeners de mouse
    this.root.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.root.addEventListener('mouseleave', () => this.handleMouseLeave());

    this.generateParticles();
    this.tick();
    this.runRevealTimeline();
  }

  resize() {
    const rect = this.root.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  generateParticles() {
    const particleCount = 200;
    const centerX = this.width / 2;
    const centerY = this.height / 2 - 50;

    // Puntos-objetivo relativos al centro del logo (silueta)
    const baseTargets = [
      { x: -100, y: -10 }, { x: -30, y: 5 }, { x: -5, y: -25 }, { x: -35, y: -10 },
      { x: -15, y: -45 }, { x: 5, y: -20 }, { x: 15, y: 10 }, { x: -15, y: 25 },
      { x: 5, y: 75 }, { x: 55, y: 60 }, { x: 45, y: -40 }, { x: 10, y: -140 },
      { x: 60, y: -160 }, { x: 80, y: -90 }, { x: 100, y: -140 }, { x: 120, y: -40 },
      { x: -20, y: -90 }, { x: 90, y: 130 }, { x: 105, y: 150 }, { x: 45, y: 55 },
    ];

    this.particles = [];
    const colorArray = [this.colors.primary, this.colors.secondary, this.colors.tertiary];

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 400 + 100;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5;
      const targetPoint = baseTargets[i % baseTargets.length];

      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1.2,
        color: colorArray[Math.floor(Math.random() * colorArray.length)],
        alpha: Math.random() * 0.4 + 0.4,
        angle,
        speed,
        vortexRadius: radius,
        targetX: centerX + targetPoint.x * 0.8,
        targetY: centerY + targetPoint.y * 0.8,
        mode: 'scattered', // scattered → vortex → target
      });
    }
  }

  runRevealTimeline() {
    // FASE 1: Revelar esquinas (150 ms)
    setTimeout(() => {
      if (this.trCorner) {
        this.trCorner.style.opacity = '1';
        this.trCorner.style.transform = 'translate(0, 0) scale(1)';
      }
      if (this.blCorner) {
        this.blCorner.style.opacity = '1';
        this.blCorner.style.transform = 'translate(0, 0) scale(1)';
      }
    }, 150);

    // FASE 2: Convergencia vórtice (1.5 s)
    setTimeout(() => {
      this.phase = 'CONVERGENCE';
      this.particles.forEach((p) => (p.mode = 'vortex'));
    }, 1500);

    // FASE 3: Burst + logo reveal (3 s)
    setTimeout(() => {
      this.phase = 'BURST';
      this.particles.forEach((p) => (p.mode = 'target'));

      // Flash
      if (this.lightBurst) {
        this.lightBurst.style.opacity = '1';
        this.lightBurst.style.transform = 'translate(-50%, -50%) scale(1.8)';
      }

      // Revelar logo y texto
      if (this.logoContainer) {
        this.logoContainer.classList.remove('animate-hidden');
        this.logoContainer.classList.add('animate-visible');
      }
      if (this.typoContainer) {
        this.typoContainer.classList.remove('animate-hidden');
        this.typoContainer.classList.add('animate-visible');
      }

      setTimeout(() => {
        if (this.lightBurst) this.lightBurst.style.opacity = '0';
      }, 500);
    }, 3000);

    // FASE 4: Red de nodos flash (3.8 s)
    setTimeout(() => {
      this.phase = 'NETWORK_FLASH';
      this.networkOpacity = 1.0;

      const fade = setInterval(() => {
        this.networkOpacity -= 0.05;
        if (this.networkOpacity <= 0) {
          this.networkOpacity = 0;
          clearInterval(fade);
          this.phase = 'IDLE';
        }
      }, 50);
    }, 3800);
  }

  /* ── Interacción magnética con el cursor ──────────────────────── */
  handleMouseMove(e) {
    const rect = this.root.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
    this.mouse.active = true;

    const cx = this.width / 2;
    const cy = this.height / 2 - 50;
    const dx = this.mouse.x - cx;
    const dy = this.mouse.y - cy;
    const dist = Math.hypot(dx, dy);

    if (dist < 350) {
      const strength = (1 - dist / 350) * 12;
      const angle = Math.atan2(dy, dx);
      this.magneticOffset.x = Math.cos(angle) * strength;
      this.magneticOffset.y = Math.sin(angle) * strength;
    } else {
      this.magneticOffset.x = 0;
      this.magneticOffset.y = 0;
    }

    // Aplicar offset magnético a la imagen del logo
    if (this.logoImg) {
      this.logoImg.style.transform = `translate(${this.magneticOffset.x}px, ${this.magneticOffset.y}px)`;
    }
  }

  handleMouseLeave() {
    this.mouse.active = false;
    this.magneticOffset = { x: 0, y: 0 };
    if (this.logoImg) {
      this.logoImg.style.transform = 'translate(0, 0)';
    }
  }

  /* ── Bucle de renderizado: SOLO partículas + red (sin cubos) ── */
  tick() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // ────────────────────────────────────────────────────────────
    // CUBOS ELIMINADOS — el fondo ahora es bg-textura.png via CSS
    // ────────────────────────────────────────────────────────────

    // 1. Red de nodos (flash temporal)
    if (this.networkOpacity > 0) {
      // Generar nodos de red a partir de una rejilla simple
      const size = 65;
      const cos30 = Math.cos(Math.PI / 6);
      const sin30 = Math.sin(Math.PI / 6);
      const colW = size * cos30 * 2;
      const cols = Math.ceil(this.width / colW) + 2;
      const rows = Math.ceil(this.height / (size * sin30)) + 2;
      const networkNodes = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r % 2 === 0 && c % 2 === 0) {
            const oddRow = r % 2 === 1;
            const cx = c * colW + (oddRow ? colW / 2 : 0) - colW;
            const cy = r * (size * (1 + sin30) / 2) - size * sin30;
            networkNodes.push({ x: cx, y: cy });
          }
        }
      }

      this.ctx.strokeStyle = `rgba(0, 193, 207, ${this.networkOpacity * 0.45})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      for (let i = 0; i < networkNodes.length; i += 3) {
        const nodeA = networkNodes[i];
        const nodeB = networkNodes[(i + 4) % networkNodes.length];
        if (nodeA && nodeB && Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y) < size * 2.5) {
          this.ctx.moveTo(nodeA.x, nodeA.y);
          this.ctx.lineTo(nodeB.x, nodeB.y);
        }
      }
      this.ctx.stroke();
    }

    // 2. Renderizar partículas
    this.particles.forEach((p) => {
      if (p.mode === 'scattered') {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > this.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.height) p.vy *= -1;
      } else if (p.mode === 'vortex') {
        p.angle += p.speed * 0.04;
        p.vortexRadius -= 4;
        if (p.vortexRadius < 10) p.vortexRadius = 10;

        const sx = this.width / 2 + Math.cos(p.angle) * p.vortexRadius;
        const sy = this.height / 2 - 50 + Math.sin(p.angle) * p.vortexRadius;
        p.x += (sx - p.x) * 0.15;
        p.y += (sy - p.y) * 0.15;
      } else if (p.mode === 'target') {
        p.x += (p.targetX - p.x) * 0.1;
        p.y += (p.targetY - p.y) * 0.1;

        // Atracción magnética del cursor
        if (this.mouse.active) {
          const d = Math.hypot(this.mouse.x - p.x, this.mouse.y - p.y);
          if (d < 180) {
            const pull = (1 - d / 180) * 4;
            const a = Math.atan2(this.mouse.y - p.y, this.mouse.x - p.x);
            p.x += Math.cos(a) * pull;
            p.y += Math.sin(a) * pull;
          }
        }
      }

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.globalAlpha = 1.0;
    this.animFrameId = requestAnimationFrame(() => this.tick());
  }
}

/**
 * Inicializador exportable. Se llama desde main.js tras el preloader.
 */
export function initHeroAnimation() {
  if (REDUCED_MOTION) {
    // Sin animación: hacer todo visible directamente
    const els = document.querySelectorAll('.hero-banner .animate-hidden');
    els.forEach((el) => {
      el.classList.remove('animate-hidden');
      el.style.opacity = '1';
    });
    return;
  }

  new HummingXBIHero();
}
