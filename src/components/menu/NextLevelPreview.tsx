import { motion } from 'framer-motion';
import { DishPreview } from './DishPreview';
import { toRomanNumeral } from '@/utils';
import type { DishDefinition } from '@/types/dishes';

interface NextLevelPreviewProps {
  dish: DishDefinition;
  lessonNumber?: number;
  lessonName: string;
  dishNameFrench: string;
  chefQuote?: string;
  techniques: string[];
  isFinalExam?: boolean;
  onStart: () => void;
  onMenu: () => void;
  reduceMotion?: boolean;
}

/**
 * Preview card shown after completing a level to introduce the next one
 */
export function NextLevelPreview({
  dish,
  lessonNumber,
  lessonName,
  dishNameFrench,
  chefQuote,
  techniques,
  isFinalExam = false,
  onStart,
  onMenu,
  reduceMotion = false,
}: NextLevelPreviewProps) {
  const baseDelay = 0.2;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Card container */}
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: baseDelay }}
        className="bg-foundation-200 rounded-2xl border border-foundation-300/50 overflow-hidden"
      >
        {/* Header */}
        <div className="pt-6 pb-4 px-6 text-center">
          {/* Next Lesson label */}
          <motion.p
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay + 0.1 }}
            className="font-display text-xs tracking-[0.15em] text-text-muted uppercase mb-3"
          >
            {isFinalExam ? 'Final Exam' : 'Next Lesson'}
          </motion.p>

          {/* Lesson number and name */}
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: baseDelay + 0.2 }}
          >
            {lessonNumber && !isFinalExam && (
              <span className="font-display text-sm text-text-tertiary mr-2">
                {toRomanNumeral(lessonNumber)}.
              </span>
            )}
            <span className="font-display text-2xl text-text-primary">
              {lessonName}
            </span>
          </motion.div>

          {/* French dish name */}
          <motion.p
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay + 0.3 }}
            className="font-display italic text-sm text-text-tertiary mt-1"
          >
            {dishNameFrench}
          </motion.p>
        </div>

        {/* Decorative rule */}
        <motion.div
          initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: baseDelay + 0.35, duration: 0.4 }}
          className="mx-auto w-16 h-px bg-foundation-500 origin-center"
        />

        {/* Dish preview */}
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: baseDelay + 0.4, duration: 0.4 }}
          className="py-6 flex justify-center"
        >
          <DishPreview dish={dish} size={120} />
        </motion.div>

        {/* Decorative rule */}
        <motion.div
          initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: baseDelay + 0.5, duration: 0.4 }}
          className="mx-auto w-16 h-px bg-foundation-500 origin-center"
        />

        {/* Chef quote */}
        {chefQuote && (
          <motion.p
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay + 0.6 }}
            className="px-8 py-4 font-display italic text-sm text-text-secondary text-center"
          >
            "{chefQuote}"
          </motion.p>
        )}

        {/* Techniques */}
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: baseDelay + 0.7 }}
          className="px-6 pb-6 flex flex-wrap justify-center gap-3"
        >
          <span className="text-xs text-text-muted font-body">Techniques:</span>
          {techniques.map((tech, idx) => (
            <span key={tech}>
              <span className="text-xs text-text-tertiary font-body">{tech}</span>
              {idx < techniques.length - 1 && (
                <span className="text-xs text-text-muted mx-2">·</span>
              )}
            </span>
          ))}
        </motion.div>

        {/* Start button */}
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: baseDelay + 0.8 }}
          className="px-6 pb-6"
        >
          <motion.button
            onClick={onStart}
            whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="
              w-full py-4 rounded-xl
              bg-gradient-to-b from-copper to-[#9A5F2A]
              text-white
              font-display text-sm tracking-[0.15em] uppercase
              border border-[#A86830]/30
              shadow-[0_4px_16px_rgba(184,115,51,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
              transition-all duration-300 ease-out
              hover:shadow-[0_6px_24px_rgba(184,115,51,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
              hover:from-[#C4813D] hover:to-[#A86830]
              active:shadow-[0_2px_8px_rgba(184,115,51,0.25),inset_0_2px_4px_rgba(0,0,0,0.1)]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/50 focus-visible:ring-offset-2
            "
          >
            {isFinalExam ? 'Begin' : 'Start'}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Menu link */}
      <motion.button
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: baseDelay + 0.9 }}
        onClick={onMenu}
        className="w-full mt-4 py-2 font-body text-sm text-text-secondary hover:text-text-primary transition-colors uppercase tracking-widest text-center"
      >
        Menu
      </motion.button>
    </div>
  );
}
