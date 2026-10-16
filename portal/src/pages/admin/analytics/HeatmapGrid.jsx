import React from 'react';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}h`);

export default function HeatmapGrid({ heatmap = [], labelType = 'sesiones', highlightPeak = true }) {
  if (!heatmap || heatmap.length < 7) {
    return <div style={{ color: '#9CA3AF', padding: '20px' }}>Sin datos de mapa de calor</div>;
  }

  const maxHeat = Math.max(...heatmap.flat(), 1);

  // Peak calculation
  let peak = { val: 0, day: '', hour: '' };
  heatmap.forEach((dayRow, dIdx) => {
    dayRow.forEach((val, hIdx) => {
      if (val > peak.val) {
        peak = { val, day: DAYS[dIdx], hour: HOURS[hIdx] };
      }
    });
  });

  const getColor = (val) => {
    if (val === 0) return '#F3F4F6';
    const ratio = val / maxHeat;
    if (ratio <= 0.25) return '#A7F3D0';
    if (ratio <= 0.5) return '#34D399';
    if (ratio <= 0.75) return '#00E5A0';
    return '#059669';
  };

  return (
    <div>
      {highlightPeak && peak.val > 0 && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, color: '#047857', marginBottom: '16px' }}>
          <span>🔥 Pico de mayor concurrencia:</span>
          <span>{peak.day} a las {peak.hour} ({peak.val} {labelType})</span>
        </div>
      )}

      <div className="heatmap-grid-wrapper">
        {/* Daylight header */}
        <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(4, 1fr)', gap: '4px', marginBottom: '6px', fontSize: '10px', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>
          <div></div>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #E5E7EB', paddingBottom: '2px' }}>Madrugada (0-5 h)</div>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #E5E7EB', paddingBottom: '2px' }}>Mañana (6-11 h)</div>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #E5E7EB', paddingBottom: '2px' }}>Tarde (12-17 h)</div>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #E5E7EB', paddingBottom: '2px' }}>Noche (18-23 h)</div>
        </div>

        {/* Hour columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(24, 1fr)', gap: '4px', marginBottom: '8px' }}>
          <div></div>
          {HOURS.map(h => (
            <div key={h} className="heatmap-hour-label">{h}</div>
          ))}
        </div>

        {/* Days rows */}
        {DAYS.map((day, dIdx) => (
          <div key={day} style={{ display: 'grid', gridTemplateColumns: '50px repeat(24, 1fr)', gap: '4px', marginBottom: '4px' }}>
            <div className="heatmap-day-label">{day}</div>
            {(heatmap[dIdx] || []).map((val, hIdx) => (
              <div
                key={hIdx}
                className="heatmap-cell"
                title={`${day} ${hIdx} h · ${val} ${labelType}`}
                style={{ backgroundColor: getColor(val) }}
              />
            ))}
          </div>
        ))}

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: '#6B7280' }}>
          <span>Menos</span>
          <div style={{ width: '16px', height: '16px', background: '#F3F4F6', borderRadius: '4px' }}></div>
          <div style={{ width: '16px', height: '16px', background: '#A7F3D0', borderRadius: '4px' }}></div>
          <div style={{ width: '16px', height: '16px', background: '#34D399', borderRadius: '4px' }}></div>
          <div style={{ width: '16px', height: '16px', background: '#00E5A0', borderRadius: '4px' }}></div>
          <div style={{ width: '16px', height: '16px', background: '#059669', borderRadius: '4px' }}></div>
          <span>Más</span>
        </div>
      </div>
    </div>
  );
}
