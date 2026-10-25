import React from 'react';
import { Client, Expression } from '../types/index.js';

const MOODS: Record<Expression, { brows: string; mouth: string; label: string }> = {
  neutral: { brows: 'M24.5 24.2h5M34.5 24.2h5', mouth: 'M29 34.6q3 1.2 6 0', label: 'calm' },
  worried: { brows: 'M24.5 25l5-1.6M39.5 25l-5-1.6', mouth: 'M29 35.6q3-1.3 6 0', label: 'worried' },
  pleased: { brows: 'M24.5 23.8h5M34.5 23.8h5', mouth: 'M28.2 33.8q3.8 3.4 7.6 0', label: 'pleased' },
  relieved: { brows: 'M24.5 24.2l5-.5M39.5 24.2l-5-.5', mouth: 'M29 34.4q3 2 6 0', label: 'relieved' },
  frustrated: { brows: 'M24.5 23l5 2M39.5 23l-5 2', mouth: 'M29 36.4q3-2.4 6 0', label: 'frustrated' }
};

const HAIR = {
  short: {
    front: 'M21 27c0-9 4.8-14 11-14s11 4.6 11 12.5c-3-3.6-7.4-5-11-5s-8 1.6-11 6.5z',
    back: ''
  },
  long: {
    front: 'M21 28c0-9.5 4.8-15 11-15s11 5.5 11 15c-2.5-4.5-6.5-7-11-7s-8.5 2.5-11 7z',
    back: 'M19.5 30c0-11 5.5-17.5 12.5-17.5S44.5 19 44.5 30v17h-25z'
  },
  bun: {
    front: 'M20.8 28c0-9.8 5-15 11.2-15s11.2 5.2 11.2 15c-2-5-6-7.6-11.2-7.6S22.8 23 20.8 28z',
    back: 'M28 10a4 4 0 1 0 8 0a4 4 0 1 0-8 0z'
  }
};

interface PortraitProps {
  client: Client;
  mood?: Expression;
  background?: string;
  className?: string;
  size?: number;
}

export const Portrait: React.FC<PortraitProps> = ({
  client,
  mood = 'neutral',
  background,
  className = '',
  size
}) => {
  const art = client.art;
  const m = MOODS[mood] || MOODS.neutral;
  const h = HAIR[art.hair] || HAIR.short;

  const tie = art.tie ? (
    <>
      <path d="M25.5 45.5L32 53l6.5-7.5" fill="#FFFFFF" />
      <path d="M30.6 49.5h2.8l.8 9.5-2.2 2-2.2-2z" fill={art.tie} />
    </>
  ) : (
    <path d="M26 46l6 6.5 6-6.5" fill="#FFFFFF" />
  );

  return (
    <svg
      className={`portrait ${className}`}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${client.name} looks ${m.label}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {background && <circle cx="32" cy="32" r="32" fill={background} />}
      {h.back && <path d={h.back} fill={art.hairColor} />}
      <path d="M7 64c2-12 12.5-18.5 25-18.5S55 52 57 64z" fill={art.shirt} />
      {tie}
      <rect x="27.5" y="37" width="9" height="10" rx="3" fill={art.neck} />
      <ellipse cx="21.6" cy="29.5" rx="1.6" ry="2.4" fill={art.skin} />
      <ellipse cx="42.4" cy="29.5" rx="1.6" ry="2.4" fill={art.skin} />
      <ellipse cx="32" cy="28" rx="10.5" ry="12" fill={art.skin} />
      <path d={h.front} fill={art.hairColor} />
      <path d={m.brows} stroke="#1B1F2A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="28" cy="29" r="1.3" fill="#1B1F2A" />
      <circle cx="36" cy="29" r="1.3" fill="#1B1F2A" />
      <path d={m.mouth} stroke="#1B1F2A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
};
