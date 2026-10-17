// portal/src/pages/admin/client-detail/TabActivity.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  AlertCircle,
  Eye,
  Timer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell 
} from 'recharts';
import api from '../../../lib/api';
import ActivityCalendar from '../analytics/ActivityCalendar';
import HeatmapGrid from '../analytics/HeatmapGrid';

export default function TabActivity({ detail }) {
  const { id, client } = detail;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.get(`/admin/analytics/client/${id}?range=90`)
      .then((res) => {
        if (isMounted) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching client activity analytics:', err);
        if (isMounted) {
          setError('No fue posible cargar las analíticas de actividad de este cliente.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="cd-section">
        <div className="cd-skeleton" style={{ height: '140px', borderRadius: '12px' }} />
        <div className="cd-skeleton" style={{ height: '260px', borderRadius: '12px' }} />
        <div className="cd-skeleton" style={{ height: '200px', borderRadius: '12px' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="cd-card cd-empty-state">
        <AlertCircle size={32} color="#EF4444" />
        <div className="cd-empty-title">Error al cargar actividad</div>
        <p className="cd-empty-desc">{error || 'No hay datos de actividad disponibles.'}</p>
      </div>
    );
  }

  const { kpis, insight, byHour, heatmap, calendar } = data;

  // Process hours for BarChart
  const byHourData = (byHour || []).map((h) => ({
    hour: `${String(h.hour).padStart(2, '0')}:00`,
    count: h.sessions || 0,
    isPeak: Boolean(h.isPeak),
  }));

  return (
    <div className="cd-section">
      {/* Header bar with link to full analytics */}
      <div className="cd-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#00C4CC" /> Actividad y Conexión en Plataforma (Últimos 90 días)
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
            Monitoreo en tiempo real del uso del portal por parte del cliente.
          </p>
        </div>

        <Link
          to={`/admin/analytics?tab=client&client=${id}`}
          className="cd-btn cd-btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          <ExternalLink size={15} /> Ver análisis completo en Analíticas
        </Link>
      </div>

      {/* Insight banner */}
      {insight && (
        <div
          style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '1px solid #A7F3D0',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#059669',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Patrón de Comportamiento Detectado
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 600, color: '#064E3B' }}>
              {insight}
            </p>
          </div>
        </div>
      )}

      {/* Quick KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px 16px', borderRadius: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="#64748B" /> Total Sesiones
          </span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginTop: '4px', display: 'block' }}>
            {kpis?.totalSessions || 0}
          </span>
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px 16px', borderRadius: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Timer size={14} color="#64748B" /> Tiempo Activo Total
          </span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginTop: '4px', display: 'block' }}>
            {kpis?.totalActiveTimeFormatted || `${kpis?.totalActiveMin || 0}m`}
          </span>
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px 16px', borderRadius: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={14} color="#64748B" /> Vistas de Página
          </span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginTop: '4px', display: 'block' }}>
            {kpis?.totalPagesViewed || 0}
          </span>
        </div>
      </div>

      {/* Horas pico (BarChart 24 hrs) */}
      <div className="cd-card">
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} color="#64748B" /> ¿A qué hora se conecta el cliente?
        </h4>
        <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px' }}>
          Distribución de sesiones a lo largo de las 24 horas del día (hora CDMX).
        </p>

        <div style={{ height: '220px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byHourData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`${value} sesiones`, 'Actividad']}
                labelFormatter={(label) => `Hora: ${label} (CDMX)`}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byHourData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isPeak ? '#00C4CC' : entry.count > 0 ? '#38BDF8' : '#E2E8F0'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap Grid */}
      {heatmap && heatmap.length > 0 && (
        <div className="cd-card">
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
            ¿Qué días y a qué horas?
          </h4>
          <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px' }}>
            Mapa de calor de sesiones por día de la semana y franja horaria.
          </p>
          <HeatmapGrid heatmap={heatmap} labelType="sesiones" />
        </div>
      )}

      {/* GitHub style Activity Calendar */}
      {calendar && calendar.length > 0 && (
        <div className="cd-card">
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="#059669" /> Calendario de Actividad (Últimos 365 Días)
          </h4>
          <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px' }}>
            Historial de sesiones activas por día.
          </p>
          <ActivityCalendar calendar={calendar} />
        </div>
      )}
    </div>
  );
}
