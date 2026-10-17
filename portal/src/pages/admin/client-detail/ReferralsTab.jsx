import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  Users, Award, DollarSign, Plus, Edit2, Trash2, Copy, 
  ExternalLink, Calendar, CheckCircle, Clock, AlertTriangle, X 
} from 'lucide-react';
import AddReferralModal from './AddReferralModal';
import CreditAdjustModal from './CreditAdjustModal';
import api from '../../../lib/api';

const STATUS_LABELS = {
  registered: { label: 'Registrado', bg: '#F3F4F6', color: '#4B5563' },
  contacted: { label: 'Contactado', bg: '#EFF6FF', color: '#1D4ED8' },
  negotiating: { label: 'En Negociación', bg: '#FFFBEB', color: '#B45309' },
  converted: { label: 'Ganado', bg: '#ECFDF5', color: '#047857' },
  inactive: { label: 'Inactivo', bg: '#FEF2F2', color: '#DC2626' },
};

export default function ReferralsTab({
  client,
  onRefresh,
  onOpenAwardModal,
  toast,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  
  // Edit referral modal
  const [editingReferral, setEditingReferral] = useState(null);
  const [editForm, setEditForm] = useState({ companyName: '', contactName: '', contactPhone: '', contactEmail: '', notes: '', status: 'contacted' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete referral modal
  const [deletingReferral, setDeletingReferral] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const summary = client?.referralSummary || {
    level: client?.level || 1,
    tierName: client?.level === 3 ? 'Oro' : client?.level === 2 ? 'Plata' : 'Bronce',
    rewardAmount: client?.level === 3 ? 3500 : client?.level === 2 ? 2500 : 1500,
    convertedCount: (client?.referralsMade || []).filter(r => r.status === 'converted').length,
    nextLevelAt: client?.level === 1 ? 5 : client?.level === 2 ? 10 : null,
    remainingToNext: client?.level === 1 ? 5 : client?.level === 2 ? 5 : 0,
  };

  const handleCopyCode = () => {
    if (client?.referralCode) {
      navigator.clipboard.writeText(client.referralCode);
      toast?.success('Copiado', `Código ${client.referralCode} copiado al portapapeles`);
    }
  };

  const handleInlineStatusChange = async (referralId, newStatus) => {
    try {
      await api.put(`/admin/referrals/${referralId}`, { status: newStatus });
      toast?.success('Estado Actualizado', 'El estatus del referido se actualizó correctamente.');
      onRefresh?.();
    } catch (err) {
      toast?.error('Error', err.response?.data?.error || 'No se pudo actualizar el estado.');
    }
  };

  const openEditModal = (ref) => {
    setEditingReferral(ref);
    setEditForm({
      companyName: ref.companyName || '',
      contactName: ref.contactName || '',
      contactPhone: ref.contactPhone || '',
      contactEmail: ref.contactEmail || '',
      notes: ref.notes || '',
      status: ref.status || 'contacted',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReferral) return;
    setSavingEdit(true);
    try {
      await api.put(`/admin/referrals/${editingReferral.id}`, editForm);
      toast?.success('Referido Guardado', 'Los cambios se guardaron correctamente.');
      setEditingReferral(null);
      onRefresh?.();
    } catch (err) {
      toast?.error('Error', err.response?.data?.error || 'No se pudo guardar los cambios.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteReferral = async () => {
    if (!deletingReferral) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/referrals/${deletingReferral.id}`);
      toast?.success('Referido Eliminado', 'La recomendación fue eliminada.');
      setDeletingReferral(null);
      onRefresh?.();
    } catch (err) {
      toast?.error('Error', err.response?.data?.error || 'No se puede eliminar este referido.');
    } finally {
      setDeleting(false);
    }
  };

  const isNumericCode = /^\d{5,6}$/.test(String(client?.referralCode || ''));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Franja Superior ─────────────────────────────────────────── */}
      <div className="card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
            {/* Chip de Código */}
            {client?.referralCode && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#F3F4F6',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 700,
                color: '#1F2937',
              }}>
                Cód. {client.referralCode}
                <button
                  type="button"
                  title="Copiar código"
                  onClick={handleCopyCode}
                  style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#6B7280', display: 'flex' }}
                >
                  <Copy size={13} />
                </button>
                {!isNumericCode && (
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'sans-serif', fontWeight: 400 }}>(código anterior)</span>
                )}
              </span>
            )}

            {/* Nivel / Tier */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              color: '#1D4ED8',
              fontSize: '13px',
              fontWeight: 700,
            }}>
              <Award size={15} />
              Nivel {summary.level} · {summary.tierName} (${summary.rewardAmount?.toLocaleString()} HX/cierre)
            </span>

            {/* Progreso a siguiente nivel */}
            <span style={{ fontSize: '13px', color: '#4B5563' }}>
              <strong>{summary.convertedCount}</strong> {summary.convertedCount === 1 ? 'cierre' : 'cierres'}
              {summary.remainingToNext > 0 ? (
                <> · faltan <strong>{summary.remainingToNext}</strong> para siguiente nivel</>
              ) : (
                <> · nivel máximo alcanzado</>
              )}
            </span>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAdjustModal(true)}
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              <DollarSign size={15} />
              Ajustar créditos
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              <Plus size={15} />
              Agregar referido
            </button>
          </div>
        </div>

        {/* Cifra Grande de Créditos */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Saldo acumulado:</span>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>
            ${(client?.totalCredits || 0).toLocaleString()} <span style={{ fontSize: '14px', color: '#00C4CC', fontWeight: 700 }}>HX</span>
          </span>
        </div>
      </div>

      {/* ── Tabla de Referidos ────────────────────────────────────────── */}
      <div className="card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#00C4CC" />
          Recomendaciones ({client?.referralsMade?.length || 0})
        </h3>

        {(!client?.referralsMade || client.referralsMade.length === 0) ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
            <Users size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '14px' }}>Este socio no tiene recomendaciones registradas aún.</p>
          </div>
        ) : (
          <div className="table-responsive-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="hx-table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Créditos</th>
                  <th>Nota Visible</th>
                  <th>Origen</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {client.referralsMade.map((ref) => {
                  const statusCfg = STATUS_LABELS[ref.status] || STATUS_LABELS.contacted;
                  const canAward = ref.creditsGenerated === 0 && ref.status !== 'inactive';
                  const canDelete = ref.creditsGenerated === 0;
                  const originLabel = ref.origin === 'client_portal' ? 'Portal' : ref.origin === 'admin_code' ? 'Código' : 'Manual';

                  return (
                    <tr key={ref.id}>
                      <td>
                        <strong style={{ color: '#111827' }}>{ref.companyName}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: '#374151' }}>{ref.contactName || '—'}</div>
                        {ref.contactPhone && <div style={{ fontSize: '11px', color: '#6B7280' }}>{ref.contactPhone}</div>}
                        {ref.contactEmail && <div style={{ fontSize: '11px', color: '#6B7280' }}>{ref.contactEmail}</div>}
                      </td>
                      <td>
                        {ref.status === 'converted' ? (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background: statusCfg.bg,
                            color: statusCfg.color
                          }}>
                            {statusCfg.label}
                          </span>
                        ) : (
                          <select
                            className="hx-input"
                            value={ref.status}
                            onChange={(e) => handleInlineStatusChange(ref.id, e.target.value)}
                            style={{ padding: '4px 8px', fontSize: '12px', height: 'auto', width: 'auto', fontWeight: 600 }}
                          >
                            <option value="registered">Registrado</option>
                            <option value="contacted">Contactado</option>
                            <option value="negotiating">En Negociación</option>
                            <option value="inactive">Inactivo</option>
                          </select>
                        )}
                      </td>
                      <td style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString('es-MX') : '—'}
                      </td>
                      <td>
                        {ref.creditsGenerated > 0 ? (
                          <span style={{ fontWeight: 700, color: '#047857', fontSize: '12.5px' }}>
                            +${ref.creditsGenerated.toLocaleString()} HX
                          </span>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: '12px' }}>$0</span>
                        )}
                      </td>
                      <td style={{ maxWidth: '200px' }}>
                        {ref.notes ? (
                          <span style={{ fontSize: '12px', color: '#4B5563', fontStyle: 'italic', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ref.notes}>
                            "{ref.notes}"
                          </span>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: '11.5px' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: ref.origin === 'client_portal' ? '#F0FDFA' : '#F3F4F6',
                          color: ref.origin === 'client_portal' ? '#0F766E' : '#4B5563',
                          fontWeight: 600,
                        }}>
                          {originLabel}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            title="Editar datos"
                            onClick={() => openEditModal(ref)}
                            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#4B5563' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          {canAward && (
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => onOpenAwardModal?.(ref)}
                              style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, color: '#047857', borderColor: '#A7F3D0', background: '#ECFDF5' }}
                            >
                              Abonar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              title="Eliminar referido"
                              onClick={() => setDeletingReferral(ref)}
                              style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#DC2626' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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

      {/* ── Movimientos de Créditos ───────────────────────────────────── */}
      <div className="card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={18} color="#00C4CC" />
          Historial de Movimientos de Créditos
        </h3>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px 0' }}>
          Para corregir un error registra un ajuste con el motivo.
        </p>

        {(!client?.creditMovements || client.creditMovements.length === 0) ? (
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>No hay movimientos de créditos registrados.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {client.creditMovements.map((m) => {
              const isPositive = m.amount > 0;
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    fontSize: '13px',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: '#111827', display: 'block' }}>{m.description}</span>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
                      {' · '}Tipo: {m.type}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: isPositive ? '#059669' : '#DC2626',
                  }}>
                    {isPositive ? `+${m.amount.toLocaleString()}` : m.amount.toLocaleString()} HX
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modales ─────────────────────────────────────────────────── */}
      <AddReferralModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        clientId={client?.id}
        onSuccess={onRefresh}
        toast={toast}
      />

      <CreditAdjustModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        clientId={client?.id}
        currentBalance={client?.totalCredits || 0}
        onSuccess={onRefresh}
        toast={toast}
      />

      {/* Modal Editar Referido */}
      {editingReferral && (
        <Dialog.Root open={!!editingReferral} onOpenChange={(open) => { if (!open) setEditingReferral(null); }}>
          <Dialog.Portal>
            <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 9999 }} />
            <Dialog.Content style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              maxWidth: '480px',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              zIndex: 10000,
              border: '1px solid #E5E7EB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Dialog.Title style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#111827' }}>
                  Editar Referido
                </Dialog.Title>
                <button type="button" onClick={() => setEditingReferral(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Empresa *</label>
                  <input type="text" required className="hx-input" value={editForm.companyName} onChange={e => setEditForm({ ...editForm, companyName: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Contacto</label>
                    <input type="text" className="hx-input" value={editForm.contactName} onChange={e => setEditForm({ ...editForm, contactName: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Teléfono</label>
                    <input type="tel" className="hx-input" value={editForm.contactPhone} onChange={e => setEditForm({ ...editForm, contactPhone: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Email</label>
                    <input type="email" className="hx-input" value={editForm.contactEmail} onChange={e => setEditForm({ ...editForm, contactEmail: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Estado</label>
                    <select className="hx-input" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                      <option value="registered">Registrado</option>
                      <option value="contacted">Contactado</option>
                      <option value="negotiating">En Negociación</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Nota visible para el cliente</label>
                  <textarea className="hx-input" rows={2} value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setEditingReferral(null)} disabled={savingEdit}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={savingEdit}>{savingEdit ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      {/* Modal Confirmar Eliminar */}
      {deletingReferral && (
        <Dialog.Root open={!!deletingReferral} onOpenChange={(open) => { if (!open) setDeletingReferral(null); }}>
          <Dialog.Portal>
            <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 9999 }} />
            <Dialog.Content style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              maxWidth: '400px',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              zIndex: 10000,
              border: '1px solid #E5E7EB',
            }}>
              <Dialog.Title style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px 0', color: '#111827' }}>
                ¿Eliminar recomendación?
              </Dialog.Title>
              <Dialog.Description style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px 0' }}>
                Se eliminará la recomendación de <strong>{deletingReferral.companyName}</strong>. Esta acción no se puede deshacer.
              </Dialog.Description>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setDeletingReferral(null)} disabled={deleting}>Cancelar</button>
                <button
                  type="button"
                  onClick={handleDeleteReferral}
                  disabled={deleting}
                  style={{
                    background: '#DC2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}
