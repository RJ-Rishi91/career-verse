import React, { useEffect, useRef } from 'react';

interface LockInSheetProps {
  isOpen: boolean;
  clientName: string;
  quoteText: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LockInSheet: React.FC<LockInSheetProps> = ({
  isOpen,
  clientName,
  quoteText,
  onCancel,
  onConfirm
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="presentation"
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-title"
      >
        <div className="sheet__handle" />
        <h2 className="sheet__title" id="lock-title">
          Say this to {clientName.split(' ')[0]}?
        </h2>
        <p className="sheet__quote">“{quoteText}”</p>
        <p className="sheet__warn">
          This reply will shape his trust, the deadline and your career record.{' '}
          <b>Once it’s said, it can’t be taken back.</b>
        </p>
        <div className="sheet__actions">
          <button
            className="btn btn--secondary"
            type="button"
            onClick={onCancel}
          >
            Not yet
          </button>
          <button
            ref={confirmButtonRef}
            className="btn btn--primary"
            type="button"
            onClick={onConfirm}
          >
            Lock it in
          </button>
        </div>
      </div>
    </div>
  );
};
