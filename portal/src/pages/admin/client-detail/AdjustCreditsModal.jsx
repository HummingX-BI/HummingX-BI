// portal/src/pages/admin/client-detail/AdjustCreditsModal.jsx
import React from 'react';

export default function AdjustCreditsModal({
  isOpen,
  onClose,
  creditAdjustmentForm,
  setCreditAdjustmentForm,
  handleAdjustCredits,
  adjustingCredits,
}) {
  if (!isOpen) return null;

  return (
    <div className="cd-dialog-overlay" onClick={onClose}>
      <div className="cd-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="cd-dialog-header">
          <h3 className="cd-dialog-title">Ajuste Manual de Créditos</h3>
          <p className="cd-dialog-desc">Registra un incremento o deducción manual de créditos HX.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdjustCredits();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div className="cd-form-group">
            <label className="cd-label">Monto con signo (ej. 1500 o -500) *</label>
            <input
              type="number"
              step="1"
              className="hx-input"
              required
              placeholder="ej. 1500 o -500"
              value={creditAdjustmentForm.amount}
              onChange={(e) => setCreditAdjustmentForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
          </div>

          <div className="cd-form-group">
            <label className="cd-label">Motivo o Justificación del Ajuste *</label>
            <input
              type="text"
              className="hx-input"
              required
              placeholder="ej. Bonificación por aniversario o canje de servicio..."
              value={creditAdjustmentForm.reason}
              onChange={(e) => setCreditAdjustmentForm((prev) => ({ ...prev, reason: e.target.value }))}
            />
          </div>

          <div className="cd-dialog-actions">
            <button
              type="button"
              className="cd-btn cd-btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="cd-btn cd-btn-primary"
              disabled={adjustingCredits || !creditAdjustmentForm.amount}
            >
              {adjustingCredits ? 'Aplicando...' : 'Aplicar Ajuste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
