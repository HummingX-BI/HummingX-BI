import React from 'react';
import { Clock, CheckCircle2, MessageCircle, Lock } from 'lucide-react';

const NEXT_STEP_DATA = {
  1: {
    nextTitle: 'Diseño de Interfaz',
    nextDesc: 'Pronto vas a poder ver el diseño y la estructura visual de tu plataforma en un entorno interactivo.'
  },
  2: {
    nextTitle: 'Revisión y Validación',
    nextDesc: 'Vas a poder interactuar con la propuesta visual y hacernos tus comentarios antes de comenzar el código.'
  },
  3: {
    nextTitle: 'Desarrollo de Software',
    nextDesc: 'Una vez aprobado el diseño visual, programaremos todas las bases de datos, APIs y componentes del sistema.'
  },
  4: {
    nextTitle: 'Lanzamiento y Producción',
    nextDesc: 'Configuraremos los servidores finales, dominio institucional y certificados de seguridad SSL.'
  },
  5: {
    nextTitle: 'Entrega y Operación Activa',
    nextDesc: 'El próximo paso es la entrega final y el arranque de operación con monitoreo continuo.'
  },
  6: {
    nextTitle: 'Operación Continua',
    nextDesc: 'Tu plataforma digital se encuentra en producción y cuenta con soporte técnico institucional.'
  }
};

export default function NextStepCard({
  project,
  isImpersonating = false,
  designApproved = false,
  onApproveDesign,
  onRequestModifications
}) {
  const currentPhase = project?.currentPhase || 1;
  const isPhase3 = currentPhase === 3;
  const isCompleted = currentPhase === 6;

  const { nextTitle, nextDesc } = NEXT_STEP_DATA[currentPhase] || NEXT_STEP_DATA[1];

  const isApproved = project?.designStatus === 'approved' || designApproved;
  const isModRequested = project?.designStatus === 'modifications_requested' && !designApproved;

  return (
    <div
      id="tour-next-step"
      className="px-card"
      style={{
        position: 'sticky',
        top: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        background: '#FFFFFF',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Clock size={14} color="#6B7280" />
          <span className="px-label">
            {isCompleted ? 'Estado Final' : 'Próximo Paso'}
          </span>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
          {nextTitle}
        </h3>

        <p style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
          {nextDesc}
        </p>
      </div>

      {/* Phase 3 Approval Box */}
      {isPhase3 && (
        <div style={{ padding: '16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#111827' }}>
            Acción de Validación
          </span>

          {isApproved ? (
            <div style={{ padding: '12px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>Diseño aprobado. Preparando desarrollo.</span>
            </div>
          ) : isModRequested ? (
            <div style={{ padding: '12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', color: '#92400E', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#D97706" />
              <span>Modificaciones solicitadas. Ajustando.</span>
            </div>
          ) : (
            <div>
              {project?.designStatus === 'modifications_resolved' && (
                <div style={{ padding: '10px 12px', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '8px', color: '#3730A3', fontSize: '12.5px', fontWeight: 600, marginBottom: '10px' }}>
                  ¡Cambios listos! Por favor revisa la nueva versión.
                </div>
              )}

              {isImpersonating ? (
                <div style={{ padding: '10px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '12px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} />
                  <span>Modo solo lectura (impersonación de admin).</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={onApproveDesign}
                    className="px-btn px-btn-accent"
                    style={{ width: '100%', minHeight: '40px', fontSize: '13px' }}
                  >
                    <CheckCircle2 size={16} /> Aprobar diseño
                  </button>
                  <a
                    href="https://wa.me/525575084267?text=Hola,%20me%20gustar%C3%ADa%20solicitar%20algunas%20modificaciones%20al%20dise%C3%B1o%20de%20mi%20proyecto."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onRequestModifications}
                    className="px-btn px-btn-secondary"
                    style={{ width: '100%', minHeight: '40px', fontSize: '13px', textDecoration: 'none' }}
                  >
                    Solicitar modificaciones
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Help CTA */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
        <a
          href="https://wa.me/525575084267"
          target="_blank"
          rel="noopener noreferrer"
          className="px-btn px-btn-secondary"
          style={{ width: '100%', textDecoration: 'none', fontSize: '13px' }}
        >
          <MessageCircle size={15} color="#25D366" />
          <span>¿Tienes dudas? Contáctanos</span>
        </a>
      </div>
    </div>
  );
}
