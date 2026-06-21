/**
 * ================================================================
 * MÓDULO: FORMULARIO MULTISTEP
 * Controla la navegación entre los pasos del formulario,
 * actualiza la barra de progreso y gestiona las opciones.
 * ================================================================
 */

/* ── CSS DINÁMICO — Animación de shake para inputs ───────────── */
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

export const FormModule = (() => {
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
