import React from 'react';
import { Icon, IconName } from './Icons.js';
import { LottiePlayer } from './LottiePlayer.js';

interface ViewBarProps {
  backHref: string;
  backLabel: string;
  backIcon?: IconName;
  title: string;
  sub?: string;
  saveState?: 'saved' | 'saving' | 'offline' | null;
  onBackClick?: (e: React.MouseEvent) => void;
}

export const ViewBar: React.FC<ViewBarProps> = ({
  backHref,
  backLabel,
  backIcon = 'back',
  title,
  sub,
  saveState = null,
  onBackClick
}) => {
  return (
    <header className="bar">
      <a
        className="icon-btn"
        href={backHref}
        aria-label={backLabel}
        onClick={onBackClick}
      >
        <Icon name={backIcon} />
      </a>
      <div className="bar__title">
        <b>{title}</b>
        {sub && <span>{sub}</span>}
      </div>
      {saveState && (
        <span className="save-state" role="status">
          {saveState === 'saving' ? (
            <>
              <LottiePlayer
                name="saving-dots"
                loop
                style={{ width: 30, height: 10, marginRight: 4 }}
              />
              Saving…
            </>
          ) : (
            <>
              <span className="save-state__dot" />
              Saved
            </>
          )}
        </span>
      )}
    </header>
  );
};
