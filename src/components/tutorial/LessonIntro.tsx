import { motion } from 'framer-motion';
import { toRomanNumeral } from '@/utils/romanNumerals';
import type { LinstitutLesson, LinstitutFinalExam } from '@/data/restaurants/linstitut';

interface LessonIntroProps {
  lesson: LinstitutLesson | LinstitutFinalExam;
  onContinue: () => void;
}

// Check if this is a lesson (has number) or final exam
function isLesson(lesson: LinstitutLesson | LinstitutFinalExam): lesson is LinstitutLesson {
  return 'number' in lesson;
}

export function LessonIntro({ lesson, onContinue }: LessonIntroProps) {
  const lessonNumber = isLesson(lesson) ? lesson.number : null;
  const lessonName = isLesson(lesson) ? lesson.name : 'Final Examination';
  const dishName = isLesson(lesson) ? lesson.dishName : lesson.dishName;
  const quote = lesson.quote;
  const techniques = lesson.techniques;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foundation-100 flex flex-col items-center justify-center z-50 px-6"
    >
      {/* Lesson number */}
      {lessonNumber && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-muted font-body text-xs uppercase tracking-[0.3em] mb-2"
        >
          Lesson {toRomanNumeral(lessonNumber)}
        </motion.div>
      )}

      {/* Lesson name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-3xl text-text-primary tracking-wide mb-6"
      >
        {lessonName}
      </motion.h1>

      {/* Decorative dot */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        className="w-1 h-1 rounded-full bg-copper mb-6"
      />

      {/* Dish name */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-display text-lg text-text-secondary italic mb-8"
      >
        {dishName}
      </motion.p>

      {/* Chef's quote */}
      {quote && (
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-md text-center mb-8"
        >
          <p className="font-display italic text-base text-text-secondary leading-relaxed">
            "{quote}"
          </p>
          <footer className="mt-2 font-body text-xs text-text-muted tracking-wide">
            — Chef Margaux
          </footer>
        </motion.blockquote>
      )}

      {/* Techniques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-16"
      >
        <p className="font-body text-xs uppercase tracking-widest text-text-muted mb-4">
          Techniques
        </p>
        <div className="flex items-center justify-center gap-4 text-text-secondary font-body text-sm">
          {techniques.map((technique, index) => (
            <span key={technique} className="flex items-center gap-4">
              {index > 0 && <span className="text-foundation-400">·</span>}
              <span>{technique}</span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* Begin button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button
          onClick={onContinue}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="
            px-14 py-4 rounded-xl
            bg-gradient-to-b from-copper to-[#9A5F2A]
            text-white
            font-display text-sm tracking-[0.2em] uppercase
            border border-[#A86830]/30
            shadow-[0_4px_16px_rgba(184,115,51,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
            transition-all duration-300 ease-out
            hover:shadow-[0_6px_24px_rgba(184,115,51,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
            hover:from-[#C4813D] hover:to-[#A86830]
            active:shadow-[0_2px_8px_rgba(184,115,51,0.25),inset_0_2px_4px_rgba(0,0,0,0.1)]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/50 focus-visible:ring-offset-2
          "
        >
          Begin
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
