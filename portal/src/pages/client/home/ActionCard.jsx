import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Copy, Check, Sparkles, ArrowRight, Gift } from 'lucide-react';

export default function ActionCard({
  project,
  user,
  referralCode = '',
  designApproved = false,
  onApproveDesign,
  onRequestModifications,
}) {
  const [copied, setCopied] = useState(false);

  const isDesignApprovalNeeded =
    project &&
    project.currentPhase === 3 &&
    project.designStatus !== 'approved' &&
    !designApproved;

  const isApproved =
    project?.designStatus === 'approved' || designApproved;

  const isModRequested =
    project?.designStatus === 'modifications_requested' && !designApproved;

  const handleCopy = () => {
    const code = referralCode || user?.referralCode || 'HX-SOCIO';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div id="tour-recommendations" className="px-action-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span className="px-label">
            {project?.currentPhase === 3 ? 'Aprobación Requerida' : 'Beneficios de Socio'}
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F0FDFA', color: '#00C4CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} />
          </div>
        </div>

        {/* Priority 1: Phase 3 Design Approval */}
        {project?.currentPhase === 3 ? (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 10px 0' }}>
              Revisión del Diseño de tu Proyecto
            </h3>

            {isApproved ? (
              <div style={{ padding: '16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', color: '#065F46', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="#059669" />
                <span>Diseño aprobado. Estamos preparando todo para avanzar a la fase de Desarrollo.</span>
              </div>
            ) : isModRequested ? (
              <div style={{ padding: '16px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '12px', color: '#92400E', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color="#D97706" />
                <span>Solicitud de modificaciones enviada. Nuestro equipo está trabajando en los ajustes.</span>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  Por favor revisa la propuesta visual interactiva en la pestaña de Mi Proyecto. Cuando estés listo, confirma tu aprobación para comenzar la programación.
                </p>

                {project.designStatus === 'modifications_resolved' && (
                  <div style={{ padding: '12px 14px', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '10px', color: '#3730A3', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <CheckCircle2 size={16} color="#4338CA" />
                    <span>¡Cambios listos! Hemos completado las modificaciones solicitadas.</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={onApproveDesign}
                    className="px-btn px-btn-accent"
                    style={{ width: '100%' }}
                  >
                    <CheckCircle2 size={16} /> Aprobar diseño
                  </button>
                  <a
                    href="https://wa.me/525575084267?text=Hola,%20me%20gustar%C3%ADa%20solicitar%20algunas%20modificaciones%20al%20dise%C3%B1o%20de%20mi%20proyecto."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onRequestModifications}
                    className="px-btn px-btn-secondary"
                    style={{ width: '100%', textDecoration: 'none' }}
                  >
                    Solicitar modificaciones
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Priority 2: Referral CTA */
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Recomienda y gana créditos
            </h3>
            <p style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Comparte tu código con colegas o empresas. Al iniciar su proyecto con nosotros, acumularás Créditos HX canjeables por horas de consultoría y mejoras técnicas.
            </p>

            <div style={{ background: '#FFFFFF', border: '1px dashed #D1D5DB', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Tu código de socio</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', letterSpacing: '0.04em' }}>
                  {referralCode || user?.referralCode || 'HX-SOCIO'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-btn px-btn-secondary"
                style={{ padding: '6px 14px', minHeight: '36px', fontSize: '12.5px' }}
              >
                {copied ? <><Check size={14} color="#059669" /> Copiado</> : <><Copy size={14} /> Copiar</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          to="/referrals"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#00C4CC',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Gift size={14} /> Conocer programa de recompensas <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
