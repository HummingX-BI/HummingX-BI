import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { EventManager } from '../../components/ui/event-manager';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const { data } = await api.get('/payments');
        
        // Palette of colors for distinct clients
        const CLIENT_PALETTE = ['blue', 'purple', 'green', 'orange', 'indigo', 'cyan', 'pink', 'teal', 'amber', 'red'];

        // Deterministically assign each unique client their own distinct color
        const clientKeys = Array.from(new Set(
          data.map(p => p.project?.client?.id || p.project?.client?.companyName || p.project?.client?.name || 'Cliente')
        )).sort();

        const clientColorMap = new Map();
        clientKeys.forEach((key, idx) => {
          clientColorMap.set(key, CLIENT_PALETTE[idx % CLIENT_PALETTE.length]);
        });

        // Transform the data into Event format
        const events = data.map(payment => {
          const clientKey = payment.project?.client?.id || payment.project?.client?.companyName || payment.project?.client?.name || 'Cliente';
          const clientName = payment.project?.client?.companyName || payment.project?.client?.name || 'Cliente';
          const logo = payment.project?.client?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=0066FF&color=fff&bold=true`;
          
          // All payments of the same client have the exact same color
          const color = clientColorMap.get(clientKey) || 'blue';

          // Safe local date parser to avoid UTC day-shift
          let dueDate = new Date();
          if (payment.dueDate) {
            const dateStr = typeof payment.dueDate === 'string' ? payment.dueDate.split('T')[0] : '';
            const parts = dateStr.split('-');
            if (parts.length === 3) {
              dueDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
            } else {
              dueDate = new Date(payment.dueDate);
            }
          }
          const endTime = new Date(dueDate.getTime() + 3600000); // 1 hour duration just for rendering

          return {
            id: payment.id,
            title: `${payment.title} - ${clientName}`,
            description: payment.description || `Proyecto: ${payment.project?.name || 'General'}`,
            amount: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(payment.amount),
            logo, // In admin view, client logo is explicitly provided
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
  }, []);

  return (
    <Layout customBreadcrumbLabel="Pagos Globales">
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Control de Pagos (Global)</h1>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Vista administrativa de todos los pagos programados de tus clientes.</p>
        </div>
        
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <div className="bars-loader"><div></div><div></div><div></div></div>
          </div>
        ) : (
          <EventManager
            events={payments}
            defaultView="month"
          />
        )}
      </div>
    </Layout>
  );
}
