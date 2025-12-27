import { useMemo, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TutorialHint } from './TutorialHint';
import { useIsTouchDevice } from '@/hooks';

type GestureType = 'place' | 'swoosh' | 'dot' | 'scatter' | 'drizzle' | 'quenelle' | 'tweeze' | 'dust';
type TutorialPhase = 'intro' | 'demo' | 'practice' | 'evaluate' | 'complete';

interface GestureHints {
  pickup: string;
  action: string;
  release: string;
}

// Gesture-specific hints for touch devices
const touchGestureHints: Record<GestureType, GestureHints> = {
  place: {
    pickup: 'Drag the ingredient',
    action: 'Move to the dashed outline',
    release: 'Release to place',
  },
  swoosh: {
    pickup: 'Touch and swipe in one motion',
    action: 'Follow the curved path smoothly',
    release: 'Lift to finish',
  },
  dot: {
    pickup: 'Tap where you see circles',
    action: '',
    release: '',
  },
  scatter: {
    pickup: 'Flick outward to scatter',
    action: 'Aim for the shaded area',
    release: '',
  },
  quenelle: {
    pickup: 'Drag in an arc motion',
    action: 'Pause briefly at the top',
    release: 'Release to place the quenelle',
  },
  drizzle: {
    pickup: 'Touch and draw continuously',
    action: 'Follow the path without lifting',
    release: 'Lift to finish',
  },
  tweeze: {
    pickup: 'Touch and hold to grip',
    action: 'Drag carefully to position',
    release: 'Release to place precisely',
  },
  dust: {
    pickup: 'Swipe across the area',
    action: 'Cover the shaded zone evenly',
    release: '',
  },
};

// Gesture-specific hints for desktop
const desktopGestureHints: Record<GestureType, GestureHints> = {
  place: {
    pickup: 'Click and drag the ingredient',
    action: 'Move to the dashed outline',
    release: 'Release to place',
  },
  swoosh: {
    pickup: 'Click and drag in one motion',
    action: 'Follow the curved path smoothly',
    release: 'Release to finish',
  },
  dot: {
    pickup: 'Click where you see circles',
    action: '',
    release: '',
  },
  scatter: {
    pickup: 'Click, drag, and release quickly',
    action: 'Aim for the shaded area',
    release: '',
  },
  quenelle: {
    pickup: 'Click and drag in an arc',
    action: 'Pause briefly at the top',
    release: 'Release to place the quenelle',
  },
  drizzle: {
    pickup: 'Click and draw continuously',
    action: 'Follow the path without releasing',
    release: 'Release to finish',
  },
  tweeze: {
    pickup: 'Click and hold to grip',
    action: 'Drag carefully to position',
    release: 'Release to place precisely',
  },
  dust: {
    pickup: 'Click and drag across the area',
    action: 'Cover the shaded zone evenly',
    release: '',
  },
};

interface TutorialManagerProps {
  gesture: GestureType;
  phase: TutorialPhase;
  isDragging: boolean;
  isOverTarget: boolean;
  enabled: boolean;
  children?: ReactNode;
}

export function TutorialManager({
  gesture,
  phase,
  isDragging,
  isOverTarget,
  enabled,
  children,
}: TutorialManagerProps) {
  const isTouchDevice = useIsTouchDevice();
  const hints = isTouchDevice ? touchGestureHints[gesture] : desktopGestureHints[gesture];

  const currentHint = useMemo(() => {
    if (!enabled) return null;
    if (phase === 'complete') return null;

    if (phase === 'demo') {
      return 'Watch the demonstration';
    }

    if (phase === 'practice' || phase === 'evaluate') {
      // For dot gesture, always show pickup hint
      if (gesture === 'dot') {
        return hints.pickup;
      }

      // For scatter and dust, show action hint when selected
      if (gesture === 'scatter' || gesture === 'dust') {
        if (!isDragging) return hints.pickup;
        return hints.action || null;
      }

      // Standard flow: pickup -> action -> release
      if (!isDragging) return hints.pickup;
      if (isDragging && !isOverTarget && hints.action) return hints.action;
      if (isDragging && isOverTarget && hints.release) return hints.release;
    }

    return null;
  }, [enabled, phase, isDragging, isOverTarget, hints, gesture]);

  // Determine hint position based on state
  // Always show above dish for cleaner look
  const hintPosition = 'above-dish' as const;

  return (
    <>
      {children}
      <AnimatePresence>
        {currentHint && (
          <TutorialHint
            text={currentHint}
            position={hintPosition}
            arrow="none"
            visible={true}
          />
        )}
      </AnimatePresence>
    </>
  );
}
