/**
 * ================================================================
 * ColibriX BI — Motor de Loader 3D (Three.js r160)
 * Versión: 2.0.0
 * Arquitectura: ES Module — Cargado ANTES que main.js
 *
 * CARACTERÍSTICAS:
 *  · Glassmorphism PBR (MeshPhysicalMaterial) en logo y burbujas
 *  · SVGLoader extrusiona "mi_imagen.svg" a geometría 3D con bisel
 *  · 18 burbujas de cristal flotantes (estilo Gemini AI)
 *  · Parallax de ratón con lerp suavizado
 *  · Luces de acento azul/violeta/teal para bordes de cristal
 *  · Transición de salida nivel Google: logo → dash arriba + fade overlay
 *  · Cleanup completo de GPU (dispose + forceContextLoss)
 *  · Fallback geométrico si mi_imagen.svg no se encuentra
 *  · Sin dependencias externas (sólo three + three/addons)
 *
 * ÍNDICE:
 *  1. CONFIGURACIÓN
 *  2. VARIABLES DE ESTADO
 *  3. INICIALIZACIÓN DE ESCENA
 *  4. ILUMINACIÓN PBR
 *  5. MATERIAL DE CRISTAL
 *  6. CARGA Y EXTRUSIÓN DEL SVG
 *  7. BURBUJAS DE CRISTAL (Gemini-style)
 *  8. PARALLAX DEL RATÓN
 *  9. BUCLE DE ANIMACIÓN
 * 10. TRANSICIÓN DE SALIDA (Google Quality)
 * 11. LIMPIEZA DE RECURSOS THREE.JS (GPU)
 * 12. COORDINACIÓN: page load + min duration
 * 13. PUNTO DE ENTRADA
 * ================================================================
 */

import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';


/* ================================================================
   1. CONFIGURACIÓN
   ================================================================ */
// Detectar si es dispositivo táctil/móvil
const IS_MOBILE = ('ontouchstart' in window) || (window.innerWidth <= 768);

const CFG = {
  /** Ruta al SVG. "mi_imagen.svg" está en la raíz del proyecto. */
  SVG_PATH: '/mi_imagen.svg',

  /** Posición Z de la cámara (perspectiva) */
  CAMERA_Z: 260,

  /** FOV de la cámara en grados */
  CAMERA_FOV: 50,

  /** Número de burbujas de cristal flotantes — reducido en móvil para evitar saturación */
  NUM_BUBBLES: IS_MOBILE ? 6 : 20,

  /** Tiempo mínimo que el loader permanece visible (ms) */
  MIN_DURATION_MS: 5500,

  /** Duración de la fase 1 de salida: logo vuela hacia arriba (s) */
  EXIT_PHASE1_S: 0.55,

  /** Retraso antes del fade del overlay (ms) */
  EXIT_FADE_DELAY_MS: 220,

  /** Duración del fade del overlay (ms) */
  EXIT_FADE_DURATION: 900,

  /** Suavizado del parallax — desactivado en móvil para evitar movimiento agresivo al scroll */
  PARALLAX_LERP: IS_MOBILE ? 0.0 : 0.04,

  /** Rango máximo del parallax en unidades 3D — reducido para suavidad */
  PARALLAX_X: IS_MOBILE ? 0 : 12,
  PARALLAX_Y: IS_MOBILE ? 0 : 8,

  /** Animación del logo: flotación — más lenta y serena */
  LOGO_FLOAT_SPEED: 0.65,
  LOGO_FLOAT_AMP: 7,

  /** Animación del logo: rotación oscilante — más suave */
  LOGO_ROT_Y_SPEED: 0.38,
  LOGO_ROT_Y_AMP: 0.09,
  LOGO_ROT_Z_SPEED: 0.55,
  LOGO_ROT_Z_AMP: 0.025,

  /** Tamaño del logo en pantalla (unidades Three.js) */
  LOGO_TARGET_SIZE: 130,

  /** Profundidad de extrusión del SVG */
  EXTRUDE_DEPTH: 18,
};


/* ================================================================
   2. VARIABLES DE ESTADO
   ================================================================ */
let renderer = null;
let scene = null;
let camera = null;
let logoGroup = null;
let bubbles = [];
let animId = null;
let clock = null;

