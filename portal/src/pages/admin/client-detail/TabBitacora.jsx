// portal/src/pages/admin/client-detail/TabBitacora.jsx
import React, { useState } from 'react';
import { Activity, Plus, Calendar, Trash2, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function TabBitacora({ detail }) {
  const {
    activeProject,
    newActivity,
    setNewActivity,
    activityType,
    setActivityType,
    addingActivity,
    handleAddActivity,
    handleDeleteActivity,
  } = detail;

  const [activityToDelete, setActivityToDelete] = useState(null);

  const activities = activeProject?.activities || [];

  const confirmDelete = async () => {
    if (!activityToDelete) return;
    await handleDeleteActivity(activityToDelete.id);
    setActivityToDelete(null);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'milestone':
        return { label: 'Hito', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'review':
        return { label: 'Revisión', bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' };
      case 'comment':
        return { label: 'Comentario', bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
      default:
        return { label: 'Actualización', bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    }
  };

  return (
    <div className="cd-section">
      {/* Composer */}
      <div className="cd-card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#00C4CC" /> Registrar Nueva Entrada en Bitácora
        </h3>

        {!activeProject ? (
          <div className="cd-empty-state">
            <AlertCircle size={32} color="#94A3B8" />
            <div className="cd-empty-title">Sin proyecto activo</div>
            <p className="cd-empty-desc">Para registrar entradas en la bitácora debes asignar o crear un proyecto primero.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddActivity();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ width: '180px' }}>
                <label className="cd-label">Tipo de entrada</label>
                <select
                  className="hx-input"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  style={{ fontWeight: 600 }}
                >
                  <option value="update">Actualización</option>
                  <option value="milestone">Hito del proyecto</option>
                  <option value="review">Revisión con cliente</option>
                  <option value="comment">Nota interna</option>
                </select>
              </div>

              <div style={{ flex: '1 1 300px' }}>
                <label className="cd-label">Descripción de la actividad o avance *</label>
                <input
                  type="text"
                  className="hx-input"
                  placeholder="ej. Se entregaron propuestas de mockups en Figma para validación de marca..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="cd-btn cd-btn-primary"
                disabled={addingActivity || !newActivity.trim()}
              >
                <Plus size={16} />
                {addingActivity ? 'Guardando...' : 'Registrar en Bitácora'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Timeline */}
      <div className="cd-card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#64748B" /> Historial de la Bitácora ({activities.length})
        </h3>

        {activities.length === 0 ? (
          <div className="cd-empty-state">
            <MessageSquare size={32} color="#94A3B8" />
            <div className="cd-empty-title">Bitácora vacía</div>
            <p className="cd-empty-desc">Aún no se han registrado actividades o notas para este proyecto.</p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '24px' }}>
            <div
              style={{
                position: 'absolute',
                left: '7px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                background: '#E2E8F0',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activities.map((act) => {
                const badge = getTypeBadge(act.type);
                const d = new Date(act.createdAt);
                const dateStr = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
                const timeStr = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={act.id}
                    style={{
                      position: 'relative',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '16px 18px',
                    }}
                  >
                    {/* Node dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-23px',
                        top: '20px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#00C4CC',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 0 0 2px #E2E8F0',
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {badge.label}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {dateStr} a las {timeStr} hrs
                          </span>
                        </div>

                        <p style={{ margin: 0, fontSize: '14px', color: '#1E293B', lineHeight: '1.5' }}>
                          {act.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActivityToDelete(act)}
                        title="Eliminar registro"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(activityToDelete)}
        onOpenChange={(open) => !open && setActivityToDelete(null)}
        title="Eliminar entrada de bitácora"
        description="¿Estás seguro de que deseas eliminar este registro de la bitácora? Esta acción no se puede deshacer."
        confirmText="Eliminar entrada"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
