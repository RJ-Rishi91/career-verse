import React from 'react';
import { ClientStatus } from '../types/index.js';

interface StatusPillProps {
  status: ClientStatus | 'neutral' | 'white';
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const STATUS_MAP: Record<ClientStatus, { label: string; className: string }> = {
  ok: { label: 'On track', className: 'pill--ok' },
  watch: { label: 'Watch', className: 'pill--watch' },
  risk: { label: 'At risk', className: 'pill--risk' }
};

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  className = '',
  style
}) => {
  if (status === 'neutral') {
    return (
      <span className={`pill pill--neutral ${className}`} style={style}>
        {label}
      </span>
    );
  }

  if (status === 'white') {
    return (
      <span className={`pill pill--white ${className}`} style={style}>
        {label}
      </span>
    );
  }

  const def = STATUS_MAP[status] || STATUS_MAP.watch;
  return (
    <span className={`pill ${def.className} ${className}`} style={style}>
      {label || def.label}
    </span>
  );
};
