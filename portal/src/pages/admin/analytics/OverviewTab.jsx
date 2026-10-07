import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, UserX, Clock, FolderKanban, AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react';

export default function OverviewTab({ range }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/analytics/overview?range=${range}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="bars-loader"><div></div><div></div><div></div></div></div>;
  }

  if (!data) return <p>Error al cargar datos.</p>;

  const { kpis, funnel, loginsChartData, alerts } = data;

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Alertas */}
      {(alerts.unactivated3d > 0 || alerts.inactive14d > 0 || alerts.stuckProjects > 0) && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {alerts.unactivated3d > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '16px', borderRadius: '12px', flex: '1', minWidth: '250px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle color="#EF4444" size={24} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#991B1B', fontSize: '14px' }}>{alerts.unactivated3d} invitaciones sin aceptar</p>
                <p style={{ margin: 0, color: '#DC2626', fontSize: '13px' }}>Más de 3 días desde el envío.</p>
              </div>
            </div>
          )}
          {alerts.inactive14d > 0 && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '16px', borderRadius: '12px', flex: '1', minWidth: '250px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock color="#D97706" size={24} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#92400E', fontSize: '14px' }}>{alerts.inactive14d} clientes inactivos</p>
                <p style={{ margin: 0, color: '#D97706', fontSize: '13px' }}>No han entrado en 14+ días.</p>
              </div>
            </div>
          )}
          {alerts.stuckProjects > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '16px', borderRadius: '12px', flex: '1', minWidth: '250px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle color="#EF4444" size={24} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#991B1B', fontSize: '14px' }}>{alerts.stuckProjects} proyectos estancados</p>
                <p style={{ margin: 0, color: '#DC2626', fontSize: '13px' }}>Mucho tiempo en revisión.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Clientes Totales</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{kpis.totalClients}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Activados</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{kpis.activatedClients}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
            <UserX size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Pendientes</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{kpis.pendingClients}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Activos 7 Días</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{kpis.active7d}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Prom. / Cliente</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>
              {kpis.avgTime}<span style={{ fontSize: '14px', color: '#6B7280', marginLeft: '4px' }}>min</span>
            </h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Embudo de Activación */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Embudo de Adopción</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Invitados</div>
              <div style={{ flex: 1, background: '#E5E7EB', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#00C4CC', borderRadius: '8px' }}></div>
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{funnel.invited}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Activaron</div>
              <div style={{ flex: 1, background: '#E5E7EB', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
                <div style={{ width: funnel.invited > 0 ? `${(funnel.activated / funnel.invited) * 100}%` : '0%', height: '100%', background: '#0E7490', borderRadius: '8px' }}></div>
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{funnel.activated}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Regresaron (+1)</div>
              <div style={{ flex: 1, background: '#E5E7EB', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
                <div style={{ width: funnel.invited > 0 ? `${(funnel.returned / funnel.invited) * 100}%` : '0%', height: '100%', background: '#3B82F6', borderRadius: '8px' }}></div>
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{funnel.returned}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>Activos 7D</div>
              <div style={{ flex: 1, background: '#E5E7EB', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
                <div style={{ width: funnel.invited > 0 ? `${(funnel.active7d / funnel.invited) * 100}%` : '0%', height: '100%', background: '#8B5CF6', borderRadius: '8px' }}></div>
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{funnel.active7d}</div>
            </div>

          </div>
        </div>

        {/* Actividad por día */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Actividad por día (Accesos)</h3>
          {loginsChartData.some(d => d.accesos > 0) ? (
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={loginsChartData}>
                  <defs>
                    <linearGradient id="colorAccesos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C4CC" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00C4CC" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="accesos" name="Accesos" stroke="#00C4CC" strokeWidth={3} fillOpacity={1} fill="url(#colorAccesos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Sin actividad reciente</div>
          )}
        </div>

      </div>

    </div>
  );
}
