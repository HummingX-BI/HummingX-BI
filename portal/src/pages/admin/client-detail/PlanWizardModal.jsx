// portal/src/pages/admin/client-detail/PlanWizardModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useToast } from '../../../lib/useToast';

export default function PlanWizardModal({
  isOpen,
  onClose,
  activeProject,
  payments = [],
  onSaved,
}) {
  const toast = useToast();
  const [planTotalAmount, setPlanTotalAmount] = useState('15000');
  const [planInstallmentsCount, setPlanInstallmentsCount] = useState(5);
  const [planReplaceExisting, setPlanReplaceExisting] = useState(true);
  const [planInstallments, setPlanInstallments] = useState([]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planError, setPlanError] = useState('');

  const generateInstallments = (total, count, existingPayments = []) => {
    const tot = parseFloat(total) || 0;
    const num = Math.max(1, parseInt(count, 10) || 1);
    const baseAmount = Math.floor((tot / num) * 100) / 100;
    const remainder = parseFloat((tot - baseAmount * (num - 1)).toFixed(2));

    const items = [];
    const today = new Date();
    for (let i = 0; i < num; i++) {
      const existing = existingPayments[i];
      const defaultDate = new Date(today);
      defaultDate.setMonth(defaultDate.getMonth() + i);
      const defaultDateStr = defaultDate.toISOString().split('T')[0];
      const defaultTitle =
        i === 0
          ? 'Anticipo inicial'
          : i === num - 1
          ? 'Liquidación / Entrega'
          : `Abono intermedio ${i}`;
      const isLast = i === num - 1;

      items.push({
        title: existing?.title || defaultTitle,
        amount: existing?.amount !== undefined ? existing.amount : isLast ? remainder : baseAmount,
        dueDate: existing?.dueDate
          ? typeof existing.dueDate === 'string'
            ? existing.dueDate.split('T')[0]
            : defaultDateStr
          : defaultDateStr,
        status: existing?.status || 'pending',
      });
    }
    return items;
  };

  useEffect(() => {
    if (isOpen) {
      setPlanError('');
      const existingTotal = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const initialTotal = existingTotal > 0 ? String(existingTotal) : '15000';
      const initialCount = payments.length > 0 ? payments.length : 5;

      setPlanTotalAmount(initialTotal);
      setPlanInstallmentsCount(initialCount);
      setPlanReplaceExisting(true);
      setPlanInstallments(generateInstallments(initialTotal, initialCount, payments));
    }
  }, [isOpen, payments]);

  if (!isOpen) return null;

  const handlePlanTotalChange = (newTotal) => {
    setPlanTotalAmount(newTotal);
    setPlanInstallments(generateInstallments(newTotal, planInstallmentsCount));
  };

  const handlePlanCountChange = (newCount) => {
    const count = Math.max(1, Math.min(24, parseInt(newCount, 10) || 1));
    setPlanInstallmentsCount(count);
    setPlanInstallments(generateInstallments(planTotalAmount, count));
  };

  const handleInstallmentChange = (index, field, value) => {
    setPlanInstallments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAutoBalanceInstallments = () => {
    const tot = parseFloat(planTotalAmount) || 0;
    const num = planInstallments.length;
    if (num === 0 || tot <= 0) return;
    const baseAmount = Math.floor((tot / num) * 100) / 100;
    const remainder = parseFloat((tot - baseAmount * (num - 1)).toFixed(2));
    setPlanInstallments((prev) =>
      prev.map((inst, i) => ({
        ...inst,
        amount: i === num - 1 ? remainder : baseAmount,
      }))
    );
  };

  const handleSavePlanSubmit = async (e) => {
    e.preventDefault();
    if (!activeProject) {
      setPlanError('Se requiere un proyecto asignado.');
      return;
    }
    if (!planInstallments || planInstallments.length === 0) {
      setPlanError('Debe haber al menos 1 pago en el plan.');
      return;
    }
    for (let i = 0; i < planInstallments.length; i++) {
      const inst = planInstallments[i];
      if (!inst.dueDate) {
        setPlanError(`Selecciona la fecha para el ${inst.title || `Pago ${i + 1}`}.`);
        return;
      }
      if (inst.amount === '' || isNaN(parseFloat(inst.amount))) {
        setPlanError(`Ingresa un monto válido para el ${inst.title || `Pago ${i + 1}`}.`);
        return;
      }
    }

    setSavingPlan(true);
    setPlanError('');
    try {
      await api.post('/payments/plan', {
        projectId: activeProject.id,
        replaceExisting: planReplaceExisting,
        payments: planInstallments.map((inst) => ({
          title: inst.title,
          amount: parseFloat(inst.amount),
          dueDate: inst.dueDate,
          status: inst.status || 'pending',
          description: inst.status === 'completed' ? 'Pagado' : 'Programado',
        })),
      });
      toast.success('Plan de pagos guardado exitosamente.');
      onClose();
      if (onSaved) onSaved();
    } catch (err) {
      setPlanError(err.response?.data?.error || 'Error al guardar el plan de pagos.');
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="cd-dialog-overlay" onClick={onClose}>
      <div className="cd-dialog-content cd-dialog-wide" onClick={(e) => e.stopPropagation()}>
        <div className="cd-dialog-header">
          <h3 className="cd-dialog-title">Configurar Plan de Pagos</h3>
          <p className="cd-dialog-desc">Calcula y distribuye las cuotas del proyecto automáticamente.</p>
        </div>

        <form onSubmit={handleSavePlanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="cd-form-group">
              <label className="cd-label">Monto total del proyecto ($ MXN) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="hx-input"
                required
                value={planTotalAmount}
                onChange={(e) => handlePlanTotalChange(e.target.value)}
                style={{ fontWeight: 700, fontSize: '15px' }}
              />
            </div>

            <div className="cd-form-group">
              <label className="cd-label">Número de pagos *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  min="1"
                  max="24"
                  className="hx-input"
                  required
                  value={planInstallmentsCount}
                  onChange={(e) => handlePlanCountChange(e.target.value)}
                  style={{ width: '70px', textAlign: 'center', fontWeight: 700 }}
                />
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  {[2, 3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => handlePlanCountChange(cnt)}
                      style={{
                        flex: 1,
                        padding: '6px 2px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: planInstallmentsCount === cnt ? '1px solid #00C4CC' : '1px solid #E2E8F0',
                        background: planInstallmentsCount === cnt ? '#F0FDFA' : '#fff',
                        color: planInstallmentsCount === cnt ? '#0D9488' : '#64748B',
                        cursor: 'pointer',
                      }}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
                Cuotas Programadas ({planInstallments.length})
              </span>
              <button
                type="button"
                onClick={handleAutoBalanceInstallments}
                style={{ background: 'none', border: 'none', color: '#00C4CC', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                ↺ Dividir partes iguales
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
              {planInstallments.map((inst, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '26px 1.4fr 1fr 1.1fr 100px',
                    gap: '8px',
                    alignItems: 'center',
                    padding: '8px 10px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textAlign: 'center' }}>
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    className="hx-input"
                    required
                    value={inst.title}
                    onChange={(e) => handleInstallmentChange(idx, 'title', e.target.value)}
                    placeholder={`Pago ${idx + 1}`}
                    style={{ padding: '6px 8px', fontSize: '12.5px' }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="hx-input"
                    required
                    value={inst.amount}
                    onChange={(e) => handleInstallmentChange(idx, 'amount', e.target.value)}
                    placeholder="Monto"
                    style={{ padding: '6px 8px', fontSize: '12.5px', fontWeight: 600 }}
                  />
                  <input
                    type="date"
                    className="hx-input"
                    required
                    value={inst.dueDate}
                    onChange={(e) => handleInstallmentChange(idx, 'dueDate', e.target.value)}
                    style={{ padding: '6px 8px', fontSize: '12px' }}
                  />
                  <select
                    className="hx-input"
                    value={inst.status || 'pending'}
                    onChange={(e) => handleInstallmentChange(idx, 'status', e.target.value)}
                    style={{ padding: '6px 6px', fontSize: '11.5px', fontWeight: 600 }}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Pagado</option>
                    <option value="upcoming">Próximo</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={planReplaceExisting}
              onChange={(e) => setPlanReplaceExisting(e.target.checked)}
              style={{ accentColor: '#00C4CC', width: '15px', height: '15px' }}
            />
            <span>Reemplazar pagos existentes de este proyecto</span>
          </label>

          {planError && (
            <div style={{ padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', fontSize: '13px' }}>
              {planError}
            </div>
          )}

          <div className="cd-dialog-actions">
            <button type="button" className="cd-btn cd-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="cd-btn cd-btn-primary" disabled={savingPlan}>
              {savingPlan ? 'Guardando plan...' : 'Aplicar Plan de Pagos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
