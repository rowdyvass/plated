import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { audioManager } from '@/audio';

type TimerPhase = 'normal' | 'warning' | 'critical';

// Color values for smooth transitions
const PHASE_COLORS = {
  normal: { bar: '#B87333', text: '#5C5C5C' },
  warning: { bar: '#B8860B', text: '#B8860B' },
  critical: { bar: '#8B4049', text: '#8B4049' },
} as const;

function getTimerPhase(timeRemaining: number, maxTime: number): TimerPhase {
  if (maxTime === 0) return 'normal';
  const ratio = timeRemaining / maxTime;
  if (ratio <= 0.25) return 'critical';
  if (ratio <= 0.5) return 'warning';
  return 'normal';
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface TimerBarProps {
  timeRemaining: number;
  maxTime: number;
  phase: TimerPhase;
}

function TimerBar({ timeRemaining, maxTime, phase }: TimerBarProps) {
  const fillPercent = maxTime > 0 ? (timeRemaining / maxTime) * 100 : 0;
  const isCritical = phase === 'critical';

  return (
    <div className="w-full h-[3px] bg-foundation-300 overflow-hidden rounded-full">
      <motion.div
        className="h-full origin-left rounded-full"
        initial={{ width: '100%' }}
        animate={{
          width: `${fillPercent}%`,
          backgroundColor: PHASE_COLORS[phase].bar,
          opacity: isCritical ? [0.75, 1, 0.75] : 1,
        }}
        transition={{
          width: { duration: 0.1, ease: 'linear' },
          backgroundColor: { duration: 0.5, ease: 'easeInOut' },
          opacity: isCritical
            ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 },
        }}
      />

      {/* Glow effect for critical phase */}
      <AnimatePresence>
        {isCritical && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-state-error/20 blur-sm rounded-full"
            style={{ width: `${fillPercent}%` }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface TimerClockProps {
  timeRemaining: number;
  phase: TimerPhase;
}

function TimerClock({ timeRemaining, phase }: TimerClockProps) {
  const isUrgent = timeRemaining <= 10 && timeRemaining > 0;
  const isFinalSeconds = timeRemaining <= 5 && timeRemaining > 0;

  return (
    <motion.span
      className="font-body text-2xl tabular-nums"
      style={{ fontVariantNumeric: 'tabular-nums' }}
      animate={{
        color: PHASE_COLORS[phase].text,
        scale: isUrgent ? [1, 1.05, 1] : 1,
      }}
      transition={{
        color: { duration: 0.5, ease: 'easeInOut' },
        scale: isUrgent
          ? {
              duration: isFinalSeconds ? 0.3 : 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : { duration: 0.2 },
      }}
    >
      {formatTime(timeRemaining)}

      {/* Pulse ring for final seconds */}
      <AnimatePresence>
        {isFinalSeconds && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.5, 0, 0.5],
              scale: [1, 1.3, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className="absolute inset-0 border-2 border-state-error/30 rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.span>
  );
}

export function Timer() {
  const { timeRemaining, maxTime, timerState } = useGameStore();
  const prevPhaseRef = useRef<TimerPhase>('normal');

  // Don't render if timer hasn't started
  const phase = timerState !== 'idle' ? getTimerPhase(timeRemaining, maxTime) : 'normal';

  // Play warning sound when entering critical phase
  useEffect(() => {
    if (timerState === 'running' && phase === 'critical' && prevPhaseRef.current !== 'critical') {
      audioManager.play('timer_warning');
    }
    prevPhaseRef.current = phase;
  }, [phase, timerState]);

  if (timerState === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full relative"
      role="timer"
      aria-label={`${Math.floor(timeRemaining)} seconds remaining`}
      aria-live="off"
    >
      <TimerBar timeRemaining={timeRemaining} maxTime={maxTime} phase={phase} />
    </motion.div>
  );
}

export function TimerClock_Standalone() {
  const { timeRemaining, maxTime, timerState } = useGameStore();

  if (timerState === 'idle') return null;

  const phase = getTimerPhase(timeRemaining, maxTime);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative inline-flex items-center justify-center"
    >
      <TimerClock timeRemaining={timeRemaining} phase={phase} />
    </motion.div>
  );
}
