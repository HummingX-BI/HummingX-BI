import {
  Building,
  User,
  DollarSign,
  FileText,
  Calendar,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';

const STAGES = [
  { key: 'lead', label: 'Contacto Inicial', color: '#4B5563', bg: '#F3F4F6' },
  { key: 'contacted', label: 'Contactado', color: '#1D4ED8', bg: '#EFF6FF' },
  { key: 'meeting', label: 'Cita / Demo', color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'proposal_sent', label: 'Propuesta Enviada', color: '#0284C7', bg: '#F0F9FF' },
  { key: 'negotiating', label: 'En Negociación', color: '#B45309', bg: '#FFFBEB' },
  { key: 'won', label: 'Cliente Ganado', color: '#047857', bg: '#ECFDF5' },
  { key: 'lost', label: 'No Concretado', color: '#DC2626', bg: '#FEF2F2' },
];

export default function ProspectKanban({
  prospects,
  onSelectProspect,
  onChangeStage,
}) {
  const getStageTotal = (stageKey) => {
    return prospects
      .filter((p) => p.status === stageKey)
      .reduce((sum, p) => sum + (p.estimatedValue || 0), 0);
  };

  const getStageIndex = (stageKey) => {
    return STAGES.findIndex((s) => s.key === stageKey);
  };

  const handleMoveStage = (e, prospectId, currentStageKey, direction) => {
    e.stopPropagation();
    const currIdx = getStageIndex(currentStageKey);
    const targetIdx = currIdx + direction;
    if (targetIdx >= 0 && targetIdx < STAGES.length) {
      onChangeStage(prospectId, STAGES[targetIdx].key);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '14px',
        overflowX: 'auto',
        paddingBottom: '16px',
        minHeight: '540px',
      }}
    >
      {STAGES.map((stage, stageIdx) => {
        const columnProspects = prospects.filter((p) => p.status === stage.key);
        const columnTotal = getStageTotal(stage.key);

        return (
          <div
            key={stage.key}
            style={{
              flex: '0 0 280px',
              width: '280px',
              background: '#F9FAFB',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 280px)',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid #E5E7EB',
                background: '#FFFFFF',
                borderRadius: '14px 14px 0 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                  {stage.label}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    background: stage.bg,
                    color: stage.color,
                  }}
                >
                  {columnProspects.length}
                </span>
              </div>

              <div style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600 }}>
                Total: <span style={{ color: '#111827' }}>${columnTotal.toLocaleString('es-MX')}</span>
              </div>
            </div>

            {/* Column Cards */}
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
              {columnProspects.length === 0 ? (
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
                  Sin empresas en esta etapa
                </div>
              ) : (
                columnProspects.map((p) => {
                  const docsCount = p.documents?.length || 0;
                  const apptsCount = p.appointments?.length || 0;
                  const currIdx = getStageIndex(p.status);

                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProspect(p)}
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
                      {/* Top: Company & Value */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                          {p.companyName}
                        </span>
                        {p.estimatedValue ? (
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#00C4CC', whiteSpace: 'nowrap' }}>
                            ${p.estimatedValue.toLocaleString('es-MX')}
                          </span>
                        ) : null}
                      </div>

                      {/* Contact / Industry */}
                      <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                        {p.contactName && <div>{p.contactName}</div>}
                        {p.industry && <div style={{ color: '#9CA3AF' }}>{p.industry}</div>}
                      </div>

                      {/* Referral Badge if any */}
                      {p.referralInfo && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#F0FDFA',
                            color: '#0D9488',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            width: 'fit-content',
                          }}
                        >
                          <Award size={11} /> {p.referralInfo.referrerName}
                        </div>
                      )}

                      {/* Bottom strip: Chips & stage arrows */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '6px',
                          borderTop: '1px solid #F3F4F6',
                          fontSize: '11px',
                          color: '#6B7280',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {docsCount > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#0284C7' }}>
                              <FileText size={11} /> {docsCount}
                            </span>
                          )}
                          {apptsCount > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#7C3AED' }}>
                              <Calendar size={11} /> {apptsCount}
                            </span>
                          )}
                        </div>

                        {/* Move stage buttons */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {currIdx > 0 && (
                            <button
                              onClick={(e) => handleMoveStage(e, p.id, p.status, -1)}
                              style={{
                                background: '#F3F4F6',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                cursor: 'pointer',
                                color: '#4B5563',
                              }}
                              title="Regresar etapa"
                            >
                              <ChevronLeft size={13} />
                            </button>
                          )}
                          {currIdx < STAGES.length - 1 && (
                            <button
                              onClick={(e) => handleMoveStage(e, p.id, p.status, 1)}
                              style={{
                                background: '#F3F4F6',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                cursor: 'pointer',
                                color: '#4B5563',
                              }}
                              title="Avanzar etapa"
                            >
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
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