// Parallax
let mouseNDX = 0;    // Normalized Device X  (-1 a 1)
let mouseNDY = 0;    // Normalized Device Y  (-1 a 1)
let camTargetX = 0;
let camTargetY = 0;

// Control de ciclo de vida
let isExiting = false;
let isDisposed = false;


/* ================================================================
   3. INICIALIZACIÓN DE LA ESCENA
   ================================================================ */
function initScene() {
  const container = document.getElementById('canvas-3d-container');
  if (!container) {
    console.error('[Loader3D] #canvas-3d-container no encontrado en el DOM.');
    return false;
  }

  const W = container.offsetWidth || window.innerWidth;
  const H = container.offsetHeight || window.innerHeight;

  // ── Escena ──
  scene = new THREE.Scene();
  // Sin background en la escena → el CSS del preloader (#050b14) muestra el fondo

  // ── Cámara perspectiva ──
  camera = new THREE.PerspectiveCamera(CFG.CAMERA_FOV, W / H, 0.1, 2000);
  camera.position.z = CFG.CAMERA_Z;

  // ── Renderer WebGL ──
  renderer = new THREE.WebGLRenderer({
    antialias: !IS_MOBILE,   // Desactivar antialias en móvil — alto costo de GPU
    alpha: true,             // Fondo transparente → fondo CSS visible
    powerPreference: 'high-performance',
  });
  renderer.setSize(W, H);
  // Limitar pixel ratio: 1.5 en móvil para reducir carga de GPU
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // ── Reloj para animaciones ──
  clock = new THREE.Clock();

  return true;
}


/* ================================================================
   4. ILUMINACIÓN PBR
   Diseñada para que el cristal muestre bordes de color ricos.
   ================================================================ */
function setupLights() {
  // Luz ambiente suave (rellena las sombras)
  const ambient = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambient);

  // Luz direccional principal — blanca fría desde arriba-derecha
  const mainLight = new THREE.DirectionalLight(0xe8f4ff, 3.2);
  mainLight.position.set(120, 180, 120);
  scene.add(mainLight);

  // Luz de acento: azul eléctrico — borde izquierdo inferior
  const blueLight = new THREE.PointLight(0x3d88ff, 6, 600);
  blueLight.position.set(-180, -120, 90);
  scene.add(blueLight);

  // Luz de acento: violeta-magenta — borde derecho superior
  const purpleLight = new THREE.PointLight(0xcc35ff, 5, 600);
  purpleLight.position.set(180, 120, -70);
  scene.add(purpleLight);

  // Luz de relleno: teal/esmeralda — desde abajo del logo
  const tealLight = new THREE.PointLight(0x0d9488, 3, 500);
  tealLight.position.set(0, -180, 80);
  scene.add(tealLight);

  // Luz de contra-relleno: naranja muy suave — desde atrás
  const backLight = new THREE.PointLight(0xff9040, 1.5, 400);
  backLight.position.set(-60, 80, -120);
  scene.add(backLight);
}


/* ================================================================
   5. MATERIAL DE CRISTAL (Glassmorphism PBR)
   MeshPhysicalMaterial es el material más avanzado de Three.js.
   ================================================================ */

/**
 * Crea un material de cristal físicamente correcto.
 * @param {object} opts - Opciones opcionales para sobrescribir defaults
 */
function makeCrystalMaterial(opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: opts.color ?? 0xffffff,
    metalness: opts.metalness ?? 0.05,
    roughness: opts.roughness ?? 0.12,
    transmission: opts.transmission ?? 0.96,   // Transparencia de vidrio
    thickness: opts.thickness ?? 10.0,   // Refracción interior (volumen)
    ior: opts.ior ?? 1.52,   // Índice de refracción (vidrio borosilicato)
    clearcoat: opts.clearcoat ?? 1.0,    // Capa externa brillante
    clearcoatRoughness: opts.clearcoatRoughness ?? 0.06,
    envMapIntensity: opts.envMapIntensity ?? 1.8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: opts.opacity ?? 1.0,
  });
}


/* ================================================================
   6. CARGA Y EXTRUSIÓN DEL SVG
   Carga mi_imagen.svg, extruye cada forma a 3D con bisel, centra
   la geometría en su bounding box y escala el grupo para que
   siempre ocupe CFG.LOGO_TARGET_SIZE unidades en pantalla.
   ================================================================ */
