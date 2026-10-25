import React from 'react';
import { BrandMark, Icon, IconName } from './Icons.js';
import { PlayerProfile } from '../types/index.js';

interface SidebarProps {
  activeRoute: string;
  inboxCount?: number;
  player: PlayerProfile;
  onNavigate?: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  inboxCount = 2,
  player,
  onNavigate
}) => {
  const navItems: Array<{ id: string; href: string; label: string; icon: IconName; count?: number }> = [
    { id: 'desk', href: '#/desk', label: 'Desk', icon: 'desk' },
    { id: 'clients', href: '#/clients', label: 'Clients', icon: 'clients' },
    { id: 'inbox', href: '#/desk', label: 'Inbox', icon: 'inbox', count: inboxCount },
    { id: 'journal', href: '#/desk', label: 'Journal', icon: 'journal' }
  ];

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar__brand">
        <BrandMark />
        <span>CareerVerse</span>
      </div>
      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const isCurrent = activeRoute === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              aria-current={isCurrent ? 'page' : undefined}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(item.id);
                }
              }}
            >
              <Icon name={item.icon} size={16} strokeWidth={1.6} />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="count">{item.count}</span>
              )}
            </a>
          );
        })}
      </nav>
      <div className="sidebar__player">
        <span
          className="avatar avatar--32"
          style={{ background: '#E3E8F5', color: '#1F3F8F' }}
        >
          {player.initials}
        </span>
        <span>
          <b>{player.name}</b>
          <span>{player.role} · Level {player.level}</span>
        </span>
      </div>
    </aside>
  );
};
