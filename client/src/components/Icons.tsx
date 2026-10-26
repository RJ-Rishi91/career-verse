import React from 'react';

export const ICON_PATHS = {
  desk: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  clients: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.9.7 3.1 2.4 3.5 5.2" />
    </>
  ),
  inbox: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5l8.5 6 8.5-6" />
    </>
  ),
  journal: (
    <>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
      <path d="M5 17a3 3 0 0 1 3-3h11M9 8h6" />
    </>
  ),
  flame: (
    <path d="M12 22c4 0 7-2.8 7-7 0-3.5-2.2-6-4-8-.5 2-1.6 3.2-3 3.5C12.5 7 11 4 8.5 2 8.8 6 5 8.5 5 14c0 4.2 3 8 7 8z" />
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.5h-3a1.8 1.8 0 0 0 0 3.5h4" />
    </>
  ),
  pause: <path d="M9 5v14M15 5v14" />,
  back: <path d="M15 5l-7 7 7 7" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3l9 16H3z" />
      <path d="M12 10v4M12 17v.5" />
    </>
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
  trophy: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v3h10v-3c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
      <path d="M6 4h12a2 2 0 0 1 2 2v4a6 6 0 0 1-12 0V6a2 2 0 0 1 2-2z" />
    </>
  )
};

export type IconName = keyof typeof ICON_PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 18,
  strokeWidth = 1.8,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
};

export const BrandMark: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true" className={className}>
    <path d="M4 6.5A4.5 4.5 0 0 1 8.5 2h11A4.5 4.5 0 0 1 24 6.5v9a4.5 4.5 0 0 1-4.5 4.5H12l-5.5 5v-5A4.5 4.5 0 0 1 4 15.5z" fill="#2459E0" />
    <path d="M9.5 14l4.5-4.5 4.5 4.5" stroke="#FFF" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
