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
    count: IS_MOBILE_DEVICE ? 0 : 60,   // Cero en móvil (video desactivado, fondo simple)
    maxRadius: 1.8,
    speed: IS_MOBILE_DEVICE ? 0.08 : 0.20,
    connectDist: IS_MOBILE_DEVICE ? 60 : 120,
    color: '201, 169, 110',  // RGB del champagne dorado
    opacity: 0.6,
  };


  class Particle {
    constructor() {
      this.reset();
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
      ctx.fillStyle = `rgba(${PARTICLE_CONFIG.color}, ${this.alpha})`;
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
          ctx.strokeStyle = `rgba(${PARTICLE_CONFIG.color}, ${alpha})`;
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
    const counterEls = document.querySelectorAll('[data-target]');

    if (!counterEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target, 10);
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
   7. MÓDULO: TARJETAS 3D TILT
   Efecto de inclinación 3D sutil cuando el cursor se mueve
   sobre las tarjetas de atributos.
   ================================================================ */
const CardTiltModule = (() => {
  const TILT_MAX = 8; // grados máximos de inclinación

  function applyTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);

    const rotateX = -dy * TILT_MAX;
    const rotateY = dx * TILT_MAX;

    card.style.transform = `
      translateY(-8px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  }

  function resetTilt(card) {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    // Restaurar transición corta después del reset
    setTimeout(() => {
      card.style.transition = '';
    }, 500);
  }

  function init() {
    // Solo aplicar en dispositivos con pointer (no touch-only)
    if (!window.matchMedia('(hover: hover)').matches) return;

    const cards = document.querySelectorAll('.attr-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', e => applyTilt(card, e));
      card.addEventListener('mouseleave', () => resetTilt(card));
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
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
  // Estado del formulario
  const state = {
    currentStep: 1,
    totalSteps: 4,
    data: {
      objetivo: 'bi_analytics',
      etapa: 'operando',
      desafio: 'datos',
      tiempo: '1mes',
      presupuesto: '15k_50k',
      negocio: 'Mi Negocio de Prueba',
      nombre: 'Cliente Prueba',
      telefono: '+52 1 55 1980 2943',
      mensaje: 'Hola, me gustaría recibir más información sobre el servicio de BI & Analytics.',
    }
  };

  // Referencias al DOM
  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4')
  ];
  const progressBar = document.getElementById('form-progress-bar');
  const stepLabel = document.getElementById('current-step-label');
  const formSuccess = document.getElementById('form-success');

  const step1Next = document.getElementById('step1-next');
  const step2Next = document.getElementById('step2-next');
  const step3Next = document.getElementById('step3-next');
  const step2Back = document.getElementById('step2-back');
  const step3Back = document.getElementById('step3-back');
  const step4Back = document.getElementById('step4-back');

  const businessInput = document.getElementById('business-name');
  const contactName = document.getElementById('contact-name');
  const contactPhone = document.getElementById('contact-phone');
  const contactMsg = document.getElementById('contact-message');
  const budgetSelect = document.getElementById('budget-select');

  /** Actualiza la barra de progreso y el label */
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

  /** Muestra un paso específico y oculta los demás */
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

    // Scroll suave hacia el formulario en mobile
    const form = document.getElementById('smart-form');
    if (form && window.innerWidth < 1024) {
      setTimeout(() => {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  /** Valida el paso 1 antes de avanzar */
  function validateStep1() {
    const negocio = businessInput?.value.trim();
    if (!negocio) {
      shakeInput(businessInput);
      businessInput?.focus();
      return false;
    }
    state.data.negocio = negocio;
    return true;
  }

  /** Valida el paso 2 antes de avanzar */
  function validateStep2() {
    return true;
  }

  /** Valida el paso 3 antes de avanzar */
  function validateStep3() {
    const presupuesto = budgetSelect?.value;
    if (!presupuesto) {
      shakeInput(budgetSelect);
      return false;
    }
    state.data.presupuesto = presupuesto;
    return true;
  }

  /** Animación de "shake" en inputs inválidos */
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

  /** Registra la selección de una opción radio */
  function setupOptionGroups() {
    const allOptions = document.querySelectorAll('.form__option');

    allOptions.forEach(option => {
      const radio = option.querySelector('.form__radio');
      if (!radio) return;

      // Hacer la opción clickeable
      option.addEventListener('click', () => {
        // Deseleccionar opciones del mismo grupo (name)
        const groupName = radio.name;
        document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
          r.closest('.form__option')?.classList.remove('is-selected');
        });

        // Seleccionar esta
        radio.checked = true;
        option.classList.add('is-selected');

        // Guardar en estado
        if (groupName === 'objetivo') state.data.objetivo = radio.value;
        if (groupName === 'etapa') state.data.etapa = radio.value;
        if (groupName === 'desafio') state.data.desafio = radio.value;
        if (groupName === 'tiempo') state.data.tiempo = radio.value;
      });

      // Accesibilidad: keyboard
      option.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          option.click();
        }
      });
    });
  }

  /** Captura cambios en inputs de texto */
  function setupInputListeners() {
    businessInput?.addEventListener('input', e => {
      state.data.negocio = e.target.value.trim();
    });
    contactName?.addEventListener('input', e => {
      state.data.nombre = e.target.value.trim();
    });
    contactPhone?.addEventListener('input', e => {
      state.data.telefono = e.target.value.trim();
    });
    contactMsg?.addEventListener('input', e => {
      state.data.mensaje = e.target.value.trim();
    });
    budgetSelect?.addEventListener('change', e => {
      state.data.presupuesto = e.target.value;
    });
  }

  function init() {
    setupOptionGroups();
    setupInputListeners();

    // Botón: paso 1 → paso 2
    step1Next?.addEventListener('click', () => {
      if (validateStep1()) showStep(2);
    });

    // Botón: paso 2 → paso 3
    step2Next?.addEventListener('click', () => {
      showStep(3);
    });

    // Botón: paso 3 → paso 4
    step3Next?.addEventListener('click', () => {
      if (validateStep3()) showStep(4);
    });

    // Botones de retroceso
    step2Back?.addEventListener('click', () => showStep(1));
    step3Back?.addEventListener('click', () => showStep(2));
    step4Back?.addEventListener('click', () => showStep(3));

    // Iniciar en paso 1
    updateProgress();
  }

  /** Expone el estado del formulario para el módulo de envío */
  function getState() {
    // Capturar valores actuales del DOM al momento de enviar
    state.data.nombre = contactName?.value.trim() || '';
    state.data.telefono = contactPhone?.value.trim() || '';
    state.data.mensaje = contactMsg?.value.trim() || '';
    return { ...state.data };
  }

  /** Muestra el estado de éxito */
  function showSuccess() {
    steps.forEach(s => { if (s) s.setAttribute('hidden', ''); });
    if (formSuccess) formSuccess.removeAttribute('hidden');
    if (progressBar) progressBar.style.width = '100%';
    if (stepLabel) stepLabel.textContent = '¡Listo!';
  }

  return { init, getState, showSuccess };
})();


/* ================================================================
   9. MÓDULO: LEAD INGESTION — Interceptor de conversión (FASE 2)
   ================================================================
   Patrón: Async fetch + fallback graceful degradation

   Flujo completo:
     1. Usuario selecciona canal (WA / IG / Email) y hace click
     2. Se llama event.preventDefault() implícitamente (son <button type="button">)
     3. Se muestra el loader #form-loader (spinner HummingX)
     4. buildLeadPayload() empaqueta todos los datos del formulario
        en un objeto JSON estricto con claves en snake_case
     5. fetch() POST → CONFIG.LEAD_ENDPOINT con AbortController (timeout)
     6a. Si 200 OK → FormModule.showSuccess() + ocultar loader
     6b. Si error de red / timeout / 4xx-5xx:
         → Ocultar loader + activar el canal directo (WA/IG/Email)
         → showToast() con mensaje de fallback
   ================================================================ */
const LeadIngestionModule = (() => {

  /* ──────────────────────────────────────────────────────────────
     ESQUEMA JSON ESPERADO POR EL ENDPOINT
     Endpoint: POST /api/leads/ingest
     Content-Type: application/json

     Este payload es consumido por:
       - Microservicio Spring Boot: parsea y persiste en PostgreSQL
       - Agente perfilador LangChain (Python): enriquece el lead
         con scoring de intención y genera la propuesta técnica.

     {
       "source":          string,   // "landing_page" (constante)
       "submitted_at":    string,   // ISO 8601 UTC timestamp
       "channel":         string,   // "whatsapp" | "instagram" | "email"
       "business_name":   string,   // Nombre del negocio del cliente
       "contact_name":    string,   // Nombre de la persona de contacto
       "phone":           string,   // Teléfono/WhatsApp (puede ser vacío)
       "message":         string,   // Descripción adicional (puede ser vacío)
       "project_goal":    string,   // Enum: plataforma_empresarial | automatizacion_ia
                                   //       web_medida | bi_analytics | integracion_datos
                                   //       | transformacion_digital
       "business_stage":  string,   // Enum: idea | operando | escalar
       "main_challenge":  string,   // Enum: ventas | automatizar | ux | datos
       "timeline":        string,   // Enum: urgente | 1mes | 2-3meses | flexible
       "budget_range":    string,   // Enum: menos_5k | 5k_15k | 15k_50k
                                   //       | 50k_150k | mas_150k | por_definir
     }
  ────────────────────────────────────────────────────────────── */

  // ─── Referencias al DOM del loader ─────────────────────────────
  const loaderEl = document.getElementById('form-loader');

  /**
   * Construye el payload JSON tipado con claves en snake_case.
   * @param {object} formData - Estado del formulario desde FormModule.getState()
   * @param {string} channel  - Canal seleccionado: 'whatsapp' | 'instagram' | 'email'
   * @returns {object} Payload listo para JSON.stringify()
   */
  function buildLeadPayload(formData, channel) {
    return {
      // ── Metadatos de la solicitud ──────────────────────────────
      source: 'landing_page',                    // string: origen constante
      submitted_at: new Date().toISOString(),          // string: ISO 8601 UTC
      channel: channel,                           // string: canal elegido

      // ── Datos de contacto ──────────────────────────────────────
      business_name: formData.negocio || '',          // string: nombre del negocio
      contact_name: formData.nombre || '',          // string: persona de contacto
      phone: formData.telefono || '',          // string: tel/WA (opcional)
      message: formData.mensaje || '',          // string: nota adicional (opcional)

      // ── Datos del proyecto (tipados con valores enum predefinidos) ──
      project_goal: formData.objetivo || '',          // string: enum objetivo
      business_stage: formData.etapa || '',          // string: enum etapa
      main_challenge: formData.desafio || '',          // string: enum desafío
      timeline: formData.tiempo || '',          // string: enum tiempo
      budget_range: formData.presupuesto || '',        // string: enum presupuesto
    };
  }

  /**
   * Muestra el loader de HummingX en el formulario.
   * Deshabilita los botones de envío para prevenir doble-submit.
   */
  function showLoader() {
    if (loaderEl) {
      loaderEl.removeAttribute('hidden');
    }
    // Deshabilitar botones de envío durante la petición
    document.querySelectorAll('#send-whatsapp, #send-whatsapp-2, #send-instagram, #send-facebook').forEach(btn => {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
    });
  }

  /**
   * Oculta el loader y rehabilita los botones de envío.
   */
  function hideLoader() {
    if (loaderEl) {
      loaderEl.setAttribute('hidden', '');
    }
    document.querySelectorAll('#send-whatsapp, #send-whatsapp-2, #send-instagram, #send-facebook').forEach(btn => {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
    });
  }

  /**
   * Función principal asíncrona.
   * Envía el payload al endpoint serverless y maneja el estado del DOM.
   *
   * @param {string} channel - 'whatsapp' | 'instagram' | 'email'
   */
  async function ingestLead(channel) {
    const formData = FormModule.getState();

    // Validación mínima: nombre del negocio requerido
    if (!formData.negocio) {
      SendButtonsModule.showToast('Por favor, completa al menos el nombre de tu negocio.');
      return;
    }

    // Mostrar estado de carga
    showLoader();

    // AbortController para timeout configurable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

    try {
      const payload = buildLeadPayload(formData, channel);

      // ── Petición POST al endpoint serverless ────────────────────
      const response = await fetch(CONFIG.LEAD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // El microservicio Spring Boot puede exigir un token de API:
          // 'X-API-Key': CONFIG.API_KEY,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // El servidor respondió con un error HTTP (4xx / 5xx)
        const errorBody = await response.text().catch(() => 'Sin detalle');
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      // ── 200 OK: Mostrar pantalla de éxito ──────────────────────
      hideLoader();
      FormModule.showSuccess();

      console.info('[LeadIngestion] ✓ Lead enviado correctamente al endpoint.');

    } catch (error) {
      clearTimeout(timeoutId);
      hideLoader();

      const isAbort = error.name === 'AbortError';
      const msg = isAbort
        ? 'Tiempo de espera agotado. Abriendo canal directo...'
        : 'No se pudo conectar al servidor. Abriendo canal directo...';

      console.warn(`[LeadIngestion] ⚠ Fallback activado. Error: ${error.message}`);
      SendButtonsModule.showToast(msg);

      // ── Fallback: abrir el canal directo elegido ────────────────
      // Permite que el lead no se pierda aunque el servidor esté caído.
      setTimeout(() => {
        SendButtonsModule.sendDirect(channel, formData);
        // Mostrar éxito de todos modos para no frustrar al usuario
        FormModule.showSuccess();
      }, 1200);
    }
  }

  function init() {
    // Delegar eventos en botones de envío usando el atributo data-channel
    const sendGroup = document.querySelector('.form__send-buttons');
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
   10. MÓDULO: BOTONES DE ENVÍO — Fallback directo (WA / IG / Email)
   ================================================================
   Este módulo actúa como FALLBACK cuando el endpoint serverless no
   está disponible. LeadIngestionModule lo llama explícitamente en
   el bloque catch de su función async.

   sendDirect() es la única función pública que necesita el módulo
   de ingesta. showToast() es un helper compartido.
   ================================================================ */
const SendButtonsModule = (() => {
  /**
   * Traduce los valores internos del formulario a texto legible
   */
  const OBJETIVO_LABELS = {
    plataforma_empresarial: 'Plataforma Empresarial a la Medida (ERP/CRM)',
    automatizacion_ia: 'Automatización Inteligente con Agentes IA',
    web_medida: 'Desarrollo de Software a la Medida',
    bi_analytics: 'Business Intelligence & Analytics',
    integracion_datos: 'Integración de Sistemas & Arquitectura de Datos',
    transformacion_digital: 'Transformación Digital Integral',
    // Legacy compatibility
    menu_digital: 'Plataforma Empresarial a la Medida',
    sistema_cobro: 'Sistema de Cobro / POS',
  };

  const ETAPA_LABELS = {
    idea: 'Tengo la Idea',
    operando: 'Ya Opero',
    escalar: 'Busco Escalar',
  };

  const DESAFIO_LABELS = {
    ventas: 'Más Ventas / Atraer clientes',
    automatizar: 'Automatizar operaciones',
    ux: 'Mejorar la experiencia (UX)',
    datos: 'Toma de decisiones con datos',
  };

  const TIEMPO_LABELS = {
    urgente: 'Lo antes posible (Urgente)',
    '1mes': 'En 1 mes',
    '2-3meses': 'En 2 o 3 meses',
    flexible: 'Flexible / Aún planeando',
  };

  const PRESUPUESTO_LABELS = {
    menos_5k: 'Menos de $5,000 MXN',
    '5k_15k': '$5,000 — $15,000 MXN',
    '15k_50k': '$15,000 — $50,000 MXN',
    '50k_150k': '$50,000 — $150,000 MXN',
    mas_150k: 'Más de $150,000 MXN',
    por_definir: 'Por definir / Consultar',
  };

  /** Construye el mensaje de texto plano */
  function buildMessage(data) {
    const lines = [
      `🦅 *Nueva solicitud — ${CONFIG.COMPANY_NAME}*`,
      '',
      `📌 *Negocio:* ${data.negocio || 'No especificado'}`,
      `🎯 *Objetivo:* ${OBJETIVO_LABELS[data.objetivo] || data.objetivo}`,
      `🌱 *Etapa actual:* ${ETAPA_LABELS[data.etapa] || data.etapa}`,
      `🚀 *Desafío principal:* ${DESAFIO_LABELS[data.desafio] || data.desafio}`,
      `⏳ *Tiempos:* ${TIEMPO_LABELS[data.tiempo] || data.tiempo}`,
      `💰 *Presupuesto:* ${PRESUPUESTO_LABELS[data.presupuesto] || data.presupuesto}`,
      '',
      `👤 *Nombre:* ${data.nombre || 'No especificado'}`,
      `📱 *Teléfono:* ${data.telefono || 'No especificado'}`,
    ];

    if (data.mensaje) {
      lines.push('', `💬 *Mensaje adicional:*`, data.mensaje);
    }

    lines.push('', '---', 'Enviado desde hummingxbi.com');

    return lines.join('\n');
  }

  /** Construye el asunto del correo */
  function buildEmailSubject(data) {
    const obj = OBJETIVO_LABELS[data.objetivo] || 'Proyecto';
    return `Solicitud de proyecto — ${obj} | ${data.negocio || 'Nuevo cliente'}`;
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

  /** Abre el cliente de correo con el mensaje pre-llenado */
  function sendEmail(data) {
    const subject = buildEmailSubject(data);
    const body = buildMessage(data)
      .replace(/\*/g, '')        // Eliminar formato Markdown del cuerpo
      .replace(/🦅|📌|🎯|📊|💰|👤|📞|💬/g, ''); // Quitar emojis opcionales en email

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
   13. INICIALIZACIÓN GLOBAL
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
      CardTiltModule.init();
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
