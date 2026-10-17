import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, User, Mail, Phone, FileText, Send, Sparkles } from 'lucide-react';
import api from '../../../lib/api';

export default function RecommendModal({ isOpen, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setError('El nombre de la empresa o negocio es obligatorio.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post('/referrals', formData);
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar recomendación.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)'
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden relative animate-scale-up"
        style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B0C2E] to-[#2E124D] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00E5FF] flex items-center gap-1">
              <Sparkles size={12} /> Red de Socios HummingX
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">Recomendar una empresa</h3>
          <p className="text-xs text-gray-300 mt-1">
            Registra los datos para que nuestro equipo directivo prepare una propuesta preferencial.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Empresa o Negocio *
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Ej. Clínica Dental Sonrisas, Restaurante El Puerto..."
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00C4CC] focus:bg-white transition-all text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nombre de Contacto
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ej. Lic. Fernando"
                  value={formData.contactName}
                  onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00C4CC] focus:bg-white transition-all text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Teléfono / WhatsApp
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Ej. 55 1234 5678"
                  value={formData.contactPhone}
                  onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00C4CC] focus:bg-white transition-all text-gray-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Correo Electrónico (Opcional)
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="contacto@empresa.com"
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00C4CC] focus:bg-white transition-all text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              ¿Qué necesidad o proyecto tienen? (Opcional)
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                rows={3}
                placeholder="Ej. Buscan modernizar su sistema de comandas, menú digital, página web o dashboards..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00C4CC] focus:bg-white transition-all text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00C4CC] hover:bg-[#00b0b8] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Registrando...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Registrar Recomendación</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
