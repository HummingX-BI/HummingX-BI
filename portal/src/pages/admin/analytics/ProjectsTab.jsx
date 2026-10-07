import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { PieChart, Pie, Cell, Legend, BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#00C4CC', '#7B2FBE', '#10B981', '#F59E0B', '#3B82F6', '#6B7280'];
const PHASE_NAMES = ['N/A', 'Análisis', 'Diseño', 'Revisión', 'Desarrollo', 'Lanzamiento', 'Completado'];

export default function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPendingDesigns, setShowPendingDesigns] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/analytics/projects`)
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="bars-loader"><div></div><div></div><div></div></div></div>;
  }

  // Distribution by Phase
  const phaseDistribution = [1, 2, 3, 4, 5].map(phase => ({
    name: PHASE_NAMES[phase],
    count: projects.filter(p => p.currentPhase === phase).length
  })).filter(p => p.count > 0);

  // Advance overview for Area Chart
  const advanceData = projects.map(p => ({
    name: p.clientName.split(' ')[0],
    avance: p.progressPercent || 0
  }));

  // Workload (Days since created)
  const workloadData = projects.map(p => ({
    name: p.clientName.split(' ')[0],
    diasActivo: differenceInDays(new Date(), new Date(p.createdAt || new Date()))
  }));

  const pendingDesignProjects = projects.filter(p => p.designStatus === 'modifications_requested');

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Solicitudes de diseño banner */}
      {pendingDesignProjects.length > 0 && (
        <div className="card" style={{ padding: '24px', background: '#FEF3C7', border: '1px solid #FCD34D' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowPendingDesigns(!showPendingDesigns)}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#92400E', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> {pendingDesignProjects.length} Clientes esperando modificaciones de diseño
            </h3>
            <span style={{ color: '#D97706', fontSize: '14px', fontWeight: 600 }}>{showPendingDesigns ? 'Ocultar' : 'Ver Detalles'}</span>
          </div>
          
          {showPendingDesigns && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {pendingDesignProjects.map(p => (
                <Link key={p.id} to={`/admin/clients/${p.clientId}`} style={{ background: '#FFFBEB', padding: '16px', borderRadius: '8px', border: '1px solid #FDE68A', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>{p.clientName}</div>
                  <div style={{ fontSize: '13px', color: '#B45309' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#D97706', marginTop: '4px' }}>Ver cliente →</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '24px' }}>
        
        {/* Pie Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Distribución de Fases</h3>
          {phaseDistribution.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={phaseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {phaseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>No hay proyectos activos</div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Pipeline por Etapa</h3>
          {phaseDistribution.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseDistribution} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#7B2FBE" radius={[0, 4, 4, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>No hay proyectos activos</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '24px' }}>
        
        {/* Area Chart: Progress */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Avance por Proyecto (%)</h3>
          {advanceData.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={advanceData}>
                  <defs>
                    <linearGradient id="colorAvance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C4CC" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00C4CC" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="avance" stroke="#00C4CC" fillOpacity={1} fill="url(#colorAvance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Sin datos de avance</div>
          )}
        </div>

        {/* Line Chart: Workload */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Días Activos desde Creación</h3>
          {workloadData.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="diasActivo" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Sin datos de antigüedad</div>
          )}
        </div>
      </div>

      {/* Detailed Tracking Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Proyectos en Riesgo y Seguimiento</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Cliente / Proyecto</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Etapa Actual</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Tiempo en Etapa</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Entrega Estimada</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
                    No hay proyectos activos para monitorear.
                  </td>
                </tr>
              ) : (
                projects.map(p => {
                  const daysInPhase = differenceInDays(new Date(), new Date(p.updatedAt));
                  let deliveryWarning = false;
                  let deliveryText = 'Sin definir';
                  if (p.estimatedDelivery) {
                    const daysToDelivery = differenceInDays(new Date(p.estimatedDelivery), new Date());
                    if (daysToDelivery < 7) deliveryWarning = true;
                    deliveryText = formatDistanceToNow(new Date(p.estimatedDelivery), { addSuffix: true, locale: es });
                  }

                  const isStuckInReview = p.currentPhase === 3 && daysInPhase > 5;
                  const isUrgent = deliveryWarning || isStuckInReview;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #E5E7EB', background: isUrgent ? '#FEF2F2' : 'transparent' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{p.clientName}</div>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>{p.name}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span className={`badge ${p.currentPhase === 3 ? 'badge-yellow' : 'badge-cyan'}`}>
                          {PHASE_NAMES[p.currentPhase]}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isStuckInReview ? '#DC2626' : '#4B5563', fontWeight: isStuckInReview ? 600 : 400 }}>
                          {isStuckInReview && <AlertTriangle size={14} />}
                          {daysInPhase === 0 ? 'Actualizado hoy' : `Hace ${daysInPhase} día${daysInPhase !== 1 ? 's' : ''}`}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: deliveryWarning ? '#DC2626' : '#4B5563', fontWeight: deliveryWarning ? 600 : 400 }}>
                          {deliveryWarning && <AlertCircle size={14} />}
                          {deliveryText}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <Link to={`/admin/clients/${p.clientId}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
