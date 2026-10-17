// portal/src/pages/admin/client-detail/TabSettings.jsx
import React, { useState } from 'react';
import { 
  Settings, 
  Upload, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  ShieldAlert, 
  Image as ImageIcon 
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function TabSettings({ detail }) {
  const {
    client,
    clientData,
    setClientData,
    savingClient,
    uploadingLogo,
    handleUpdateClient,
    handleToggleSuspend,
    handleDeleteClient,
    handleLogoUpload,
  } = detail;

  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInputName, setDeleteInputName] = useState('');

  const companyNameExpected = client?.companyName || client?.name || '';
  const canDelete = deleteInputName.trim().toLowerCase() === companyNameExpected.trim().toLowerCase();

  const onSubmitProfile = (e) => {
    e.preventDefault();
    handleUpdateClient();
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const confirmDeleteClient = async () => {
    if (!canDelete) return;
    await handleDeleteClient();
    setDeleteConfirmOpen(false);
  };

  return (
    <div className="cd-section">
      {/* Client Profile Settings */}
      <div className="cd-card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} color="#00C4CC" /> Información y Configuración del Cliente
        </h3>

        <form onSubmit={onSubmitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Logo Upload Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '12px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {clientData.logoUrl ? (
                <img
                  src={clientData.logoUrl}
                  alt={clientData.companyName}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <ImageIcon size={32} color="#94A3B8" />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A', display: 'block' }}>
                Logotipo del Cliente
              </label>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block', margin: '2px 0 10px' }}>
                Formatos PNG, JPG o SVG. Se muestra en su portal y cotizaciones.
              </span>

              <label
                className="cd-btn cd-btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                  opacity: uploadingLogo ? 0.6 : 1,
                }}
              >
                <Upload size={14} />
                {uploadingLogo ? 'Subiendo logo a Cloudinary...' : 'Subir nuevo logotipo'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onFileChange}
                  disabled={uploadingLogo}
                />
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="cd-form-group">
              <label className="cd-label">Nombre de Contacto *</label>
              <input
                type="text"
                className="hx-input"
                required
                value={clientData.name}
                onChange={(e) => setClientData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="cd-form-group">
              <label className="cd-label">Empresa / Negocio *</label>
              <input
                type="text"
                className="hx-input"
                required
                value={clientData.companyName}
                onChange={(e) => setClientData((prev) => ({ ...prev, companyName: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="cd-form-group">
              <label className="cd-label">Correo Electrónico *</label>
              <input
                type="email"
                className="hx-input"
                required
                value={clientData.email}
                onChange={(e) => setClientData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="cd-form-group">
              <label className="cd-label">Teléfono / WhatsApp</label>
              <input
                type="tel"
                className="hx-input"
                placeholder="+52 55 1234 5678"
                value={clientData.phone}
                onChange={(e) => setClientData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="cd-form-group">
              <label className="cd-label">Nivel de Socio / Programa de Recomendados</label>
              <select
                className="hx-input"
                value={clientData.level}
                onChange={(e) => setClientData((prev) => ({ ...prev, level: parseInt(e.target.value, 10) }))}
              >
                <option value={1}>Nivel 1 — Socio Standard ($1,500 HX por cierre)</option>
                <option value={2}>Nivel 2 — Socio Partner ($2,500 HX por cierre)</option>
                <option value={3}>Nivel 3 — Socio Élite ($3,500 HX por cierre)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="cd-btn cd-btn-primary" disabled={savingClient}>
              <Save size={16} /> {savingClient ? 'Guardando cambios...' : 'Guardar Datos del Cliente'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="cd-card" style={{ border: '1px solid #FECACA', background: '#FFFDFD' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#DC2626', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="#DC2626" /> Zona de Peligro
        </h3>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px', lineHeight: '1.5' }}>
          Acciones críticas que afectan el acceso de este cliente o la permanencia de sus registros en la base de datos.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Suspender / Reactivar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                {client?.active ? 'Suspender Acceso del Cliente' : 'Reactivar Acceso del Cliente'}
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                {client?.active
                  ? 'Bloquea temporalmente el inicio de sesión del cliente sin borrar su información.'
                  : 'Restaura el acceso del cliente a su portal con sus credenciales habituales.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuspendConfirmOpen(true)}
              className={client?.active ? 'cd-btn cd-btn-secondary' : 'cd-btn cd-btn-primary'}
              style={{
                color: client?.active ? '#B45309' : '#FFFFFF',
                borderColor: client?.active ? '#FDE68A' : undefined,
                background: client?.active ? '#FFFBEB' : undefined,
              }}
            >
              {client?.active ? (
                <>
                  <AlertCircle size={15} /> Suspender Acceso
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> Reactivar Acceso
                </>
              )}
            </button>
          </div>

          {/* Eliminar Cliente */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#991B1B' }}>
                Eliminar Cliente Permanentemente
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#B91C1C' }}>
                Se eliminará al usuario, sus proyectos, pagos, registros de actividad y referencias asociadas en cascada.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setDeleteInputName('');
                setDeleteConfirmOpen(true);
              }}
              className="cd-btn cd-btn-danger"
            >
              <Trash2 size={15} /> Eliminar Cliente
            </button>
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        open={suspendConfirmOpen}
        onOpenChange={setSuspendConfirmOpen}
        title={client?.active ? 'Suspender acceso' : 'Reactivar acceso'}
        description={
          client?.active
            ? `¿Deseas suspender el acceso a ${companyNameExpected}? No podrá entrar a su portal hasta que lo reactives.`
            : `¿Deseas reactivar el acceso a ${companyNameExpected}? Podrá iniciar sesión normalmente.`
        }
        confirmText={client?.active ? 'Suspender' : 'Reactivar'}
        variant={client?.active ? 'danger' : 'primary'}
        onConfirm={handleToggleSuspend}
      />

      {/* Delete Client Confirmation Modal (Requires typing company name) */}
      {deleteConfirmOpen && (
        <div className="cd-dialog-overlay" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="cd-dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="cd-dialog-header">
              <h3 className="cd-dialog-title" style={{ color: '#DC2626' }}>
                ¿Eliminar cliente permanentemente?
              </h3>
              <p className="cd-dialog-desc">
                Esta acción es destructiva e irreversible. Para confirmar, escribe exactamente el nombre de la empresa:{' '}
                <strong>{companyNameExpected}</strong>
              </p>
            </div>

            <div style={{ margin: '16px 0' }}>
              <input
                type="text"
                className="hx-input"
                placeholder={companyNameExpected}
                value={deleteInputName}
                onChange={(e) => setDeleteInputName(e.target.value)}
                autoFocus
                style={{ borderColor: canDelete ? '#059669' : '#EF4444' }}
              />
            </div>

            <div className="cd-dialog-actions">
              <button
                type="button"
                className="cd-btn cd-btn-secondary"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="cd-btn cd-btn-danger"
                disabled={!canDelete}
                onClick={confirmDeleteClient}
              >
                Eliminar Cliente Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
