import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Building2, User, Mail, Phone, FileText, Calendar, Check, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';

export default function AddReferralModal({ isOpen, onClose, clientId, onSuccess, toast }) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    status: 'contacted',
    clientNote: '',
    createdAt: '',
    createInCrm: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.companyName.trim()) {
      setErrorMsg('El nombre de la empresa es obligatorio.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyName: formData.companyName.trim(),
        contactName: formData.contactName.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        contactEmail: formData.contactEmail.trim() || undefined,
        status: formData.status,
        clientNote: formData.clientNote.trim() || undefined,
        createdAt: formData.createdAt ? new Date(formData.createdAt).toISOString() : undefined,
        createInCrm: formData.createInCrm,
      };

      await api.post(`/admin/clients/${clientId}/referrals`, payload);
      toast?.success('Referido Agregado', 'La recomendación se registró correctamente.');
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMsg('Ya existe esta recomendación para este cliente.');
        toast?.error('Conflicto', 'Ya existe esta recomendación para este cliente.');
      } else {
        const msg = err.response?.data?.error || 'Error al agregar el referido.';
        setErrorMsg(msg);
        toast?.error('Error', msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
        }} />
        <Dialog.Content style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '520px',
          maxHeight: '90vh',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 10000,
          overflowY: 'auto',
          outline: 'none',
          border: '1px solid #E5E7EB',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#EFF6FF',
                color: '#1D4ED8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={20} />
              </div>
              <Dialog.Title style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Agregar Recomendación
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px' }}>
            Registra una recomendación manual para este socio.
          </Dialog.Description>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#FEF2F2',
              color: '#DC2626',
              fontSize: '12.5px',
              marginBottom: '14px',
              border: '1px solid #FECACA',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Empresa recomendada *
              </label>
              <input
                type="text"
                required
                className="hx-input"
                placeholder="Nombre del negocio o empresa"
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Persona de contacto
                </label>
                <input
                  type="text"
                  className="hx-input"
                  placeholder="Ej. Ing. Carlos Pérez"
                  value={formData.contactName}
                  onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="hx-input"
                  placeholder="Ej. 4771234567"
                  value={formData.contactPhone}
                  onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="hx-input"
                  placeholder="contacto@empresa.com"
                  value={formData.contactEmail}
                  onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Estado inicial
                </label>
                <select
                  className="hx-input"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="registered">Registrado</option>
                  <option value="contacted">Contactado</option>
                  <option value="negotiating">En Negociación</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Nota visible para el cliente
              </label>
              <textarea
                className="hx-input"
                rows={2}
                placeholder="Ej. Ya estamos en contacto para ofrecerle este servicio"
                value={formData.clientNote}
                onChange={e => setFormData({ ...formData, clientNote: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginTop: '3px' }}>
                El cliente verá empresa, estado y esta nota en Mis Referidos.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Fecha (opcional)
                </label>
                <input
                  type="date"
                  className="hx-input"
                  value={formData.createdAt}
                  onChange={e => setFormData({ ...formData, createdAt: e.target.value })}
                />
              </div>

              <div style={{ paddingTop: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.createInCrm}
                    onChange={e => setFormData({ ...formData, createInCrm: e.target.checked })}
                    style={{ accentColor: '#1D4ED8', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontWeight: 500 }}>Crear también en CRM</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar Referido'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
