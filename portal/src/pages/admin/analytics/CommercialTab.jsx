import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { 
  TrendingUp, 
  DollarSign, 
  CalendarCheck, 
  Users, 
  Sparkles, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  UserCheck,
  Building2,
  Share2
} from 'lucide-react';

export default function CommercialTab({ range }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/analytics/commercial?range=${range}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="bars-loader"><div></div><div></div><div></div></div>
      </div>
    );
  }

  if (!data) return <p style={{ color: '#6B7280' }}>Error al cargar métricas comerciales.</p>;

  const { 
    totalProspects, 
    totalPipelineValue, 
    wonValue, 
    conversionRate, 
    funnelStages, 
    apptsByMember, 
    apptsByStatus, 
    totalAppointments,
    referralsStats,
    insights 
  } = data;

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const memberNames = {
    emmanuel: { label: 'Emmanuel', role: 'Dirección Comercial & Ventas', color: '#00C4CC', avatar: 'EM' },
    juan_pablo: { label: 'Juan Pablo', role: 'Operaciones & Tecnología', color: '#7B2FBE', avatar: 'JP' },
    curiel: { label: 'Curiel', role: 'Alianzas & Proyectos', color: '#F59E0B', avatar: 'CU' },
    all: { label: 'Todo el Equipo', role: 'Reunión General HX', color: '#3B82F6', avatar: 'HX' }
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Commercial KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Tasa de Conversión */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Conversión</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{conversionRate}%</h3>
            <span style={{ fontSize: '12px', color: '#059669', fontWeight: 500 }}>de prospectos a ganados</span>
          </div>
        </div>

        {/* Pipeline Total */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <DollarSign size={26} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Pipeline Total</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>{formatMoney(totalPipelineValue)}</h3>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>{totalProspects} prospectos en curso</span>
          </div>
        </div>

        {/* Proyectos Cerrados */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
            <Award size={26} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Cerrado Ganado</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>{formatMoney(wonValue)}</h3>
            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>Contratos confirmados</span>
          </div>
        </div>

        {/* Citas y Demos */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
            <CalendarCheck size={26} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Citas Realizadas</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{apptsByStatus.completed || 0}</h3>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>de {totalAppointments} agendadas</span>
          </div>
        </div>

        {/* Impacto de Recomendados */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Share2 size={26} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Red de Referidos</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{referralsStats.convertedReferrals || 0}</h3>
            <span style={{ fontSize: '12px', color: '#D97706', fontWeight: 500 }}>de {referralsStats.totalReferrals || 0} referidos activos</span>
          </div>
        </div>

      </div>

      {/* Embudo Comercial Visual */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
              Embudo Comercial de Prospección
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Paso a paso de las oportunidades comerciales desde primer contacto hasta el cierre formal.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Valor Potencial Total:</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827', background: '#F3F4F6', padding: '4px 12px', borderRadius: '6px' }}>
              {formatMoney(totalPipelineValue)}
            </span>
          </div>
        </div>

        {/* Funnel Progress Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {funnelStages.map((stage, idx) => {
            const pct = totalProspects > 0 ? Math.round((stage.count / totalProspects) * 100) : 0;
            return (
              <div 
                key={stage.id} 
                style={{ 
                  background: '#F9FAFB', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Paso {idx + 1}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#fff', padding: '2px 8px', borderRadius: '999px', border: '1px solid #E5E7EB', color: '#374151' }}>
                    {pct}%
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
                    {stage.label}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{stage.count}</span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>prospectos</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: stage.color, marginTop: '4px' }}>
                    {formatMoney(stage.value)}
                  </div>
                </div>

                {/* Micro progress indicator */}
                <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${pct}%`, 
                      height: '100%', 
                      background: stage.color, 
                      borderRadius: '999px',
                      transition: 'width 0.5s ease'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversion Bar visualization */}
        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>
            <span>Distribución Relativa del Pipeline</span>
            <span>{totalProspects} Prospectos Registrados</span>
          </div>
          <div style={{ display: 'flex', height: '24px', borderRadius: '8px', overflow: 'hidden', background: '#E2E8F0' }}>
            {funnelStages.filter(s => s.count > 0).map((stage) => {
              const widthPct = (stage.count / (totalProspects || 1)) * 100;
              return (
                <div 
                  key={stage.id}
                  title={`${stage.label}: ${stage.count} (${Math.round(widthPct)}%)`}
                  style={{
                    width: `${widthPct}%`,
                    background: stage.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {widthPct > 8 ? `${Math.round(widthPct)}%` : ''}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Desempeño del Equipo & Citas Comerciales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px' }}>
        
        {/* Desempeño de Citas por Socio */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#00C4CC" /> Citas por Responsable
          </h3>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px 0' }}>
            Distribución de citas y reuniones comerciales atendidas por los socios.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(memberNames).map(([key, info]) => {
              const count = apptsByMember[key] || 0;
              const pct = totalAppointments > 0 ? Math.round((count / totalAppointments) * 100) : 0;
              return (
                <div 
                  key={key} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#F9FAFB',
                    border: '1px solid #F3F4F6'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: info.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                      {info.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{info.label}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{info.role}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                      {count} <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>citas</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>{pct}% del total</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estatus Operativo de Citas */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarCheck size={18} color="#7C3AED" /> Estatus Operativo de Reuniones
          </h3>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px 0' }}>
            Cumplimiento y efectividad en la ejecución de la agenda de citas.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #DCFCE7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                <CheckCircle2 size={16} /> Completadas
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#15803D', marginTop: '6px' }}>
                {apptsByStatus.completed || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '2px' }}>Minutas generadas</div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                <Clock size={16} /> Programadas
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1D4ED8', marginTop: '6px' }}>
                {apptsByStatus.scheduled || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '2px' }}>Próximas en calendario</div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                <Clock size={16} /> Reagendadas
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#B45309', marginTop: '6px' }}>
                {apptsByStatus.rescheduled || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#D97706', marginTop: '2px' }}>Ajuste de horario</div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                <Clock size={16} /> Canceladas
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#B91C1C', marginTop: '6px' }}>
                {apptsByStatus.cancelled || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '2px' }}>No concretadas</div>
            </div>
          </div>
        </div>

      </div>

      {/* AI Commercial Insights Panel */}
      <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 50%, #EDE9FE 100%)', border: '1px solid #DDD6FE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#7C3AED', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#5B21B6', margin: 0 }}>
              Recomendaciones & AI Commercial Insights
            </h3>
            <p style={{ fontSize: '13px', color: '#6D28D9', margin: 0 }}>
              Análisis predictivo en tiempo real basado en tu embudo, cotizaciones y velocidad de cierre.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {insights.map((ins, i) => (
            <div 
              key={i} 
              style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                padding: '18px', 
                boxShadow: '0 2px 4px rgba(124, 58, 237, 0.06)',
                border: '1px solid #E9D5FF',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  padding: '2px 8px', 
                  borderRadius: '999px',
                  background: ins.type === 'success' ? '#DCFCE7' : ins.type === 'info' ? '#DBEAFE' : '#FEF3C7',
                  color: ins.type === 'success' ? '#15803D' : ins.type === 'info' ? '#1D4ED8' : '#B45309'
                }}>
                  {ins.type === 'success' ? 'Oportunidad' : ins.type === 'info' ? 'Alianza' : 'Acción Sugerida'}
                </span>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {ins.title}
                </h4>
              </div>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
                {ins.text}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
