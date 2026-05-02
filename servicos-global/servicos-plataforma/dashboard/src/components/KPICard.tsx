import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  loading = false,
}) => {
  if (loading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          minWidth: '200px',
          animation: 'pulse 1.5s infinite',
        }}
      >
        <div style={{ height: '1.2rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', width: '60%' }} />
        <div style={{ height: '2rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', width: '40%', marginTop: '0.5rem' }} />
      </div>
    );
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'var(--success-color, #10b981)';
    if (trend === 'down') return 'var(--danger-color, #ef4444)';
    return 'var(--text-muted, #9ca3af)';
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: '200px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      <span
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
        <span
          style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: '1rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {(trend || trendValue) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
          {trend && (
            <span style={{ color: getTrendColor(), fontSize: '0.875rem' }}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
          {trendValue && (
            <span style={{ color: getTrendColor(), fontSize: '0.875rem', fontWeight: 500 }}>
              {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
