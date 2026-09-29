import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area, LineChart, Line
} from 'recharts';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Users, FolderKanban, Clock, AlertTriangle, CheckCircle2,
  TrendingUp, Calendar, AlertCircle
} from 'lucide-react';

const COLORS = ['#00C4CC', '#7B2FBE', '#10B981', '#F59E0B', '#3B82F6', '#6B7280'];
const PHASE_NAMES = ['N/A', 'Análisis', 'Diseño', 'Revisión', 'Desarrollo', 'Lanzamiento', 'Completado'];

export default function AdminAnalyticsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    setLoading(true);
    api.get('/admin/clients')
      .then(res => setClients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <Layout customBreadcrumbLabel="Control y Analíticas">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div className="bars-loader"><div></div><div></div><div></div></div>
        </div>
      </Layout>
    );
  }

  const allProjects = clients.flatMap(c => 
    c.projects.map(p => ({ ...p, clientName: c.companyName || c.name }))
  );
  
  const activeProjects = allProjects.filter(p => p.status === 'active' && p.currentPhase < 6);
  const completedProjects = allProjects.filter(p => p.status === 'completed' || p.currentPhase === 6);

  // Distribution by Phase
  const phaseDistribution = [1, 2, 3, 4, 5].map(phase => ({
    name: PHASE_NAMES[phase],
    count: activeProjects.filter(p => p.currentPhase === phase).length
  })).filter(p => p.count > 0);

  // Advance overview for Area Chart
  const advanceData = activeProjects.map(p => ({
    name: p.clientName.split(' ')[0],
    avance: p.progressPercent || 0
  }));

  // Workload (Days since created)
  const workloadData = activeProjects.map(p => ({
    name: p.clientName.split(' ')[0],
    diasActivo: differenceInDays(new Date(), new Date(p.createdAt || new Date()))
  }));

  return (
    <Layout customBreadcrumbLabel="Control y Analíticas">
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
            Control y Analíticas
          </h1>
          <p style={{ fontSize: '15px', color: '#6B7280', margin: 0 }}>
            Supervisa el estado global de todos los proyectos activos, cuellos de botella y tiempos de entrega.
          </p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
              <FolderKanban size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 4px 0' }}>Proyectos Activos</p>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{activeProjects.length}</h3>
            </div>
          </div>
          
          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B2FBE' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 4px 0' }}>En Revisión (Cuellos)</p>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>
                {activeProjects.filter(p => p.currentPhase === 3).length}
              </h3>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C4CC' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 4px 0' }}>Completados</p>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{completedProjects.length}</h3>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
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
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                No hay proyectos activos
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Volumen por Etapa</h3>
            {phaseDistribution.length > 0 ? (
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={phaseDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="#7B2FBE" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                No hay proyectos activos
              </div>
            )}
          </div>
        </div>

        {/* Line 2 of Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
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
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
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
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
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
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Control y Seguimiento de Tiempos</h3>
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
                {activeProjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
                      No hay proyectos activos para monitorear.
                    </td>
                  </tr>
                ) : (
                  activeProjects.map(p => {
                    const daysInPhase = differenceInDays(new Date(), new Date(p.updatedAt));
                    let deliveryWarning = false;
                    let deliveryText = 'Sin definir';
                    if (p.estimatedDelivery) {
                      const daysToDelivery = differenceInDays(new Date(p.estimatedDelivery), new Date());
                      if (daysToDelivery < 7) deliveryWarning = true;
                      deliveryText = formatDistanceToNow(new Date(p.estimatedDelivery), { addSuffix: true, locale: es });
                    }

                    // Flag if in Review for too long (> 5 days)
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
                            Ver Cliente
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
    </Layout>
  );
}
