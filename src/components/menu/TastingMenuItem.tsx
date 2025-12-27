import { motion } from 'framer-motion';
import { toRomanNumeral } from '@/utils';
import { DishPreview } from './DishPreview';
import type { DishDefinition } from '@/types/dishes';

export type MenuItemStatus = 'locked' | 'available' | 'completed';

interface TastingMenuItemProps {
  lessonNumber: number;
  lessonName: string;
  dishName: string;
  status: MenuItemStatus;
  stars: 0 | 1 | 2 | 3;
  isExpanded?: boolean;
  onPress?: () => void;
  reduceMotion?: boolean;
}

/**
 * Star display for menu items - uses ★ for earned, ☆ for unearned
 */
function InlineStarDisplay({ stars }: { stars: 0 | 1 | 2 | 3 }) {
  return (
    <span className="font-body text-sm tracking-wide">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={i <= stars ? 'text-accent-star' : 'text-foundation-500'}
        >
          {i <= stars ? '\u2605' : '\u2606'}
        </span>
      ))}
    </span>
  );
}

export function TastingMenuItem({
  lessonNumber,
  lessonName,
  dishName,
  status,
  stars,
  isExpanded = false,
  onPress,
  reduceMotion = false,
}: TastingMenuItemProps) {
  const romanNumeral = toRomanNumeral(lessonNumber);
  const isLocked = status === 'locked';

  return (
    <motion.button
      onClick={onPress}
      disabled={isLocked}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={!isLocked && !reduceMotion ? { scale: 0.98 } : undefined}
      className={`
        w-full py-4 flex flex-col items-center
        transition-opacity focus:outline-none
        focus-visible:ring-2 focus-visible:ring-copper/50 focus-visible:ring-offset-2
        ${isLocked ? 'opacity-40 cursor-not-allowed' : 'active:opacity-80'}
        ${isExpanded ? 'opacity-100' : ''}
      `}
      aria-disabled={isLocked}
      aria-label={`${lessonName}, ${dishName}${isLocked ? ', locked' : ''}${status === 'completed' ? `, ${stars} stars` : ''}`}
    >
      {/* Fixed-width container for consistent alignment */}
      <div className="w-[320px] flex items-baseline justify-between">
        {/* Left side: Lesson number and names */}
        <div className="flex items-baseline gap-3 text-left">
          {/* Roman numeral */}
          <span
            className={`
              font-display text-base w-10 text-right flex-shrink-0
              ${isLocked ? 'text-text-muted' : 'text-text-tertiary'}
            `}
          >
            {romanNumeral}.
          </span>

          {/* Lesson and dish names */}
          <div>
            <div
              className={`
                font-display text-xl leading-tight
                ${isLocked ? 'text-text-muted' : 'text-text-primary'}
              `}
            >
              {lessonName}
            </div>
            <div
              className={`
                font-display italic text-sm mt-0.5
                ${isLocked ? 'text-text-muted' : 'text-text-tertiary'}
              `}
            >
              {dishName}
            </div>
          </div>
        </div>

        {/* Right side: Status indicator - always show stars */}
        <div className="flex items-center justify-end w-12 flex-shrink-0">
          <InlineStarDisplay stars={status === 'completed' ? stars : 0} />
        </div>
      </div>
    </motion.button>
  );
}

/**
 * Menu divider - centered dot aligned with middle star
 */
export function MenuDivider({ reduceMotion = false }: { reduceMotion?: boolean }) {
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-[320px] flex justify-end py-1"
    >
      {/* w-12 matches the status indicator width, dot is centered within */}
      <span className="w-12 text-center text-text-muted text-xs" aria-hidden="true">
        ·
      </span>
    </motion.div>
  );
}

/**
 * Expanded dish detail card that appears when a lesson is tapped
 */
interface DishDetailCardProps {
  dish?: DishDefinition;
  chefQuote?: string;
  techniques: string[];
  bestScore?: number;
  bestTime?: number;
  onPlate: () => void;
  reduceMotion?: boolean;
}

export function DishDetailCard({
  dish,
  chefQuote,
  techniques,
  bestScore,
  bestTime,
  onPlate,
  reduceMotion = false,
}: DishDetailCardProps) {
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="mx-10 my-4 p-5 bg-foundation-200 rounded-lg border border-foundation-300/50">
        {/* Dish preview */}
        <div className="py-2 mb-2 flex items-center justify-center">
          {dish ? (
            <DishPreview dish={dish} size={88} />
          ) : (
            <div className="h-20 w-20 bg-foundation-300/30 rounded-full flex items-center justify-center">
              <span className="text-text-muted text-xs font-body">Preview</span>
            </div>
          )}
        </div>

        {/* Decorative rule */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-px bg-foundation-500" />
        </div>

        {/* Chef quote */}
        {chefQuote && (
          <p className="font-display italic text-sm text-text-secondary text-center mb-4 px-2">
            "{chefQuote}"
          </p>
        )}

        {/* Techniques */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <span className="text-xs text-text-muted font-body">Techniques:</span>
          {techniques.map((tech, idx) => (
            <span key={tech}>
              <span className="text-xs text-text-tertiary font-body">{tech}</span>
              {idx < techniques.length - 1 && (
                <span className="text-xs text-text-muted mx-1">·</span>
              )}
            </span>
          ))}
        </div>

        {/* Best score and time (if completed) */}
        {(bestScore !== undefined || bestTime !== undefined) && (
          <div className="flex justify-center gap-8 mb-4 text-xs font-body text-text-tertiary">
            {bestScore !== undefined && <span>Best: {bestScore}</span>}
            {bestTime !== undefined && (
              <span>Time: {Math.floor(bestTime / 60)}:{String(bestTime % 60).padStart(2, '0')}</span>
            )}
          </div>
        )}

        {/* Plate button */}
        <motion.button
          onClick={onPlate}
          whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="
            w-full py-3.5 rounded-xl
            bg-gradient-to-b from-copper to-[#9A5F2A]
            text-white
            font-display text-sm tracking-[0.15em] uppercase
            border border-[#A86830]/30
            shadow-[0_3px_12px_rgba(184,115,51,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]
            transition-all duration-300 ease-out
            hover:shadow-[0_5px_20px_rgba(184,115,51,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]
            hover:from-[#C4813D] hover:to-[#A86830]
            active:shadow-[0_2px_6px_rgba(184,115,51,0.2),inset_0_2px_4px_rgba(0,0,0,0.1)]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/50 focus-visible:ring-offset-2
          "
        >
          Plate
        </motion.button>
      </div>
    </motion.div>
  );
}
