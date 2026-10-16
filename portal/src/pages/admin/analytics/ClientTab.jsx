import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, LogIn, TrendingUp, Sparkles, AlertCircle, RefreshCw, Smartphone, Laptop, Calendar, Layers, Search, ChevronDown, Check } from 'lucide-react';
import { SkeletonBox, SkeletonStatCard } from '../../../components/Skeleton';
import { fmtDuration } from '../../../lib/format';
import HeatmapGrid from './HeatmapGrid';
import ActivityCalendar from './ActivityCalendar';

const SECTION_COLORS = ['#00C4CC', '#7B2FBE', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
const DEVICE_COLORS = ['#10B981', '#F59E0B'];

export default function ClientTab({ range, initialClientId }) {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch client list once
  useEffect(() => {
    setInitialLoading(true);
    setListError(null);
    api.get('/admin/analytics/clients-list')
      .then(res => {
        const list = res.data || [];
        setClients(list);
        if (list.length > 0) {
          if (initialClientId && list.some(c => c.id === initialClientId)) {
            setSelectedClientId(initialClientId);
          } else {
            // Default to client with most recent lastLoginAt
            const sorted = [...list].sort((a, b) => {
              const ta = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
              const tb = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
              return tb - ta;
            });
            setSelectedClientId(sorted[0].id);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching clients-list:', err);
        setListError('Error al cargar la lista de clientes.');
      })
      .finally(() => setInitialLoading(false));
  }, [initialClientId]);

  // Sync if initialClientId changes
  useEffect(() => {
    if (initialClientId && clients.some(c => c.id === initialClientId)) {
      setSelectedClientId(initialClientId);
    }
  }, [initialClientId, clients]);

  const fetchClientAnalytics = () => {
    if (!selectedClientId) return;
    setLoading(true);
    setError(null);
    api.get(`/admin/analytics/client/${selectedClientId}?range=${range}`)
      .then(res => setData(res.data))
      .catch(err => {
        console.error('Error loading client analytics:', err);
        setError('Error al cargar analíticas del cliente.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClientAnalytics();
  }, [selectedClientId, range]);

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SkeletonBox width="280px" height={40} />
        <div className="client-kpi-grid">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
      </div>
    );
  }

  if (listError) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <AlertCircle size={36} color="#EF4444" />
        <p style={{ margin: 0, color: '#B91C1C', fontWeight: 600 }}>{listError}</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
        <p style={{ fontSize: '16px', margin: 0, fontWeight: 600 }}>No hay clientes registrados en la plataforma.</p>
      </div>
    );
  }

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const filteredClients = clients.filter(c => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (c.name || '').toLowerCase().includes(q);
    const companyMatch = (c.companyName || '').toLowerCase().includes(q);
    return nameMatch || companyMatch;
  });

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Client Selector Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px', display: 'block' }}>
            Cliente a supervisar:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 14px',
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '300px',
                maxWidth: '420px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              {selectedClient?.logoUrl ? (
                <img 
                  src={selectedClient.logoUrl} 
                  alt="" 
                  style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain', background: '#F3F4F6' }} 
                />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                  {(selectedClient?.companyName || selectedClient?.name || 'C').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedClient?.companyName || selectedClient?.name || 'Seleccionar cliente'}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedClient?.lastLoginAt 
                    ? `Último acceso ${formatDistanceToNow(new Date(selectedClient.lastLoginAt), { addSuffix: true, locale: es })}`
                    : 'Sin accesos registrados'}
                </div>
              </div>
              <ChevronDown size={16} color="#6B7280" />
            </div>
          </div>

          {dropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                width: '380px',
                maxHeight: '340px',
                background: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '10px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={16} color="#9CA3AF" />
                <input 
                  type="text"
                  placeholder="Buscar por nombre o empresa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '13px',
                    color: '#111827'
                  }}
                />
              </div>
              <div style={{ overflowY: 'auto', flex: 1, maxHeight: '280px' }}>
                {filteredClients.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: '13px', color: '#9CA3AF', textAlign: 'center' }}>
                    No se encontraron clientes coincidentes
                  </div>
                ) : (
                  filteredClients.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => {
                        setSelectedClientId(c.id);
                        setDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        background: c.id === selectedClientId ? '#F0FDFA' : 'transparent',
                        borderBottom: '1px solid #F9FAFB',
                        transition: 'background 0.15s'
                      }}
                    >
                      {c.logoUrl ? (
                        <img src={c.logoUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain', background: '#F3F4F6', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                          {(c.companyName || c.name || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.companyName || c.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {c.companyName && c.companyName !== c.name && <span>{c.name} • </span>}
                          <span>
                            {c.lastLoginAt 
                              ? `hace ${formatDistanceToNow(new Date(c.lastLoginAt), { locale: es })}`
                              : 'Sin accesos'}
                          </span>
                        </div>
                      </div>
                      {c.id === selectedClientId && <Check size={16} color="#00C4CC" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {data && (
          <div style={{ fontSize: '13px', color: '#6B7280' }}>
            Rango activo: <strong>{range} días</strong> (Horarios en tiempo local CDMX)
          </div>
        )}
      </div>

      {/* Loading state for client change */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="client-kpi-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <SkeletonBox height={280} />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={36} color="#EF4444" />
          <p style={{ margin: 0, color: '#B91C1C', fontWeight: 600 }}>{error}</p>
          <button className="btn-secondary" onClick={fetchClientAnalytics} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      )}

      {/* Analytics Content */}
      {!loading && !error && data && (() => {
        const { client, kpis, byHour, heatmap, calendar, sections, devices, recentSessions, insight, source } = data;
        const isLegacySource = source === 'loginEvents';

        // Find peak hour for byHour chart
        const maxByHour = Math.max(...byHour, 1);
        const byHourData = byHour.map((count, hour) => ({
          hour: `${hour}h`,
          count,
          isPeak: count === maxByHour && count > 0
        }));

        return (
          <>
            {/* 1. KPIs */}
            <div className="client-kpi-grid">
              
              {/* Sesiones */}
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Sesiones</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{kpis.sessions}</h3>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>en {range}d</span>
                </div>
                <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>
                  {client.loginCount} inicios de sesión totales
                </span>
              </div>

              {/* Tiempo Activo */}
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Tiempo Activo</p>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {isLegacySource ? '—' : fmtDuration(client.totalTimeSpent)}
                </h3>
                {isLegacySource ? (
                  <span style={{ fontSize: '11px', color: '#B45309', marginTop: '4px', display: 'block' }}>
                    El tiempo activo se mide desde el 16 oct 2026; antes solo hay horas de acceso.
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                    {kpis.daysActive} días con actividad
                  </span>
                )}
              </div>

              {/* Duración Media */}
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Duración Media</p>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {isLegacySource ? '—' : (kpis.avgSessionMin > 0 ? `${kpis.avgSessionMin} min` : '—')}
                </h3>
                <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  por sesión completada
                </span>
              </div>

              {/* Visitas por semana */}
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Visitas / Semana</p>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>{kpis.visitsPerWeek}</h3>
                <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  frecuencia estimada
                </span>
              </div>

              {/* Último acceso */}
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Último Acceso</p>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '6px 0 0 0' }}>
                  {kpis.lastSeenAt 
                    ? formatDistanceToNow(new Date(kpis.lastSeenAt), { addSuffix: true, locale: es })
                    : 'Nunca'}
                </h3>
                <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  {kpis.lastSeenAt ? new Date(kpis.lastSeenAt).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' }) : ''}
                </span>
              </div>

            </div>

            {/* 2. Frase Insight destacada */}
            <div className="client-insight-banner">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={20} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Patrón de Comportamiento Detectado
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 600, color: '#064E3B' }}>
                  {insight}
                </p>
              </div>
            </div>

            {/* 3. A qué hora se conecta (BarChart de 24 horas CDMX) */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                    ¿A qué hora se conecta?
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                    Distribución de sesiones a lo largo de las 24 horas del día (hora local CDMX).
                  </p>
                </div>
              </div>

              <div style={{ height: '240px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byHourData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value} sesiones`, 'Actividad']}
                      labelFormatter={(label) => `Hora: ${label} (CDMX)`}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {byHourData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isPeak ? '#00E5A0' : (entry.count > 0 ? '#34D399' : '#E5E7EB')}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Qué días y horas (HeatmapGrid) */}
            <div className="card heatmap-card">
              <div style={{ margin: '0 0 20px 0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                  ¿Qué días y a qué horas?
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                  Mapa de intensidad de sesiones por día de la semana y franja horaria.
                </p>
              </div>
              <HeatmapGrid heatmap={heatmap} labelType="sesiones" />
            </div>

            {/* 5. Calendario de actividad estilo GitHub (365 días) */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ margin: '0 0 16px 0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="#059669" /> Calendario de Actividad (Últimos 365 Días)
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                  Registro histórico de sesiones y tiempo diario en plataforma sin importar el filtro de rango.
                </p>
              </div>
              <ActivityCalendar calendar={calendar} />
            </div>

            {/* 6. Qué hace (Secciones + Dispositivos) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '24px' }}>
              
              {/* Secciones más visitadas */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="#00C4CC" /> Secciones más visitadas
                </h3>
                {sections.length > 0 && sections.some(s => s.count > 0) ? (
                  <div style={{ height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sections} layout="vertical" margin={{ left: 15, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                          {sections.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SECTION_COLORS[index % SECTION_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                    Sin datos de navegación en este período
                  </div>
                )}
              </div>

              {/* Dona de Dispositivos */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Laptop size={18} color="#2563EB" /> Dispositivos
                </h3>
                {devices.length > 0 ? (
                  <div style={{ height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={devices}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="count"
                        >
                          {devices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                    Sin datos de dispositivos registrados
                  </div>
                )}
              </div>

            </div>

            {/* 7. Tabla "Últimas sesiones" */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#4B5563" /> Últimas Sesiones Registradas
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {recentSessions.length} más recientes
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="client-sessions-table">
                  <thead>
                    <tr>
                      <th>Fecha y Hora (CDMX)</th>
                      <th>Duración</th>
                      <th>Dispositivo</th>
                      <th>Página de Entrada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
                          Sin sesiones registradas aún para este cliente.
                        </td>
                      </tr>
                    ) : (
                      recentSessions.map((s, idx) => {
                        const dateObj = new Date(s.startedAt);
                        const dateStr = dateObj.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' });
                        const timeStr = dateObj.toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit' });
                        
                        return (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600, color: '#111827' }}>
                              {dateStr} <span style={{ color: '#6B7280', fontWeight: 400, marginLeft: '6px' }}>{timeStr}</span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, color: s.activeMin > 0 ? '#059669' : '#6B7280' }}>
                                {isLegacySource ? '—' : fmtDuration(s.activeMin * 60)}
                              </span>
                            </td>
                            <td>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#374151' }}>
                                {s.device === 'Móvil' ? <Smartphone size={14} color="#F59E0B" /> : <Laptop size={14} color="#10B981" />}
                                {s.device}
                              </span>
                            </td>
                            <td style={{ color: '#6B7280', fontFamily: 'monospace', fontSize: '12px' }}>
                              {s.entryPath}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        );
      })()}

    </div>
  );
}
