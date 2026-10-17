// portal/src/pages/admin/client-detail/projectUtils.js
export const PHASES = [
  { num: 1, name: 'Kickoff y Planificación', desc: 'Reunión inicial y levantamiento de requerimientos' },
  { num: 2, name: 'Diseño UX/UI', desc: 'Estructura visual, wireframes y propuesta de diseño' },
  { num: 3, name: 'Revisión y Feedback', desc: 'Aprobación del diseño por parte del cliente' },
  { num: 4, name: 'Desarrollo Frontend & Backend', desc: 'Construcción técnica del sistema' },
  { num: 5, name: 'Pruebas y QA', desc: 'Control de calidad y optimización' },
  { num: 6, name: 'Entrega y Capacitación', desc: 'Puesta en producción y entrega de accesos' },
];

export function normalizeProject(proj) {
  if (!proj) return null;
  return {
    name: proj.name || '',
    description: proj.description || '',
    currentPhase: proj.currentPhase || 1,
    progressPercent: proj.progressPercent || 0,
    estimatedDelivery: proj.estimatedDelivery ? proj.estimatedDelivery.split('T')[0] : '',
    quoteLink: proj.quoteLink || '',
    contractLink: proj.contractLink || '',
    previewUrl: proj.previewUrl || '',
    designStatus: proj.designStatus || 'pending_review',
  };
}
