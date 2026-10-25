import React from 'react';

interface RelationshipMeterProps {
  label: string;
  value: number; // 0-10
  delta?: number;
  goodWhenIncreased?: boolean;
  color?: string;
}

export const RelationshipMeter: React.FC<RelationshipMeterProps> = ({
  label,
  value,
  delta = 0,
  goodWhenIncreased = true,
  color = 'var(--accent)'
}) => {
  const isPositiveChange = goodWhenIncreased ? delta > 0 : delta < 0;
  const isNegativeChange = goodWhenIncreased ? delta < 0 : delta > 0;
  const deltaSign = delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : '';

  return (
    <div className="meter">
      <div className="meter__top">
        <span>{label}</span>
        <span className="meter__val">
          {delta !== 0 && (
            <span className={`meter__delta ${isPositiveChange ? 'up' : isNegativeChange ? 'down' : ''}`}>
              {deltaSign}{' '}
            </span>
          )}
          <b>{value}</b>/10
        </span>
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{
            width: `${Math.min(100, Math.max(0, value * 10))}%`,
            background: color
          }}
        />
      </div>
    </div>
  );
};
