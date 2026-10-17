// portal/src/pages/admin/client-detail/PaymentFormModal.jsx
import React from 'react';

export default function PaymentFormModal({
  isOpen,
  onClose,
  editingPayment,
  paymentForm,
  setPaymentForm,
  onSubmit,
  savingPayment,
}) {
  if (!isOpen) return null;

  return (
    <div className="cd-dialog-overlay" onClick={onClose}>
      <div className="cd-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="cd-dialog-header">
          <h3 className="cd-dialog-title">{editingPayment ? 'Editar Pago' : 'Registrar Pago'}</h3>
          <p className="cd-dialog-desc">Ingresa los detalles del pago para este cliente.</p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="cd-form-group">
            <label className="cd-label">Título / Concepto *</label>
            <input
              type="text"
              className="hx-input"
              required
              placeholder="ej. Anticipo del 50%"
              value={paymentForm.title}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="cd-form-group">
              <label className="cd-label">Monto ($ MXN) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="hx-input"
                required
                placeholder="ej. 5000"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div className="cd-form-group">
              <label className="cd-label">Fecha Programada *</label>
              <input
                type="date"
                className="hx-input"
                required
                value={paymentForm.dueDate}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="cd-form-group">
            <label className="cd-label">Estado</label>
            <select
              className="hx-input"
              value={paymentForm.status}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="pending">Pendiente</option>
              <option value="upcoming">Próximo</option>
              <option value="completed">Completado</option>
              <option value="overdue">Vencido</option>
            </select>
          </div>

          <div className="cd-form-group">
            <label className="cd-label">Descripción o Notas</label>
            <input
              type="text"
              className="hx-input"
              placeholder="Notas adicionales..."
              value={paymentForm.description}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="cd-dialog-actions">
            <button type="button" className="cd-btn cd-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="cd-btn cd-btn-primary" disabled={savingPayment}>
              {savingPayment ? 'Guardando...' : editingPayment ? 'Actualizar Pago' : 'Crear Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
