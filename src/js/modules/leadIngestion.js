/**
 * ================================================================
 * MÓDULO: LEAD INGESTION
 * Interceptor de conversión: gestiona los clicks de envío,
 * muestra el loader y delega al canal directo.
 * ================================================================
 */
import { FormModule } from './form.js';
import { SendButtonsModule } from './sendButtons.js';

export const LeadIngestionModule = (() => {
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
