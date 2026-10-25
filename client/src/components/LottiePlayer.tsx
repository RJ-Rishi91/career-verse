import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web/build/player/lottie_light';

import savingDotsData from '../assets/lottie/saving-dots.json';
import successCheckData from '../assets/lottie/success-check.json';
import callPulseData from '../assets/lottie/call-pulse.json';
import badgeBurstData from '../assets/lottie/badge-burst.json';
import confettiData from '../assets/lottie/confetti.json';
import xpSparkData from '../assets/lottie/xp-spark.json';

const ANIM_MAP: Record<string, any> = {
  'saving-dots': savingDotsData,
  'success-check': successCheckData,
  'call-pulse': callPulseData,
  'badge-burst': badgeBurstData,
  'confetti': confettiData,
  'xp-spark': xpSparkData
};

export type LottieAnimationName = 'saving-dots' | 'success-check' | 'call-pulse' | 'badge-burst' | 'confetti' | 'xp-spark';

interface LottiePlayerProps {
  name: LottieAnimationName;
  loop?: boolean;
  autoplay?: boolean;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({
  name,
  loop = false,
  autoplay = true,
  delay = 0,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const animationData = ANIM_MAP[name];
    if (!animationData) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    animRef.current?.destroy();

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: loop && !reduceMotion,
      autoplay: autoplay && !reduceMotion && delay === 0,
      animationData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet'
      }
    });

    animRef.current = anim;

    if (reduceMotion) {
      anim.addEventListener('DOMLoaded', () => {
        anim.goToAndStop(loop ? 0 : (animationData.op || 1) - 1, true);
      });
    } else if (delay > 0 && autoplay) {
      const timer = setTimeout(() => {
        anim.play();
      }, delay);
      return () => {
        clearTimeout(timer);
        anim.destroy();
      };
    }

    return () => {
      anim.destroy();
    };
  }, [name, loop, autoplay, delay]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ display: 'inline-block', ...style }}
      aria-hidden="true"
    />
  );
};
