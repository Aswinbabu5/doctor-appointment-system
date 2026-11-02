import React from 'react';

export const LoadingSkeleton: React.FC<{ height?: string; width?: string; className?: string; style?: React.CSSProperties }> = ({
  height = '120px',
  width = '100%',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        height,
        width,
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        ...style
      }}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="skeleton" style={{ height: '24px', width: '50%' }} />
      <div className="skeleton" style={{ height: '16px', width: '80%' }} />
      <div className="skeleton" style={{ height: '16px', width: '60%' }} />
      <div className="skeleton" style={{ height: '38px', width: '100%', marginTop: '0.5rem' }} />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="table-container">
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {
          Array.from({ length: rows }).map((_, r) => (
            <div key={r} style={{ display: 'flex', gap: '1rem' }}>
              {
                Array.from({ length: cols }).map((_, c) => (
                  <div key={c} className="skeleton" style={{ height: '20px', flex: 1 }} />
                ))
              }
            </div>
          ))
        }
      </div>
    </div>
  );
};
