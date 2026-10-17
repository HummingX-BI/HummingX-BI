import {
  Building,
  User,
  Phone,
  MessageCircle,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  Award,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-react';

const STAGE_CONFIG = {
  lead: { label: 'Contacto Inicial', bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
  contacted: { label: 'Contactado', bg: '#EFF6FF', color: '#1D4ED8', border: '#DBEAFE' },
  meeting: { label: 'Cita / Demo', bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
  proposal_sent: { label: 'Propuesta Enviada', bg: '#EFF6FF', color: '#0284C7', border: '#BAE6FD' },
  negotiating: { label: 'En Negociación', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  won: { label: 'Cliente Ganado', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  lost: { label: 'No Concretado', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
};

export default function ProspectCompactList({
  prospects,
  onSelectProspect,
  onConvert,
  convertingId,
  onEdit,
  onDelete,
  highlightedId,
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
      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 1.8fr) minmax(160px, 1.2fr) 130px 130px 140px 110px 130px',
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
        <div>Empresa & Giro</div>
        <div>Contacto</div>
        <div>Etapa</div>
        <div style={{ textAlign: 'right' }}>Presupuesto</div>
        <div>Socio</div>
        <div style={{ textAlign: 'center' }}>Docs / Citas</div>
        <div style={{ textAlign: 'right' }}>Acciones</div>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {prospects.map((p, idx) => {
          const stageCfg = STAGE_CONFIG[p.status] || STAGE_CONFIG.lead;
          const docsCount = p.documents?.length || 0;
          const apptsCount = p.appointments?.length || 0;
          const isWon = p.status === 'won';
          const isHighlighted = highlightedId === p.id;

          const rawPhone = (p.phone || '').replace(/[^0-9]/g, '');
          const cleanPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
          const whatsappUrl = rawPhone
            ? `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(p.contactName || p.companyName)}%2C%20te%20contacto%20de%20HummingX%20BI.`
            : null;

          return (
            <div
              key={p.id}
              id={`prospect-${p.id}`}
              onClick={() => onSelectProspect(p)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(220px, 1.8fr) minmax(160px, 1.2fr) 130px 130px 140px 110px 130px',
                padding: '12px 18px',
                borderBottom: idx < prospects.length - 1 ? '1px solid #F3F4F6' : 'none',
                gap: '12px',
                alignItems: 'center',
                cursor: 'pointer',
                background: isHighlighted ? '#FEF3C7' : '#FFFFFF',
                boxShadow: isHighlighted ? 'inset 0 0 0 2px #F59E0B' : 'none',
                transition: 'background 0.5s ease, box-shadow 0.5s ease',
              }}
              onMouseEnter={(e) => { if (!isHighlighted) e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseLeave={(e) => { if (!isHighlighted) e.currentTarget.style.background = '#FFFFFF'; }}
            >
              {/* Empresa & Giro */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.companyName}
                  </span>
                </div>
                {p.industry && (
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>
                    {p.industry}
                  </span>
                )}
              </div>

              {/* Contacto & WhatsApp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontSize: '12.5px',
                      color: '#111827',
                      fontWeight: 500,
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.contactName || '—'}
                  </span>
                  {p.phone && (
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>
                      {p.phone}
                    </span>
                  )}
                </div>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      background: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                    }}
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle size={14} />
                  </a>
                )}
              </div>

              {/* Etapa */}
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: stageCfg.bg,
                    color: stageCfg.color,
                    border: `1px solid ${stageCfg.border}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {stageCfg.label}
                </span>
              </div>

              {/* Presupuesto */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                  {p.estimatedValue ? `$${p.estimatedValue.toLocaleString('es-MX')}` : '—'}
                </span>
              </div>

              {/* Socio Recomendador */}
              <div style={{ minWidth: 0 }}>
                {p.referralInfo ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#F0FDFA',
                      border: '1px solid #CCFBF1',
                      color: '#0D9488',
                      fontSize: '11px',
                      fontWeight: 600,
                      maxWidth: '100%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={`Recomendado por ${p.referralInfo.referrerName} (${p.referralInfo.tierName})`}
                  >
                    <Award size={12} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Socio: {p.referralInfo.referrerName}{p.referralCode ? ` · Cód. ${p.referralCode}` : ''}
                    </span>
                  </span>
                ) : (
                  <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>Directo</span>
                )}
              </div>

              {/* Docs / Citas */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {docsCount > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0284C7',
                      background: '#F0F9FF',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                    title={`${docsCount} propuesta(s)`}
                  >
                    <FileText size={11} /> {docsCount}
                  </span>
                )}
                {apptsCount > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#7C3AED',
                      background: '#F5F3FF',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                    title={`${apptsCount} cita(s)`}
                  >
                    <Calendar size={11} /> {apptsCount}
                  </span>
                )}
                {docsCount === 0 && apptsCount === 0 && (
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
                {!isWon ? (
                  <button
                    onClick={() => onConvert(p)}
                    disabled={convertingId === p.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #00C4CC 0%, #0099AA 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    title="Convertir a Cliente Activo"
                  >
                    <Sparkles size={11} />
                    {convertingId === p.id ? '...' : 'Cerrar'}
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#047857',
                      background: '#ECFDF5',
                      padding: '3px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Activo
                  </span>
                )}

                <button
                  onClick={() => onEdit && onEdit(p)}
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
                  title="Editar datos del prospecto"
                >
                  <Edit size={13} />
                </button>

                <button
                  onClick={() => onSelectProspect(p)}
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
