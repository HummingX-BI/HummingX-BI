import React, { useMemo } from 'react';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function ActivityCalendar({ calendar = [] }) {
  const { weeks, monthLabels, maxCount } = useMemo(() => {
    // Map existing calendar entries by YYYY-MM-DD
    const calMap = new Map();
    let max = 1;
    calendar.forEach(item => {
      calMap.set(item.date, item);
      if ((item.sessions || 0) > max) max = item.sessions;
    });

    // Calculate dates for last 53 weeks (371 days ending today)
    const today = new Date();
    // Weekday 0=Sun, 1=Mon... In our grid: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
    const todayDow = (today.getDay() + 6) % 7; 
    
    // We want the last day of the grid to be the end of the current week (Sunday)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - todayDow));

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (53 * 7 - 1));

    const weeksArr = [];
    const monthsArr = [];
    let currentMonth = -1;

    let curr = new Date(startDate);
    for (let w = 0; w < 53; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const dayNum = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${dayNum}`;

        const entry = calMap.get(dateStr) || { date: dateStr, sessions: 0, activeMin: 0 };
        const isFuture = curr > today;

        weekDays.push({
          date: dateStr,
          month: curr.getMonth(),
          dayOfMonth: curr.getDate(),
          year: curr.getFullYear(),
          sessions: isFuture ? 0 : (entry.sessions || 0),
          activeMin: isFuture ? 0 : (entry.activeMin || 0),
          isFuture
        });

        // Track month label on top row
        if (d === 0 && curr.getMonth() !== currentMonth) {
          currentMonth = curr.getMonth();
          monthsArr.push({ weekIndex: w, name: MONTHS[currentMonth] });
        }

        curr.setDate(curr.getDate() + 1);
      }
      weeksArr.push(weekDays);
    }

    return { weeks: weeksArr, monthLabels: monthsArr, maxCount: max };
  }, [calendar]);

  const getColor = (sessions, isFuture) => {
    if (isFuture || sessions === 0) return '#E5E7EB';
    const ratio = sessions / maxCount;
    if (ratio <= 0.25) return '#A7F3D0';
    if (ratio <= 0.5) return '#34D399';
    if (ratio <= 0.75) return '#00E5A0';
    return '#059669';
  };

  const CELL_SIZE = 11;
  const CELL_GAP = 3;
  const LEFT_OFFSET = 32;
  const TOP_OFFSET = 20;

  const totalWidth = LEFT_OFFSET + 53 * (CELL_SIZE + CELL_GAP) + 10;
  const totalHeight = TOP_OFFSET + 7 * (CELL_SIZE + CELL_GAP) + 10;

  return (
    <div className="activity-cal-scroll">
      <svg
        className="activity-cal-svg"
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
      >
        {/* Month labels */}
        {monthLabels.map((lbl, idx) => (
          <text
            key={idx}
            x={LEFT_OFFSET + lbl.weekIndex * (CELL_SIZE + CELL_GAP)}
            y={12}
            fontSize="10"
            fill="#6B7280"
            fontWeight="500"
          >
            {lbl.name}
          </text>
        ))}

        {/* Day labels (Lun, Mié, Vie) */}
        <text x={4} y={TOP_OFFSET + 0 * (CELL_SIZE + CELL_GAP) + 9} fontSize="9" fill="#9CA3AF">Lun</text>
        <text x={4} y={TOP_OFFSET + 2 * (CELL_SIZE + CELL_GAP) + 9} fontSize="9" fill="#9CA3AF">Mié</text>
        <text x={4} y={TOP_OFFSET + 4 * (CELL_SIZE + CELL_GAP) + 9} fontSize="9" fill="#9CA3AF">Vie</text>

        {/* Calendar grid cells */}
        {weeks.map((week, wIdx) => {
          const x = LEFT_OFFSET + wIdx * (CELL_SIZE + CELL_GAP);
          return week.map((day, dIdx) => {
            const y = TOP_OFFSET + dIdx * (CELL_SIZE + CELL_GAP);
            const fill = getColor(day.sessions, day.isFuture);
            
            // Format date for tooltip, e.g. "12 sep 2026"
            const dateObj = new Date(day.year, day.month, day.dayOfMonth);
            const formattedDate = `${day.dayOfMonth} ${MONTHS[day.month].toLowerCase()} ${day.year}`;

            return (
              <rect
                key={day.date}
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                fill={fill}
                className="activity-cal-cell"
              >
                {!day.isFuture && (
                  <title>
                    {`${formattedDate} · ${day.sessions} sesiones · ${day.activeMin} min`}
                  </title>
                )}
              </rect>
            );
          });
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '11px', color: '#6B7280' }}>
        <span>Menos</span>
        <div style={{ width: '11px', height: '11px', background: '#E5E7EB', borderRadius: '2px' }}></div>
        <div style={{ width: '11px', height: '11px', background: '#A7F3D0', borderRadius: '2px' }}></div>
        <div style={{ width: '11px', height: '11px', background: '#34D399', borderRadius: '2px' }}></div>
        <div style={{ width: '11px', height: '11px', background: '#00E5A0', borderRadius: '2px' }}></div>
        <div style={{ width: '11px', height: '11px', background: '#059669', borderRadius: '2px' }}></div>
        <span>Más</span>
      </div>
    </div>
  );
}
