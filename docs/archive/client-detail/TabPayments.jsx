// portal/src/pages/admin/client-detail/TabPayments.jsx
import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Plus, 
  Sparkles, 
  AlertCircle, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import { formatSafeDate } from './useClientDetail';
import ConfirmDialog from './ConfirmDialog';
import PlanWizardModal from './PlanWizardModal';
import PaymentFormModal from './PaymentFormModal';
import api from '../../../lib/api';
import { useToast } from '../../../lib/useToast';

export default function TabPayments({ detail }) {
  const { 
    activeProject, 
    payments, 
    fetchClient, 
    handleQuickStatusChange, 
    handleDeletePayment 
  } = detail;
  const toast = useToast();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    title: '',
    description: '',
    amount: '',
    status: 'pending',
    dueDate: '',
    invoiceLink: '',
    receiptLink: '',
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const totalAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const collectedAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const pendingAmount = totalAmount - collectedAmount;

  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    setPaymentForm({
      title: '',
      description: '',
      amount: '',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
      invoiceLink: '',
      receiptLink: '',
    });
    setShowPaymentModal(true);
  };

  const handleOpenAddAnnuity = () => {
    setEditingPayment(null);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setPaymentForm({
      title: 'Anualidad de Mantenimiento y Servidores',
      description: 'Renovación de hosting, soporte técnico y actualizaciones',
      amount: '5000',
      status: 'pending',
      dueDate: nextYear.toISOString().split('T')[0],
      invoiceLink: '',
      receiptLink: '',
    });
    setShowPaymentModal(true);
  };

  const handleOpenEditPayment = (p) => {
    setEditingPayment(p);
    setPaymentForm({
      title: p.title || '',
      description: p.description || '',
      amount: p.amount || '',
      status: p.status || 'pending',
      dueDate: p.dueDate ? p.dueDate.split('T')[0] : '',
      invoiceLink: p.invoiceLink || '',
      receiptLink: p.receiptLink || '',
    });
    setShowPaymentModal(true);
  };

  const handleSavePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!activeProject) {
      toast.error('Se requiere un proyecto asignado.');
      return;
    }
    setSavingPayment(true);
    try {
      if (editingPayment) {
        await api.put(`/payments/${editingPayment.id}`, {
          ...paymentForm,
          amount: parseFloat(paymentForm.amount),
        });
        toast.success('Pago actualizado.');
      } else {
        await api.post('/payments', {
          ...paymentForm,
          projectId: activeProject.id,
          amount: parseFloat(paymentForm.amount),
        });
        toast.success('Pago registrado.');
      }
      setShowPaymentModal(false);
      await fetchClient();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar el pago.');
    } finally {
      setSavingPayment(false);
    }
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    await handleDeletePayment(paymentToDelete.id);
    setPaymentToDelete(null);
  };

  return (
    <div className="cd-section">
      <div className="cd-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="#00C4CC" /> Plan de Pagos del Cliente
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
              {activeProject ? `Proyecto activo: ${activeProject.name}` : 'Asigna un proyecto para configurar el plan de pagos.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowPlanModal(true)}
              className="cd-btn cd-btn-primary"
              disabled={!activeProject}
            >
              <Sparkles size={15} /> Configurar Plan
            </button>
            <button
              type="button"
              onClick={handleOpenAddAnnuity}
              className="cd-btn cd-btn-secondary"
              disabled={!activeProject}
            >
              <Calendar size={15} /> Agregar Anualidad
            </button>
            <button
              type="button"
              onClick={handleOpenAddPayment}
              className="cd-btn cd-btn-secondary"
              disabled={!activeProject}
            >
              <Plus size={15} /> Pago Individual
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px 16px', borderRadius: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block' }}>Total del Proyecto</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginTop: '4px', display: 'block' }}>
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalAmount)}
            </span>
          </div>

          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '14px 16px', borderRadius: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#166534', display: 'block' }}>Cobrado</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#15803D', marginTop: '4px', display: 'block' }}>
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(collectedAmount)}
            </span>
          </div>

          <div style={{ background: '#FFFBEB', border: '1px solid #FED7AA', padding: '14px 16px', borderRadius: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#9A3412', display: 'block' }}>Por Cobrar</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#C2410C', marginTop: '4px', display: 'block' }}>
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(pendingAmount)}
            </span>
          </div>
        </div>

        {!activeProject ? (
          <div className="cd-empty-state">
            <AlertCircle size={32} color="#94A3B8" />
            <div className="cd-empty-title">Sin proyecto activo</div>
            <p className="cd-empty-desc">Crea o activa un proyecto primero para poder gestionar pagos y cuotas.</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="cd-empty-state">
            <Calendar size={32} color="#94A3B8" />
            <div className="cd-empty-title">No hay pagos registrados</div>
            <p className="cd-empty-desc">Configura el plan de pagos completo o registra el primer abono individual.</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="button" className="cd-btn cd-btn-primary" onClick={() => setShowPlanModal(true)}>
                <Sparkles size={15} /> Configurar Plan
              </button>
              <button type="button" className="cd-btn cd-btn-secondary" onClick={handleOpenAddPayment}>
                <Plus size={15} /> Pago Individual
              </button>
            </div>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Concepto</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Fecha Programada</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Monto</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Estado</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '13.5px' }}>
                {payments.map((p) => {
                  const formattedDate = formatSafeDate(p.dueDate);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{p.title}</div>
                        {p.description && <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{p.description}</div>}
                      </td>
                      <td style={{ padding: '14px', color: '#475569', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="#64748B" />
                          {formattedDate}
                        </div>
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(p.amount)}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <select
                          className="hx-input"
                          value={p.status}
                          onChange={(e) => handleQuickStatusChange(p.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: p.status === 'completed' ? '#BBF7D0' : p.status === 'upcoming' ? '#FED7AA' : p.status === 'overdue' ? '#FECACA' : '#E2E8F0',
                            background: p.status === 'completed' ? '#F0FDF4' : p.status === 'upcoming' ? '#FFFBEB' : p.status === 'overdue' ? '#FEF2F2' : '#F8FAFC',
                            color: p.status === 'completed' ? '#166534' : p.status === 'upcoming' ? '#9A3412' : p.status === 'overdue' ? '#991B1B' : '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="upcoming">Próximo</option>
                          <option value="completed">Completado</option>
                          <option value="overdue">Vencido</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditPayment(p)}
                            title="Editar Pago"
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              color: '#334155',
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentToDelete(p)}
                            title="Eliminar Pago"
                            style={{
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              color: '#DC2626',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PlanWizardModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        activeProject={activeProject}
        payments={payments}
        onSaved={fetchClient}
      />

      <PaymentFormModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        editingPayment={editingPayment}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        onSubmit={handleSavePaymentSubmit}
        savingPayment={savingPayment}
      />

      <ConfirmDialog
        open={Boolean(paymentToDelete)}
        onOpenChange={(open) => !open && setPaymentToDelete(null)}
        title="Eliminar pago"
        description={`¿Estás seguro de que deseas eliminar "${paymentToDelete?.title}"? Se removerá del calendario del cliente.`}
        confirmText="Eliminar pago"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
