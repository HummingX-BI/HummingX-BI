// portal/src/pages/admin/client-detail/AwardCreditsModal.jsx
import React from 'react';

export default function AwardCreditsModal({
  isOpen,
  onClose,
  targetReferral,
  awardAmount,
  setAwardAmount,
  level,
  levelName,
  levelReward,
  clientName,
  submittingReward,
  onConfirm,
}) {
  if (!isOpen || !targetReferral) return null;

  return (
    <div className="cd-dialog-overlay" onClick={onClose}>
      <div className="cd-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="cd-dialog-header">
          <h3 className="cd-dialog-title">Abonar Créditos de Recompensa</h3>
          <p className="cd-dialog-desc">
            Vas a premiar a <strong>{clientName}</strong> por el cierre con{' '}
            <strong>{targetReferral.companyName}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' }}>
          <div className="cd-form-group">
            <label className="cd-label">Monto de la recompensa ($ MXN)</label>
            <input
              type="number"
              step="100"
              min="1"
              className="hx-input"
              value={awardAmount}
              onChange={(e) => setAwardAmount(parseInt(e.target.value, 10) || 0)}
              style={{ fontWeight: 700, fontSize: '15px' }}
            />
            <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
              Monto sugerido para Nivel {level} ({levelName}): ${levelReward.toLocaleString('es-MX')} HX.
            </span>
          </div>
        </div>

        <div className="cd-dialog-actions">
          <button type="button" className="cd-btn cd-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="cd-btn cd-btn-primary"
            onClick={onConfirm}
            disabled={submittingReward || awardAmount <= 0}
          >
            {submittingReward ? 'Abonando...' : `Confirmar Abono de $${awardAmount.toLocaleString('es-MX')} HX`}
          </button>
        </div>
      </div>
    </div>
  );
}
