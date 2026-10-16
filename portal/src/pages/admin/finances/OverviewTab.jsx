import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Clock,
  Briefcase,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Server,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function OverviewTab({ data, onGoToTab }) {
  if (!data) return null;

  const {
    totalHistoricalRevenue = 0,
    totalExpenses = 0,
    netProfit = 0,
    monthlyBurn = 0,
    totalUpcomingRevenue = 0,
    nextPayment,
    partnerSplits = [],
    expenses = [],
  } = data;

  const activeExpenses = expenses.filter((e) => e.active);

  const getDaysRemainingText = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Vencido hace ${Math.abs(diffDays)} días`;
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    return `En ${diffDays} días`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Top Executive KPIs ────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px',
        }}
      >
        {/* Total Ingresos Cobrados */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Ingresos Cobrados</span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#ECFDF5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #A7F3D0',
              }}
            >
              <TrendingUp size={15} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              ${Math.round(totalHistoricalRevenue).toLocaleString('es-MX')}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>MXN</span>
          </div>
          <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
            Pagos reales y proyectos cerrados
          </span>
        </div>

        {/* Gastos Operativos Totales */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Gastos Operativos</span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #FECACA',
              }}
            >
              <TrendingDown size={15} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#DC2626', letterSpacing: '-0.02em' }}>
              ${Math.round(totalExpenses).toLocaleString('es-MX')}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626' }}>MXN</span>
          </div>
          <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
            {expenses.length} conceptos registrados
          </span>
        </div>

        {/* Utilidad Neta Real Repartible */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #99F6E4',
            background: 'linear-gradient(135deg, #F0FDFA 0%, #FFFFFF 100%)',
            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F766E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Utilidad Neta Repartible
            </span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#CCFBF1',
                color: '#0D9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #99F6E4',
              }}
            >
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#0F766E', letterSpacing: '-0.02em' }}>
              ${Math.round(netProfit).toLocaleString('es-MX')}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D9488' }}>MXN</span>
          </div>
          <span style={{ fontSize: '11.5px', color: '#0D9488', fontWeight: 600 }}>
            Ingresos menos costos operativos
          </span>
        </div>

        {/* Burn Rate Mensual Recurrente */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Costo Fijo Mensual</span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#F3F4F6',
                color: '#4B5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #E5E7EB',
              }}
            >
              <Server size={15} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              ${Math.round(monthlyBurn).toLocaleString('es-MX')}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>/ mes</span>
          </div>
          <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
            Hosting, servidores y licencias
          </span>
        </div>

        {/* Flujo por Cobrar */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Flujo por Cobrar</span>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#FFFBEB',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #FDE68A',
              }}
            >
              <Wallet size={15} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#B45309', letterSpacing: '-0.02em' }}>
              ${Math.round(totalUpcomingRevenue).toLocaleString('es-MX')}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309' }}>MXN</span>
          </div>
          <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
            {data.upcomingPayments?.length || 0} pagos en cobranza
          </span>
        </div>
      </div>

      {/* ── TABLERO DE REPARTO ENTRE SOCIOS (1/3 EQUITATIVO) ──────────── */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '18px',
          border: '1px solid #E5E7EB',
          background: '#FFFFFF',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00C4CC 0%, #0284C7 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Reparto de Utilidades entre Socios
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
              División equitativa 1/3 (33.33%) sobre la Utilidad Neta real, con reembolso directo de gastos cubiertos de bolsa propia.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#F0FDFA',
              border: '1px solid #CCFBF1',
              color: '#0F766E',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={14} />
            <span>Fórmula: Utilidad Neta ÷ 3 + Gastos Reembolsables</span>
          </div>
        </div>

        {/* Barra de Distribución Equitativa */}
        <div style={{ marginBottom: '22px' }}>
          <div
            style={{
              display: 'flex',
              height: '8px',
              borderRadius: '9999px',
              overflow: 'hidden',
              background: '#F3F4F6',
              gap: '3px',
              marginBottom: '8px',
            }}
          >
            <div style={{ flex: 1, background: '#0E7490' }} title="Emmanuel (33.33%)" />
            <div style={{ flex: 1, background: '#1D4ED8' }} title="Juan Pablo (33.33%)" />
            <div style={{ flex: 1, background: '#7C3AED' }} title="Curiel (33.33%)" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>
            <span style={{ color: '#0E7490' }}>● Emmanuel (33.33%)</span>
            <span style={{ color: '#1D4ED8' }}>● Juan Pablo (33.33%)</span>
            <span style={{ color: '#7C3AED' }}>● Curiel (33.33%)</span>
          </div>
        </div>

        {/* 3 Tarjetas de Socios */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '16px',
          }}
        >
          {partnerSplits.map((partner) => (
            <div
              key={partner.id}
              style={{
                borderRadius: '14px',
                border: `1px solid #E5E7EB`,
                background: partner.bg,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Header Socio */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        border: `1.5px solid ${partner.color}`,
                        color: partner.color,
                        fontWeight: 800,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {partner.avatar}
                    </div>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827', display: 'block' }}>
                        {partner.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>
                        {partner.role}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      color: partner.color,
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    {partner.percentage}
                  </span>
                </div>

                {/* Desglose de Números */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280' }}>
                    <span>Utilidad base (1/3):</span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>
                      ${partner.shareAmount.toLocaleString('es-MX')} MXN
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280' }}>
                    <span>Gastos aportados (reembolso):</span>
                    <span style={{ fontWeight: 700, color: partner.outOfPocket > 0 ? '#047857' : '#9CA3AF' }}>
                      {partner.outOfPocket > 0 ? `+$${partner.outOfPocket.toLocaleString('es-MX')} MXN` : '$0 MXN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Payout */}
              <div
                style={{
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#4B5563' }}>
                  Total a Recibir:
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: partner.color }}>
                    ${partner.totalPayout.toLocaleString('es-MX')}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '4px' }}>MXN</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECCIÓN DOBLE: PRÓXIMO COBRO & GASTOS FIJOS ───────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '20px',
        }}
      >
        {/* Próximo Cobro Programado */}
        <div
          className="card"
          style={{
            padding: '22px',
            borderRadius: '16px',
            border: nextPayment ? '1px solid #BAE6FD' : '1px solid #E5E7EB',
            background: nextPayment ? 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)' : '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#0284C7" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0369A1' }}>
                  Próxima Entrada de Dinero
                </span>
              </div>
              {nextPayment && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#E0F2FE',
                    color: '#0369A1',
                  }}
                >
                  {getDaysRemainingText(nextPayment.dueDate)}
                </span>
              )}
            </div>

            {nextPayment ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '30px', fontWeight: 800, color: '#0369A1', letterSpacing: '-0.02em' }}>
                    ${Math.round(nextPayment.amount).toLocaleString('es-MX')}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0284C7' }}>MXN</span>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                  {nextPayment.project?.client?.companyName || nextPayment.project?.client?.name || 'Cliente'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {nextPayment.title} • {nextPayment.project?.name || 'General'}
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                No hay cobros pendientes calendarizados para los próximos días.
              </div>
            )}
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0', marginTop: '16px' }}>
            <button
              onClick={() => onGoToTab('cobranza')}
              style={{
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid #BAE6FD',
                borderRadius: '8px',
                padding: '9px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#0284C7',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              Ver Calendario Completo de Cobranza <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Resumen de Gastos Operativos Recurrentes */}
        <div
          className="card"
          style={{
            padding: '22px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={16} color="#4B5563" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                  Servicios Activos & Hosting
                </span>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#6B7280' }}>
                {activeExpenses.length} activos
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeExpenses.slice(0, 3).map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#F9FAFB',
                    border: '1px solid #F3F4F6',
                    fontSize: '12.5px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {exp.title}
                  </span>
                  <span style={{ fontWeight: 700, color: '#DC2626', whiteSpace: 'nowrap' }}>
                    ${exp.amount.toLocaleString('es-MX')} {exp.frequency === 'annual' ? '/ año' : '/ mes'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6', marginTop: '16px' }}>
            <button
              onClick={() => onGoToTab('expenses')}
              style={{
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '9px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              Administrar Gastos & Herramientas <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
