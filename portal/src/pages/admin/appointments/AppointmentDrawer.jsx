import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calendar,
  Clock,
  Building,
  User,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  Edit,
  Trash2,
  CheckCircle2,
  FileText,
  Navigation,
} from 'lucide-react';

const TEAM_MEMBERS = {
  emmanuel: { label: 'Emmanuel', color: '#0E7490', bg: '#F0FDFA', border: '#CCFBF1' },
  juan_pablo: { label: 'Juan Pablo', color: '#1D4ED8', bg: '#EFF6FF', border: '#DBEAFE' },
  curiel: { label: 'Curiel', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  all: { label: 'Equipo Conjunto', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
};

const STATUS_CONFIG = {
  scheduled: { label: 'Programada', bg: '#EFF6FF', color: '#1D4ED8', border: '#DBEAFE' },
  completed: { label: 'Realizada', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  rescheduled: { label: 'Reprogramada', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  cancelled: { label: 'Cancelada', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
};

export default function AppointmentDrawer({
  appointment,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus,
  onUpdateSummary,
}) {
  if (!appointment) return null;

  const [summaryText, setSummaryText] = useState(appointment.summary || '');
  const [savingSummary, setSavingSummary] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const memberCfg = TEAM_MEMBERS[appointment.assignedTo] || TEAM_MEMBERS.emmanuel;
  const statusCfg = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.scheduled;

  const dateObj = new Date(appointment.dateTime);
  const formattedDate = dateObj.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const rawPhone = (appointment.contactPhone || '').replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
  const whatsappUrl = rawPhone
    ? `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(appointment.contactName || appointment.companyName)}%2C%20te%20contacto%20de%20HummingX%20BI%20respecto%20a%20nuestra%20visita%20programada.`
    : null;

  const mapsUrl = appointment.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.location)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(appointment.location)}`;

  const handleSaveSummary = async () => {
    setSavingSummary(true);
    setSavedSuccess(false);
    try {
      await onUpdateSummary(appointment.id, summaryText);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error al guardar minuta.');
    } finally {
      setSavingSummary(false);
    }
  };

  return createPortal(
    <div
      className="drawer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="drawer-panel">
        {/* Header */}
        <div className="drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#00C4CC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cita Presencial
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: memberCfg.bg,
                  color: memberCfg.color,
                }}
              >
                {memberCfg.label}
              </span>
            </div>

            <h2
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {appointment.title}
            </h2>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600, display: 'block', marginTop: '2px' }}>
              {appointment.companyName}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Cerrar panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">

          {/* Date & Time Highlight Card */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0A192F 0%, #172A45 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span style={{ fontSize: '11.5px', color: '#94A3B8', display: 'block', textTransform: 'capitalize' }}>
                {formattedDate}
              </span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#00C4CC' }}>
                {formattedTime}
              </span>
            </div>

            <span
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                background: statusCfg.bg,
                color: statusCfg.color,
                border: `1px solid ${statusCfg.border}`,
              }}
            >
              {statusCfg.label}
            </span>
          </div>

          {/* Quick Status Buttons */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              Cambiar Estado de la Visita
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const isActive = appointment.status === key;
                return (
                  <button
                    key={key}
                    onClick={() => onChangeStatus(appointment.id, key)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 500,
                      border: isActive ? `1.5px solid ${cfg.color}` : '1px solid #E5E7EB',
                      background: isActive ? cfg.bg : '#FFFFFF',
                      color: isActive ? cfg.color : '#6B7280',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#F9FAFB',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contacto de la Empresa
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '13px' }}>
              {appointment.contactName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#111827' }}>
                  <User size={14} color="#6B7280" />
                  <strong>{appointment.contactName}</strong>
                </div>
              )}

              {appointment.contactPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#6B7280" />
                  <span>{appointment.contactPhone}</span>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginLeft: 'auto',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#25D366',
                        color: '#FFFFFF',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <MessageCircle size={12} /> WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Physical Address & Navigation */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} color="#00C4CC" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dirección Física
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '13.5px', color: '#111827', lineHeight: 1.4, fontWeight: 500 }}>
              {appointment.location}
            </p>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  color: '#0284C7',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Navigation size={13} /> Abrir en Google Maps
              </a>

              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#334155',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Abrir en Waze
              </a>
            </div>
          </div>

          {/* Meeting Minutes (Minuta de Acuerdos) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} color="#00C4CC" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                  Minuta & Acuerdos de la Reunión
                </span>
              </div>
              {savedSuccess && (
                <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Guardado
                </span>
              )}
            </div>

            <textarea
              className="hx-input"
              rows={4}
              placeholder="Escribe los acuerdos tomados en la reunión, dudas del cliente o entregables pactados..."
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              style={{ resize: 'vertical', lineHeight: 1.5, fontSize: '13px' }}
            />

            <button
              onClick={handleSaveSummary}
              disabled={savingSummary}
              style={{
                marginTop: '8px',
                background: '#111827',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {savingSummary ? 'Guardando...' : 'Guardar Minuta'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button
            onClick={() => onDelete(appointment.id, appointment.title)}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Trash2 size={14} /> Eliminar Cita
          </button>

          <button
            onClick={() => onEdit(appointment)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#111827',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Edit size={14} /> Editar Cita
          </button>
        </div>

      </aside>
    </div>,
    document.body
  );
}
