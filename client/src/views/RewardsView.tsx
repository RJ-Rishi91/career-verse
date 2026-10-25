import React, { useEffect, useState } from 'react';
import { Client, PlayerProfile, ScorecardResult } from '../types/index.js';
import { LottiePlayer } from '../components/LottiePlayer.js';
import { Icon } from '../components/Icons.js';

interface RewardsViewProps {
  scorecard: ScorecardResult;
  player: PlayerProfile;
  dana: Client;
  onBackToDesk: () => void;
  onSelectDana: () => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  scorecard,
  player,
  dana,
  onBackToDesk,
  onSelectDana
}) => {
  const r = scorecard;
  const p = player;

  const targetPct = Math.min(100, Math.round((p.xp / p.xpToNext) * 100));
  const prevPct = Math.min(100, Math.round(((p.prevXp ?? p.xp - r.xp) / p.xpToNext) * 100));

  const [barWidth, setBarWidth] = useState(prevPct);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBarWidth(targetPct);
    }, 350);
    return () => clearTimeout(timer);
  }, [targetPct]);

  const badgeSvg = (
    <svg width="150" height="170" viewBox="0 0 150 170" role="img" aria-label="Straight Shooter badge">
      <path d="M48 104l-14 58 22-11 14 19 12-62z" fill="#2459E0" />
      <path d="M102 104l14 58-22-11-14 19-12-62z" fill="#1F3F8F" />
      <circle cx="75" cy="72" r="62" fill="#FFFFFF" stroke="#14161C" strokeWidth="3" />
      <circle cx="75" cy="72" r="48" fill="#FFD66B" />
      <circle cx="75" cy="72" r="30" fill="none" stroke="#14161C" strokeWidth="4" />
      <circle cx="75" cy="72" r="14" fill="none" stroke="#14161C" strokeWidth="4" />
      <circle cx="75" cy="72" r="4" fill="#14161C" />
      <path d="M108 39L79 68M108 39h-11M108 39v11" stroke="#14161C" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="rewards view-enter">
      {/* Reward Hero */}
      {r.badge ? (
        <section className="reward-hero tint-butter">
          <div className="reward-hero__confetti">
            <LottiePlayer name="confetti" delay={250} style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="t-ink" style={{ fontSize: 13 }}>New badge</div>
          <div className="reward-hero__badge">
            <div className="reward-hero__burst">
              <LottiePlayer name="badge-burst" style={{ width: 300, height: 300 }} />
            </div>
            {badgeSvg}
          </div>
          <h1>Straight Shooter</h1>
          <p className="t-ink">
            A truthful, specific update under deadline pressure, without promising what wasn’t yours to promise.
          </p>
        </section>
      ) : (
        <section className="reward-hero" style={{ background: 'var(--chrome)' }}>
          <div className="muted" style={{ fontSize: 13 }}>No badge this time</div>
          <h1>Call complete</h1>
          <p className="muted">
            Straight Shooter needs Correct and Concrete rated Strong with no critical mistake. It’s still there to earn on a later call.
          </p>
        </section>
      )}

      {/* Progress & Stats Panel */}
      <section className="panel" style={{ gap: 12 }}>
        <div className="xp-line">
          <span className="xp-line__gain">
            <span className="xp-spark">
              <LottiePlayer name="xp-spark" delay={900} style={{ width: 28, height: 28 }} />
            </span>
            +{r.xp} <span className="muted" style={{ fontSize: 14 }}>XP</span>
          </span>
          <span className="muted num" style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--ink)' }}>{p.xp}</span> / {p.xpToNext} to Level {p.level + 1}
          </span>
        </div>

        <div className="bar-track">
          <div
            className="bar-fill"
            style={{
              width: `${barWidth}%`,
              transition: 'width 1100ms var(--ease)'
            }}
          />
        </div>

        <div className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>
          Promotion also needs a healthy portfolio and a passed boss review. XP alone won’t get you there.
        </div>

        <div className="split3" style={{ border: '1px solid var(--border)' }}>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Coins</div>
            <div className="split3__v">
              {p.coins} <small className="up">+{r.coins}</small>
            </div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Streak</div>
            <div className="split3__v">
              {p.streak} <small className="muted">days</small>
            </div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Calls</div>
            <div className="split3__v">
              {p.callsDone}
              <small className="muted"> /{p.callsTotal}</small>
            </div>
          </div>
        </div>
      </section>

      {/* Up Next Row */}
      <a
        className="row tint-coral"
        href="#/client/dana"
        style={{ border: 0 }}
        onClick={(e) => {
          e.preventDefault();
          onSelectDana();
        }}
      >
        <span
          className="avatar avatar--38"
          style={{ background: '#FFFFFF', color: '#8A2E12' }}
        >
          {dana.initials}
        </span>
        <span className="row__body">
          <span className="t-ink">Up next · Instruction call</span>
          <b>Dana is nervous about a renewal</b>
        </span>
        <span className="t-ink">
          <Icon name="chevron" size={16} strokeWidth={2} />
        </span>
      </a>

      {/* Primary Action Button */}
      <button
        className="btn btn--primary btn--block"
        type="button"
        onClick={onBackToDesk}
      >
        Back to my desk
      </button>
    </div>
  );
};
