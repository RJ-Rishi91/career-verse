import React, { useState } from 'react';
import { Client } from '../types/index.js';
import { Portrait } from '../components/Portraits.js';
import { StatusPill } from '../components/StatusPill.js';
import { Icon } from '../components/Icons.js';

interface ClientsViewProps {
  clients: Client[];
  selectedClientId?: string;
  onSelectClient: (clientId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  selectedClientId,
  onSelectClient
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const tintBgMap: Record<string, { bg: string; ink: string }> = {
    blue: { bg: '#DCE8FF', ink: '#1F3F8F' },
    coral: { bg: '#FFE3DA', ink: '#8A2E12' },
    mint: { bg: '#D6F3E6', ink: '#0D5A3A' },
    butter: { bg: '#FFF0C2', ink: '#7A3E00' }
  };

  const word = (k: 'trust' | 'respect' | 'anger', v: number) => {
    if (k === 'anger') {
      return v >= 7 ? 'Hot' : v >= 4 ? 'Tense' : 'Calm';
    }
    return v >= 8 ? 'Strong' : v >= 6 ? 'Building' : v >= 4 ? 'Fragile' : 'Low';
  };

  const thoughtOpen = selectedClient.meters.trust >= selectedClient.thought.unlockTrust;

  const meterRow = (k: 'trust' | 'respect' | 'anger', label: string, color: string) => (
    <div key={k} className="meter">
      <div className="meter__top">
        <span style={{ fontSize: 14 }}>{label}</span>
        <span className="meter__val">
          <b>{selectedClient.meters[k]}</b>/10 · {word(k, selectedClient.meters[k])}
        </span>
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{
            width: `${selectedClient.meters[k] * 10}%`,
            background: color
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="clients view-enter">
      {/* Client List (Left Column on Desktop, Full on Mobile when no client selected) */}
      <section className="clients__list" aria-label="Client list">
        <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>
          Clients <span className="muted" style={{ fontWeight: 400 }}>{clients.length}</span>
        </h1>
        {clients.map((c) => {
          const tint = tintBgMap[c.tint] || tintBgMap.blue;
          const isCurrent = c.id === selectedClient.id;
          return (
            <a
              key={c.id}
              className="row"
              href={`#/client/${c.id}`}
              aria-current={isCurrent ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                onSelectClient(c.id);
              }}
            >
              <span
                className="avatar avatar--38"
                style={{ background: tint.bg, color: tint.ink }}
              >
                {c.initials}
              </span>
              <span className="row__body">
                <b>{c.name}</b>
                <span>{c.company}</span>
              </span>
              <StatusPill status={c.status} />
            </a>
          );
        })}
      </section>

      {/* Client Detail (Right Column on Desktop, Active Screen on Mobile) */}
      <div className="clients__detail">
        {/* Client Hero Header */}
        <section className={`client-hero tint-${selectedClient.tint}`}>
          <div className="client-hero__text">
            <h2>{selectedClient.name}</h2>
            <div className="client-hero__role t-ink">{selectedClient.role}</div>
            <div className="client-hero__pills">
              <StatusPill status={selectedClient.status} />
              <span className="pill pill--white">{selectedClient.importance}</span>
            </div>
          </div>
          <Portrait
            client={selectedClient}
            mood={selectedClient.status === 'risk' ? 'frustrated' : 'neutral'}
          />
        </section>

        {/* Tab Controls */}
        <div className="tabs" role="tablist" aria-label="Client sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === 'overview' ? (
          <>
            <div className="duo">
              <section className="panel" style={{ gap: 14 }}>
                <h3 className="panel__title">Relationship</h3>
                {meterRow('trust', 'Trust', 'var(--accent)')}
                {meterRow('respect', 'Respect', 'var(--ink)')}
                {meterRow('anger', 'Anger', 'var(--anger)')}
              </section>

              <section className="panel panel--white">
                <div className="muted" style={{ fontSize: 12 }}>
                  What {selectedClient.name.split(' ')[0]} is thinking ·{' '}
                  {thoughtOpen
                    ? `unlocked at trust ${selectedClient.thought.unlockTrust}`
                    : `unlocks at trust ${selectedClient.thought.unlockTrust}`}
                </div>
                {thoughtOpen ? (
                  <p className="thought">{selectedClient.thought.text}</p>
                ) : (
                  <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                    Build trust to hear what they don’t say out loud.
                  </p>
                )}
              </section>
            </div>

            <section className="panel">
              <h3 className="panel__title">
                How {selectedClient.id === 'marcus' ? 'he' : 'she'} likes to be told
              </h3>
              <div className="chips">
                {selectedClient.prefs.map((pref, i) => (
                  <span key={i} className="chip">{pref}</span>
                ))}
                <span className="chip chip--warn">{selectedClient.trigger}</span>
              </div>
            </section>

            <section className="panel" style={{ gap: 8 }}>
              <div className="panel__head">
                <h3 className="panel__title">Client cycle</h3>
                <span className="panel__link num">
                  {selectedClient.cycle.filter(x => x.done).length} of 3 calls
                </span>
              </div>
              {selectedClient.cycle.map((x, idx) => (
                <div key={idx} className={`cycle-row ${x.done ? '' : 'is-next'}`}>
                  <span className={`cycle-row__dot ${x.done ? 'is-done' : ''}`}>
                    {x.done && <Icon name="check" size={12} strokeWidth={3} />}
                  </span>
                  <span className="cycle-row__name">{x.name}</span>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {x.done ? x.when : x.current ? 'Up next' : x.when}
                  </span>
                </div>
              ))}
            </section>
          </>
        ) : (
          <section className="panel">
            {selectedClient.history.map((e, i) => (
              <div key={i} className="timeline__item">
                <div className="timeline__rail">
                  <span className={`timeline__dot ${e.kind === 'Call' ? 'is-call' : ''}`} />
                  {i < selectedClient.history.length - 1 && <span className="timeline__line" />}
                </div>
                <div className="timeline__body">
                  <div className="timeline__meta">
                    {e.when} · {e.kind}
                  </div>
                  <div className="timeline__title">{e.title}</div>
                  <div className="timeline__detail">{e.detail}</div>
                </div>
              </div>
            ))}
            <div className="muted" style={{ fontSize: 13, paddingLeft: 32 }}>
              This record is permanent. Recovering adds new entries; it never erases old ones.
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
