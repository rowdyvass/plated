import { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IngredientPreview } from './IngredientPreview';
import { cn } from '@/utils';

type GestureType = 'place' | 'swoosh' | 'dot' | 'scatter' | 'drizzle' | 'quenelle' | 'tweeze';

type TrayStyle = 'wood' | 'slate' | 'white';

interface IngredientTrayProps {
  ingredient: { id: string; name: string } | null;
  isDragging: boolean;
  isSelected?: boolean;
  gestureType?: GestureType;
  remainingCount?: number;
  totalCount?: number;
  trayStyle?: TrayStyle;
  onDragStart?: (clientX: number, clientY: number) => void;
  onDragMove?: (clientX: number, clientY: number) => void;
  onDragEnd?: (clientX: number, clientY: number) => void;
  onSelect?: () => void;
}

// Tray animation variants
const trayVariants = {
  initial: {
    opacity: 0,
    x: -100,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -100,
  },
};

// Subtle float animation for the ingredient
const floatAnimation = {
  y: [0, -2, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

// Tray surface styles
const trayStyles: Record<TrayStyle, string> = {
  wood: 'bg-gradient-to-b from-[#8B7355] to-[#6B5344] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.2)]',
  slate: 'bg-gradient-to-b from-[#4A4A4A] to-[#3A3A3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.3)]',
  white: 'bg-[#FEFEFA] border border-foundation-400/30 shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
};

export function IngredientTray({
  ingredient,
  isDragging,
  isSelected = false,
  gestureType = 'place',
  remainingCount,
  totalCount,
  trayStyle = 'white',
  onDragStart,
  onDragMove,
  onDragEnd,
  onSelect,
}: IngredientTrayProps) {
  const isDraggingRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!ingredient) return;

    // Gesture types that use tap-to-select mode
    const tapToSelectGestures: GestureType[] = ['swoosh', 'dot', 'scatter', 'drizzle', 'quenelle', 'tweeze'];

    if (tapToSelectGestures.includes(gestureType)) {
      e.preventDefault();
      e.stopPropagation();
      onSelect?.();
      return;
    }

    // Regular place gesture - drag behavior
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    onDragStart?.(e.clientX, e.clientY);
  }, [ingredient, gestureType, onDragStart, onSelect]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    onDragMove?.(e.clientX, e.clientY);
  }, [onDragMove]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    if (!isDraggingRef.current) return;

    e.currentTarget.releasePointerCapture(e.pointerId);
    isDraggingRef.current = false;
    onDragEnd?.(e.clientX, e.clientY);
  }, [onDragEnd]);

  // Calculate display count
  const showCount = remainingCount !== undefined && totalCount !== undefined && totalCount > 1;

  return (
    <AnimatePresence mode="wait">
      {ingredient && (
        <motion.div
          key={ingredient.id}
          variants={trayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 select-none touch-none z-10"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Tray surface */}
          <motion.div
            animate={{
              scale: isDragging ? 0.95 : 1,
              opacity: isDragging ? 0.7 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            className="relative"
          >
            {/* Main tray */}
            <div
              className={cn(
                'w-20 h-[72px] rounded flex items-center justify-center relative',
                trayStyles[trayStyle],
                isSelected && 'ring-2 ring-copper/50'
              )}
            >
              {/* Ingredient visual */}
              <motion.div
                className="cursor-grab active:cursor-grabbing"
                animate={!isDragging ? floatAnimation : undefined}
              >
                <IngredientPreview
                  ingredientId={ingredient.id}
                  size={48}
                  className="pointer-events-none"
                />
              </motion.div>

              {/* Count badge */}
              {showCount && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-copper text-white text-xs font-body font-medium flex items-center justify-center shadow-md"
                >
                  {remainingCount}
                </motion.div>
              )}

              {/* Selected indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 20,
                    }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-copper rounded-full"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Subtle bottom shadow */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute -bottom-1 left-2 right-2 h-2 bg-foundation-400/20 rounded-full blur-sm"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
