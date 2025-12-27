import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

type HintPosition = 'above-dish' | 'above-tray' | 'near-ghost' | 'center' | 'custom';
type ArrowDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface TutorialHintProps {
  text: string;
  position: HintPosition;
  customPosition?: { x: number; y: number };
  arrow?: ArrowDirection;
  visible: boolean;
}

// Arrow positioning styles
const arrowStyles: Record<Exclude<ArrowDirection, 'none'>, string> = {
  up: '-top-1 left-1/2 -translate-x-1/2 border-l border-t',
  down: '-bottom-1 left-1/2 -translate-x-1/2 border-r border-b',
  left: 'top-1/2 -left-1 -translate-y-1/2 border-l border-b',
  right: 'top-1/2 -right-1 -translate-y-1/2 border-r border-t',
};

// Position styles for fixed positions
const positionStyles: Record<Exclude<HintPosition, 'custom'>, string> = {
  'above-dish': 'fixed top-24 left-1/2 -translate-x-1/2',
  'above-tray': 'fixed bottom-28 left-4',
  'near-ghost': 'absolute', // Positioned via customPosition
  'center': 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

export function TutorialHint({
  text,
  position,
  customPosition,
  arrow = 'none',
  visible,
}: TutorialHintProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn(
            position === 'custom' ? 'absolute' : positionStyles[position],
            'bg-foundation-100/95 backdrop-blur-sm',
            'px-4 py-2 rounded-lg',
            'shadow-lg border border-foundation-400/50',
            'font-body text-sm text-text-secondary',
            'pointer-events-none z-30',
            'whitespace-nowrap'
          )}
          style={
            position === 'custom' && customPosition
              ? { left: customPosition.x, top: customPosition.y }
              : undefined
          }
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        >
          {/* Arrow indicator */}
          {arrow !== 'none' && (
            <div
              className={cn(
                'absolute w-2 h-2 bg-foundation-100 border-foundation-400/50 rotate-45',
                arrowStyles[arrow]
              )}
            />
          )}

          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
