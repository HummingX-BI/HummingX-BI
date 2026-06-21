/**
 * ================================================================
 * MÓDULO: NAVBAR
 * - Aplica estilos al hacer scroll
 * - Controla el menú móvil (hamburger)
 * - Actualiza el link activo según la sección visible
 * ================================================================
 */
import { CONFIG } from '../config.js';

export const NavbarModule = (() => {
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
