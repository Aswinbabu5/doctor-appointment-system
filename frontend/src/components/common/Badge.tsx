import React from 'react';

interface BadgeProps {
  status: string;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  const normalizedStatus = status.toLowerCase();
  const displayLabel = label || status.replace('_', ' ');

  return (
    <span className={`badge badge-${normalizedStatus}`}>
      {displayLabel}
    </span>
  );
};
