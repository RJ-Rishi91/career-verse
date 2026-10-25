import React from 'react';
import { LottiePlayer } from './LottiePlayer.js';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="toast" role="status">
      <span className="toast__anim">
        <LottiePlayer name="success-check" style={{ width: 24, height: 24 }} />
      </span>
      <span>{message}</span>
    </div>
  );
};
