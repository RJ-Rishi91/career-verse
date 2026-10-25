import React from 'react';
import { BrandMark, Icon } from './Icons.js';
import { PlayerProfile } from '../types/index.js';

interface TopBarProps {
  player: PlayerProfile;
  isBackendConnected?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ player, isBackendConnected }) => {
  return (
    <header className="bar bar--brand">
      <div className="bar__brand">
        <BrandMark />
        <span>CareerVerse</span>
        {isBackendConnected !== undefined && (
          <span
            className="pill pill--neutral"
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              marginLeft: '4px',
              fontWeight: 500
            }}
            title={isBackendConnected ? 'Connected to Backend API' : 'Running in Local Authoritative Engine'}
          >
            {isBackendConnected ? 'API Connected' : 'Local Demo'}
          </span>
        )}
      </div>
      <div className="bar__stats">
        <span className="bar__stat num" aria-label={`${player.streak} day streak`}>
          <Icon name="flame" size={16} strokeWidth={1.6} />
          {player.streak} days
        </span>
        <span className="bar__stat num" aria-label={`${player.coins} coins`}>
          <Icon name="coin" size={16} strokeWidth={1.6} />
          {player.coins}
        </span>
        <span
          className="avatar avatar--32"
          style={{ background: '#E3E8F5', color: '#1F3F8F' }}
          title={player.name}
        >
          {player.initials}
        </span>
      </div>
    </header>
  );
};
