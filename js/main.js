/**
 * ================================================================
 * HummingX-BI — JavaScript Principal
 * Versión: 2.0.0  (Refactorizado — Fase 1-4)
 * Descripción: Preloader, navbar, partículas, formulario multistep,
 *              animaciones de scroll y flujo de automatización inteligente.
 * Migración: Arquitectura modular ES6+ lista para extracción a
 *            componentes (React / Vue / Svelte) sin refactorizar lógica.
 * ================================================================
 *
 * ÍNDICE:
 *  1. CONFIGURACIÓN (datos de contacto y endpoints)
 *  2. MÓDULO: PRELOADER
 *  3. MÓDULO: NAVBAR (scroll + mobile menu)
 *  4. MÓDULO: PARTÍCULAS (canvas hero)
 *  5. MÓDULO: SCROLL REVEAL (IntersectionObserver)
 *  6. MÓDULO: CONTADORES ANIMADOS (métricas)
 *  7. MÓDULO: TARJETAS 3D TILT (atributos)
 *  8. MÓDULO: FORMULARIO MULTISTEP
 *  9. MÓDULO: LEAD INGESTION — Interceptor de conversión (FASE 2)
 * 10. MÓDULO: BOTONES DE ENVÍO — Fallback directo (WhatsApp/IG/Email)
 * 11. MÓDULO: FOOTER (año dinámico)
 * 12. MÓDULO: CSS DINÁMICO (shake animation)
 * 13. MÓDULO: SVG INJECTOR
 * 14. INICIALIZACIÓN GLOBAL
 */

'use strict';

/* ================================================================
   1. CONFIGURACIÓN — Edita aquí los datos de contacto
   ================================================================ */
/* ================================================================
   1. CONFIGURACIÓN — Edita aquí los datos de contacto
   ================================================================ */
const CONFIG = {
  /**
   * WHATSAPP: Números en formato internacional sin '+' ni espacios.
   */
  WA_NUMBER_1: '5215519802943',
  WA_NUMBER_2: '525568905795',

  /**
   * INSTAGRAM: Nombre de usuario SIN el @
   */
  IG_USERNAME: 'hummingx.bi',

  /**
   * FACEBOOK: Link de la página oficial
   */
  FB_PAGE_URL: 'https://www.facebook.com/profile.php?id=61590401354021',

  /**
   * EMAIL: Dirección de correo electrónico donde recibirás solicitudes
   */
  EMAIL_ADDRESS: 'colibrixbi@gmail.com',

  /**
   * NOMBRE DE LA EMPRESA (para mensajes pre-llenados)
   */
  COMPANY_NAME: 'HummingX-BI',

  /**
   * UMBRAL DEL SCROLL para activar el estilo "scrolled" de la navbar.
   */
  NAVBAR_SCROLL_THRESHOLD: 60,

  /**
   * ENDPOINT SERVERLESS — Lead Ingestion API
   */
  LEAD_ENDPOINT: '/api/leads/ingest',

  /**
   * TIMEOUT para la llamada fetch (ms).
   */
  FETCH_TIMEOUT_MS: 8000,
};


/* ================================================================
   2. MÓDULO: PRELOADER (Barra de progreso minimalista)
   Barra de 2px en la parte superior + logo centrado.
   Se completa al 100% con la carga de la página y desaparece.
   ================================================================ */
const PreloaderModule = (() => {
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


/* ================================================================
   3. MÓDULO: NAVBAR
   - Aplica estilos al hacer scroll
   - Controla el menú móvil (hamburger)
   - Actualiza el link activo según la sección visible
   ================================================================ */
const NavbarModule = (() => {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav__link');
  const closeMenuLinks = document.querySelectorAll('[data-close-menu]');

  let isMenuOpen = false;

  /** Aplica / elimina clase 'scrolled' según la posición del scroll */
  function handleScroll() {
    const scrolled = window.scrollY > CONFIG.NAVBAR_SCROLL_THRESHOLD;
    navbar.classList.toggle('scrolled', scrolled);
  }

  /** Abre o cierra el menú móvil */
  function toggleMenu(forceClose = false) {
    isMenuOpen = forceClose ? false : !isMenuOpen;

    hamburger.classList.toggle('is-active', isMenuOpen);
    hamburger.setAttribute('aria-expanded', String(isMenuOpen));
    mobileMenu.classList.toggle('is-open', isMenuOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isMenuOpen));

    // Bloquear scroll del body cuando el menú está abierto
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
  }

  /** Cierra el menú al hacer click en cualquier link */
  function setupCloseLinks() {
    closeMenuLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(true));
    });
  }

  /** Actualiza el link activo en la navbar según la sección en viewport */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop <= 100) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.slice(1);
      link.removeAttribute('aria-current');
      if (href === currentSection) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function init() {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    hamburger.addEventListener('click', () => toggleMenu());
    setupCloseLinks();

    // Cerrar menú al hacer click fuera de él
    document.addEventListener('click', e => {
      if (isMenuOpen && !navbar.contains(e.target)) {
        toggleMenu(true);
      }
    });

    // Cerrar menú con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isMenuOpen) toggleMenu(true);
    });

    handleScroll();
  }

  return { init };
})();


