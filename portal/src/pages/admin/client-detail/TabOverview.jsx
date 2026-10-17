// portal/src/pages/admin/client-detail/TabOverview.jsx
import { useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { formatSafeDate } from './useClientDetail';
import {
  AlertCircle,
  Clock,
  Mail,
  Palette,
  Calendar,
  Building2,
  Phone,
  FolderGit2,
  ExternalLink,
  Send,
  CheckCircle2,
  Activity
} from 'lucide-react';
import PendingAlerts from './PendingAlerts';

export default function TabOverview({
  client,
  activeProject,
  payments = [],
  onResendInvitation,
  onNavigateTab
}) {
  if (!client) return null;

  // 1. Detección de pendientes basados en reglas
  const pendingAlerts = useMemo(() => {
    const alerts = [];
    const now = new Date();

    // Regla: Pagos vencidos
    const overduePayments = payments.filter(
      p => p.status !== 'completed' && new Date(p.dueDate) < now
    );
    if (overduePayments.length > 0) {
      const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      alerts.push({
        id: 'overdue-payments',
        type: 'error',
        title: `${overduePayments.length} pago(s) vencido(s)`,
        description: `Monto total adeudado: $${totalOverdue.toLocaleString('es-MX')}.`,
        actionLabel: 'Ver pagos',
        onAction: () => onNavigateTab('pagos'),
        icon: Calendar,
      });
    }

    // Regla: Diseño por revisar o modificaciones solicitadas
    if (activeProject?.designStatus === 'modifications_requested') {
      alerts.push({
        id: 'design-mods',
        type: 'warning',
        title: 'Modificaciones de diseño solicitadas por el cliente',
        description: 'El cliente ha enviado observaciones en la fase de diseño para ser atendidas.',
        actionLabel: 'Ver proyecto',
        onAction: () => onNavigateTab('proyecto'),
        icon: Palette,
      });
    }

    // Regla: Invitación sin activar > 3 días
    if (!client.invitationAccepted) {
      const daysSinceCreated = differenceInDays(now, new Date(client.createdAt));
      if (daysSinceCreated >= 3) {
        alerts.push({
          id: 'unaccepted-invitation',
          type: 'warning',
          title: `Invitación pendiente desde hace ${daysSinceCreated} días`,
          description: `El cliente aún no establece contraseña ni activa su cuenta (${client.email}).`,
          actionLabel: 'Reenviar invitación',
          onAction: onResendInvitation,
          icon: Mail,
        });
      }
    }

    // Regla: Sin acceso en 14+ días
    if (client.lastLoginAt) {
      const daysSinceLogin = differenceInDays(now, new Date(client.lastLoginAt));
      if (daysSinceLogin >= 14) {
        alerts.push({
          id: 'inactive-client',
          type: 'info',
          title: `Inactivo desde hace ${daysSinceLogin} días`,
          description: `Último acceso registrado el ${formatSafeDate(client.lastLoginAt)}. Se recomienda seguimiento.`,
          icon: Clock,
        });
      }
    } else {
      const daysSinceCreated = differenceInDays(now, new Date(client.createdAt));
      if (daysSinceCreated >= 14 && client.invitationAccepted) {
        alerts.push({
          id: 'never-logged-in',
          type: 'info',
          title: 'Sin accesos registrados en 14+ días',
          description: 'El cliente activó su cuenta pero aún no ingresa al portal.',
          icon: Clock,
        });
      }
    }

    return alerts;
  }, [client, activeProject, payments, onResendInvitation, onNavigateTab]);

  // 2. Últimos 5 movimientos combinados (actividades de proyecto y movimientos de crédito)
  const recentFeed = useMemo(() => {
    const list = [];

    (activeProject?.activities || []).forEach(act => {
      list.push({
        id: `act-${act.id}`,
        title: act.description,
        type: act.type || 'update',
        date: new Date(act.createdAt),
        category: 'Bitácora',
      });
    });

    (client.creditMovements || []).forEach(cm => {
      list.push({
        id: `cm-${cm.id}`,
        title: `${cm.amount > 0 ? '+' : ''}$${cm.amount.toLocaleString('es-MX')} Créditos: ${cm.description}`,
        type: cm.amount > 0 ? 'milestone' : 'note',
        date: new Date(cm.createdAt),
        category: 'Créditos',
      });
    });

    list.sort((a, b) => b.date - a.date);
    return list.slice(0, 5);
  }, [activeProject, client.creditMovements]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Bloque Pendientes y Alertas */}
      <div className="cd-card">
        <PendingAlerts alerts={pendingAlerts} />
      </div>

      {/* 2. Grid: Contacto + Proyecto Activo Mini */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Contacto & Ficha */}
        <div className="cd-card">
          <div className="cd-card-header">
            <h3 className="cd-card-title">
              <Building2 size={17} color="#4B5563" />
              <span>Ficha Comercial</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('ajustes')}
              style={{ fontSize: '12px', fontWeight: 600, color: '#0E7490', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Editar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
              <span style={{ color: '#6B7280' }}>Empresa:</span>
              <strong style={{ color: '#111827' }}>{client.companyName || '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
              <span style={{ color: '#6B7280' }}>Contacto titular:</span>
              <strong style={{ color: '#111827' }}>{client.name || '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
              <span style={{ color: '#6B7280' }}>Correo electrónico:</span>
              <span style={{ color: '#111827', fontFamily: 'monospace' }}>{client.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
              <span style={{ color: '#6B7280' }}>Teléfono:</span>
              <span style={{ color: '#111827' }}>{client.phone || 'Sin registrar'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ color: '#6B7280' }}>Código de Socio:</span>
              <span style={{ color: '#00C4CC', fontWeight: 800, fontFamily: 'monospace' }}>
                {client.referralCode || 'Sin asignar'}
              </span>
            </div>
          </div>
        </div>

        {/* Proyecto Activo Mini */}
        <div className="cd-card">
          <div className="cd-card-header">
            <h3 className="cd-card-title">
              <FolderGit2 size={17} color="#4B5563" />
              <span>Proyecto Activo</span>
            </h3>
            {activeProject && (
              <button
                type="button"
                onClick={() => onNavigateTab('proyecto')}
                style={{ fontSize: '12px', fontWeight: 600, color: '#0E7490', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Gestionar
              </button>
            )}
          </div>

          {activeProject ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                  {activeProject.name}
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#6B7280', lineHeight: 1.4 }}>
                  {activeProject.description || 'Sin descripción detallada.'}
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  <span>Fase {activeProject.currentPhase} de 6</span>
                  <span>{activeProject.progressPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${activeProject.progressPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #00C4CC 0%, #0099AA 100%)',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Links rápidos */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                {activeProject.previewUrl && (
                  <a
                    href={activeProject.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Preview</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {activeProject.figmaUrl && (
                  <a
                    href={activeProject.figmaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Figma</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>El cliente no tiene proyectos asignados actualmente.</p>
              <button
                type="button"
                onClick={() => onNavigateTab('proyecto')}
                className="btn-primary"
                style={{ marginTop: '12px', padding: '8px 14px', fontSize: '12px' }}
              >
                Crear Proyecto
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Últimos 5 Movimientos (Feed) */}
      <div className="cd-card">
        <div className="cd-card-header">
          <h3 className="cd-card-title">
            <Activity size={17} color="#4B5563" />
            <span>Últimos Movimientos del Cliente</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('bitacora')}
            style={{ fontSize: '12px', fontWeight: 600, color: '#0E7490', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Ver Bitácora Completa
          </button>
        </div>

        {recentFeed.length === 0 ? (
          <p style={{ margin: 0, color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
            No hay actividades ni movimientos registrados recientemente.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentFeed.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '10px 14px',
                  background: '#F9FAFB',
                  borderRadius: '10px',
                  border: '1px solid #F3F4F6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.category === 'Créditos' ? '#EDE9FE' : '#E0F2FE',
                      color: item.category === 'Créditos' ? '#6D28D9' : '#0369A1',
                    }}
                  >
                    {item.category}
                  </span>
                  <p style={{ margin: 0, fontSize: '13px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </p>
                </div>
                <span style={{ fontSize: '11.5px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                  {formatSafeDate(item.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
