import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { IconButton, SettingsIcon } from '@/components/ui';
import {
  TastingMenuItem,
  MenuDivider,
  type MenuItemStatus,
} from '@/components/menu';
import {
  linstitutRestaurant,
  isLessonUnlocked,
} from '@/data/restaurants/linstitut';
import { dishDefinitions } from '@/data/dishes';
import { audioManager } from '@/audio';

export function LinstitutMenuScreen() {
  const navigate = useNavigate();
  const { setCurrentDish } = useGameStore();
  const { completedDishes, graduatedLinstitut } = useProgressStore();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const handleLessonPress = (lessonId: string, status: MenuItemStatus) => {
    if (status === 'locked') return;

    audioManager.play('button_tap');
    const dish = dishDefinitions[lessonId];
    if (dish) {
      setCurrentDish(dish);
      navigate('/game');
    }
  };

  // Get status for a lesson
  const getLessonStatus = (lessonId: string): MenuItemStatus => {
    const stars = completedDishes[lessonId] ?? 0;
    if (stars > 0) return 'completed';
    if (isLessonUnlocked(lessonId, completedDishes)) return 'available';
    return 'locked';
  };

  // Check if final exam is unlocked
  const isFinalExamUnlocked = linstitutRestaurant.lessons.every(
    (l) => (completedDishes[l.id] ?? 0) > 0
  );

  const finalExamStatus: MenuItemStatus = graduatedLinstitut
    ? 'completed'
    : isFinalExamUnlocked
      ? 'available'
      : 'locked';

  return (
    <div className="h-full w-full flex flex-col bg-foundation-100">
      {/* Header with settings */}
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
        className="flex items-center justify-end px-6 py-4"
      >
        <IconButton
          icon={<SettingsIcon size={24} />}
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        />
      </motion.div>

      {/* Restaurant Header */}
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1 }}
        className="text-center px-6 pt-4 pb-8"
      >
        {/* Restaurant name with letter-spacing */}
        <h1
          className="font-display text-[28px] font-light tracking-[0.15em] text-text-primary"
          style={{ letterSpacing: '0.15em' }}
        >
          L ' I N S T I T U T
        </h1>

        {/* Decorative rule */}
        <div className="flex justify-center my-3">
          <div className="w-20 h-px bg-foundation-500" />
        </div>

        {/* Subtitle in italic */}
        <p className="font-display italic text-sm text-text-tertiary">
          {linstitutRestaurant.subtitle}
        </p>

        {/* Location */}
        <p className="font-body text-xs text-text-muted mt-1">
          {linstitutRestaurant.location}
        </p>
      </motion.div>

      {/* LEÇONS Section Title */}
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
        className="text-center mb-4"
      >
        <h2
          className="font-display text-sm font-normal tracking-[0.1em] text-text-secondary uppercase"
          style={{ letterSpacing: '0.1em' }}
        >
          Leçons
        </h2>
      </motion.div>

      {/* Menu Items - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
        <div className="flex flex-col items-center">
          {/* Center dot before lessons */}
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.25 }}
            className="flex justify-center pb-2"
          >
            <span className="text-text-muted text-xs">·</span>
          </motion.div>

          {/* Lesson Items */}
          {linstitutRestaurant.lessons.map((lesson, index) => {
            const status = getLessonStatus(lesson.id);
            const stars = (completedDishes[lesson.id] ?? 0) as 0 | 1 | 2 | 3;

            return (
              <motion.div
                key={lesson.id}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.4, delay: 0.3 + index * 0.08 }
                }
              >
                <TastingMenuItem
                  lessonNumber={lesson.number}
                  lessonName={lesson.name}
                  dishName={lesson.dishName}
                  status={status}
                  stars={stars}
                  onPress={() => handleLessonPress(lesson.id, status)}
                  reduceMotion={reduceMotion}
                />

                {/* Divider after each item (except last before final exam) */}
                {index < linstitutRestaurant.lessons.length - 1 && (
                  <MenuDivider reduceMotion={reduceMotion} />
                )}
              </motion.div>
            );
          })}

          {/* Final Exam Section */}
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.4, delay: 0.3 + linstitutRestaurant.lessons.length * 0.08 }
            }
            className="mt-8 pt-4"
          >
            {/* Decorative rules around EXAMEN FINAL */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-px bg-foundation-500" />
            </div>

            {/* EXAMEN FINAL Header */}
            <div className="text-center mb-2">
              <span
                className="font-display text-xs font-normal tracking-[0.1em] text-text-tertiary uppercase"
                style={{ letterSpacing: '0.1em' }}
              >
                Examen Final
              </span>
            </div>

            {/* Final Exam Dish Name - Larger */}
            <div className="text-center mb-2">
              <h3 className="font-display text-xl text-text-primary">
                {linstitutRestaurant.finalExam.name}
              </h3>
            </div>

            {/* Status indicator */}
            <div className="text-center mb-3">
              {finalExamStatus === 'locked' && (
                <span className="text-text-muted text-base">●</span>
              )}
              {finalExamStatus === 'available' && (
                <span className="text-text-muted text-base">○</span>
              )}
              {finalExamStatus === 'completed' && (
                <span className="font-body text-sm tracking-wide">
                  {[1, 2, 3].map((i) => {
                    const stars = completedDishes[linstitutRestaurant.finalExam.id] ?? 0;
                    return (
                      <span
                        key={i}
                        className={i <= stars ? 'text-accent-star' : 'text-foundation-500'}
                      >
                        {i <= stars ? '\u2605' : '\u2606'}
                      </span>
                    );
                  })}
                </span>
              )}
            </div>

            {/* Chef quote - always visible for final exam */}
            <div className="text-center mb-4 px-4">
              <p className="font-display italic text-sm text-text-tertiary">
                "{linstitutRestaurant.finalExam.quote}"
              </p>
            </div>

            {/* Decorative rule after */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-px bg-foundation-500" />
            </div>

            {/* Plate button for final exam if available or completed */}
            {finalExamStatus !== 'locked' && (
              <div className="flex justify-center">
                <motion.button
                  onClick={() => handleLessonPress(linstitutRestaurant.finalExam.id, finalExamStatus)}
                  whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="
                    px-10 py-3.5 rounded-xl
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
            )}

            {/* Graduated badge */}
            {graduatedLinstitut && (
              <div className="text-center mt-4">
                <span className="text-xs font-body text-copper uppercase tracking-wider">
                  Graduated
                </span>
              </div>
            )}
          </motion.div>

          {/* Bottom padding */}
          <div className="h-8" />
        </div>
      </div>

      {/* Footer decoration */}
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.5 }}
        className="py-6 flex justify-center gap-1"
      >
        {[1, 2, 3].map((star) => (
          <svg
            key={star}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4C9BB"
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </motion.div>
    </div>
  );
}