function loadSVGLogo() {
  logoGroup = new THREE.Group();
  scene.add(logoGroup);

  // Material de cristal para el logo: ligeramente más denso
  const logoMat = makeCrystalMaterial({
    color: 0xffffff,
    transmission: 0.92,
    thickness: 14,
    roughness: 0.08,
    clearcoat: 1.0,
  });

  const loader = new SVGLoader();

  loader.load(
    CFG.SVG_PATH,

    // ── onLoad ──
    (data) => {
      const shapeGroup = new THREE.Group();

      for (const path of data.paths) {
        const shapes = SVGLoader.createShapes(path);

        for (const shape of shapes) {
          const extrudeCfg = {
            depth: CFG.EXTRUDE_DEPTH,
            bevelEnabled: true,
            bevelThickness: 2.8,
            bevelSize: 1.4,
            bevelSegments: 5,
            curveSegments: 28,   // Curvas suaves en el SVG
          };

          const geo = new THREE.ExtrudeGeometry(shape, extrudeCfg);

          // Centrar cada pieza en su propio bounding box
          geo.computeBoundingBox();
          const b = geo.boundingBox;
          const cx = -0.5 * (b.max.x + b.min.x);
          const cy = -0.5 * (b.max.y + b.min.y);
          geo.translate(cx, cy, 0);

          const mesh = new THREE.Mesh(geo, logoMat);
          mesh.scale.y = -1;   // SVGs vienen invertidos en Y respecto al sistema Three.js
          shapeGroup.add(mesh);
        }
      }

      // Auto-escalar el grupo completo al tamaño objetivo
      const bbox = new THREE.Box3().setFromObject(shapeGroup);
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, 1);   // Evitar división por 0
      const scale = CFG.LOGO_TARGET_SIZE / maxDim;
      shapeGroup.scale.setScalar(scale);

      logoGroup.add(shapeGroup);

      // Ocultar el texto de estado cuando el SVG cargó
      fadeOutStatusText('Listo');
    },

    // ── onProgress ──
    undefined,

    // ── onError ──
    (err) => {
      console.warn(
        `[Loader3D] No se encontró "${CFG.SVG_PATH}". Coloca mi_imagen.svg en la raíz del proyecto.\n`,
        err
      );
      // Mostrar colibrí geométrico de emergencia
      buildFallbackBird(logoMat);
      fadeOutStatusText('Demo 3D');
    }
  );
}

/**
 * Crea un colibrí esquemático con geometrías básicas cuando
 * mi_imagen.svg no está disponible.
 */
function buildFallbackBird(mat) {
  const group = new THREE.Group();

  // Cuerpo ovalado
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(18, 35, 8, 16),
    mat
  );
  group.add(body);

  // Cabeza esférica
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(14, 20, 20),
    mat
  );
  head.position.set(35, 12, 0);
  group.add(head);

  // Pico cónico
  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 28, 8),
    mat
  );
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(58, 12, 0);
  group.add(beak);

  // Ala superior
  const wingGeo = new THREE.TorusGeometry(28, 3, 8, 24, Math.PI * 0.7);
  const wingTop = new THREE.Mesh(wingGeo, mat);
  wingTop.rotation.z = -Math.PI * 0.3;
  wingTop.position.set(0, 20, 0);
  group.add(wingTop);

  group.scale.setScalar(1.0);
  logoGroup.add(group);
}

/**
 * Desvanece el texto de estado suavemente y lo oculta.
 * @param {string} finalText - Texto final antes de desvanecerse
 */
function fadeOutStatusText(finalText) {
  const el = document.getElementById('loader-status-text');
  if (!el) return;
  if (finalText) el.textContent = finalText;

  // Pequeño delay para que el usuario lo vea brevemente
  setTimeout(() => {
    el.style.opacity = '0';
  }, 600);
}


/* ================================================================
   7. BURBUJAS DE CRISTAL FLOTANTES (Estilo Gemini AI)
   Cada burbuja tiene su propio material de cristal con variación
   de color (azul o violeta), velocidad y wobble independientes.
   ================================================================ */
