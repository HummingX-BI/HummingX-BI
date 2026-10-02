import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { EventManager } from '../../components/ui/event-manager';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { CheckCircle2, Calendar, DollarSign, Clock } from 'lucide-react';

const parseSafeLocalDate = (dateVal) => {
  if (!dateVal) return new Date();
  const dateStr = typeof dateVal === 'string' ? dateVal.split('T')[0] : '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
  }
  return new Date(dateVal);
};

const formatSafeDate = (dateVal) => {
  if (!dateVal) return '';
  const d = parseSafeLocalDate(dateVal);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

export default function ClientPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [rawPayments, setRawPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const { data } = await api.get('/payments/my-payments');
        setRawPayments(data || []);
        
        // Transform the data into Event format
        const events = (data || []).map(payment => {
          const color = 'blue';

          // Safe local date parser to avoid UTC day-shift
          const dueDate = parseSafeLocalDate(payment.dueDate);
          const endTime = new Date(dueDate.getTime() + 3600000); // 1 hour duration just for rendering

          return {
            id: payment.id,
            title: payment.title, // Client sees just the title
            description: payment.description || `Proyecto: ${payment.project?.name || 'General'}`,
            amount: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(payment.amount),
            logo: null, // As requested: client view should NOT display any client logo/icon
            startTime: dueDate,
            endTime: endTime,
            color,
            category: payment.status === 'completed' ? 'Completado' : payment.status === 'upcoming' ? 'Próximo' : payment.status === 'overdue' ? 'Vencido' : 'Pendiente',
            tags: [payment.status === 'completed' ? 'Facturado' : 'Pendiente'],
          };
        });

        setPayments(events);
      } catch (err) {
        console.error('Error loading payments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [user]);

  const annuityPayments = rawPayments.filter(p => p.title.toLowerCase().includes('anualidad'));
  const projectPayments = rawPayments.filter(p => !p.title.toLowerCase().includes('anualidad'));

  const completedList = projectPayments.filter(p => p.status === 'completed');
  const upcomingList = projectPayments.filter(p => p.status !== 'completed');
  const totalAmount = projectPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const paidAmount = completedList.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const pendingAmount = upcomingList.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  
  // Próximo pago del proyecto
  const nextPayment = upcomingList.length > 0 ? upcomingList.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))[0] : null;
  const isOverdue = nextPayment ? (nextPayment.status === 'overdue' || new Date(nextPayment.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)) : false;
  
  const lastPaid = completedList.length > 0 ? completedList[completedList.length - 1] : null;

  // Próxima anualidad
  const pendingAnnuities = annuityPayments.filter(p => p.status !== 'completed').sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  const nextAnnuity = pendingAnnuities.length > 0 ? pendingAnnuities[0] : null;

  return (
    <Layout customBreadcrumbLabel="Plan de Pagos">
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Plan de Pagos</h1>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Administra y visualiza el historial y las fechas de tus próximos abonos.</p>
        </div>

        {/* Overview cards */}
        {rawPayments.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>Total Cubierto / Anticipos</span>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(paidAmount)}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {lastPaid ? `${lastPaid.title} (Pagado)` : 'Sin abonos completados aún'}
              </div>
            </div>

            <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px', border: isOverdue ? '1px solid #FCA5A5' : nextPayment ? '1px solid #93C5FD' : '1px solid #E5E7EB', backgroundColor: isOverdue ? '#FEF2F2' : '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: isOverdue ? '#DC2626' : '#2563EB' }}>{isOverdue ? 'Pago Vencido' : 'Próximo Pago'}</span>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isOverdue ? '#FEE2E2' : '#EFF6FF', color: isOverdue ? '#DC2626' : '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={16} />
                </div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                {nextPayment ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(nextPayment.amount) : '$0.00 MXN'}
              </div>
              <div style={{ fontSize: '12px', color: isOverdue ? '#DC2626' : '#2563EB', fontWeight: 500 }}>
                {nextPayment ? `${nextPayment.title} — Vence el ${formatSafeDate(nextPayment.dueDate)}` : '¡Al corriente con tus pagos!'}
              </div>
            </div>

            <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>Por Liquidar</span>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} />
                </div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(pendingAmount)}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {upcomingList.length} {upcomingList.length === 1 ? 'pago restante' : 'pagos restantes'} del proyecto
              </div>
            </div>

            {nextAnnuity && (
              <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#4F46E5' }}>Anualidad</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(nextAnnuity.amount)}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  Renovación hasta el {formatSafeDate(nextAnnuity.dueDate)}
                </div>
              </div>
            )}
          </div>
        )}
        
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <div className="bars-loader"><div></div><div></div><div></div></div>
          </div>
        ) : (
          <EventManager
            events={payments}
            readOnly={true}
          />
        )}
      </div>
    </Layout>
  );
}
