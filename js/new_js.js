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
