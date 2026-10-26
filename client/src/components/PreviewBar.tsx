import React from 'react';

export type PreviewMode = 'auto' | 'phone' | 'desktop';

interface PreviewBarProps {
  currentMode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  timeOverride: number | null;
  onTimeChange: (hour: number | null) => void;
  onResetDemo: () => void;
}

export const PreviewBar: React.FC<PreviewBarProps> = ({
  currentMode,
  onModeChange,
  timeOverride,
  onTimeChange,
  onResetDemo
}) => {
  return (
    <div className="proto-bar" role="group" aria-label="Prototype controls">
      <span className="proto-bar__label">Layout</span>
      <button
        type="button"
        className="proto-bar__btn"
        aria-pressed={currentMode === 'auto'}
        onClick={() => onModeChange('auto')}
      >
        Auto
      </button>
      <button
        type="button"
        className="proto-bar__btn"
        aria-pressed={currentMode === 'phone'}
        onClick={() => onModeChange('phone')}
      >
        Phone (390px)
      </button>
      <button
        type="button"
        className="proto-bar__btn"
        aria-pressed={currentMode === 'desktop'}
        onClick={() => onModeChange('desktop')}
      >
        Desktop (1280px)
      </button>

      <span className="proto-bar__sep" aria-hidden="true" />

      <label className="proto-bar__label" htmlFor="time-sel">Time</label>
      <select
        id="time-sel"
        className="proto-bar__select"
        value={timeOverride === null ? 'now' : String(timeOverride)}
        onChange={(e) => {
          const val = e.target.value;
          onTimeChange(val === 'now' ? null : Number(val));
        }}
      >
        <option value="now">Now</option>
        <option value="2">2 AM (Up late)</option>
        <option value="6">6 AM (Early bird)</option>
        <option value="10">10 AM (Morning)</option>
        <option value="13">1 PM (Midday)</option>
        <option value="16">4 PM (Afternoon)</option>
        <option value="20">8 PM (Evening)</option>
        <option value="23">11 PM (Night owl)</option>
      </select>

      <span className="proto-bar__sep" aria-hidden="true" />

      <button
        type="button"
        className="proto-bar__btn"
        onClick={onResetDemo}
      >
        Reset demo
      </button>
    </div>
  );
};
