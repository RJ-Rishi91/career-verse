import React from 'react';

export type PreviewMode = 'auto' | 'phone' | 'desktop';

interface PreviewBarProps {
  currentMode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  onResetDemo: () => void;
}

export const PreviewBar: React.FC<PreviewBarProps> = ({
  currentMode,
  onModeChange,
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
