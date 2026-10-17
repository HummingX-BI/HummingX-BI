import React from 'react';

export default function ClientBadge({
  logoUrl,
  name = '',
  companyName = '',
  size = 96,
  className = ''
}) {
  const displayName = companyName || name || 'Cliente';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'H';

  return (
    <div
      className={`px-client-badge ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={displayName}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className="px-client-badge-initials">
          {initial}
        </span>
      )}
    </div>
  );
}
