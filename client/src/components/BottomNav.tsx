import React from 'react';
import { Icon, IconName } from './Icons.js';

interface BottomNavProps {
  activeRoute: string;
  inboxCount?: number;
  onNavigate?: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeRoute,
  inboxCount = 2,
  onNavigate
}) => {
  const tabs: Array<{ id: string; href: string; label: string; icon: IconName }> = [
    { id: 'desk', href: '#/desk', label: 'Desk', icon: 'desk' },
    { id: 'clients', href: '#/clients', label: 'Clients', icon: 'clients' },
    { id: 'inbox', href: '#/desk', label: `Inbox · ${inboxCount}`, icon: 'inbox' },
    { id: 'leaderboard', href: '#/leaderboard', label: 'Top 30', icon: 'trophy' }
  ];

  return (
    <nav className="bottomnav" aria-label="Main">
      {tabs.map((tab) => {
        const isCurrent = activeRoute === tab.id;
        return (
          <a
            key={tab.id}
            href={tab.href}
            aria-current={isCurrent ? 'page' : undefined}
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate(tab.id);
              }
            }}
          >
            <Icon name={tab.icon} size={20} strokeWidth={1.6} />
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
};
