// portal/src/pages/admin/client-detail/ClientKpis.jsx
import { useMemo } from 'react';
import { formatSafeDate } from './useClientDetail';
import { CheckCircle2, Calendar, DollarSign, Award, Clock } from 'lucide-react';

export default function ClientKpis({ client, activeProject, payments = [] }) {
  if (!client) return null;

  // Cálculos de pagos
  const paymentStats = useMemo(() => {
    let collected = 0;
    let pending = 0;
    let nextUpcoming = null;
    const now = new Date();

    for (const p of payments) {
      if (p.status === 'completed') {
        collected += p.amount || 0;
      } else {
        pending += p.amount || 0;
        const due = new Date(p.dueDate);
        if (!nextUpcoming || (due >= now && due < new Date(nextUpcoming.dueDate))) {
          nextUpcoming = p;
        }
      }
    }

    return { collected, pending, nextUpcoming };
  }, [payments]);

  // Formato de último acceso
  const lastAccessStr = useMemo(() => {
    if (!client.lastLoginAt) return 'Sin accesos';
    const d = new Date(client.lastLoginAt);
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [client.lastLoginAt]);

  return (
    <div className="cd-kpis-grid">
      {/* 1. Avance del Proyecto */}
      <div className="cd-kpi-card">
        <div className="cd-kpi-label">
          <span>Avance Proyecto</span>
          <CheckCircle2 size={16} color="#00C4CC" />
        </div>
        <div className="cd-kpi-val">
          {activeProject?.progressPercent || 0}%
        </div>
        <div className="cd-kpi-sub">
          {activeProject ? `Fase ${activeProject.currentPhase} de 6 · ${activeProject.name}` : 'Sin proyecto activo'}
        </div>
      </div>

      {/* 2. Próximo Pago */}
      <div className="cd-kpi-card">
        <div className="cd-kpi-label">
          <span>Próximo Pago</span>
          <Calendar size={16} color="#3B82F6" />
        </div>
        <div className="cd-kpi-val" style={{ fontSize: paymentStats.nextUpcoming ? '20px' : '18px' }}>
          {paymentStats.nextUpcoming
            ? `$${paymentStats.nextUpcoming.amount.toLocaleString('es-MX')}`
            : 'Al corriente'}
        </div>
        <div className="cd-kpi-sub">
          {paymentStats.nextUpcoming
            ? `Vence: ${formatSafeDate(paymentStats.nextUpcoming.dueDate)}`
            : 'No hay pagos pendientes'}
        </div>
      </div>

      {/* 3. Cobrado vs Pendiente */}
      <div className="cd-kpi-card">
        <div className="cd-kpi-label">
          <span>Cobrado / Pendiente</span>
          <DollarSign size={16} color="#10B981" />
        </div>
        <div className="cd-kpi-val" style={{ fontSize: '18px' }}>
          ${paymentStats.collected.toLocaleString('es-MX')}{' '}
          <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
            / ${paymentStats.pending.toLocaleString('es-MX')}
          </span>
        </div>
        <div className="cd-kpi-sub">
          Total pactado: ${(paymentStats.collected + paymentStats.pending).toLocaleString('es-MX')}
        </div>
      </div>

      {/* 4. Créditos HX */}
      <div className="cd-kpi-card">
        <div className="cd-kpi-label">
          <span>Créditos HX</span>
          <Award size={16} color="#8B5CF6" />
        </div>
        <div className="cd-kpi-val" style={{ color: '#0E7490' }}>
          ${(client.totalCredits || 0).toLocaleString('es-MX')}
        </div>
        <div className="cd-kpi-sub">
          Socio Nivel {client.level || 1}
        </div>
      </div>

      {/* 5. Último Acceso */}
      <div className="cd-kpi-card">
        <div className="cd-kpi-label">
          <span>Último Acceso</span>
          <Clock size={16} color="#F59E0B" />
        </div>
        <div className="cd-kpi-val" style={{ fontSize: '18px' }}>
          {lastAccessStr}
        </div>
        <div className="cd-kpi-sub">
          {client.loginCount ? `${client.loginCount} sesiones iniciadas` : 'Nunca ha iniciado sesión'}
        </div>
      </div>
    </div>
  );
}
