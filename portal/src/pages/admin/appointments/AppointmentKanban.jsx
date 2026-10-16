import {
  Calendar,
  Clock,
  Building,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

const STATUS_COLUMNS = [
  { key: 'scheduled', label: 'Programadas', bg: '#EFF6FF', color: '#1D4ED8' },
  { key: 'completed', label: 'Realizadas', bg: '#ECFDF5', color: '#047857' },
  { key: 'rescheduled', label: 'Reprogramadas', bg: '#FFFBEB', color: '#B45309' },
  { key: 'cancelled', label: 'Canceladas', bg: '#FEF2F2', color: '#DC2626' },
];

const TEAM_MEMBERS = {
  emmanuel: { label: 'Emmanuel', color: '#0E7490', bg: '#F0FDFA' },
  juan_pablo: { label: 'Juan Pablo', color: '#1D4ED8', bg: '#EFF6FF' },
  curiel: { label: 'Curiel', color: '#7C3AED', bg: '#F5F3FF' },
  all: { label: 'Equipo Conjunto', color: '#047857', bg: '#ECFDF5' },
};

export default function AppointmentKanban({
  appointments,
  onSelectAppointment,
  onChangeStatus,
}) {
  const getColIndex = (statusKey) => {
    return STATUS_COLUMNS.findIndex((c) => c.key === statusKey);
  };

  const handleMoveStatus = (e, appointmentId, currentStatusKey, direction) => {
    e.stopPropagation();
    const currIdx = getColIndex(currentStatusKey);
    const targetIdx = currIdx + direction;
    if (targetIdx >= 0 && targetIdx < STATUS_COLUMNS.length) {
      onChangeStatus(appointmentId, STATUS_COLUMNS[targetIdx].key);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '14px',
        overflowX: 'auto',
        paddingBottom: '16px',
        minHeight: '520px',
      }}
    >
      {STATUS_COLUMNS.map((col) => {
        const columnAppts = appointments.filter((a) => a.status === col.key);

        return (
          <div
            key={col.key}
            style={{
              flex: '0 0 290px',
              width: '290px',
              background: '#F9FAFB',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 280px)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid #E5E7EB',
                background: '#FFFFFF',
                borderRadius: '14px 14px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
                {col.label}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: col.bg,
                  color: col.color,
                }}
              >
                {columnAppts.length}
              </span>
            </div>

            {/* Cards */}
            <div
              style={{
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {columnAppts.length === 0 ? (
                <div
                  style={{
                    padding: '30px 10px',
                    textAlign: 'center',
                    color: '#9CA3AF',
                    fontSize: '12px',
                    border: '1px dashed #E5E7EB',
                    borderRadius: '10px',
                  }}
                >
                  Sin citas en este estado
                </div>
              ) : (
                columnAppts.map((a) => {
                  const member = TEAM_MEMBERS[a.assignedTo] || TEAM_MEMBERS.emmanuel;
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
                  const currIdx = getColIndex(a.status);

                  return (
                    <div
                      key={a.id}
                      onClick={() => onSelectAppointment(a)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
                      }}
                    >
                      {/* DateTime & Responsable badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284C7', textTransform: 'capitalize' }}>
                          {dayFormatted} • {timeFormatted}
                        </span>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: member.bg,
                            color: member.color,
                          }}
                        >
                          {member.label}
                        </span>
                      </div>

                      {/* Company & Title */}
                      <div>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#111827', display: 'block', lineHeight: 1.25 }}>
                          {a.companyName}
                        </span>
                        <span style={{ fontSize: '12px', color: '#4B5563', display: 'block', marginTop: '2px' }}>
                          {a.title}
                        </span>
                      </div>

                      {/* Location snippet */}
                      {a.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#6B7280' }}>
                          <MapPin size={11} color="#9CA3AF" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.location}
                          </span>
                        </div>
                      )}

                      {/* Minuta chip if any */}
                      {a.summary && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#0F766E',
                            background: '#F0FDFA',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            borderLeft: '2.5px solid #00C4CC',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <strong>Minuta:</strong> {a.summary}
                        </div>
                      )}

                      {/* Footer: Stage move arrows */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingTop: '6px',
                          borderTop: '1px solid #F3F4F6',
                          gap: '4px',
                        }}
                      >
                        {currIdx > 0 && (
                          <button
                            onClick={(e) => handleMoveStatus(e, a.id, a.status, -1)}
                            style={{
                              background: '#F3F4F6',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              color: '#4B5563',
                            }}
                            title="Mover estado anterior"
                          >
                            <ChevronLeft size={13} />
                          </button>
                        )}
                        {currIdx < STATUS_COLUMNS.length - 1 && (
                          <button
                            onClick={(e) => handleMoveStatus(e, a.id, a.status, 1)}
                            style={{
                              background: '#F3F4F6',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              color: '#4B5563',
                            }}
                            title="Avanzar estado"
                          >
                            <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
