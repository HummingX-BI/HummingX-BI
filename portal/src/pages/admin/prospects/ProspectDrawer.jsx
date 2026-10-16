import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building,
  User,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageCircle,
  MapPin,
  AlertCircle,
  ChevronRight,
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

const DOC_TYPES = {
  quote: { label: 'Cotización', color: '#0284C7' },
  proposal: { label: 'Propuesta Técnica', color: '#7C3AED' },
  roi: { label: 'Análisis de ROI', color: '#059669' },
  contract: { label: 'Borrador Contrato', color: '#B45309' },
  specs: { label: 'Especificaciones', color: '#4B5563' },
  other: { label: 'Documento', color: '#6B7280' },
};

const TEAM_MEMBERS = {
  emmanuel: { label: 'Emmanuel', color: '#0E7490', bg: '#F0FDFA' },
  juan_pablo: { label: 'Juan Pablo', color: '#1D4ED8', bg: '#EFF6FF' },
  curiel: { label: 'Curiel', color: '#7C3AED', bg: '#F5F3FF' },
  all: { label: 'Equipo Conjunto', color: '#047857', bg: '#ECFDF5' },
};

export default function ProspectDrawer({
  prospect,
  onClose,
  onEdit,
  onDelete,
  onConvert,
  convertingId,
  onAddDoc,
  onDeleteDoc,
  onAwardCredits,
  onChangeStage,
  onOpenNewAppointment,
}) {
  if (!prospect) return null;

  const stageCfg = STAGE_CONFIG[prospect.status] || STAGE_CONFIG.lead;
  const docs = prospect.documents || [];
  const appointments = prospect.appointments || [];

  const rawPhone = (prospect.phone || '').replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
  const whatsappUrl = rawPhone
    ? `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(prospect.contactName || prospect.companyName)}%2C%20te%20contacto%20de%20HummingX%20BI.`
    : null;

  return createPortal(
    <div
      className="drawer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="drawer-panel">
        {/* ── Top Header Strip ─────────────────────────────────────── */}
        <div className="drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#00C4CC',
                }}
              >
                Prospecto Comercial
              </span>
              {prospect.industry && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#F3F4F6',
                    color: '#4B5563',
                  }}
                >
                  {prospect.industry}
                </span>
              )}
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
              {prospect.companyName}
            </h2>
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

        {/* ── Drawer Body ─────────────────────────────────────── */}
        <div className="drawer-body">

          {/* Quick Stage Status Selector */}
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Etapa en el Embudo Comercial
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: stageCfg.bg,
                  color: stageCfg.color,
                  border: `1px solid ${stageCfg.border}`,
                }}
              >
                {stageCfg.label}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.entries(STAGE_CONFIG).map(([key, cfg]) => {
                const isActive = prospect.status === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChangeStage && onChangeStage(prospect.id, key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 11px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 500,
                      border: isActive ? `1.5px solid ${cfg.color}` : '1px solid #E5E7EB',
                      background: isActive ? cfg.bg : '#FFFFFF',
                      color: isActive ? cfg.color : '#4B5563',
                      cursor: 'pointer',
                      boxShadow: isActive ? `0 2px 6px ${cfg.border}` : '0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isActive && <CheckCircle2 size={12} color={cfg.color} />}
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Value & Conversion CTA Banner */}
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
              boxShadow: '0 4px 16px rgba(10, 25, 47, 0.2)',
            }}
          >
            <div>
              <span style={{ fontSize: '11.5px', color: '#94A3B8', display: 'block', fontWeight: 500 }}>
                Valor Estimado de Cierre
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#00C4CC' }}>
                ${(prospect.estimatedValue || 0).toLocaleString('es-MX')}{' '}
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>MXN</span>
              </span>
            </div>

            {prospect.status !== 'won' ? (
              <button
                onClick={() => onConvert(prospect)}
                disabled={convertingId === prospect.id}
                style={{
                  background: 'linear-gradient(135deg, #00C4CC 0%, #0099AA 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(0, 196, 204, 0.35)',
                }}
              >
                <Sparkles size={15} />
                {convertingId === prospect.id ? 'Convirtiendo...' : 'Convertir a Cliente'}
              </button>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34D399',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={14} /> Cliente Convertido
              </span>
            )}
          </div>

          {/* Contact Details Card */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#F9FAFB',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contacto Directo
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
              {prospect.contactName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
                  <User size={15} color="#6B7280" />
                  <span style={{ fontWeight: 600 }}>{prospect.contactName}</span>
                </div>
              )}

              {prospect.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={15} color="#6B7280" />
                  <span style={{ color: '#111827' }}>{prospect.phone}</span>
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

              {prospect.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={15} color="#6B7280" />
                  <a href={`mailto:${prospect.email}`} style={{ color: '#0284C7', textDecoration: 'none' }}>
                    {prospect.email}
                  </a>
                </div>
              )}

              {prospect.source && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '12px' }}>
                  <strong>Origen:</strong> {prospect.source}
                </div>
              )}
            </div>
          </div>

          {/* Referral Partner Card if any */}
          {prospect.referralInfo && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #CCFBF1',
                background: '#F0FDFA',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#0D9488" />
                  <div>
                    <span style={{ fontSize: '11px', color: '#0F766E', fontWeight: 600, display: 'block' }}>
                      Recomendado por Socio Activo
                    </span>
                    <strong style={{ fontSize: '14px', color: '#111827' }}>
                      {prospect.referralInfo.referrerName}
                    </strong>{' '}
                    <span style={{ fontSize: '12px', color: '#0D9488', fontWeight: 700 }}>
                      ({prospect.referralInfo.tierName})
                    </span>
                  </div>
                </div>

                {prospect.referralInfo.needsCreditAward && (
                  <button
                    onClick={() => onAwardCredits(prospect)}
                    style={{
                      background: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    Abonar ${prospect.referralInfo.creditAmount?.toLocaleString('es-MX')} Créditos
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Commercial Notes */}
          {prospect.notes && (
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Notas & Contexto Comercial
              </span>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  fontSize: '13px',
                  color: '#374151',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {prospect.notes}
              </div>
            </div>
          )}

          {/* Document Versions (Quotes / Proposals) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#00C4CC" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                  Propuestas & Cotizaciones ({docs.length})
                </span>
              </div>
              <button
                onClick={() => onAddDoc(prospect)}
                style={{
                  background: '#111827',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={12} /> Nueva Versión
              </button>
            </div>

            {docs.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  border: '1px dashed #D1D5DB',
                  background: '#F9FAFB',
                  color: '#6B7280',
                  fontSize: '12.5px',
                }}
              >
                Aún no has adjuntado cotizaciones para esta empresa.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {docs.map((doc) => {
                  const docTypeCfg = DOC_TYPES[doc.type] || DOC_TYPES.quote;
                  const docDate = new Date(doc.createdAt).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={doc.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#111827',
                            color: '#FFFFFF',
                          }}
                        >
                          {doc.version}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: docTypeCfg.color }}>
                          {docTypeCfg.label}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                          {doc.title}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{docDate}</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#F3F4F6',
                            color: '#111827',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          Abrir <ExternalLink size={11} />
                        </a>
                        <button
                          onClick={() => onDeleteDoc(prospect.id, doc.id, doc.version)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}
                          title="Eliminar versión"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Linked Appointments & Field Visits */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="#0284C7" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                  Citas & Visitas Presenciales ({appointments.length})
                </span>
              </div>
              <button
                onClick={() => onOpenNewAppointment && onOpenNewAppointment(prospect)}
                style={{
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={12} /> Agendar Cita
              </button>
            </div>

            {appointments.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  border: '1px dashed #D1D5DB',
                  background: '#F9FAFB',
                  color: '#6B7280',
                  fontSize: '12.5px',
                }}
              >
                No hay citas agendadas con esta empresa.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {appointments.map((a) => {
                  const member = TEAM_MEMBERS[a.assignedTo] || TEAM_MEMBERS.emmanuel;
                  const dateFormatted = new Date(a.dateTime).toLocaleDateString('es-MX', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={a.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                          {a.title}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: member.bg,
                            color: member.color,
                          }}
                        >
                          {member.label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6B7280' }}>
                        <Clock size={12} />
                        <span>{dateFormatted}</span>
                        {a.location && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            • <MapPin size={12} /> {a.location}
                          </span>
                        )}
                      </div>

                      {a.summary && (
                        <div style={{ fontSize: '12px', color: '#374151', background: '#F8FAFC', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #00C4CC' }}>
                          <strong>Minuta:</strong> {a.summary}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── Drawer Footer ─────────────────────────────────────── */}
        <div className="drawer-footer">
          <button
            onClick={() => onDelete(prospect.id, prospect.companyName)}
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
            <Trash2 size={14} /> Eliminar Prospecto
          </button>

          <button
            onClick={() => onEdit(prospect)}
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
            <Edit size={14} /> Editar Datos
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}
