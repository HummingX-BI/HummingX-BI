/**
 * ================================================================
 * HummingX-BI — JavaScript Principal
 * Versión: 1.0.0
 * Descripción: Lógica del preloader, navbar, partículas, formulario
 *              multistep, animaciones de scroll y botones de envío.
 * ================================================================
 *
 * ÍNDICE:
 *  1. CONFIGURACIÓN (edita aquí tus datos de contacto)
 *  2. MÓDULO: PRELOADER
 *  3. MÓDULO: NAVBAR (scroll + mobile menu)
 *  4. MÓDULO: PARTÍCULAS (canvas hero)
 *  5. MÓDULO: SCROLL REVEAL (IntersectionObserver)
 *  6. MÓDULO: CONTADORES ANIMADOS (métricas)
 *  7. MÓDULO: TARJETAS 3D TILT (atributos)
 *  8. MÓDULO: FORMULARIO MULTISTEP
 *  9. MÓDULO: BOTONES DE ENVÍO (WhatsApp, Instagram, Email)
 * 10. MÓDULO: FOOTER (año dinámico)
 * 11. INICIALIZACIÓN
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
   * WHATSAPP:
   * Número en formato internacional sin '+' ni espacios.
   * Ejemplo: '5215551234567' (México, Ciudad de México)
   */
  WA_NUMBER: '5215519802943',

  /**
   * INSTAGRAM:
   * Nombre de usuario SIN el @
   * Ejemplo: 'hummingxbi'
   */
  IG_USERNAME: 'hummingx.bi',

  /**
   * EMAIL:
   * Dirección de correo electrónico donde recibirás solicitudes
   */
  EMAIL_ADDRESS: 'hola@hummingxbi.com',

  /**
   * NOMBRE DE LA EMPRESA (para mensajes pre-llenados)
   */
  COMPANY_NAME: 'HummingX-BI',

  /**
   * UMBRAL DEL SCROLL para activar el estilo "scrolled" de la navbar
   * (en píxeles desde el top de la página).
   */
  NAVBAR_SCROLL_THRESHOLD: 60,
};


/* ================================================================
   2. MÓDULO: PRELOADER (Vuelo y Aterrizaje del Colibrí)
   Un colibrí vectorial aletea en el centro de la pantalla. Al completar
   la carga, vuela orgánicamente y aterriza sobre el logo de la navbar,
   mientras el fondo oscuro del preloader se desvanece.
   ================================================================ */
