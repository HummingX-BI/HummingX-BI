import { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  ArrowUpRight,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';
import api from '../../../lib/api';

export default function CobranzaTab({ data, onRefresh, onShowToast }) {
  const [submittingId, setSubmittingId] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'completed'

  const upcomingPayments = data?.upcomingPayments || [];
  const completedPayments = data?.completedPayments || [];

  const getDaysRemainingInfo = (dateString) => {
    if (!dateString) return { text: '', isOverdue: false, isToday: false };
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Vencido hace ${Math.abs(diffDays)} días`,
        bg: '#FEF2F2',
        color: '#DC2626',
        border: '#FECACA',
        isOverdue: true,
      };
    }
    if (diffDays === 0) {
      return {
        text: 'Vence hoy',
        bg: '#FFFBEB',
        color: '#B45309',
        border: '#FDE68A',
        isToday: true,
      };
    }
    if (diffDays === 1) {
      return {
        text: 'Vence mañana',
        bg: '#EFF6FF',
        color: '#1D4ED8',
        border: '#DBEAFE',
      };
    }
    return {
      text: `En ${diffDays} días`,
      bg: '#F0F9FF',
      color: '#0284C7',
      border: '#BAE6FD',
    };
  };

  const handleTogglePaymentStatus = async (paymentId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setSubmittingId(paymentId);
    try {
      await api.put(`/admin/payments/${paymentId}/mark-paid`, { status: newStatus });
      onShowToast(
        newStatus === 'completed'
          ? '¡Pago marcado como cobrado! El balance general se actualizó.'
          : 'Pago regresado a estado pendiente.'
      );
      onRefresh();
    } catch (err) {
      console.error('Error toggling payment status:', err);
      if (onShowToast) onShowToast('Error al actualizar el estado del pago.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Top Header Strip ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
            Calendario de Cobranza & Flujo de Pagos
          </h2>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            Control de cuentas por cobrar de proyectos activos, fechas de vencimiento y registro de ingresos.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterMode('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: filterMode === 'all' ? '1px solid #111827' : '1px solid #E5E7EB',
              background: filterMode === 'all' ? '#111827' : '#FFFFFF',
              color: filterMode === 'all' ? '#FFFFFF' : '#4B5563',
            }}
          >
            Todos ({upcomingPayments.length + completedPayments.length})
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: filterMode === 'pending' ? '1px solid #B45309' : '1px solid #E5E7EB',
              background: filterMode === 'pending' ? '#FFFBEB' : '#FFFFFF',
              color: filterMode === 'pending' ? '#B45309' : '#4B5563',
            }}
          >
            Por Cobrar ({upcomingPayments.length})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: filterMode === 'completed' ? '1px solid #047857' : '1px solid #E5E7EB',
              background: filterMode === 'completed' ? '#ECFDF5' : '#FFFFFF',
              color: filterMode === 'completed' ? '#047857' : '#4B5563',
            }}
          >
            Cobrados ({completedPayments.length})
          </button>
        </div>
      </div>

      {/* ── SECCIÓN 1: PAGOS POR COBRAR (CALENDARIO) ────────────────── */}
      {(filterMode === 'all' || filterMode === 'pending') && (
        <div
          className="card"
          style={{
            padding: '22px 24px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#FFFBEB',
                  border: '1px solid #FEF3C7',
                  color: '#B45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#111827' }}>
                Pagos Pendientes & Por Cobrar
              </h3>
            </div>

            <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309' }}>
              Total: ${Math.round(data?.totalUpcomingRevenue || 0).toLocaleString('es-MX')} MXN
            </span>
          </div>

          {upcomingPayments.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
              No hay pagos pendientes por cobrar en este momento. Todos los proyectos están al día.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingPayments.map((payment) => {
                const client = payment.project?.client;
                const daysInfo = getDaysRemainingInfo(payment.dueDate);
                const formattedDate = new Date(payment.dueDate).toLocaleDateString('es-MX', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={payment.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      gap: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Cliente & Proyecto */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
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
                          fontWeight: 800,
                          color: '#0284C7',
                          fontSize: '14px',
                        }}
                      >
                        {(client?.companyName || client?.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827', display: 'block' }}>
                          {client?.companyName || client?.name}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>
                          {payment.title} • {payment.project?.name || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Vencimiento & Cuenta Regresiva */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: '#6B7280', display: 'block' }}>
                        Vence: {formattedDate}
                      </span>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: daysInfo.bg,
                          color: daysInfo.color,
                          border: `1px solid ${daysInfo.border}`,
                          marginTop: '3px',
                        }}
                      >
                        {daysInfo.text}
                      </span>
                    </div>

                    {/* Monto & Botón Marcar Cobrado */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right', minWidth: '100px' }}>
                        <span style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>
                          ${payment.amount.toLocaleString('es-MX')}
                        </span>
                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>MXN</span>
                      </div>

                      <button
                        onClick={() => handleTogglePaymentStatus(payment.id, payment.status)}
                        disabled={submittingId === payment.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Check size={13} />
                        {submittingId === payment.id ? 'Registrando...' : 'Marcar Cobrado'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SECCIÓN 2: HISTORIAL DE PAGOS YA COBRADOS ───────────────── */}
      {(filterMode === 'all' || filterMode === 'completed') && (
        <div
          className="card"
          style={{
            padding: '22px 24px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#111827' }}>
                Pagos Cobrados del Sistema
              </h3>
            </div>

            <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>
              Total: ${Math.round(data?.revenueFromPayments || 0).toLocaleString('es-MX')} MXN
            </span>
          </div>

          {completedPayments.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
              Aún no hay cobros registrados como completados en los proyectos activos.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {completedPayments.map((payment) => {
                const client = payment.project?.client;
                const paidDate = payment.paidAt
                  ? new Date(payment.paidAt).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Cobrado';

                return (
                  <div
                    key={payment.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      gap: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#ECFDF5',
                          color: '#047857',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckCircle2 size={15} />
                      </div>
                      <div>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827', display: 'block' }}>
                          {client?.companyName || client?.name}
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
                          {payment.title} • {payment.project?.name || 'General'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Cobrado el</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#047857' }}>{paidDate}</span>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '90px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#047857' }}>
                          ${payment.amount.toLocaleString('es-MX')}
                        </span>
                        <span style={{ fontSize: '10.5px', color: '#6B7280', display: 'block' }}>MXN</span>
                      </div>

                      <button
                        onClick={() => handleTogglePaymentStatus(payment.id, payment.status)}
                        disabled={submittingId === payment.id}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9CA3AF',
                          padding: '4px',
                        }}
                        title="Revertir a pendiente"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