function createBubbles() {
  // Geometría compartida: esfera de alta subdivisión
  const sphereGeo = new THREE.SphereGeometry(1, 36, 36);

  for (let i = 0; i < CFG.NUM_BUBBLES; i++) {
    const size = Math.random() * 11 + 4;

    // Alternar entre azul eléctrico y violeta
    const useBlue = Math.random() < 0.55;
    const hue = useBlue ? 0.595 + Math.random() * 0.04 : 0.77 + Math.random() * 0.06;
    const sat = 0.6 + Math.random() * 0.3;
    const lit = 0.75 + Math.random() * 0.2;

    const mat = makeCrystalMaterial({
      color: new THREE.Color().setHSL(hue, sat, lit),
      transmission: 0.84 + Math.random() * 0.12,
      thickness: 2.5 + Math.random() * 6,
      roughness: 0.08 + Math.random() * 0.18,
      ior: 1.4 + Math.random() * 0.2,
      opacity: 0.65 + Math.random() * 0.35,
    });

    const bubble = new THREE.Mesh(sphereGeo, mat);

    // Posición inicial esparcida por toda la pantalla + profundidad aleatoria
    const startX = (Math.random() - 0.5) * 400;
    const startY = (Math.random() - 0.5) * 300 - 150;
    const startZ = (Math.random() - 0.5) * 160 - 40;

    bubble.position.set(startX, startY, startZ);
    bubble.scale.setScalar(size);

    // Metadatos de animación individuales (sin contaminación del objeto)
    bubble.userData = {
      speedY: (Math.random() * 0.18 + 0.04) * (IS_MOBILE ? 0.6 : 1.0),  // Más lento en móvil
      wobbleAmp: (Math.random() * 18 + 6) * (IS_MOBILE ? 0.5 : 1.0),    // Bamboleo más sutil en móvil
      wobbleFreq: Math.random() * 0.015 + 0.004,   // Frecuencia más suave
      wobblePhase: Math.random() * Math.PI * 2,    // Fase inicial aleatoria
      driftX: (Math.random() - 0.5) * 0.03,        // Deriva lateral lenta
      rotSpeedX: (Math.random() - 0.5) * 0.007,
      rotSpeedY: (Math.random() - 0.5) * 0.008,
      baseX: startX,                               // Referencia X para el wobble
    };

    scene.add(bubble);
    bubbles.push(bubble);
  }
}


/* ================================================================
   8. PARALLAX DEL RATÓN
   Escucha mousemove y actualiza los targets de posición de cámara.
   El lerp suavizado en el bucle de animación hace la transición fluida.
   ================================================================ */
function setupMouseParallax() {
  // En móvil, no registrar parallax de mouse para evitar movimientos agresivos al scroll
  if (IS_MOBILE) return;

  window.addEventListener('mousemove', (e) => {
    mouseNDX = (e.clientX / window.innerWidth - 0.5) * 2;   // -1 a 1
    mouseNDY = (e.clientY / window.innerHeight - 0.5) * 2;  // -1 a 1
  }, { passive: true });
}


/* ================================================================
   9. BUCLE DE ANIMACIÓN
   Separado en funciones para claridad: updateLogo, updateBubbles,
   updateParallax. Respeta 'isDisposed' para no renderizar tras cleanup.
   ================================================================ */
function updateLogo(t) {
  if (!logoGroup) return;

  // Flotación vertical sinusoidal
  logoGroup.position.y = Math.sin(t * CFG.LOGO_FLOAT_SPEED) * CFG.LOGO_FLOAT_AMP;

  // Rotaciones oscilantes suaves (no da vueltas completas)
  logoGroup.rotation.y = Math.sin(t * CFG.LOGO_ROT_Y_SPEED) * CFG.LOGO_ROT_Y_AMP;
  logoGroup.rotation.z = Math.sin(t * CFG.LOGO_ROT_Z_SPEED) * CFG.LOGO_ROT_Z_AMP;
}

function updateBubbles(t) {
  for (const bubble of bubbles) {
    const ud = bubble.userData;

    // Ascenso continuo
    bubble.position.y += ud.speedY;

    // Bamboleo sinusoidal en X alrededor de la posición base
    bubble.position.x = ud.baseX
      + Math.sin(t * ud.wobbleFreq + ud.wobblePhase) * ud.wobbleAmp
      + t * ud.driftX * 10;

    // Rotación propia de cada burbuja
    bubble.rotation.x += ud.rotSpeedX;
    bubble.rotation.y += ud.rotSpeedY;

    // Reiniciar cuando sale por arriba de la pantalla
    if (bubble.position.y > 240) {
      bubble.position.y = -240;
      bubble.userData.baseX = (Math.random() - 0.5) * 400;
    }
  }
}

