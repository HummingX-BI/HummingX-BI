import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CheckCircle2, Rocket, FileText, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

function getActivityIcon(desc = '') {
  const d = desc.toLowerCase();
  if (d.includes('aprob') || d.includes('listo') || d.includes('complet')) {
    return <CheckCircle2 size={16} color="#059669" />;
  }
  if (d.includes('lanzamiento') || d.includes('despliegue') || d.includes('fase')) {
    return <Rocket size={16} color="#00C4CC" />;
  }
  if (d.includes('entreg') || d.includes('diseño') || d.includes('document')) {
    return <FileText size={16} color="#4F46E5" />;
  }
  return <Activity size={16} color="#6B7280" />;
}

export default function ActivityFeed({ activities = [] }) {
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div id="tour-activity" className="px-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <span className="px-label">Bitácora en Tiempo Real</span>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>
            Actividad reciente
          </h3>
        </div>
        <Link
          to="/project"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#00C4CC',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Ver todo <ArrowRight size={14} />
        </Link>
      </div>

      {recentActivities.length === 0 ? (
        <div style={{ padding: '36px 16px', textAlign: 'center', color: '#6B7280', fontSize: '13.5px' }}>
          Tu proyecto está activo. El equipo de HummingX irá documentando los avances paso a paso en esta bitácora.
        </div>
      ) : (
        <div className="px-timeline">
          {recentActivities.map((act, idx) => {
            const dateObj = new Date(act.createdAt);
            const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true, locale: es });

            return (
              <div key={act.id || idx} className="px-timeline-item">
                <div className="px-timeline-icon">
                  {getActivityIcon(act.description)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                    {act.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                    <Clock size={12} />
                    <span>{relativeTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
