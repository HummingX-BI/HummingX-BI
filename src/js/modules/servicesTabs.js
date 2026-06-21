/**
 * ================================================================
 * MÓDULO: SERVICIOS MASTER-DETAIL
 * ================================================================
 */
export const ServicesMasterDetailModule = (() => {
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