function updateParallax() {
  // Lerp suavizado: camTargetX/Y se acercan al destino cada frame
  camTargetX += (mouseNDX * CFG.PARALLAX_X - camTargetX) * CFG.PARALLAX_LERP;
  camTargetY += (-mouseNDY * CFG.PARALLAX_Y - camTargetY) * CFG.PARALLAX_LERP;

  camera.position.x = camTargetX;
  camera.position.y = camTargetY;
  camera.lookAt(scene.position);   // Siempre mirando al centro
}

function animate() {
  if (isDisposed) return;

  animId = requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  updateLogo(t);
  updateBubbles(t);
  updateParallax();

  renderer.render(scene, camera);
}


/* ================================================================
  10. TRANSICIÓN DE SALIDA — NIVEL GOOGLE (3 fases)
   ─────────────────────────────────────────────────────────────────
   FASE 1 (0s – 0.45s):  Logo accelera hacia arriba y escala (Three.js RAF)
   FASE 2 (0.18s – 0.9s): Overlay desvanece + desliza (CSS transition inline)
   FASE 3 (0.95s):        Revela contenido, despacha evento, limpia GPU
   ================================================================ */
function triggerExitAnimation() {
  if (isExiting || isDisposed) return;
  isExiting = true;

  const preloader = document.getElementById('preloader');

  // ── FASE 1: Logo vuela hacia arriba con easing cúbico ──────────
  cancelAnimationFrame(animId);   // Parar el bucle principal

  const exitStart = performance.now();
  const phase1Duration = CFG.EXIT_PHASE1_S * 1000;   // ms

  /** Easing ease-in cúbico (acelera progresivamente) */
  const easeInCubic = (x) => x * x * x;

  function phase1Loop(now) {
    if (isDisposed) return;

    const elapsed = now - exitStart;
    const progress = Math.min(elapsed / phase1Duration, 1);
    const eased = easeInCubic(progress);

    if (logoGroup) {
      // Sube y crece simultáneamente
      logoGroup.position.y = eased * 220;
      const s = 1 + eased * 0.35;
      logoGroup.scale.set(s, s, s);
    }

    // Actualizar burbujas también (para que no se congelen)
    const t = clock.getElapsedTime();
    updateBubbles(t);

    renderer.render(scene, camera);

    if (progress < 1) {
      requestAnimationFrame(phase1Loop);
    }
    // Al terminar fase 1 → la fase 2 ya está en marcha por setTimeout
  }

  requestAnimationFrame(phase1Loop);

  // ── FASE 2: Fade-out del overlay con Google Material Easing ─────
  // Cubic-bezier(0.4, 0, 0.2, 1) = curva estándar de Material Design
  // Comienza 180ms después del inicio (deja ver el primer fotograma)
  setTimeout(() => {
    if (!preloader || isDisposed) return;

    preloader.style.transition = [
      `opacity     ${CFG.EXIT_FADE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      `transform   ${CFG.EXIT_FADE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    ].join(', ');

    // Forzar reflow antes de cambiar los valores para que la transición se active
    void preloader.offsetHeight;

    preloader.style.opacity = '0';
    preloader.style.transform = 'translateY(-28px)';

  }, CFG.EXIT_FADE_DELAY_MS);

  // ── FASE 3: Cleanup y notificación ─────────────────────────────
  // Esperar a que el fade termine: delay + duration + 50ms de seguridad
  const phase3Delay = CFG.EXIT_FADE_DELAY_MS + CFG.EXIT_FADE_DURATION + 50;

  setTimeout(() => {
    // Ocultar el preloader del DOM (ya completamente transparente)
    if (preloader) {
      preloader.setAttribute('aria-hidden', 'true');
      preloader.style.display = 'none';
    }

    // Notificar a main.js → PreloaderModule.revealMainContent()
    document.dispatchEvent(new CustomEvent('colibrix:loader-done'));

    // Liberar recursos de GPU
    disposeThreeJS();

  }, phase3Delay);
}


/* ================================================================
  11. LIMPIEZA DE RECURSOS THREE.JS
   Libera geometrías, materiales y el contexto WebGL de la GPU.
   Crítico para no penalizar el rendimiento del resto de la app.
   ================================================================ */
function disposeThreeJS() {
  if (isDisposed) return;
  isDisposed = true;

  // Cancelar el RAF si aún está activo (debería estar cancelado ya)
  cancelAnimationFrame(animId);
  animId = null;

  // ── Disposar burbujas ──────────────────────────────────────────
  for (const bubble of bubbles) {
    bubble.geometry.dispose();
    bubble.material.dispose();
    scene.remove(bubble);
  }
  bubbles = [];

  // ── Disposar logo group (recursivo) ───────────────────────────
  if (logoGroup) {
    logoGroup.traverse((child) => {
      if (!child.isMesh) return;

      child.geometry?.dispose();

      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material?.dispose();
      }
    });
    scene.remove(logoGroup);
    logoGroup = null;
  }

  // ── Disposar el renderer (libera contexto WebGL en la GPU) ─────
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();   // Libera el contexto OpenGL
    const canvas = renderer.domElement;
    // Reducir el canvas a 1×1 para liberar VRAM inmediatamente
    canvas.width = 1;
    canvas.height = 1;
    canvas.remove();
    renderer = null;
  }

  // Nulificar referencias para que el GC pueda limpiar la memoria JS
  scene = null;
  camera = null;
  clock = null;

  console.info('[Loader3D] ✓ Recursos Three.js liberados correctamente.');
}


