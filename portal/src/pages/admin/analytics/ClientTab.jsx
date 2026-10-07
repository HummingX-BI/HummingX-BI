import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, LogIn, TrendingUp, AlertCircle, Eye, MonitorPlay } from 'lucide-react';

const COLORS = ['#00C4CC', '#7B2FBE', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
const PHASE_NAMES = ['N/A', 'Análisis', 'Diseño', 'Revisión', 'Desarrollo', 'Lanzamiento', 'Completado'];

export default function ClientTab({ range }) {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [globalAverages, setGlobalAverages] = useState(null);

  useEffect(() => {
    setInitialLoading(true);
    api.get('/admin/clients')
      .then(res => {
        setClients(res.data);
        if (res.data.length > 0) setSelectedClientId(res.data[0].id);

        const activated = res.data.filter(c => c.invitationAccepted);
        const avgTime = activated.length ? activated.reduce((a,c) => a + c.totalTimeSpent, 0) / activated.length : 0;
        const avgLogins = activated.length ? activated.reduce((a,c) => a + c.loginCount, 0) / activated.length : 0;
        setGlobalAverages({ avgTime, avgLogins });
      })
      .catch(console.error)
      .finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClientId) return;
    setLoading(true);
    api.get(`/admin/clients/${selectedClientId}`)
      .then(res => {
        setClientData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedClientId, range]);

  if (initialLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="bars-loader"><div></div><div></div><div></div></div></div>;
  }

  if (!clients.length) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>No hay clientes registrados.</div>;
  }

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Selector de Cliente */}
      <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-end', background: 'linear-gradient(135deg, #0b0b0e 0%, #1a1a24 100%)', color: '#fff' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '8px' }}>
            Seleccionar Cliente para Analizar
          </label>
          <select 
            value={selectedClientId} 
            onChange={e => setSelectedClientId(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', outline: 'none' }}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id} style={{ color: '#000' }}>
                {c.companyName || c.name} {c.invitationAccepted ? '' : '(Pendiente)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="bars-loader"><div></div><div></div><div></div></div></div>
      ) : clientData ? (
        <ClientDashboard client={clientData} globalAverages={globalAverages} range={range} />
      ) : (
        <p>Error cargando detalle del cliente.</p>
      )}

    </div>
  );
}

function ClientDashboard({ client, globalAverages, range }) {
  // Procesar datos para gráficas
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - range);

  // Filtrar por rango
  const pageViews = client.pageViews?.filter(pv => new Date(pv.createdAt) >= dateLimit) || [];
  const loginEvents = client.loginEvents?.filter(evt => new Date(evt.createdAt) >= dateLimit) || [];

  // Actividad diaria
  const loginsPerDayMap = {};
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    loginsPerDayMap[d.toISOString().split('T')[0]] = 0;
  }
  
  loginEvents.forEach(evt => {
    const dateStr = new Date(evt.createdAt).toISOString().split('T')[0];
    if (loginsPerDayMap[dateStr] !== undefined) loginsPerDayMap[dateStr]++;
  });

  const loginsChartData = Object.entries(loginsPerDayMap).map(([date, count]) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return {
      date: d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      accesos: count
    };
  });

  // Secciones
  const sectionCounts = { 'Inicio': 0, 'Mi Proyecto': 0, 'Plan de Pagos': 0, 'Mis Referidos': 0, 'Soporte': 0 };
  pageViews.forEach(pv => {
    let section = 'Otro';
    if (pv.path === '/dashboard' || pv.path === '/') section = 'Inicio';
    else if (pv.path.includes('/project')) section = 'Mi Proyecto';
    else if (pv.path.includes('/pagos')) section = 'Plan de Pagos';
    else if (pv.path.includes('/referrals')) section = 'Mis Referidos';
    else if (pv.path.includes('/support')) section = 'Soporte';
    
    if (section !== 'Otro') {
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    }
  });
  const sections = Object.entries(sectionCounts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B2FBE' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Tiempo Total</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>
              {Math.round(client.totalTimeSpent / 60)} <span style={{ fontSize: '14px', color: '#6B7280' }}>min</span>
            </h3>
            {globalAverages && (
              <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: client.totalTimeSpent > globalAverages.avgTime ? '#10B981' : '#6B7280' }}>
                {client.totalTimeSpent > globalAverages.avgTime ? '▲' : '▼'} vs prom. global
              </p>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
            <LogIn size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Total Accesos</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>{client.loginCount}</h3>
            {globalAverages && (
              <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: client.loginCount > globalAverages.avgLogins ? '#10B981' : '#6B7280' }}>
                {client.loginCount > globalAverages.avgLogins ? '▲' : '▼'} vs prom. global
              </p>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891B2' }}>
            <Eye size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Páginas Vistas ({(range)}d)</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>{pageViews.length}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: client.invitationAccepted ? '#FFFFFF' : '#FEF2F2' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: client.invitationAccepted ? '#F0FDF4' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: client.invitationAccepted ? '#10B981' : '#EF4444' }}>
            {client.invitationAccepted ? <MonitorPlay size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Estado</p>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: client.invitationAccepted ? '#059669' : '#DC2626', margin: 0 }}>
              {client.invitationAccepted ? 'Activo' : 'Pendiente'}
            </h3>
            {client.lastLoginAt && (
              <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#6B7280' }}>
                Últ. vez: {formatDistanceToNow(new Date(client.lastLoginAt), { addSuffix: true, locale: es })}
              </p>
            )}
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Actividad Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Actividad Reciente ({(range)}d)</h3>
          {loginsChartData.some(d => d.accesos > 0) ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={loginsChartData}>
                  <defs>
                    <linearGradient id="colorAccesosCl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C4CC" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00C4CC" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="accesos" name="Accesos" stroke="#00C4CC" strokeWidth={3} fillOpacity={1} fill="url(#colorAccesosCl)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Sin actividad en el rango seleccionado</div>
          )}
        </div>

        {/* Sections Bar Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>Rutas más visitadas</h3>
          {sections.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sections} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#7B2FBE" radius={[0, 4, 4, 0]} maxBarSize={30}>
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

      </div>

    </>
  );
}
