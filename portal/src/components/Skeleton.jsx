/**
 * Skeleton.jsx — HummingX BI
 * Reusable skeleton components for loading states.
 * All use CSS class .skeleton (shimmer animation in index.css).
 */

/** Generic rectangular skeleton block */
export function SkeletonBox({ width = '100%', height = 16, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 6, ...style }}
      aria-hidden="true"
    />
  );
}

/** Skeleton for a stat/KPI card */
export function SkeletonStatCard() {
  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SkeletonBox width="60%" height={13} />
      <SkeletonBox width="40%" height={28} />
      <SkeletonBox width="50%" height={12} />
    </div>
  );
}

/** Skeleton for a table row */
export function SkeletonTableRow({ cols = 4 }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <SkeletonBox width={i === 0 ? '70%' : '50%'} height={13} />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton for a client card row */
export function SkeletonClientRow() {
  return (
    <div
      className="card"
      style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
      aria-hidden="true"
    >
      <SkeletonBox width={40} height={40} style={{ borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonBox width="55%" height={14} />
        <SkeletonBox width="35%" height={12} />
      </div>
      <SkeletonBox width={72} height={22} style={{ borderRadius: 99 }} />
    </div>
  );
}

/** Full-page skeleton for Dashboard */
export function SkeletonDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <SkeletonBox width={56} height={56} style={{ borderRadius: 12, flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <SkeletonBox width="40%" height={20} />
          <SkeletonBox width="60%" height={14} />
        </div>
      </div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      {/* Main card */}
      <div className="card" style={{ padding: 24 }}>
        <SkeletonBox width="30%" height={18} style={{ marginBottom: 16 }} />
        <SkeletonBox height={8} style={{ marginBottom: 12 }} />
        <SkeletonBox width="80%" height={13} />
      </div>
    </div>
  );
}
