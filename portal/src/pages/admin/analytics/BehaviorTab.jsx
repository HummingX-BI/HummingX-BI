import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MousePointerClick, Smartphone, HeartHandshake, Medal, Clock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#00C4CC', '#7B2FBE', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HOURS = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];

export default function BehaviorTab({ range }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/analytics/behavior?range=${range}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="bars-loader"><div></div><div></div><div></div></div></div>;
  }

  if (!data) return <p>Error al cargar datos.</p>;

  const { sections, devices, heatmap, retention, ranking } = data;

  const maxHeat = Math.max(...heatmap.flat(), 1);

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Behavior KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DB2777' }}>
            <HeartHandshake size={28} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: '0 0 4px 0' }}>Retención (Vuelven en +7d)</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', margin: 0 }}>{retention}%</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891B2' }}>
            <MousePointerClick size={28} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: '0 0 4px 0' }}>Sección Favorita</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>
              {sections.length > 0 ? sections[0].name : 'N/A'}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <Smartphone size={28} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: '0 0 4px 0' }}>Uso Móvil</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>
              {devices.length > 0 
                ? Math.round(((devices.find(d => d.name === 'Móvil')?.count || 0) / devices.reduce((a,b) => a+b.count, 0)) * 100) 
                : 0}%
            </h3>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Mapa de Calor: Días y Horas de Actividad</h3>
        <div style={{ minWidth: '800px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(24, 1fr)', gap: '4px', marginBottom: '8px' }}>
            <div></div>
            {HOURS.map(h => <div key={h} style={{ fontSize: '11px', color: '#6B7280', textAlign: 'center' }}>{h}</div>)}
          </div>
          {DAYS.map((day, dIdx) => (
            <div key={day} style={{ display: 'grid', gridTemplateColumns: '50px repeat(24, 1fr)', gap: '4px', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#4B5563', display: 'flex', alignItems: 'center' }}>{day}</div>
              {heatmap[dIdx].map((val, hIdx) => {
                const opacity = val / maxHeat;
                return (
                  <div 
                    key={hIdx} 
                    title={`${val} accesos el ${day} a las ${HOURS[hIdx]}`}
                    style={{ 
                      height: '24px', 
                      background: val === 0 ? '#F3F4F6' : '#00C4CC', 
                      opacity: val === 0 ? 1 : Math.max(0.15, opacity),
                      borderRadius: '4px',
                      cursor: 'help',
                      transition: 'transform 0.1s',
                      ':hover': { transform: 'scale(1.1)' }
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: '#6B7280' }}>
          <span>Menos</span>
          <div style={{ width: '16px', height: '16px', background: '#F3F4F6', borderRadius: '4px' }}></div>
          <div style={{ width: '16px', height: '16px', background: '#00C4CC', opacity: 0.3, borderRadius: '4px' }}></div>
          <div style={{ width: '16px', height: '16px', background: '#00C4CC', opacity: 0.6, borderRadius: '4px' }}></div>
          <div style={{ width: '16px', height: '16px', background: '#00C4CC', opacity: 1, borderRadius: '4px' }}></div>
          <span>Más</span>
        </div>
      </div>

      {/* Sections and Devices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Sections */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Secciones más visitadas</h3>
          {sections.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sections} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} maxBarSize={30}>
                    {sections.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Sin datos de navegación</div>
          )}
        </div>

        {/* Devices */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Dispositivos</h3>
          {devices.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#F59E0B'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Sin datos de dispositivos</div>
          )}
        </div>

      </div>

      {/* Ranking */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Medal size={20} color="#F59E0B" /> Top 10 Clientes Más Activos
          </h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', width: '50px' }}>#</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Cliente</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Tiempo Total</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Accesos</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
                    Sin datos suficientes para generar un ranking.
                  </td>
                </tr>
              ) : (
                ranking.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: i < 3 ? '#F59E0B' : '#9CA3AF' }}>{i + 1}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#111827' }}>{u.name}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4B5563' }}>
                        <Clock size={14} /> {Math.round(u.time / 60)} min
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4B5563' }}>
                        <LogIn size={14} /> {u.logins}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <Link to={`/admin/clients/${u.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