/* ================================================================
   4. MÓDULO: PARTÍCULAS (Canvas del Hero)
   Sistema de partículas minimalistas que flota sutilmente,
   simulando datos en movimiento.
   ================================================================ */
const ParticlesModule = (() => {
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


/* ================================================================
   5. MÓDULO: SCROLL REVEAL
   Usa IntersectionObserver para revelar elementos al entrar
   en el viewport. Los elementos deben tener la clase:
   'reveal-up', 'reveal-left', o 'reveal-right'.
   ================================================================ */
const ScrollRevealModule = (() => {
  const REVEAL_CLASSES = ['.reveal-up', '.reveal-left', '.reveal-right'];

  function init() {
    const elements = document.querySelectorAll(REVEAL_CLASSES.join(','));

    if (!elements.length) return;

    // Si el navegador no soporta IntersectionObserver, mostrar todo
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Desconectar después de revelar para no re-observar
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,     // 12% visible antes de activar
        rootMargin: '-40px 0px -40px 0px',
      }
    );

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ================================================================
   6. MÓDULO: CONTADORES ANIMADOS
   Anima los números en la sección de métricas del Hero
   usando requestAnimationFrame.
   ================================================================ */
const CountersModule = (() => {
  function animateCounter(el, target, duration = 1500) {
    const start = performance.now();
    const suffix = el.querySelector('span')?.textContent || '';
    const textNode = el.childNodes[0];

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubico
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      if (textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = current;
      }

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function init() {
    const counterEls = document.querySelectorAll('[data-count]');

    if (!counterEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.count, 10);
            animateCounter(entry.target, target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterEls.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ================================================================
   7. MÓDULO: FAQs (Acordeón)
   ================================================================ */
const FaqAccordionModule = (() => {
  function init() {
    const faqHeaders = document.querySelectorAll('.faq-item__header');
    if (!faqHeaders.length) return;

    faqHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        
        // Cerrar todos los demás (comportamiento de acordeón único)
        faqHeaders.forEach(h => {
          h.setAttribute('aria-expanded', 'false');
        });

        // Si no estaba abierto, abrirlo
        if (!isExpanded) {
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }
  return { init };
})();


/* ================================================================
   8. MÓDULO: FORMULARIO MULTISTEP
   Controla la navegación entre los 4 pasos del formulario,
   actualiza la barra de progreso y gestiona las opciones.
   ================================================================ */
const FormModule = (() => {
  const state = {
    currentStep: 1,
    totalSteps: 2,
    data: {
      servicios: [],
      negocio: '',
      nombre: '',
      email: '',
      telefono: '',
      mensaje: '',
      presupuesto: '',
    }
  };

  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2')
  ];
  const progressBar = document.getElementById('form-progress-bar');
  const stepLabel = document.getElementById('current-step-label');
  const formSuccess = document.getElementById('form-success');
  const summaryTags = document.getElementById('form-summary-tags');

  const step1Next = document.getElementById('step1-next');
  const step2Back = document.getElementById('step2-back');

  const businessInput = document.getElementById('business-name');
  const contactName = document.getElementById('contact-name');
  const contactEmail = document.getElementById('contact-email');
  const contactPhone = document.getElementById('contact-phone');
  const contactMsg = document.getElementById('contact-message');
  const budgetSelect = document.getElementById('budget-select');

  function updateProgress() {
    const pct = Math.round((state.currentStep / state.totalSteps) * 100);
    if (progressBar) {
      progressBar.style.width = `${pct}%`;
      progressBar.setAttribute('aria-valuenow', pct);
    }
    if (stepLabel) {
      stepLabel.textContent = `Paso ${state.currentStep} de ${state.totalSteps}`;
    }
  }

  function showStep(stepIndex) {
    steps.forEach((step, i) => {
      if (!step) return;
      if (i === stepIndex - 1) {
        step.removeAttribute('hidden');
        step.style.display = '';
      } else {
        step.setAttribute('hidden', '');
      }
    });

    state.currentStep = stepIndex;
    updateProgress();

    if (stepIndex === 2) updateSummary();

    const form = document.getElementById('smart-form');
    if (form && window.innerWidth < 1024) {
      setTimeout(() => {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  function updateSummary() {
    if (!summaryTags) return;
    summaryTags.innerHTML = '';
    state.data.servicios.forEach(srv => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = srv;
      summaryTags.appendChild(tag);
    });
  }

  function shakeInput(input) {
    if (!input) return;
    input.style.animation = 'none';
    input.offsetHeight; // reflow
    input.style.animation = 'shake-input 0.4s ease';
    input.addEventListener('animationend', () => {
      input.style.animation = '';
    }, { once: true });
    input.style.borderColor = 'rgba(239, 68, 68, 0.8)';
    setTimeout(() => {
      input.style.borderColor = '';
    }, 2000);
  }

  function validateStep1() {
    let isValid = true;
    
    if (state.data.servicios.length === 0) {
      const container = document.getElementById('services-options');
      shakeInput(container);
      isValid = false;
    }
    if (!businessInput?.value.trim()) {
      shakeInput(businessInput);
      isValid = false;
    }
    if (!contactName?.value.trim()) {
      shakeInput(contactName);
      isValid = false;
    }

    if (isValid) {
      state.data.negocio = businessInput.value.trim();
      state.data.nombre = contactName.value.trim();
    }
    return isValid;
  }

  function setupCheckboxes() {
    const checkboxes = document.querySelectorAll('.form__checkbox');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const option = cb.closest('.form__option');
        if (cb.checked) {
          option?.classList.add('is-selected');
          if (!state.data.servicios.includes(cb.value)) {
            state.data.servicios.push(cb.value);
          }
        } else {
          option?.classList.remove('is-selected');
          state.data.servicios = state.data.servicios.filter(v => v !== cb.value);
        }
      });
      
      // Accessibility: toggle with Enter/Space
      const option = cb.closest('.form__option');
      option?.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cb.click();
        }
      });
    });
  }

  function setupInputListeners() {
    businessInput?.addEventListener('input', e => { state.data.negocio = e.target.value.trim(); });
    contactName?.addEventListener('input', e => { state.data.nombre = e.target.value.trim(); });
    contactEmail?.addEventListener('input', e => { state.data.email = e.target.value.trim(); });
    contactPhone?.addEventListener('input', e => { state.data.telefono = e.target.value.trim(); });
    contactMsg?.addEventListener('input', e => { state.data.mensaje = e.target.value.trim(); });
    budgetSelect?.addEventListener('change', e => { state.data.presupuesto = e.target.value; });
  }

  function init() {
    setupCheckboxes();
    setupInputListeners();

    step1Next?.addEventListener('click', () => {
      if (validateStep1()) showStep(2);
    });

    step2Back?.addEventListener('click', () => showStep(1));

    updateProgress();
  }

  function getState() {
    state.data.negocio = businessInput?.value.trim() || '';
    state.data.nombre = contactName?.value.trim() || '';
    state.data.email = contactEmail?.value.trim() || '';
    state.data.telefono = contactPhone?.value.trim() || '';
    state.data.mensaje = contactMsg?.value.trim() || '';
    return { ...state.data };
  }

  function showSuccess() {
    steps.forEach(s => { if (s) s.setAttribute('hidden', ''); });
    if (formSuccess) formSuccess.removeAttribute('hidden');
    if (progressBar) progressBar.style.width = '100%';
    if (stepLabel) stepLabel.textContent = '¡Listo!';
  }

  return { init, getState, showSuccess };
})();


/* ================================================================
   9. MÓDULO: LEAD INGESTION
   ================================================================ */
const LeadIngestionModule = (() => {
  const loaderEl = document.getElementById('form-loader');

  function showLoader() {
    if (loaderEl) loaderEl.removeAttribute('hidden');
    document.querySelectorAll('.btn--send-wa').forEach(btn => {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
    });
  }

  function hideLoader() {
    if (loaderEl) loaderEl.setAttribute('hidden', '');
    document.querySelectorAll('.btn--send-wa').forEach(btn => {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
    });
  }

  async function ingestLead(channel) {
    const formData = FormModule.getState();

    showLoader();

    // Bypass API since this is a static landing page implementation
    setTimeout(() => {
      hideLoader();
      SendButtonsModule.sendDirect(channel, formData);
      FormModule.showSuccess();
    }, 800);
  }

  function init() {
    const sendGroup = document.querySelector('.form__send-group');
    if (!sendGroup) return;

    sendGroup.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-channel]');
      if (!btn) return;

      const channel = btn.getAttribute('data-channel');
      ingestLead(channel);
    });
  }

  return { init };
})();


/* ================================================================
   10. MÓDULO: BOTONES DE ENVÍO
   ================================================================ */
const SendButtonsModule = (() => {
  const PRESUPUESTO_LABELS = {
    menos_5k: 'Menos de $5,000 MXN',
    '5k_15k': '$5,000 — $15,000 MXN',
    '15k_50k': '$15,000 — $50,000 MXN',
    '50k_150k': '$50,000 — $150,000 MXN',
    mas_150k: 'Más de $150,000 MXN',
  };

  function buildMessage(data) {
    const lines = [
      `*Nueva solicitud — ${CONFIG.COMPANY_NAME}*`,
      '',
      `*Servicios requeridos:* ${data.servicios && data.servicios.length > 0 ? data.servicios.join(', ') : 'Ninguno seleccionado'}`,
      `*Negocio:* ${data.negocio || 'No especificado'}`,
      `*Presupuesto:* ${data.presupuesto ? (PRESUPUESTO_LABELS[data.presupuesto] || data.presupuesto) : 'Por definir'}`,
      '',
      `*Nombre:* ${data.nombre || 'No especificado'}`,
      `*Email:* ${data.email || 'No especificado'}`,
      `*WhatsApp:* ${data.telefono || 'No especificado'}`,
    ];

    if (data.mensaje) {
      lines.push('', `*Desafío / Mensaje:*`, data.mensaje);
    }

    lines.push('', '---', 'Enviado desde hummingxbi.com');
    return lines.join('\n');
  }

  function buildEmailSubject(data) {
    return `Solicitud de proyecto — ${data.negocio || 'Nuevo cliente'}`;
  }

  /** Abre WhatsApp con el mensaje pre-llenado */
  function sendWhatsApp(data, customNumber) {
    const msg = buildMessage(data);
    const encodedMsg = encodeURIComponent(msg);
    const targetNumber = customNumber || CONFIG.WA_NUMBER_1;
    const url = `https://wa.me/${targetNumber}?text=${encodedMsg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /** Abre Instagram con el mensaje pre-llenado en DMs */
  function sendInstagram(data) {
    const msg = buildMessage(data);
    const encodedMsg = encodeURIComponent(msg);
    const url = `https://ig.me/m/${CONFIG.IG_USERNAME}?text=${encodedMsg}`;

    // Copiamos al portapapeles como respaldo de seguridad en caso de fallas de redirección en algunas versiones de la app
    if (navigator.clipboard && data) {
      navigator.clipboard.writeText(msg).then(() => {
        showToast('✅ Solicitud copiada. ¡Pégala en el chat de Instagram si no se auto-llena!');
      }).catch(() => {
        // Silenciar error
      });
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /** Abre Facebook Messenger o la Página Oficial */
  function sendFacebook(data) {
    const msg = buildMessage(data);

    if (navigator.clipboard && data) {
      navigator.clipboard.writeText(msg).then(() => {
        showToast('✅ Solicitud copiada. ¡Pégala en el chat de Facebook!');
      }).catch(() => {});
    }

    // Usar el link de la página oficial provisto por el usuario
    window.open(CONFIG.FB_PAGE_URL, '_blank', 'noopener,noreferrer');
  }

  function sendEmail(data) {
    const subject = buildEmailSubject(data);
    const body = buildMessage(data)
      .replace(/\*/g, '');        // Eliminar formato Markdown del cuerpo

    const mailtoUrl = [
      `mailto:${CONFIG.EMAIL_ADDRESS}`,
      `?subject=${encodeURIComponent(subject)}`,
      `&body=${encodeURIComponent(body)}`,
    ].join('');

    window.location.href = mailtoUrl;
  }

  /** Muestra un toast de notificación breve */
  function showToast(msg) {
    // Crear o reutilizar el toast
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: 'rgba(13, 148, 136, 0.95)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: '99999',
        opacity: '0',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        maxWidth: '90vw',
        textAlign: 'center',
      });
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    // Mostrar
    requestAnimationFrame(() => {
      Object.assign(toast.style, {
        opacity: '1',
        transform: 'translateX(-50%) translateY(0)',
      });
    });

    // Ocultar después de 4 segundos
    setTimeout(() => {
      Object.assign(toast.style, {
        opacity: '0',
        transform: 'translateX(-50%) translateY(20px)',
      });
    }, 4000);
  }

  /**
   * Método público de fallback.
   * Llamado por LeadIngestionModule cuando el endpoint serverless falla.
   * Redirige al canal directo sin pasar por el servidor.
   *
   * @param {string} channel  - 'whatsapp' | 'instagram' | 'email'
   * @param {object} formData - Estado del formulario desde FormModule.getState()
   */
  function sendDirect(channel, formData) {
    switch (channel) {
      case 'whatsapp': sendWhatsApp(formData, CONFIG.WA_NUMBER_1); break;
      case 'whatsapp2': sendWhatsApp(formData, CONFIG.WA_NUMBER_2); break;
      case 'instagram': sendInstagram(formData); break;
      case 'facebook': sendFacebook(formData); break;
      case 'email': sendEmail(formData); break;
      default:
        console.warn(`[SendButtons] Canal desconocido: ${channel}`);
    }
  }

  /**
   * init() — En v2.0 LeadIngestionModule gestiona la delegación de clicks
   * usando data-channel. Este módulo ya no registra sus propios listeners.
   * Se mantiene por compatibilidad con la cadena de inicialización.
   */
  function init() {
    // Intencionalmente vacío en v2.0: LeadIngestionModule gestiona los clicks.
    // Para migrar a framework: exportar sendDirect() y showToast() como acciones.
  }

  // API pública: sendDirect y showToast son consumidos por LeadIngestionModule
  return { init, sendDirect, showToast };
})();


/* ================================================================
   11. MÓDULO: FOOTER — Año dinámico
   ================================================================ */
function setFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}


