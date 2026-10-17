import React from 'react';
import { FileText, ShieldCheck, Paintbrush, ExternalLink, Clock } from 'lucide-react';

export default function DeliverablesGrid({ project }) {
  const items = [
    {
      title: 'Cotización de Servicios',
      desc: project?.quoteLink
        ? 'Propuesta económica, especificaciones de arquitectura y cronograma de pagos.'
        : 'Aún no se ha adjuntado. Tu ejecutivo de cuenta lo cargará próximamente.',
      type: 'DOCUMENTO',
      icon: FileText,
      iconColor: project?.quoteLink ? 'var(--px-accent)' : '#9CA3AF',
      link: project?.quoteLink,
      isAvailable: Boolean(project?.quoteLink),
    },
    {
      title: 'Contrato de Servicios',
      desc: project?.contractLink
        ? 'Acuerdo legal de confidencialidad, propiedad intelectual y niveles de servicio.'
        : 'En proceso de formalización por parte del área jurídica.',
      type: 'LEGAL',
      icon: ShieldCheck,
      iconColor: project?.contractLink ? '#059669' : '#9CA3AF',
      link: project?.contractLink,
      isAvailable: Boolean(project?.contractLink),
    },
    {
      title: 'Prototipo y Diseño de Interfaz',
      desc: project?.previewUrl
        ? 'Entorno visual interactivo navegable para validar flujos y pantallas.'
        : 'Se habilitará durante la fase de Diseño y Revisión del proyecto.',
      type: 'DISEÑO',
      icon: Paintbrush,
      iconColor: project?.previewUrl ? '#8B5CF6' : '#9CA3AF',
      link: project?.previewUrl,
      isAvailable: Boolean(project?.previewUrl),
    },
  ];

  return (
    <div id="entregables" className="px-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <span className="px-label">Expediente del Proyecto</span>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>
          Entregables y documentación clave
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {items.map((doc, idx) => {
          const Icon = doc.icon;
          return (
            <div
              key={idx}
              className="px-card px-card-interactive"
              style={{
                background: '#FAFAFA',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} color={doc.iconColor} />
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      background: doc.isAvailable ? '#ECFDF5' : '#F3F4F6',
                      color: doc.isAvailable ? '#059669' : '#6B7280',
                    }}
                  >
                    {doc.isAvailable ? 'Disponible' : 'Pendiente'}
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
                  {doc.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  {doc.desc}
                </p>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
                {doc.isAvailable ? (
                  <a
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-btn px-btn-secondary"
                    style={{ padding: '6px 12px', minHeight: '32px', fontSize: '12px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={13} />
                    <span>Ver documento</span>
                  </a>
                ) : (
                  <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Próximamente
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
