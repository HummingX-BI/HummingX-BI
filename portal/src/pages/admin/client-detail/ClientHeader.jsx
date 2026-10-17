// portal/src/pages/admin/client-detail/ClientHeader.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ArrowLeft,
  LogIn,
  BarChart3,
  MoreVertical,
  Mail,
  UserX,
  UserCheck,
  Trash2,
  Send,
  Building2
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function ClientHeader({
  client,
  activeProject,
  impersonating,
  onImpersonate,
  onToggleSuspend,
  onDeleteClient,
  onResendInvitation,
}) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [lastInviteResult, setLastInviteResult] = useState(null);

  if (!client) return null;

  const displayName = client.companyName || client.name || 'Cliente';
  const phaseNames = { 1: 'Análisis', 2: 'Diseño', 3: 'Revisión', 4: 'Desarrollo', 5: 'Lanzamiento', 6: 'Activo' };
  const currentPhaseName = activeProject ? (phaseNames[activeProject.currentPhase] || `Fase ${activeProject.currentPhase}`) : null;

  const handleSendInviteClick = async () => {
    setSendingInvite(true);
    const res = await onResendInvitation();
    setLastInviteResult(res);
    setSendingInvite(false);
  };

  return (
    <>
      <header className="cd-header">
        {/* Left: Back + Logo + Title & Badges */}
        <div className="cd-header-left">
          <button
            type="button"
            onClick={() => navigate('/admin/clientes')}
            className="cd-back-btn"
            title="Volver a lista de clientes"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="cd-logo-box">
            {client.logoUrl ? (
              <img src={client.logoUrl} alt={displayName} />
            ) : (
              <Building2 size={24} color="#9CA3AF" />
            )}
          </div>

          <div className="cd-title-box">
            <h1 className="cd-title">
              {displayName}
              {client.companyName && client.name && (
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>
                  ({client.name})
                </span>
              )}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              {/* Status Badge */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: !client.active ? '#FEE2E2' : (!client.invitationAccepted ? '#FEF3C7' : '#DCFCE7'),
                  color: !client.active ? '#991B1B' : (!client.invitationAccepted ? '#92400E' : '#166534'),
                }}
              >
                {!client.active ? 'Suspendido' : (!client.invitationAccepted ? 'Pendiente de activación' : 'Activo')}
              </span>

              {/* Tier Badge */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: '#F0FDFA',
                  color: '#0E7490',
                  border: '1px solid #CCFBF1',
                }}
              >
                Nivel {client.level || 1}
              </span>

              {/* Phase Badge */}
              {currentPhaseName && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#F3F4F6',
                    color: '#374151',
                  }}
                >
                  {currentPhaseName}
                </span>
              )}

              {/* Invitation pending chip */}
              {!client.invitationAccepted && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#D97706',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  • Invitación pendiente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="cd-header-actions">
          {/* Send invite button if not yet accepted */}
          {!client.invitationAccepted && (
            <button
              type="button"
              onClick={() => {
                setLastInviteResult(null);
                setShowInviteModal(true);
              }}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={15} color="#00C4CC" />
              <span>Enviar invitación</span>
            </button>
          )}

          {/* Secondary: Analytics */}
          <button
            type="button"
            onClick={() => navigate(`/admin/analytics?tab=client&client=${client.id}`)}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BarChart3 size={15} />
            <span className="hidden sm:inline">Ver analíticas</span>
          </button>

          {/* Primary: Impersonate */}
          <button
            type="button"
            onClick={onImpersonate}
            disabled={impersonating || !client.active}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #00C4CC 0%, #0099AA 100%)',
            }}
          >
            <LogIn size={15} />
            <span>{impersonating ? 'Accediendo...' : 'Entrar como cliente'}</span>
          </button>

          {/* ⋯ Radix Dropdown Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="cd-back-btn"
                style={{ width: '36px', height: '36px' }}
                aria-label="Más opciones"
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content className="cd-dropdown-content" align="end" sideOffset={6}>
                {!client.invitationAccepted && (
                  <DropdownMenu.Item
                    className="cd-dropdown-item"
                    onSelect={() => {
                      setLastInviteResult(null);
                      setShowInviteModal(true);
                    }}
                  >
                    <Mail size={15} />
                    <span>Reenviar invitación</span>
                  </DropdownMenu.Item>
                )}

                <DropdownMenu.Item
                  className="cd-dropdown-item"
                  onSelect={() => setShowSuspendConfirm(true)}
                >
                  {client.active ? (
                    <>
                      <UserX size={15} color="#DC2626" />
                      <span style={{ color: '#DC2626' }}>Suspender cliente</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={15} color="#059669" />
                      <span style={{ color: '#059669' }}>Reactivar cliente</span>
                    </>
                  )}
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="cd-dropdown-separator" />

                <DropdownMenu.Item
                  className="cd-dropdown-item destructive"
                  onSelect={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={15} />
                  <span>Eliminar cliente</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* Modal Reenviar / Enviar Invitación con copia de enlace */}
      <ConfirmDialog
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onConfirm={handleSendInviteClick}
        loading={sendingInvite}
        title="Enviar invitación de acceso"
        description={`Se generará y enviará un enlace de activación seguro a: ${client.email}`}
        confirmText={sendingInvite ? 'Enviando...' : 'Enviar correo'}
      />

      {/* Alerta de enlace generado */}
      {lastInviteResult?.activationLink && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setLastInviteResult(null)}
          onConfirm={() => {
            navigator.clipboard.writeText(lastInviteResult.activationLink);
            setLastInviteResult(null);
          }}
          title="Enlace de activación listo"
          description={`Enlace: ${lastInviteResult.activationLink}`}
          confirmText="Copiar enlace"
          cancelText="Cerrar"
        />
      )}

      {/* Confirmar Suspender / Reactivar */}
      <ConfirmDialog
        isOpen={showSuspendConfirm}
        onClose={() => setShowSuspendConfirm(false)}
        onConfirm={() => {
          onToggleSuspend();
          setShowSuspendConfirm(false);
        }}
        title={client.active ? '¿Suspender acceso al cliente?' : '¿Reactivar cliente?'}
        description={
          client.active
            ? `El cliente "${displayName}" perderá acceso al portal hasta que sea reactivado.`
            : `El cliente "${displayName}" podrá volver a ingresar al portal con sus credenciales.`
        }
        confirmText={client.active ? 'Suspender' : 'Reactivar'}
        isDestructive={client.active}
      />

      {/* Confirmar Eliminar Cliente con coincidencia estricta */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDeleteClient();
          setShowDeleteConfirm(false);
        }}
        title={`¿Eliminar permanentemente a "${displayName}"?`}
        description="Esta acción eliminará al cliente, sus proyectos asociados, pagos, actividades y registros en cascada. Esta operación es irreversible."
        confirmText="Eliminar cliente permanentemente"
        isDestructive={true}
        requireMatch={client.companyName || client.name}
        requireMatchLabel="Escribe el nombre de la empresa para confirmar:"
      />
    </>
  );
}
