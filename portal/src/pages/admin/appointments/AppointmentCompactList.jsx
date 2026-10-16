import {
  Calendar,
  Clock,
  Building,
  User,
  Phone,
  MapPin,
  MessageCircle,
  ChevronRight,
  FileText,
  Edit,
} from 'lucide-react';

const TEAM_MEMBERS = {
  emmanuel: { label: 'Emmanuel', color: '#0E7490', bg: '#F0FDFA' },
  juan_pablo: { label: 'Juan Pablo', color: '#1D4ED8', bg: '#EFF6FF' },
  curiel: { label: 'Curiel', color: '#7C3AED', bg: '#F5F3FF' },
  all: { label: 'Equipo Conjunto', color: '#047857', bg: '#ECFDF5' },
};

const STATUS_CONFIG = {
  scheduled: { label: 'Programada', bg: '#EFF6FF', color: '#1D4ED8', border: '#DBEAFE' },
  completed: { label: 'Realizada', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  rescheduled: { label: 'Reprogramada', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  cancelled: { label: 'Cancelada', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
};

export default function AppointmentCompactList({
  appointments,
  onSelectAppointment,
  onChangeStatus,
  onEdit,
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '170px minmax(220px, 1.8fr) 140px minmax(160px, 1.2fr) 130px 100px 90px',
          padding: '12px 18px',
          background: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          fontSize: '11px',
          fontWeight: 700,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <div>Fecha y Hora</div>
        <div>Empresa & Objetivo</div>
        <div>Responsable</div>
        <div>Ubicación</div>
        <div>Estado</div>
        <div style={{ textAlign: 'center' }}>Minuta</div>
        <div style={{ textAlign: 'right' }}>Acciones</div>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {appointments.map((a, idx) => {
          const member = TEAM_MEMBERS[a.assignedTo] || TEAM_MEMBERS.emmanuel;
          const statusCfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.scheduled;

          const dateObj = new Date(a.dateTime);
          const dayFormatted = dateObj.toLocaleDateString('es-MX', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          });
          const timeFormatted = dateObj.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          });

          const rawPhone = (a.contactPhone || '').replace(/[^0-9]/g, '');
          const cleanPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
          const whatsappUrl = rawPhone
            ? `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(a.contactName || a.companyName)}%2C%20te%20contacto%20de%20HummingX%20BI.`
            : null;

          return (
            <div
              key={a.id}
              onClick={() => onSelectAppointment(a)}
              style={{
                display: 'grid',
                gridTemplateColumns: '170px minmax(220px, 1.8fr) 140px minmax(160px, 1.2fr) 130px 100px 90px',
                padding: '12px 18px',
                borderBottom: idx < appointments.length - 1 ? '1px solid #F3F4F6' : 'none',
                gap: '12px',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
            >
              {/* Fecha y Hora */}
              <div>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#111827', display: 'block', textTransform: 'capitalize' }}>
                  {dayFormatted}
                </span>
                <span style={{ fontSize: '11px', color: '#00C4CC', fontWeight: 700 }}>
                  {timeFormatted}
                </span>
              </div>

              {/* Empresa & Objetivo */}
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.companyName}
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {a.title}
                </span>
              </div>

              {/* Responsable */}
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: member.bg,
                    color: member.color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {member.label}
                </span>
              </div>

              {/* Ubicación */}
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '12px', color: '#4B5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {a.location}
                </span>
              </div>

              {/* Estado */}
              <div onClick={(e) => e.stopPropagation()}>
                <select
                  value={a.status}
                  onChange={(e) => onChangeStatus(a.id, e.target.value)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    background: statusCfg.bg,
                    color: statusCfg.color,
                    border: `1px solid ${statusCfg.border}`,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              {/* Minuta */}
              <div style={{ textAlign: 'center' }}>
                {a.summary ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#F0FDFA',
                      color: '#0F766E',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                    title={a.summary}
                  >
                    <FileText size={11} /> Con Minuta
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', color: '#D1D5DB' }}>—</span>
                )}
              </div>

              {/* Acciones */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '6px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                    }}
                    title="WhatsApp"
                  >
                    <MessageCircle size={13} />
                  </a>
                )}

                <button
                  onClick={() => onEdit && onEdit(a)}
                  style={{
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px',
                    cursor: 'pointer',
                    color: '#4B5563',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Editar cita"
                >
                  <Edit size={13} />
                </button>

                <button
                  onClick={() => onSelectAppointment(a)}
                  style={{
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px',
                    cursor: 'pointer',
                    color: '#4B5563',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Ver detalle completo"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
