import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  AlertCircle,
  TrendingDown,
  Server,
  Code2,
  Cpu,
  Megaphone,
  Briefcase,
  HelpCircle,
  DollarSign,
  Calendar,
  Sparkles,
  ShieldAlert,
  Info,
} from 'lucide-react';
import api from '../../../lib/api';

const CATEGORIES = [
  { id: 'infrastructure', label: 'Infraestructura', desc: 'Servidores, BD, hosting', icon: Server, color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  { id: 'software', label: 'Software & APIs', desc: 'OpenAI, Gemini, licencias', icon: Code2, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { id: 'hardware', label: 'Hardware & NFC', desc: 'Tarjetas, chips, soportes', icon: Cpu, color: '#0D9488', bg: '#F0FDFA', border: '#CCFBF1' },
  { id: 'marketing', label: 'Marketing', desc: 'Pauta, publicidad, diseño', icon: Megaphone, color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  { id: 'operations', label: 'Operaciones', desc: 'Viáticos, reuniones, varios', icon: Briefcase, color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' },
];

const PRESETS = [
  { title: 'Neon Serverless Postgres Pro', amount: '380', category: 'infrastructure', frequency: 'monthly' },
  { title: 'Vercel Pro (Hosting Portal & API)', amount: '400', category: 'infrastructure', frequency: 'monthly' },
  { title: 'Dominio hummingxbi.com & DNS', amount: '450', category: 'infrastructure', frequency: 'annual' },
  { title: 'Tokens API OpenAI & Gemini', amount: '250', category: 'software', frequency: 'monthly' },
  { title: 'Lote Tarjetas Inteligentes NFC', amount: '600', category: 'hardware', frequency: 'one_time' },
];

const PARTNERS = [
  { id: 'company', label: 'Cuenta Empresa', role: 'Fondo general', color: '#374151', bg: '#F3F4F6', avatar: 'HX' },
  { id: 'emmanuel', label: 'Emmanuel', role: 'Reembolso en reparto', color: '#0E7490', bg: '#F0FDFA', avatar: 'EM' },
  { id: 'juan_pablo', label: 'Juan Pablo', role: 'Reembolso en reparto', color: '#1D4ED8', bg: '#EFF6FF', avatar: 'JP' },
  { id: 'curiel', label: 'Curiel', role: 'Reembolso en reparto', color: '#7C3AED', bg: '#F5F3FF', avatar: 'CU' },
];

export default function ExpenseModal({
  isOpen,
  expense,
  onClose,
  onSaved,
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'infrastructure',
    frequency: 'monthly',
    paidBy: 'company',
    dueDate: '',
    notes: '',
    active: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || '',
        amount: expense.amount ? String(expense.amount) : '',
        category: expense.category || 'infrastructure',
        frequency: expense.frequency || 'monthly',
        paidBy: expense.paidBy || 'company',
        dueDate: expense.dueDate ? expense.dueDate.split('T')[0] : '',
        notes: expense.notes || '',
        active: expense.active !== undefined ? expense.active : true,
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'infrastructure',
        frequency: 'monthly',
        paidBy: 'company',
        dueDate: '',
        notes: '',
        active: true,
      });
    }
    setFormError('');
  }, [expense]);

  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      amount: preset.amount,
      category: preset.category,
      frequency: preset.frequency,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) {
      setFormError('El concepto y el monto son obligatorios.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        frequency: formData.frequency,
        paidBy: formData.paidBy,
        dueDate: formData.dueDate || null,
        notes: formData.notes.trim() || null,
        active: formData.active,
      };

      if (expense) {
        await api.put(`/admin/expenses/${expense.id}`, payload);
      } else {
        await api.post('/admin/expenses', payload);
      }

      onSaved(expense ? 'Gasto operativo actualizado.' : 'Gasto operativo registrado exitosamente.');
      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
      setFormError(err.response?.data?.error || 'Error al guardar el gasto.');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(220, 38, 38, 0.25)',
              flexShrink: 0,
            }}
          >
            <TrendingDown size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {expense ? 'Editar Gasto Operativo' : 'Registrar Gasto Operativo'}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Control de infraestructura, servidores, IA y costos reembolsables a socios.
            </p>
          </div>
        </div>

        {/* ── Quick Presets (Only on new expense) ─────────────────── */}
        {!expense && (
          <div style={{ marginBottom: '20px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
              ⚡ Plantillas Rápidas Frecuentes
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00C4CC')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                >
                  {p.title.split(' ')[0]} ${p.amount}
                </button>
              ))}
            </div>
          </div>
        )}

        {formError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#B91C1C', fontSize: '12.5px', marginBottom: '18px' }}>
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Concepto */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Concepto / Nombre del Servicio *
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
              placeholder="Ej. Neon PostgreSQL Pro, Vercel Pro, OpenAI API"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Monto & Frecuencia */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Monto en Pesos (MXN) *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontSize: '15px', fontWeight: 700, color: '#9CA3AF' }}>$</span>
                <input
                  type="number"
                  step="any"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 28px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    fontSize: '15px',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="380"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Frecuencia
              </label>
              <div style={{ display: 'flex', background: '#F3F4F6', padding: '3px', borderRadius: '10px', gap: '3px' }}>
                {[
                  { id: 'monthly', label: 'Mes' },
                  { id: 'annual', label: 'Año' },
                  { id: 'one_time', label: 'Único' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, frequency: f.id })}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: formData.frequency === f.id ? 700 : 500,
                      background: formData.frequency === f.id ? '#FFFFFF' : 'transparent',
                      color: formData.frequency === f.id ? '#111827' : '#6B7280',
                      boxShadow: formData.frequency === f.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Categoría con Chips Visuales */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Categoría del Costo
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

          {/* Pagado Por (Socios / Empresa) */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              ¿Quién cubrió este pago?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              {PARTNERS.map((p) => {
                const isSel = formData.paidBy === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, paidBy: p.id })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: isSel ? `2px solid ${p.color}` : '1px solid #E5E7EB',
                      background: isSel ? p.bg : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        border: `1px solid ${p.color}`,
                        color: p.color,
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {p.avatar}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: isSel ? 700 : 500, color: isSel ? p.color : '#374151' }}>
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {formData.paidBy !== 'company' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11.5px', color: '#0F766E' }}>
                <Info size={13} />
                <span>Se reembolsará íntegramente al socio en el tablero de reparto de utilidades.</span>
              </div>
            )}
          </div>

          {/* Próximo Corte / Vencimiento */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Próxima Fecha de Renovación / Corte (Opcional)
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
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          {/* Notas */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Notas o Detalles
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
              placeholder="Detalles sobre el plan, tarjeta usada o justificación del gasto..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Estado Activo Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
            <input
              type="checkbox"
              id="activeExpenseCheck"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: '#00C4CC', cursor: 'pointer' }}
            />
            <label htmlFor="activeExpenseCheck" style={{ fontSize: '12.5px', color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
              Servicio activo (contabilizar en el costo mensual fijo / burn rate)
            </label>
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
                background: 'linear-gradient(135deg, #00C4CC 0%, #0099AA 100%)',
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 196, 204, 0.25)',
              }}
            >
              {submitting ? 'Guardando...' : expense ? 'Actualizar Gasto' : 'Registrar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
