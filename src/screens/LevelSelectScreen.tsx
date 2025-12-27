import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { IconButton, SettingsIcon } from '@/components/ui';
import { lesson1Butter } from '@/data/dishes/linstitut/lesson1-butter';
import { lesson2Veloute } from '@/data/dishes/linstitut/lesson2-veloute';
import { lesson3Tartare } from '@/data/dishes/linstitut/lesson3-tartare';
import { lesson4PeaSalad } from '@/data/dishes/linstitut/lesson4-pea-salad';
import { lesson5Sole } from '@/data/dishes/linstitut/lesson5-sole';
import { lesson6Caprese } from '@/data/dishes/linstitut/lesson6-caprese';
import { lesson7Duck } from '@/data/dishes/linstitut/lesson7-duck';
import { lesson8Tarte } from '@/data/dishes/linstitut/lesson8-tarte';
import { finalExamPigeon } from '@/data/dishes/linstitut/final-exam';
import { audioManager } from '@/audio';
import type { DishDefinition } from '@/types/dishes';

interface LevelInfo {
  id: string;
  name: string;
  subtitle: string;
  gesture: string;
  dish: DishDefinition;
  isFinalExam?: boolean;
}

const LEVELS: LevelInfo[] = [
  {
    id: 'lesson1',
    name: 'Lesson 1',
    subtitle: 'Compound Butter',
    gesture: 'Place',
    dish: lesson1Butter,
  },
  {
    id: 'lesson2',
    name: 'Lesson 2',
    subtitle: 'Sauce Velouté',
    gesture: 'Swoosh',
    dish: lesson2Veloute,
  },
  {
    id: 'lesson3',
    name: 'Lesson 3',
    subtitle: 'Beef Tartare',
    gesture: 'Dots',
    dish: lesson3Tartare,
  },
  {
    id: 'lesson4',
    name: 'Lesson 4',
    subtitle: 'Spring Pea Salad',
    gesture: 'Scatter',
    dish: lesson4PeaSalad,
  },
  {
    id: 'lesson5',
    name: 'Lesson 5',
    subtitle: 'Sole Meunière',
    gesture: 'Quenelle',
    dish: lesson5Sole,
  },
  {
    id: 'lesson6',
    name: 'Lesson 6',
    subtitle: 'Caprese Moderne',
    gesture: 'Drizzle',
    dish: lesson6Caprese,
  },
  {
    id: 'lesson7',
    name: 'Lesson 7',
    subtitle: 'Duck Breast',
    gesture: 'Tweeze',
    dish: lesson7Duck,
  },
  {
    id: 'lesson8',
    name: 'Lesson 8',
    subtitle: 'Tarte Tatin',
    gesture: 'Dust',
    dish: lesson8Tarte,
  },
  {
    id: 'final-exam',
    name: 'Final Exam',
    subtitle: 'Pigeon en Croûte',
    gesture: 'All Techniques',
    dish: finalExamPigeon,
    isFinalExam: true,
  },
];

export function LevelSelectScreen() {
  const navigate = useNavigate();
  const { setCurrentDish } = useGameStore();
  const { completedDishes, graduatedLinstitut } = useProgressStore();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const handleLevelSelect = (level: LevelInfo) => {
    audioManager.play('button_tap');
    setCurrentDish(level.dish);
    navigate('/game');
  };

  const handleBack = () => {
    audioManager.play('button_tap');
    navigate('/');
  };

  // Get star count for a dish
  const getStars = (dishId: string): number => {
    return completedDishes[dishId] ?? 0;
  };

  return (
    <div className="h-full w-full flex flex-col bg-foundation-100">
      {/* Header */}
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
        className="flex items-center justify-between px-6 py-4"
      >
        <button
          onClick={handleBack}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-xl tracking-wider text-text-primary">
          Select Lesson
        </h1>
        <IconButton
          icon={<SettingsIcon size={24} />}
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        />
      </motion.div>

      {/* Level list */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          {LEVELS.map((level, index) => {
            const stars = getStars(level.dish.id);
            const isExam = level.isFinalExam;

            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => handleLevelSelect(level)}
                className={`w-full rounded-2xl p-5 text-left border transition-all group ${
                  isExam
                    ? 'bg-gradient-to-br from-foundation-200 to-foundation-300/50 border-copper/30 hover:border-copper hover:shadow-lg'
                    : 'bg-foundation-200 border-foundation-300/50 hover:border-copper/50 hover:bg-foundation-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`font-display text-lg ${isExam ? 'text-copper' : 'text-text-primary'}`}>
                        {level.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-body uppercase tracking-wider ${
                        isExam
                          ? 'bg-copper/20 text-copper'
                          : 'bg-foundation-300/50 text-text-muted'
                      }`}>
                        {level.gesture}
                      </span>
                    </div>
                    <p className="font-body text-sm text-text-secondary">
                      {level.subtitle}
                    </p>
                    {/* Star rating for completed dishes */}
                    {stars > 0 && (
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3].map((i) => (
                          <svg
                            key={i}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={i <= stars ? '#D4AF37' : 'none'}
                            stroke={i <= stars ? '#D4AF37' : '#D4C9BB'}
                            strokeWidth="1.5"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`transition-colors ${isExam ? 'text-copper' : 'text-text-muted group-hover:text-copper'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
                {/* Graduation badge for completed final exam */}
                {isExam && graduatedLinstitut && (
                  <div className="mt-3 pt-3 border-t border-copper/20">
                    <span className="text-xs font-body text-copper uppercase tracking-wider">
                      Graduated
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
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