const PreloaderModule = (() => {
  const preloader    = document.getElementById('preloader');
  const mainContent  = document.getElementById('main-content');
  const bird         = document.getElementById('preloader-bird');
  const progressBar  = document.getElementById('preloader-progress-bar');
  const loadingText  = document.getElementById('loading-text');
  const targetLogo   = document.querySelector('.nav__logo-icon');
  const navLogo      = document.querySelector('.nav__logo');

  let hasHidden      = false;
  let progress       = 0;
  let progressInterval;
  let pageLoaded     = false;

  // Frases estratégicas para HummingX-BI
  const loadingPhrases = [
    'Preparando entorno estratégico...',
    'Alineando variables de Business Intelligence...',
    'Calibrando arquitectura de alta precisión...',
    'Estructurando microservicios y flujos de datos...',
    'Evolución digital en vuelo...',
    'Sincronizando HummingX-BI...'
  ];

  /** Simula e incrementa la barra de progreso */
  function startProgress() {
    progressInterval = setInterval(() => {
      // Avanzar más rápido si la carga real ya terminó
      const increment = pageLoaded ? Math.random() * 12 + 8 : Math.random() * 2 + 1;
      progress = Math.min(progress + increment, 100);

      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }

      // Actualizar mensajes descriptivos de carga
      if (loadingText) {
        const phraseIdx = Math.min(
          Math.floor((progress / 100) * loadingPhrases.length),
          loadingPhrases.length - 1
        );
        loadingText.textContent = loadingPhrases[phraseIdx];
      }

      if (progress >= 100) {
        clearInterval(progressInterval);
        setTimeout(triggerFlightAnimation, 450); // Breve pausa dramática
      }
    }, 45);
  }

  /** Transiciona el colibrí volando del centro al logo de cabecera */
  function triggerFlightAnimation() {
    if (hasHidden) return;
    hasHidden = true;

    // 1. Revelar la página principal (pero sin hacer visible el logo del header aún)
    document.body.classList.remove('loading');
    if (mainContent) {
      mainContent.setAttribute('aria-hidden', 'false');
      mainContent.classList.add('is-visible');
    }

    if (targetLogo) {
      targetLogo.style.opacity = '0';
      targetLogo.style.transition = 'opacity 0.2s ease';
    }

    // 2. Obtener dimensiones de inicio y fin en pantalla (fixed coordinates)
    const startRect = bird.getBoundingClientRect();
    const targetRect = targetLogo.getBoundingClientRect();

    // 3. Calcular diferencias y factor de escala
    const deltaX = targetRect.left - startRect.left;
    const deltaY = targetRect.top - startRect.top;
    const scale  = targetRect.width / startRect.width;

    // 4. Modificar velocidad de aleteo en CSS y rotación para el viaje
    bird.classList.add('is-migrating');
    void bird.offsetWidth; // Forzar reflow para registrar la transición antes del transform

    // 5. Transformar y trasladar el colibrí con curva bez de vuelo acelerado
    bird.style.transformOrigin = 'top left';
    bird.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale}) rotate(12deg)`;

    // 6. Desvanecer el fondo del preloader suavemente
    if (preloader) {
      preloader.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), visibility 1s';
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
    }

    // 7. Al aterrizar en el header (duración de la transición: 1.2s en style.css)
    setTimeout(() => {
      // Disparar destello luminoso en el logo del header
      if (navLogo) {
        navLogo.classList.add('logo-landing-glow');
      }

      // Revelar logo real en la navbar
      if (targetLogo) {
        targetLogo.style.opacity = '1';
      }

      // Ocultar preloader definitivamente
      setTimeout(() => {
        if (preloader) {
          preloader.style.display = 'none';
          preloader.setAttribute('aria-hidden', 'true');
        }
      }, 200);

    }, 1200);
  }

  function init() {
    document.body.classList.add('loading');
    startProgress();

    if (document.readyState === 'complete') {
      pageLoaded = true;
    } else {
      window.addEventListener('load', () => {
        pageLoaded = true;
      }, { once: true });
    }

    // Fallback de seguridad por si falla la carga real
    setTimeout(() => {
      pageLoaded = true;
      if (progress < 100) {
        clearInterval(progressInterval);
        progress = 100;
        if (progressBar) progressBar.style.width = '100%';
        triggerFlightAnimation();
      }
    }, 7000);
  }

  return { init };
})();


/* ================================================================
   3. MÓDULO: NAVBAR
   - Aplica estilos al hacer scroll
   - Controla el menú móvil (hamburger)
   - Actualiza el link activo según la sección visible
   ================================================================ */
const NavbarModule = (() => {
  const navbar        = document.getElementById('navbar');
  const hamburger     = document.getElementById('hamburger-btn');
  const mobileMenu    = document.getElementById('mobile-menu');
  const navLinks      = document.querySelectorAll('.nav__link');
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
  if (!canvas) return { init: () => {} };

  const ctx    = canvas.getContext('2d');
  let particles = [];
  let animId    = null;
  let W, H;

  const PARTICLE_CONFIG = {
    count:         100,       // número de partículas (aumentado para más densidad)
    maxRadius:     2.5,       // radio máximo en px (aumentado)
    speed:         0.3,       // velocidad base
    connectDist:   150,       // distancia para trazar conexiones (aumentada)
    color:         '13, 148, 136',  // RGB del color teal
    opacity:       0.9,       // opacidad base aumentada
  };

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.vx    = (Math.random() - 0.5) * PARTICLE_CONFIG.speed;
      this.vy    = (Math.random() - 0.5) * PARTICLE_CONFIG.speed;
      this.r     = Math.random() * PARTICLE_CONFIG.maxRadius + 0.5;
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
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < PARTICLE_CONFIG.connectDist) {
          // Líneas más notorias (hasta 0.6 de opacidad en vez de 0.2)
          const alpha = (1 - dist / PARTICLE_CONFIG.connectDist) * 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${PARTICLE_CONFIG.color}, ${alpha})`;
          ctx.lineWidth   = 1.0; // Líneas un poco más gruesas
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
    resize();
    window.addEventListener('resize', () => {
      resize();
      // Reiniciar partículas al redimensionar
      particles.forEach(p => p.reset());
    }, { passive: true });

    for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
      particles.push(new Particle());
    }

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
        threshold:   0.12,     // 12% visible antes de activar
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
    const start     = performance.now();
    const suffix    = el.querySelector('span')?.textContent || '';
    const textNode  = el.childNodes[0];

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubico
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);

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
    const rect   = card.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;
    const dx     = (e.clientX - centerX) / (rect.width  / 2);
    const dy     = (e.clientY - centerY) / (rect.height / 2);

    const rotateX = -dy * TILT_MAX;
    const rotateY =  dx * TILT_MAX;

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
    totalSteps:  4,
    data: {
      objetivo:    'bi_analytics', 
      etapa:       'operando',     
      desafio:     'datos',        
      tiempo:      '1mes',         
      presupuesto: '15k_50k',
      negocio:     'Mi Negocio de Prueba',
      nombre:      'Cliente Prueba',
      telefono:    '+52 1 55 1980 2943',
      mensaje:     'Hola, me gustaría recibir más información sobre el servicio de BI & Analytics.',
    }
  };

  // Referencias al DOM
  const steps         = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4')
  ];
  const progressBar   = document.getElementById('form-progress-bar');
  const stepLabel     = document.getElementById('current-step-label');
  const formSuccess   = document.getElementById('form-success');

  const step1Next     = document.getElementById('step1-next');
  const step2Next     = document.getElementById('step2-next');
  const step3Next     = document.getElementById('step3-next');
  const step2Back     = document.getElementById('step2-back');
  const step3Back     = document.getElementById('step3-back');
  const step4Back     = document.getElementById('step4-back');

  const businessInput = document.getElementById('business-name');
  const contactName   = document.getElementById('contact-name');
  const contactPhone  = document.getElementById('contact-phone');
  const contactMsg    = document.getElementById('contact-message');
  const budgetSelect  = document.getElementById('budget-select');

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
        if (groupName === 'etapa')    state.data.etapa    = radio.value;
        if (groupName === 'desafio')  state.data.desafio  = radio.value;
        if (groupName === 'tiempo')   state.data.tiempo   = radio.value;
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
    state.data.nombre    = contactName?.value.trim()  || '';
    state.data.telefono  = contactPhone?.value.trim() || '';
    state.data.mensaje   = contactMsg?.value.trim()   || '';
    return { ...state.data };
  }

  /** Muestra el estado de éxito */
  function showSuccess() {
    steps.forEach(s => { if (s) s.setAttribute('hidden', ''); });
    if (formSuccess) formSuccess.removeAttribute('hidden');
    if (progressBar) progressBar.style.width = '100%';
    if (stepLabel)   stepLabel.textContent = '¡Listo!';
  }

  return { init, getState, showSuccess };
})();


