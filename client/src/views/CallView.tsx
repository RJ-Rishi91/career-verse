import React, { useState } from 'react';
import { CallState, Client, Scenario } from '../types/index.js';
import { Portrait } from '../components/Portraits.js';
import { RelationshipMeter } from '../components/RelationshipMeter.js';
import { LockInSheet } from '../components/LockInSheet.js';
import { LottiePlayer } from '../components/LottiePlayer.js';
import { Icon } from '../components/Icons.js';

interface CallViewProps {
  callState: CallState;
  client: Client;
  scenario: Scenario;
  onNextOption: () => void;
  onCommitOption: (optionId: string, optionIndex: number) => void;
  onContinue: () => void;
  isSaving: boolean;
}

export const CallView: React.FC<CallViewProps> = ({
  callState,
  client,
  scenario,
  onNextOption,
  onCommitOption,
  onContinue,
  isSaving
}) => {
  const [isLockInOpen, setIsLockInOpen] = useState(false);

  const node = scenario.nodes[callState.nodeId];
  const optionCount = callState.optionCount || node?.options?.length || 1;
  const currentOption = callState.visibleOption;
  const isLastOption = callState.optionIndex >= optionCount - 1;

  const reacted = callState.phase === 'reacted';
  const saving = isSaving || callState.phase === 'saving';
  const lastChoice = callState.lastChoice;

  const handleSayClick = () => {
    if (!currentOption) return;
    if (callState.consequential) {
      setIsLockInOpen(true);
    } else {
      onCommitOption(currentOption.optionId, callState.optionIndex);
    }
  };

  const handleLockInConfirm = () => {
    setIsLockInOpen(false);
    if (currentOption) {
      onCommitOption(currentOption.optionId, callState.optionIndex);
    }
  };

  // Deltas for reacted state
  const lastEffects = lastChoice?.option.effects || { trust: 0, respect: 0, anger: 0 };
  const stageTint = reacted
    ? (lastChoice?.option.face === 'relieved' ? 'mint' : lastChoice?.option.face === 'frustrated' ? 'coral' : client.tint)
    : client.tint;

  const decisionNumber = callState.choicesCount + (reacted ? 0 : 1);
  const isCallEnding = lastChoice?.option.next === 'end';

  return (
    <div className="call view-enter">
      {/* Mobile Collapsible Brief */}
      <details className="brief-m">
        <summary>
          Call brief <Icon name="chevron" size={16} />
        </summary>
        <div className="brief-m__body">
          <div>{scenario.goal}</div>
          <div className="known">
            {scenario.known.map((k, i) => (
              <div key={i}>
                <span>{k.time}</span>
                <span>{k.text}</span>
              </div>
            ))}
          </div>
        </div>
      </details>

      {/* Desktop Left Column: Call Brief */}
      <aside className="call__brief" aria-label="Call brief">
        <section className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              className="avatar avatar--44"
              style={{ background: '#DCE8FF', color: '#1F3F8F' }}
            >
              {client.initials}
            </span>
            <span>
              <b style={{ display: 'block', fontSize: 15 }}>{client.name}</b>
              <span className="muted" style={{ fontSize: 12 }}>
                {client.role.split(',')[0]}
              </span>
            </span>
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Call goal</div>
          <div style={{ fontSize: 15, lineHeight: 1.45 }}>{scenario.goal}</div>
        </section>

        <section className="panel">
          <h2 className="panel__title">What you know</h2>
          <div className="known">
            {scenario.known.map((k, i) => (
              <div key={i}>
                <span>{k.time}</span>
                <span>{k.text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel panel--white">
          <div className="muted" style={{ fontSize: 12 }}>How he likes to be told</div>
          <div style={{ fontSize: 15, lineHeight: 1.45 }}>
            {client.prefs.slice(0, 2).join('. ')}.
          </div>
        </section>
      </aside>

      {/* Stage: Client Portrait & Reactive Tint */}
      <div className={`stage tint-${stageTint}`}>
        <Portrait client={client} mood={callState.expression} />
        <div className="stage__meters">
          <RelationshipMeter
            label="Trust"
            value={callState.meters.trust}
            delta={reacted ? lastEffects.trust : 0}
            goodWhenIncreased={true}
            color="var(--accent)"
          />
          <RelationshipMeter
            label="Respect"
            value={callState.meters.respect}
            delta={reacted ? lastEffects.respect : 0}
            goodWhenIncreased={true}
            color="var(--ink)"
          />
          <RelationshipMeter
            label="Anger"
            value={callState.meters.anger}
            delta={reacted ? lastEffects.anger : 0}
            goodWhenIncreased={false}
            color="var(--anger)"
          />
        </div>
      </div>

      {/* Floating Line Bubble */}
      <div className="line">
        <div className="line__who">{client.name.split(' ')[0]}</div>
        <p className="line__text">
          {reacted ? lastChoice?.option.reaction : node?.line}
        </p>
      </div>

      {/* Choice Panel */}
      {reacted ? (
        <div className="choice">
          <div className="muted" style={{ fontSize: 12 }}>You said</div>
          <p className="choice__said">“{lastChoice?.option.text}”</p>
          <div className="deltas">
            {lastEffects.trust !== 0 && (
              <span className={`pill ${lastEffects.trust > 0 ? 'pill--ok' : 'pill--risk'}`}>
                Trust {lastEffects.trust > 0 ? `+${lastEffects.trust}` : lastEffects.trust}
              </span>
            )}
            {lastEffects.respect !== 0 && (
              <span className={`pill ${lastEffects.respect > 0 ? 'pill--ok' : 'pill--risk'}`}>
                Respect {lastEffects.respect > 0 ? `+${lastEffects.respect}` : lastEffects.respect}
              </span>
            )}
            {lastEffects.anger !== 0 && (
              <span className={`pill ${lastEffects.anger < 0 ? 'pill--ok' : 'pill--risk'}`}>
                Anger {lastEffects.anger > 0 ? `+${lastEffects.anger}` : lastEffects.anger}
              </span>
            )}
          </div>
          <button
            className="btn btn--primary btn--block"
            type="button"
            onClick={onContinue}
          >
            {isCallEnding ? 'See how you did' : 'Continue the call'}{' '}
            <Icon name="arrow" size={16} strokeWidth={2} />
          </button>
        </div>
      ) : saving ? (
        <div className="choice" aria-busy="true">
          <div className="notice">
            <LottiePlayer
              name="saving-dots"
              loop
              style={{ width: 30, height: 10, marginRight: 8 }}
            />
            Saving your reply. Choices are paused until the server confirms.
          </div>
          {currentOption && (
            <p className="choice__said">“{currentOption.text}”</p>
          )}
        </div>
      ) : (
        <div className="choice">
          <div className="choice__head">
            <span>
              Your reply · option <b>{callState.optionIndex + 1}</b> of {optionCount}
            </span>
            <span className="pips" aria-hidden="true">
              {Array.from({ length: optionCount }, (_, i) => (
                <span
                  key={i}
                  className={`pip ${
                    i < callState.optionIndex
                      ? 'is-past'
                      : i === callState.optionIndex
                      ? 'is-now'
                      : ''
                  }`}
                />
              ))}
            </span>
          </div>
          <p className="choice__text">“{currentOption?.text}”</p>
          <div className="choice__actions">
            <p className="choice__hint">
              {isLastOption
                ? 'You’ve passed the other replies. This is the one you have left.'
                : 'Skipped replies don’t come back.'}
            </p>
            <button
              className="btn btn--secondary"
              type="button"
              disabled={isLastOption}
              onClick={onNextOption}
            >
              {isLastOption ? 'Last option' : 'Next option'}
            </button>
            <button
              className="btn btn--primary"
              type="button"
              onClick={handleSayClick}
            >
              Say this
            </button>
          </div>
        </div>
      )}

      {/* Desktop Right Column: Relationship & Progress */}
      <aside className="call__side" aria-label="Relationship">
        <section className="panel" style={{ gap: 16 }}>
          <h2 className="panel__title">Relationship</h2>
          <RelationshipMeter
            label="Trust"
            value={callState.meters.trust}
            delta={reacted ? lastEffects.trust : 0}
            goodWhenIncreased={true}
            color="var(--accent)"
          />
          <RelationshipMeter
            label="Respect"
            value={callState.meters.respect}
            delta={reacted ? lastEffects.respect : 0}
            goodWhenIncreased={true}
            color="var(--ink)"
          />
          <RelationshipMeter
            label="Anger"
            value={callState.meters.anger}
            delta={reacted ? lastEffects.anger : 0}
            goodWhenIncreased={false}
            color="var(--anger)"
          />
        </section>

        <section className="panel">
          <h2 className="panel__title">Call progress</h2>
          <div className="num" style={{ fontSize: 14 }}>
            Decision {decisionNumber} of 2
          </div>
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
            Each reply you say is final. Skipped replies don’t come back.
          </div>
        </section>
      </aside>

      {/* Consequential Lock-in Confirmation Sheet / Modal */}
      <LockInSheet
        isOpen={isLockInOpen}
        clientName={client.name}
        quoteText={currentOption?.text || ''}
        onCancel={() => setIsLockInOpen(false)}
        onConfirm={handleLockInConfirm}
      />
    </div>
  );
};