/* ================================================================
  12. RESPONSIVE: ADAPTACIÓN DE PANTALLA
   ================================================================ */
function onResize() {
  if (isDisposed || !renderer || !camera) return;

  const container = document.getElementById('canvas-3d-container');
  if (!container) return;

  const W = container.offsetWidth || window.innerWidth;
  const H = container.offsetHeight || window.innerHeight;

  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
}


/* ================================================================
  13. COORDINACIÓN: page load + min duration
   El loader se mantiene visible hasta que AMBAS condiciones se cumplan:
   (a) La página (window.load) terminó de cargar todos sus recursos
   (b) Ha pasado el tiempo mínimo CFG.MIN_DURATION_MS

   Solo entonces se dispara la secuencia de salida.
   ================================================================ */
function waitAndExit() {
  let pageReady = false;
  let minTimeDone = false;
  let exited = false;

  function maybeExit() {
    if (exited) return;
    if (pageReady && minTimeDone) {
      exited = true;
      triggerExitAnimation();
    }
  }

  // (a) Esperar window.load
  if (document.readyState === 'complete') {
    pageReady = true;
  } else {
    window.addEventListener('load', () => {
      pageReady = true;
      maybeExit();
    }, { once: true });
  }

  // (b) Tiempo mínimo de visibilidad
  setTimeout(() => {
    minTimeDone = true;
    maybeExit();
  }, CFG.MIN_DURATION_MS);

  // (c) TIMEOUT DE SEGURIDAD: Si por cualquier bug el loader no termina en 15s,
  // se fuerza la salida para que el usuario nunca quede atrapado.
  setTimeout(() => {
    if (!exited) {
      console.warn('[Loader3D] Timeout de seguridad activado — forzando salida.');
      exited = true;
      triggerExitAnimation();
    }
  }, 15000);

  // Chequeo inicial (por si la página ya está lista y el min time también)
  maybeExit();
}


/* ================================================================
  14. PUNTO DE ENTRADA
   ================================================================ */
function initLoader3D() {
  // Si la inicialización de escena falla (contenedor no existe), salir limpio
  if (!initScene()) {
    // Notificar igualmente para que el fallback de main.js no espere
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('colibrix:loader-done'));
    }, 500);
    return;
  }

  setupLights();
  loadSVGLogo();
  createBubbles();
  setupMouseParallax();
  animate();
  waitAndExit();

  // Resize handler
  window.addEventListener('resize', onResize, { passive: true });

  // Pausar animación cuando la pestaña pierde el foco (ahorro de CPU/GPU)
  document.addEventListener('visibilitychange', () => {
    if (!isDisposed && !isExiting) {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        animate();
      }
    }
  });
}

// Arrancar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoader3D, { once: true });
} else {
  initLoader3D();
}
