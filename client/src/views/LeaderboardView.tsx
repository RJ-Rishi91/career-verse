import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types/index.js';
import { ApiService } from '../services/api.js';

interface LeaderboardViewProps {
  onBackToDesk?: () => void;
  showToast: (msg: string) => void;
}

const KUDOS_TYPES = [
  'Clear communicator',
  'Great judgment',
  'Calm under pressure',
  'Inspiring streak',
  'Rising star',
  'Helpful example'
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ showToast }) => {
  const [period, setPeriod] = useState<string>('weekly');
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [optIn, setOptIn] = useState<boolean>(false);
  const [kudosSent, setKudosSent] = useState<Record<string, string>>({});
  const [kudosPickHandle, setKudosPickHandle] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await ApiService.getLeaderboard(period);
      setRows(data);
      const career = await ApiService.getCareer();
      setOptIn(career.lbOptIn);
      setKudosSent(career.kudosSent || {});
    };
    load();
  }, [period]);

  const top30 = rows.filter(r => !r.me).slice(0, 30);
  const me = rows.find(r => r.me);
  const kudosLeft = Math.max(0, 3 - Object.keys(kudosSent).length);

  const handleJoin = async () => {
    await ApiService.setLeaderboardOptIn(true);
    setOptIn(true);
    showToast('Joined leaderboard as Alex K.');
  };

  const handleSendKudos = async (type: string) => {
    if (!kudosPickHandle) return;
    try {
      const updated = await ApiService.sendKudos(kudosPickHandle, type);
      setKudosSent(updated);
      showToast(`Sent "${type}" kudos to ${kudosPickHandle}`);
    } catch (e: any) {
      showToast(e.message || 'Could not send kudos');
    } finally {
      setKudosPickHandle(null);
    }
  };

  const avatarColors = ['#DCE8FF', '#FFE3DA', '#D6F3E6', '#E8F4CC', '#FCE1EA', '#D6F0FA'];

  const renderRow = (r: LeaderboardEntry) => (
    <div
      key={r.handle}
      className={`lb-row ${r.me ? 'is-me' : ''}`}
      aria-current={r.me ? 'true' : undefined}
    >
      <span className={`lb-rank num ${r.rank <= 3 ? 'is-podium' : ''}`}>
        {r.rank}
      </span>
      <span
        className="avatar avatar--38"
        style={{
          background: avatarColors[r.rank % avatarColors.length],
          color: '#14161C'
        }}
      >
        {r.handle.split(' ').map(x => x[0]).join('')}
      </span>
      <span className="row__body">
        <b>
          {r.handle}
          {r.me && ' (you)'}
          {r.topVoice && (
            <span className="pill pill--watch lb-tv">Top Voice</span>
          )}
        </b>
        <span>
          {r.title} · {r.badge}
        </span>
      </span>
      <span className="lb-pts num">
        {r.points.toLocaleString()} <small>CP</small>
      </span>

      {r.me ? (
        <span style={{ width: 84 }} />
      ) : optIn ? (
        kudosSent[r.handle] ? (
          <span
            className="pill pill--ok lb-kudos"
            title={kudosSent[r.handle]}
          >
            Sent
          </span>
        ) : (
          <button
            className="btn btn--secondary lb-kudos"
            type="button"
            disabled={kudosLeft <= 0}
            onClick={() => setKudosPickHandle(r.handle)}
          >
            Kudos
          </button>
        )
      ) : (
        <span style={{ width: 84 }} />
      )}
    </div>
  );

  return (
    <div className="lb view-enter">
      <div>
        <h1 className="h-display">Top 30</h1>
        <p className="h-sub">
          Career Points reward quality: communication and business scores, with a daily cap so grinding doesn't win.
        </p>
      </div>

      {!optIn && (
        <section className="panel tint-butter">
          <h2 className="panel__title t-ink">Join the leaderboard</h2>
          <p className="t-ink" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
            Show your rank as <b>Alex K.</b> with your title and top badge. Your email and full name are never shown. You can leave any time.
          </p>
          <div>
            <button className="btn btn--primary" type="button" onClick={handleJoin}>
              Join as Alex K.
            </button>
          </div>
        </section>
      )}

      {/* 3 Periods Tabs */}
      <div className="tabs tabs--3" role="tablist" aria-label="Period">
        <button
          type="button"
          role="tab"
          aria-selected={period === 'weekly'}
          onClick={() => setPeriod('weekly')}
        >
          This week
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={period === 'monthly'}
          onClick={() => setPeriod('monthly')}
        >
          This month
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={period === 'all_time'}
          onClick={() => setPeriod('all_time')}
        >
          All time
        </button>
      </div>

      {/* Your position panel if opted in */}
      {optIn && me && (
        <section className="panel lb-me">
          <div className="panel__head">
            <h2 className="panel__title">Your position</h2>
            <span className="panel__link">
              {me.rank <= 30
                ? 'In the top 30'
                : top30[29]
                ? `${top30[29].points - me.points + 1} CP to reach #30`
                : 'Ranked'}
            </span>
          </div>
          {renderRow(me)}
        </section>
      )}

      {/* Top 30 List */}
      <section className="panel" aria-label="Top 30" style={{ gap: 6 }}>
        {top30.map(renderRow)}
      </section>

      <p className="muted" style={{ fontSize: 12, margin: 0 }}>
        Weekly board resets Monday 00:00 UTC. Kudos: 3 a day, one per person per week, preset types only.
      </p>

      {/* Kudos Picker Modal */}
      {kudosPickHandle && (
        <div
          className="scrim"
          onClick={(e) => {
            if (e.target === e.currentTarget) setKudosPickHandle(null);
          }}
          role="presentation"
        >
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="kudos-title">
            <div className="sheet__handle" />
            <h2 className="sheet__title" id="kudos-title">
              Kudos for {kudosPickHandle}
            </h2>
            <p className="sheet__warn">
              Pick one. No messages, just recognition. {kudosLeft} left today.
            </p>
            <div className="chips">
              {KUDOS_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className="chip"
                  style={{ cursor: 'pointer', minHeight: 44 }}
                  onClick={() => handleSendKudos(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="sheet__actions">
              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => setKudosPickHandle(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