/* ================================================================
   9. MÓDULO: BOTONES DE ENVÍO
   Ensambla un mensaje estructurado con los datos del formulario
   y abre el canal seleccionado (WhatsApp, Instagram, Email).
   ================================================================ */
const SendButtonsModule = (() => {
  /**
   * Traduce los valores internos del formulario a texto legible
   */
  const OBJETIVO_LABELS = {
    menu_digital:  'Menú Digital (QR / Carta / Pedidos)',
    sistema_cobro: 'Sistema de Cobro / POS',
    web_medida:    'Web o App a la Medida',
    bi_analytics:  'Business Intelligence & Analytics',
  };

  const ETAPA_LABELS = {
    idea:     'Tengo la Idea',
    operando: 'Ya Opero',
    escalar:  'Busco Escalar',
  };

  const DESAFIO_LABELS = {
    ventas:      'Más Ventas / Atraer clientes',
    automatizar: 'Automatizar operaciones',
    ux:          'Mejorar la experiencia (UX)',
    datos:       'Toma de decisiones con datos',
  };

  const TIEMPO_LABELS = {
    urgente:    'Lo antes posible (Urgente)',
    '1mes':     'En 1 mes',
    '2-3meses': 'En 2 o 3 meses',
    flexible:   'Flexible / Aún planeando',
  };

  const PRESUPUESTO_LABELS = {
    menos_5k:    'Menos de $5,000 MXN',
    '5k_15k':    '$5,000 — $15,000 MXN',
    '15k_50k':   '$15,000 — $50,000 MXN',
    '50k_150k':  '$50,000 — $150,000 MXN',
    mas_150k:    'Más de $150,000 MXN',
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
  function sendWhatsApp(data) {
    const msg = buildMessage(data);
    const encodedMsg = encodeURIComponent(msg);
    const url = `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodedMsg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /** Abre Instagram con el mensaje pre-llenado en DMs */
  function sendInstagram(data) {
    const msg = buildMessage(data);
    const encodedMsg = encodeURIComponent(msg);
    const url = `https://ig.me/m/hummingx.bi?text=${encodedMsg}`;

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

  /** Abre el cliente de correo con el mensaje pre-llenado */
  function sendEmail(data) {
    const subject = buildEmailSubject(data);
    const body    = buildMessage(data)
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
        position:   'fixed',
        bottom:     '24px',
        left:       '50%',
        transform:  'translateX(-50%) translateY(20px)',
        background: 'rgba(13, 148, 136, 0.95)',
        color:      'white',
        padding:    '12px 24px',
        borderRadius: '12px',
        fontSize:   '14px',
        fontWeight: '600',
        zIndex:     '99999',
        opacity:    '0',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        border:     '1px solid rgba(255,255,255,0.1)',
        boxShadow:  '0 8px 32px rgba(0,0,0,0.3)',
        maxWidth:   '90vw',
        textAlign:  'center',
      });
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    // Mostrar
    requestAnimationFrame(() => {
      Object.assign(toast.style, {
        opacity:   '1',
        transform: 'translateX(-50%) translateY(0)',
      });
    });

    // Ocultar después de 4 segundos
    setTimeout(() => {
      Object.assign(toast.style, {
        opacity:   '0',
        transform: 'translateX(-50%) translateY(20px)',
      });
    }, 4000);
  }

  function init() {
    const btnWa   = document.getElementById('send-whatsapp');
    const btnIg   = document.getElementById('send-instagram');
    const btnMail = document.getElementById('send-email');

    function handleSend(channel) {
      // Capturar estado actual del formulario
      const data = FormModule.getState();

      // Validación mínima: al menos el nombre del negocio
      if (!data.negocio) {
        showToast('Por favor, completa al menos el nombre de tu negocio.');
        return;
      }

      switch (channel) {
        case 'whatsapp': sendWhatsApp(data); break;
        case 'instagram': sendInstagram(data); break;
        case 'email': sendEmail(data); break;
      }

      // Mostrar éxito en el formulario
      setTimeout(() => FormModule.showSuccess(), 300);
    }

    btnWa?.addEventListener('click',   () => handleSend('whatsapp'));
    btnIg?.addEventListener('click',   () => handleSend('instagram'));
    btnMail?.addEventListener('click', () => handleSend('email'));
  }

  return { init };
})();


/* ================================================================
   10. MÓDULO: FOOTER — Año dinámico
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
   12. INICIALIZACIÓN GLOBAL
   Arranca todos los módulos en el orden correcto.
   ================================================================ */
function initApp() {
  // Preloader: primer en iniciar
  PreloaderModule.init();

  // El resto se inicializa después de que el DOM esté completamente listo
  const onReady = () => {
    NavbarModule.init();
    ParticlesModule.init();
    ScrollRevealModule.init();
    CountersModule.init();
    CardTiltModule.init();
    FormModule.init();
    SendButtonsModule.init();
    setFooterYear();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
}

// ¡Aceleramos!
initApp();
