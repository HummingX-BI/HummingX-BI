/**
 * ================================================================
 * UTIL: INYECTOR DINÁMICO DE SVG
 * Busca elementos con la etiqueta data-inject-svg y reemplaza el
 * marcado con el contenido del archivo SVG conservando las clases.
 * ================================================================
 */

export function injectSVGs() {
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