/* ================================================================
   11. CSS DINÁMICO — Animación de shake para inputs
   ================================================================ */
(function injectDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake-input {
      0%   { transform: translateX(0); }
      20%  { transform: translateX(-8px); }
      40%  { transform: translateX(8px); }
      60%  { transform: translateX(-5px); }
      80%  { transform: translateX(5px); }
      100% { transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
})();


/* ================================================================
   12. INYECTOR DINÁMICO DE SVG
   Busca elementos con la etiqueta data-inject-svg y reemplaza el
   marcado con el contenido del archivo SVG conservando las clases.
   ================================================================ */
function injectSVGs() {
  const elements = document.querySelectorAll('[data-inject-svg]');
  const promises = Array.from(elements).map(el => {
    const src = el.getAttribute('data-src');
    if (!src) return Promise.resolve();
    return fetch(src)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
      })
      .then(text => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) {
          console.warn(`[SVG Injector] No se encontró elemento <svg> en ${src}`);
          return;
        }

        // Transferir clases
        const containerClasses = el.className;
        if (containerClasses) {
          svg.classList.add(...containerClasses.split(/\s+/).filter(Boolean));
        }

        // Transferir otros atributos
        Array.from(el.attributes).forEach(attr => {
          if (attr.name !== 'data-inject-svg' && attr.name !== 'data-src' && attr.name !== 'class') {
            svg.setAttribute(attr.name, attr.value);
          }
        });

        // Reemplazar elemento
        el.parentNode.replaceChild(svg, el);
      })
      .catch(error => {
        console.error(`[SVG Injector] Error al inyectar SVG desde ${src}:`, error);
      });
  });
  return Promise.all(promises);
}


