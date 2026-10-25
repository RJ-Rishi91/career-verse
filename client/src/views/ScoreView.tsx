import React from 'react';
import { Client, ScorecardResult, Scenario } from '../types/index.js';
import { StatusPill } from '../components/StatusPill.js';
import { Icon } from '../components/Icons.js';

interface ScoreViewProps {
  scorecard: ScorecardResult;
  client: Client;
  scenario: Scenario;
  onCollect: () => void;
}

export const ScoreView: React.FC<ScoreViewProps> = ({
  scorecard,
  client,
  scenario,
  onCollect
}) => {
  const r = scorecard;

  const lvlPill = (lvl: number) => {
    if (lvl === 3) return <StatusPill status="ok" label="Strong" />;
    if (lvl === 2) return <StatusPill status="neutral" label="Good" />;
    return <StatusPill status="watch" label="Needs work" />;
  };

  const deltaCell = (label: string, value: number, delta: number, goodWhenIncreased: boolean) => {
    const isGood = goodWhenIncreased ? delta > 0 : delta < 0;
    const isBad = goodWhenIncreased ? delta < 0 : delta > 0;
    const signStr = delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : '';

    return (
      <div>
        <div className="muted" style={{ fontSize: 12 }}>{label}</div>
        <div className="split3__v">
          {value}{' '}
          <small className={delta === 0 ? 'muted' : isGood ? 'up' : isBad ? 'down' : 'muted'}>
            {signStr}
          </small>
        </div>
      </div>
    );
  };

  return (
    <div className="score view-enter">
      {/* Header */}
      <div className="score__hello">
        <div className="muted" style={{ fontSize: 13 }}>
          {client.name} · {scenario.type}
        </div>
        <h1 className="h-display" style={{ marginTop: 6 }}>
          {r.headline}
        </h1>
      </div>

      {/* Main Column */}
      <div className="score__main">
        {/* Score Splits */}
        <section className="split" aria-label="Scores">
          <div>
            <div className="muted" style={{ fontSize: 13 }}>Communication</div>
            <div className="split__big">
              {r.communication}
              <small> /100</small>
            </div>
            <div className="muted" style={{ fontSize: 12 }}>The 7Cs, tone, grammar</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 13 }}>Business</div>
            <div className="split__big">
              {r.business}
              <small> /100</small>
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              {r.capped ? 'Capped: critical mistake' : 'Accuracy, authority, outcome'}
            </div>
          </div>
        </section>

        {/* Incident Alert if Critical Error */}
        {r.critical && (
          <div className="incident">
            <Icon name="alert" size={18} />
            <span>
              <b>Critical mistake: promised beyond your authority.</b> A critical mistake caps the
              business score at 40, however good the words.{' '}
              {r.recovered
                ? 'You corrected it on the call; the correction is on the record too.'
                : 'An incident is now on Marcus’s record.'}
            </span>
          </div>
        )}

        {/* The 7Cs Breakdown */}
        <section className="panel" aria-label="The 7Cs">
          <div className="panel__head" style={{ marginBottom: 4 }}>
            <h2 className="panel__title">The 7Cs</h2>
            <span className="panel__link">How your replies landed</span>
          </div>
          {r.c7rows.map((row) => (
            <div key={row.key} className="c7">
              <div>{row.name}</div>
              <div className="c7__bar">
                <div className="c7__segs" aria-hidden="true">
                  {[1, 2, 3].map((seg) => (
                    <span key={seg} className={seg <= row.lvl ? 'on' : ''} />
                  ))}
                </div>
                <div className="c7__why">{row.why}</div>
              </div>
              <div className="c7__lvl">{lvlPill(row.lvl)}</div>
            </div>
          ))}
        </section>

        {/* Coach's Notes */}
        <section className="panel coach" aria-label="Coach's notes" style={{ gap: 14 }}>
          <h2 className="panel__title">Coach’s notes</h2>
          <div>
            <div className="coach__k coach__k--ok">What worked</div>
            <p>{r.coach.worked}</p>
          </div>
          <div>
            <div className="coach__k coach__k--next">Try next time</div>
            <p>{r.coach.next}</p>
          </div>
          <div>
            <div className="coach__k coach__k--why">Why it mattered</div>
            <p>{r.coach.why}</p>
          </div>
          <div className="rule-card">
            <div className="rule-card__k">Rule of thumb</div>
            <div className="rule-card__v">{r.ruleOfThumb || scenario.ruleOfThumb}</div>
          </div>
        </section>
      </div>

      {/* Side Column */}
      <div className="score__side">
        <section className="panel tint-blue" aria-label="Account impact">
          <h2 className="panel__title t-ink">
            {client.name.split(' ')[0]}’s account
          </h2>
          <div className="split3">
            {deltaCell('Trust', client.meters.trust, r.totals.trust, true)}
            {deltaCell('Respect', client.meters.respect, r.totals.respect, true)}
            {deltaCell('Anger', client.meters.anger, r.totals.anger, false)}
          </div>
          <div className="t-ink" style={{ fontSize: 13, lineHeight: 1.5 }}>
            Status: <StatusPill status={client.status} />{' '}
            {client.status === 'risk'
              ? 'until the promise is resolved.'
              : 'until the certificate is delivered.'}
          </div>
        </section>

        <section className="panel">
          <div className="muted" style={{ fontSize: 13 }}>
            60 base + {r.xp - 60} performance
          </div>
          <div className="num" style={{ fontSize: 22 }}>
            +{r.xp} XP · +{r.coins} coins
          </div>
        </section>

        <button
          className="btn btn--primary btn--block"
          type="button"
          onClick={onCollect}
        >
          Collect rewards
        </button>
      </div>
    </div>
  );
};
