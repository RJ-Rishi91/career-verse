import React, { useState } from 'react';
import { CareerState, ScenarioSummary } from '../types/index.js';
import { Portrait } from '../components/Portraits.js';
import { LottiePlayer } from '../components/LottiePlayer.js';
import { StatusPill } from '../components/StatusPill.js';
import { Icon } from '../components/Icons.js';
import { ApiService } from '../services/api.js';

interface DeskViewProps {
  career: CareerState;
  timeOverride: number | null;
  onNavigate: (route: string) => void;
  onStartCall: (scenarioId?: string) => void;
}

export const DeskView: React.FC<DeskViewProps> = ({
  career,
  timeOverride,
  onNavigate,
  onStartCall
}) => {
  const [showScenarioPicker, setShowScenarioPicker] = useState<boolean>(false);

  const p = career.player;
  const sc = career.scenario;
  const marcus = career.clients.find(c => c.id === 'marcus')!;
  const dana = career.clients.find(c => c.id === 'dana')!;

  const marcusDone = career.completedScenarios.includes('L1_MARCUS_STATUS_UPDATE') || !!career.lastResult;
  const inCall = !!career.activeCall;

  // Time-aware greeting
  const greeting = ApiService.getGreeting(timeOverride);
  let sub = 'Marcus needs his COI by 3:00 PM.';

  if (marcusDone) {
    if (career.lastResult?.critical && !career.lastResult?.recovered) {
      sub = 'Marcus is expecting that certificate by 2. Better check with the carrier.';
    } else {
      sub = 'Dana is next with her renewal.';
    }
  }

  if (greeting.band === 'up_late') {
    sub += ' One call, then get some rest.';
  }

  const callsLeft = Math.max(0, p.callsTotal - p.callsDone);
  const xpPct = Math.min(100, Math.round((p.xp / p.xpToNext) * 100));

  const gates = [
    { name: 'Calls complete', val: `${p.callsDone} of ${p.callsTotal}`, met: p.callsDone >= p.callsTotal },
    { name: 'XP threshold', val: `${p.xp} of ${p.xpToNext}`, met: p.xp >= p.xpToNext },
    { name: 'Portfolio health', val: p.portfolio, met: p.portfolio === 'Good' },
    { name: 'Boss review', val: 'Locked', met: false }
  ];

  const today = [
    {
      kind: 'Call',
      title: marcusDone ? 'Call Marcus with a firm time' : 'Status update with Marcus Bell',
      sub: marcusDone ? 'You promised this on the call' : 'COI for the Riverside job',
      pill: marcusDone ? '1:30 PM' : 'Due 3:00 PM',
      status: 'watch' as const
    },
    ...career.inbox.map(m => ({
      kind: 'Email',
      title: `${m.from}: ${m.title.toLowerCase()}`,
      sub: m.sub,
      pill: 'New',
      status: 'neutral' as const
    }))
  ];

  const tintBgMap: Record<string, { bg: string; ink: string }> = {
    blue: { bg: '#DCE8FF', ink: '#1F3F8F' },
    coral: { bg: '#FFE3DA', ink: '#8A2E12' },
    mint: { bg: '#D6F3E6', ink: '#0D5A3A' },
    butter: { bg: '#FFF0C2', ink: '#7A3E00' }
  };

  return (
    <div className="desk view-enter">
      {/* Hello Greeting Header */}
      <div className="desk__hello">
        <h1 className="h-display">
          {greeting.line}
          <br />
          {sub}
        </h1>
        <p className="h-sub">
          Monday · Level {p.level}, {p.levelTitle} · {callsLeft} calls left this level
        </p>
      </div>

      {/* KPI Strip */}
      <section className="kpis desk__kpis" aria-label="Your numbers">
        <div className="kpi">
          <div className="kpi__label">XP to Level {p.level + 1}</div>
          <div className="kpi__value">
            {p.xp}
            <small> /{p.xpToNext}</small>
          </div>
          <div className="bar-track" style={{ marginTop: 10, height: 6 }}>
            <div className="bar-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        <div className="kpi">
          <div className="kpi__label">Calls this level</div>
          <div className="kpi__value">
            {p.callsDone}
            <small> /{p.callsTotal}</small>
          </div>
          <div className="kpi__note">{callsLeft} left across 3 clients</div>
        </div>

        <div className="kpi">
          <div className="kpi__label">Portfolio health</div>
          <div className="kpi__value">{p.portfolio}</div>
          <div className="kpi__note">
            {career.clients.filter(c => c.status !== 'ok').length} client needs attention
          </div>
        </div>

        <div className="kpi">
          <div className="kpi__label">Streak</div>
          <div className="kpi__value">
            {p.streak}
            <small> days</small>
          </div>
          <div className="kpi__note">{p.freezes} freeze available</div>
        </div>
      </section>

      {/* Next Call Card */}
      {marcusDone ? (
        <section className="next desk__next tint-coral" aria-label="Next call">
          <div className="next__top">
            <div className="next__portrait">
              <Portrait client={dana} mood="neutral" background="#FFFFFF" />
            </div>
          </div>
          <div className="next__body">
            <div className="next__kicker t-ink">
              Next call · Instruction · Dana Whitfield, Whitfield Insurance Group
            </div>
            <h2 className="next__title">Dana is nervous about a renewal</h2>
            <p className="next__teaser t-ink">
              The premium may rise again. She needs to know what you can find out, and by when.
            </p>
            <div className="next__foot">
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => onStartCall('L1_DANA_INSTRUCTION')}
              >
                Take the call <Icon name="arrow" size={16} strokeWidth={2} />
              </button>
              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => setShowScenarioPicker(true)}
              >
                All 11 Scenarios
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="next desk__next tint-blue" aria-label="Next call">
          <div className="next__top">
            <div className="next__portrait">
              <div className="next__pulse">
                <LottiePlayer name="call-pulse" loop style={{ width: 116, height: 116 }} />
              </div>
              <Portrait client={marcus} mood="worried" background="#FFFFFF" />
            </div>
          </div>
          <div className="next__body">
            <div className="next__kicker t-ink">
              Next call · {sc.type} · {marcus.name}, {marcus.company}{' '}
              <span className="pill pill--watch" style={{ marginLeft: 6 }}>
                {sc.due}
              </span>
            </div>
            <h2 className="next__title">{sc.title}</h2>
            <p className="next__teaser t-ink">{sc.teaser}</p>
            <div className="next__foot">
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => onStartCall('L1_MARCUS_STATUS_UPDATE')}
              >
                {inCall ? 'Resume the call' : 'Take the call'} <Icon name="arrow" size={16} strokeWidth={2} />
              </button>
              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => setShowScenarioPicker(true)}
              >
                All Level 1 Scenarios ({career.availableScenarios.length})
              </button>
              <span className="meta t-ink">
                +60 XP base · skills: {sc.skills.join(', ')}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Scenario Selection Modal */}
      {showScenarioPicker && (
        <div
          className="scrim"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowScenarioPicker(false);
          }}
          role="presentation"
        >
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="picker-title" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="sheet__handle" />
            <h2 className="sheet__title" id="picker-title">
              Level 1 Scenarios ({career.availableScenarios.length})
            </h2>
            <p className="sheet__warn">
              Choose any scenario to practice your communication, boundaries, and client relationships.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '14px 0' }}>
              {career.availableScenarios.map((scItem: ScenarioSummary) => (
                <div
                  key={scItem.id}
                  className="row"
                  style={{ cursor: 'pointer', border: scItem.id === sc.id ? '1.5px solid var(--accent)' : undefined }}
                  onClick={() => {
                    setShowScenarioPicker(false);
                    onStartCall(scItem.id);
                  }}
                >
                  <span className="row__body">
                    <b>{scItem.title}</b>
                    <span>{scItem.clientName} · {scItem.type}</span>
                  </span>
                  {scItem.completed ? (
                    <span className="pill pill--ok">Completed</span>
                  ) : scItem.isBoss ? (
                    <span className="pill pill--watch">Boss review</span>
                  ) : (
                    <span className="pill pill--neutral">Available</span>
                  )}
                </div>
              ))}
            </div>
            <div className="sheet__actions">
              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => setShowScenarioPicker(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clients Summary Panel */}
      <section className="panel desk__clients" aria-label="Your clients">
        <div className="panel__head">
          <h2 className="panel__title">
            Your clients <span className="count">{career.clients.length}</span>
          </h2>
          <a
            className="panel__link"
            href="#/clients"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('clients');
            }}
          >
            View all
          </a>
        </div>
        {career.clients.slice(0, 3).map((c) => {
          const tint = tintBgMap[c.tint] || tintBgMap.blue;
          return (
            <a
              key={c.id}
              className="row"
              href={`#/client/${c.id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`client/${c.id}`);
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
                <span>{c.company} · {c.next}</span>
              </span>
              <span className="row__meta num">Trust {c.meters.trust}</span>
              <StatusPill status={c.status} />
            </a>
          );
        })}
      </section>

      {/* Gates Review Panel */}
      <section className="panel desk__gates" aria-label="Level review">
        <h2 className="panel__title" style={{ marginBottom: 6 }}>
          Level {p.level} review
        </h2>
        {gates.map((g, i) => (
          <div key={i} className="gate">
            <span className={`gate__dot ${g.met ? 'is-met' : ''}`}>
              {g.met && <Icon name="check" size={11} strokeWidth={3} />}
            </span>
            <span className="gate__name">{g.name}</span>
            <span className="gate__val">{g.val}</span>
          </div>
        ))}
        <p className="muted" style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.45 }}>
          XP alone never promotes. Every gate must be met.
        </p>
      </section>

      {/* Today Panel */}
      <section className="panel desk__today" aria-label="Today">
        <div className="panel__head">
          <h2 className="panel__title">
            Today <span className="count">{today.length}</span>
          </h2>
          <span className="panel__link">Tasks and inbox</span>
        </div>
        {today.map((t, idx) => (
          <div key={idx} className="row">
            <span className="row__meta" style={{ width: 44, fontSize: 12 }}>
              {t.kind}
            </span>
            <span className="row__body">
              <b>{t.title}</b>
              <span>{t.sub}</span>
            </span>
            <StatusPill status={t.status} label={t.pill} />
          </div>
        ))}
      </section>
    </div>
  );
};