/* ================================================================
   12B. MÓDULO: CURSOR MAGNÉTICO (Solo desktop)
   El cursor personalizado sigue el ratón con un Lerp suave.
   Al pasar sobre elementos interactivos, se expande (efecto magneto).
   ================================================================ */
const MagneticCursorModule = (() => {
  const cursor = document.getElementById('magnetic-cursor');

  // Solo desktop con puntero fino (no táctil)
  const isPointerFine = window.matchMedia('(pointer: fine)').matches;
  if (!cursor || !isPointerFine) return { init: () => {} };

  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;
  const LERP = 0.12;

  const interactiveSelectors = 'a, button, .btn, .service-item, .attr-card, input, select, textarea, [data-cursor-hover]';

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.classList.add('is-visible');
  }, { passive: true });

  document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));

  // Detectar hover en elementos interactivos
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.remove('is-hovering');
    }
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * LERP;
    cursorY += (mouseY - cursorY) * LERP;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(renderCursor);
  }

  function init() {
    renderCursor();
  }

  return { init };
})();


/* ================================================================
   13. MÓDULO: SERVICIOS MASTER-DETAIL
   ================================================================ */
const ServicesMasterDetailModule = (() => {
  function init() {
    const tabs = document.querySelectorAll('.service-tab');
    const panels = document.querySelectorAll('.service-panel');

    if (!tabs.length || !panels.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remover active de todos los tabs y paneles
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        // Agregar active al tab clickeado
        tab.classList.add('active');

        // Buscar el panel correspondiente y activarlo
        const targetId = tab.getAttribute('data-target');
        const targetPanel = document.getElementById(targetId);
        
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  return { init };
})();


/* ================================================================
   15. MÓDULO: CARRUSEL PREMIUM (Scroll-Snap con Progress Bar)
   ================================================================ */
const CarouselModule = (() => {
  function init() {
    const wrappers = document.querySelectorAll('.carousel-wrapper');
    if (!wrappers.length) return;

    wrappers.forEach(wrapper => {
      const container = wrapper.querySelector('.carousel-container');
      const prevBtn = wrapper.querySelector('.carousel-prev');
      const nextBtn = wrapper.querySelector('.carousel-next');
      const progressBar = wrapper.querySelector('.carousel-progress-bar');
      if (!container || !prevBtn || !nextBtn || !progressBar) return;

      const updateProgress = () => {
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth - container.clientWidth;
        const progress = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;
        // La barra mínima es del 20%
        progressBar.style.width = Math.max(20, progress) + '%';
      };

      container.addEventListener('scroll', updateProgress, { passive: true });
      // Init bar
      setTimeout(updateProgress, 100);

      const scrollAmount = 320; // Aproximadamente el ancho de un card + gap

      prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    });
  }
  return { init };
})();

/* ================================================================
   16. MÓDULO: STEPPER HORIZONTAL (Proceso)
   ================================================================ */
const ProcessStepperModule = (() => {
  function init() {
    const steps = document.querySelectorAll('.process-step');
    if (!steps.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -40% 0px', // Activa un poco antes de que llegue a la mitad
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
        } else {
          // Opcional: si queremos que se apaguen al salir de la vista
          // entry.target.classList.remove('is-active');
        }
      });
    }, observerOptions);

    steps.forEach(step => observer.observe(step));
  }
  return { init };
})();

/* ================================================================
   17. INICIALIZACIÓN GLOBAL
   Arranca todos los módulos en el orden correcto.
   ================================================================ */
function initApp() {
  // Preloader: primer en iniciar
  PreloaderModule.init();

  // El resto se inicializa después de que el DOM esté completamente listo
  const onReady = () => {
    // Inyectar SVGs dinámicamente antes de arrancar módulos que interactúan con ellos
    injectSVGs().then(() => {
      NavbarModule.init();
      ParticlesModule.init();
      ScrollRevealModule.init();
      CountersModule.init();
      FaqAccordionModule.init();
      ServicesMasterDetailModule.init();
      CarouselModule.init();
      ProcessStepperModule.init();
      MagneticCursorModule.init();
      FormModule.init();
      SendButtonsModule.init();
      LeadIngestionModule.init();
      setFooterYear();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
}

// ¡Aceleramos!
initApp();
