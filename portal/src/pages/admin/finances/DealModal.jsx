import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Code2,
  Cpu,
  Sparkles,
  Layers,
  DollarSign,
  Calendar,
  Building,
} from 'lucide-react';
import api from '../../../lib/api';

const CATEGORIES = [
  { id: 'Business Intelligence', label: 'Business Intelligence', desc: 'Dashboards, reportes', icon: TrendingUp, color: '#00C4CC', bg: '#F0FDFA' },
  { id: 'Desarrollo Web', label: 'Desarrollo Web', desc: 'Portales, landing, apps', icon: Code2, color: '#0284C7', bg: '#F0F9FF' },
  { id: 'Tarjetas NFC', label: 'Tarjetas NFC & QR', desc: 'Tarjetas smart, menús', icon: Cpu, color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'Automatización', label: 'Automatización & IA', desc: 'Bots, sincronización', icon: Sparkles, color: '#059669', bg: '#ECFDF5' },
  { id: 'Consultoría', label: 'Consultoría', desc: 'Estrategia, arquitectura', icon: Briefcase, color: '#B45309', bg: '#FFFBEB' },
];

const PRESET_AMOUNTS = ['12000', '18500', '25000', '35000', '50000'];

export default function DealModal({
  isOpen,
  deal,
  onClose,
  onSaved,
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    amount: '',
    closedAt: new Date().toISOString().split('T')[0],
    category: 'Business Intelligence',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (deal) {
      setFormData({
        clientName: deal.clientName || '',
        projectName: deal.projectName || '',
        amount: deal.amount ? String(deal.amount) : '',
        closedAt: deal.closedAt ? deal.closedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        category: deal.category || 'Business Intelligence',
        notes: deal.notes || '',
      });
    } else {
      setFormData({
        clientName: '',
        projectName: '',
        amount: '',
        closedAt: new Date().toISOString().split('T')[0],
        category: 'Business Intelligence',
        notes: '',
      });
    }
    setFormError('');
  }, [deal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.projectName.trim() || !formData.amount) {
      setFormError('Cliente, proyecto y monto son obligatorios.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        clientName: formData.clientName.trim(),
        projectName: formData.projectName.trim(),
        amount: parseFloat(formData.amount),
        closedAt: formData.closedAt,
        category: formData.category.trim(),
        notes: formData.notes.trim() || null,
      };

      if (deal) {
        await api.put(`/admin/finances/deals/${deal.id}`, payload);
      } else {
        await api.post('/admin/finances/deals', payload);
      }

      onSaved(deal ? 'Proyecto histórico actualizado.' : 'Proyecto cerrado registrado con éxito.');
      onClose();
    } catch (err) {
      console.error('Error saving deal:', err);
      setFormError(err.response?.data?.error || 'Error al guardar el proyecto.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #E5E7EB',
          position: 'relative',
          padding: '28px 32px',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F3F4F6',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6B7280',
          }}
        >
          <X size={17} />
        </button>

        {/* ── Modal Header with Icon Badge ───────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.25)',
              flexShrink: 0,
            }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {deal ? 'Editar Proyecto Cerrado' : 'Registrar Proyecto Cerrado Histórico'}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Registra soluciones y servicios entregados para el balance histórico y reparto de utilidades.
            </p>
          </div>
        </div>

        {formError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#B91C1C', fontSize: '12.5px', marginBottom: '18px' }}>
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Cliente & Empresa */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Cliente / Empresa *
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="Ej. Clínica Dental Sonrisas CDMX, Tahara Café"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
            />
          </div>

          {/* Nombre del Proyecto */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Proyecto o Solución Realizada *
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="Ej. Dashboard de Ventas BI & Comandero NFC"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              required
            />
          </div>

          {/* Monto & Presets */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>
                Monto Cobrado (MXN) *
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: amt })}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    +${parseInt(amt) / 1000}k
                  </button>
                ))}
              </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', fontSize: '16px', fontWeight: 700, color: '#059669' }}>$</span>
              <input
                type="number"
                step="any"
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 28px',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                placeholder="18500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <span style={{ position: 'absolute', right: '14px', fontSize: '12px', fontWeight: 700, color: '#6B7280' }}>MXN</span>
            </div>
          </div>

          {/* Fecha de Cierre */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Fecha de Cierre / Cobro
            </label>
            <input
              type="date"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              value={formData.closedAt}
              onChange={(e) => setFormData({ ...formData, closedAt: e.target.value })}
              required
            />
          </div>

          {/* Categoría Visual */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Categoría del Servicio
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSel = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: isSel ? `2px solid ${cat.color}` : '1px solid #E5E7EB',
                      background: isSel ? cat.bg : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={16} color={cat.color} />
                    <span style={{ fontSize: '12px', fontWeight: isSel ? 700 : 500, color: isSel ? cat.color : '#374151' }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Notas de Alcance y Entregables
            </label>
            <textarea
              rows={2}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
              }}
              placeholder="Detalle de entregables, soporte acordado o notas del cobro..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #F3F4F6', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 22px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              {submitting ? 'Guardando...' : deal ? 'Actualizar Proyecto' : 'Registrar Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
