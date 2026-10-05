export default function ProgressTicks({ value = 0, color = '#00A7A8', label = 'Avance del proyecto' }) {
  const percent = Math.max(0, Math.min(100, Number(value) || 0));
  const completed = Math.round(percent / 4);

  return (
    <div className="progress-ticks" role="progressbar" aria-label={label} aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100">
      {Array.from({ length: 25 }, (_, index) => {
        const isFilled = index < completed;
        const isCurrent = index === completed - 1 && percent > 0 && percent < 100;
        return (
          <span
            key={index}
            className={`progress-tick ${isFilled ? 'filled' : ''} ${isCurrent ? 'active-tick' : ''}`}
            style={{ backgroundColor: isFilled ? color : '#E5E7EB' }}
          />
        );
      })}
    </div>
  );
}
