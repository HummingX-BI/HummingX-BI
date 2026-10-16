import React from 'react';
import { Activity, Clock, CheckCircle2, Rocket, FileText, Bookmark } from 'lucide-react';

function getBitacoraIcon(desc = '') {
  const d = desc.toLowerCase();
  if (d.includes('hito') || d.includes('fase') || d.includes('complet')) {
    return <Rocket size={16} color="var(--px-accent)" />;
  }
  if (d.includes('entreg') || d.includes('document') || d.includes('contrato')) {
    return <FileText size={16} color="#059669" />;
  }
  if (d.includes('aprob') || d.includes('revis')) {
    return <CheckCircle2 size={16} color="#8B5CF6" />;
  }
  return <Bookmark size={16} color="#6B7280" />;
}

export default function Bitacora({ activities = [] }) {
  if (!activities || activities.length === 0) return null;

  // Sort activities by date descending
  const sorted = [...activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Group by Month + Year
  const groups = {};
  sorted.forEach(act => {
    const d = new Date(act.createdAt);
    const monthYear = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    const capitalized = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    if (!groups[capitalized]) groups[capitalized] = [];
    groups[capitalized].push(act);
  });

  return (
    <div id="tour-bitacora" className="px-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="px-label">Historial Cronológico</span>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--px-accent)" /> Bitácora de desarrollo
          </h2>
        </div>
        <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
          {sorted.length} {sorted.length === 1 ? 'registro' : 'registros'} documentados
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {Object.entries(groups).map(([monthYear, items]) => (
          <div key={monthYear} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'capitalize' }}>
                {monthYear}
              </span>
              <div style={{ flex: 1, height: '1px', background: '#F3F4F6' }} />
            </div>

            <div className="px-timeline">
              {items.map((act) => {
                const dateObj = new Date(act.createdAt);
                const dayNum = dateObj.getDate();
                const timeStr = dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

                return (
                  <div key={act.id} className="px-timeline-item">
                    <div className="px-timeline-icon">
                      {getBitacoraIcon(act.description)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingBottom: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                        {act.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6B7280' }}>
                        <span>Día {dayNum}</span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {timeStr} hrs
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
