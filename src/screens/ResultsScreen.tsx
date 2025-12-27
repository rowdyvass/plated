import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, StarRating, ProgressBar, AnimatedScore } from '@/components/ui';
import { PageTransition } from '@/components/transitions';
import { NextLevelPreview } from '@/components/menu';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getNextDish, hasNextDish, dishDefinitions } from '@/data/dishes';
import { getLessonByDishId } from '@/data/restaurants/linstitut';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface ScoreRowProps {
  label: string;
  score: number;
  index: number;
}

function ScoreRow({ label, score, index }: ScoreRowProps) {
  const baseDelay = 1.2;
  const staggerDelay = 0.15;
  const delay = baseDelay + index * staggerDelay;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-4"
    >
      <span className="w-24 text-text-secondary font-body text-sm">{label}</span>
      <div className="flex-1">
        <ProgressBar value={score} size="md" animated delay={delay} />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.3 }}
        className="w-8 text-right font-body text-sm text-text-primary tabular-nums"
      >
        {score}
      </motion.span>
    </motion.div>
  );
}

export function ResultsScreen() {
  const navigate = useNavigate();
  const { results, currentDish, resetGame, reset, setCurrentDish } = useGameStore();
  const { completeDish, graduatedLinstitut, setGraduated } = useProgressStore();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  // State for showing next level preview
  const [showNextPreview, setShowNextPreview] = useState(false);

  // Check if this is the final exam
  const dish = results ? dishDefinitions[results.dishId] : null;
  const isFinalExam = dish?.isFinalExam ?? false;
  const isGraduation = isFinalExam && results && results.stars >= 1;

  // Check if there's a next lesson available
  const nextDishAvailable = results ? hasNextDish(results.dishId) : false;

  // Get next dish info for preview
  const nextDish = results ? getNextDish(results.dishId) : null;
  const nextLessonMeta = nextDish ? getLessonByDishId(nextDish.id) : null;

  // Redirect to home if no results
  useEffect(() => {
    if (!results) {
      navigate('/');
    }
  }, [results, navigate]);

  // Record completion and handle graduation
  useEffect(() => {
    if (results) {
      completeDish(results.dishId, results.stars, results.finalScore);
      if (isGraduation && !graduatedLinstitut) {
        setGraduated('linstitut', true);
      }
    }
  }, [results, isGraduation, graduatedLinstitut, completeDish, setGraduated]);

  if (!results) {
    return null;
  }

  const handleRetry = () => {
    if (currentDish) {
      resetGame();
      navigate('/game');
    }
  };

  const handleNext = () => {
    if (nextDish && nextLessonMeta) {
      // Show the next level preview instead of immediately starting
      setShowNextPreview(true);
    } else {
      // No more lessons - go to menu
      reset();
      navigate('/linstitut');
    }
  };

  const handleStartNextLevel = () => {
    if (nextDish) {
      // Reset the game state first, then set the new dish
      // This clears phase, results, etc. so GameScreen doesn't redirect back
      reset();
      setCurrentDish(nextDish);
      navigate('/game');
    }
  };

  const handleMenu = () => {
    reset();
    navigate('/linstitut');
  };

  // Show next level preview
  if (showNextPreview && nextDish && nextLessonMeta) {
    const isNextFinalExam = nextDish.isFinalExam ?? false;
    const lessonNumber = 'number' in nextLessonMeta ? (nextLessonMeta as { number: number }).number : undefined;

    return (
      <PageTransition className="flex flex-col items-center justify-center bg-foundation-100 px-6 py-8">
        <NextLevelPreview
          dish={nextDish}
          lessonNumber={lessonNumber}
          lessonName={nextLessonMeta.name}
          dishNameFrench={nextLessonMeta.dishName}
          chefQuote={nextLessonMeta.quote}
          techniques={nextLessonMeta.techniques}
          isFinalExam={isNextFinalExam}
          onStart={handleStartNextLevel}
          onMenu={handleMenu}
          reduceMotion={reduceMotion}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="flex flex-col items-center justify-center bg-foundation-100 px-6 py-8">
      <div className="max-w-md w-full flex flex-col items-center gap-8">
        {/* Restaurant name */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="font-display text-sm tracking-widest text-text-secondary uppercase"
        >
          {results.restaurantName}
        </motion.p>

        {/* Dish name */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="font-display text-3xl text-text-primary text-center"
        >
          {results.dishName}
        </motion.h1>

        {/* Star rating with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        >
          <StarRating rating={results.stars} size="display" animated startDelay={0.5} />
        </motion.div>

        {/* Final score with count-up animation */}
        <AnimatedScore
          value={results.finalScore}
          duration={800}
          delay={800}
          size="display"
        />

        {/* Divider with reveal animation */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4, ease: 'easeOut' }}
          className="w-48 h-px bg-foundation-500 origin-center"
        />

        {/* Score breakdown with staggered animations */}
        <div className="w-full space-y-4">
          <ScoreRow label="Precision" score={results.precision} index={0} />
          <ScoreRow label="Technique" score={results.technique} index={1} />
          <ScoreRow label="Tempo" score={results.tempo} index={2} />
        </div>

        {/* Flow bonus badge (if earned) */}
        <AnimatePresence>
          {(results.flowBonus ?? 0) > 0 && results.flowLabel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 1.8, type: 'spring', stiffness: 200, damping: 20 }}
              className="flex items-center gap-2 px-4 py-2 bg-accent-primary/10 rounded-full border border-accent-primary/30"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.9 }}
                className="text-accent-primary font-display text-sm"
              >
                {results.flowLabel}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.0, type: 'spring' }}
                className="text-accent-primary font-body text-sm font-medium"
              >
                +{results.flowBonus}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: (results.flowBonus ?? 0) > 0 ? 2.1 : 1.9, duration: 0.4 }}
          className="w-48 h-px bg-foundation-500 origin-center"
        />

        {/* Time elapsed with fade-in */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (results.flowBonus ?? 0) > 0 ? 2.3 : 2.1, duration: 0.4 }}
          className="font-body text-2xl text-text-secondary tabular-nums"
        >
          {formatTime(results.timeElapsed)}
        </motion.p>

        {/* Graduation message for final exam */}
        <AnimatePresence>
          {isGraduation && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 2.5, duration: 0.6, ease: 'easeOut' }}
              className="text-center space-y-3 py-4 px-6 bg-foundation-200 rounded-lg border border-foundation-400"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.7 }}
                className="font-display text-lg text-text-primary"
              >
                You have completed your training at L'Institut.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.9 }}
                className="font-body text-sm text-text-secondary italic"
              >
                Chef Margaux nods. "You are ready. Copenhagen awaits."
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons with slide-up animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: isGraduation ? 3.1 : 2.5,
            duration: 0.4,
            ease: 'easeOut',
          }}
          className="flex gap-4 w-full"
        >
          <Button variant="secondary" onClick={handleRetry} className="flex-1">
            Retry
          </Button>
          <Button variant="primary" onClick={handleNext} className="flex-1">
            {isGraduation ? 'Continue' : nextDishAvailable ? 'Next' : 'Done'}
          </Button>
        </motion.div>

        {/* Menu link with fade-in */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: isGraduation ? 3.3 : 2.7 }}
          onClick={handleMenu}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="font-body text-sm text-text-secondary hover:text-text-primary transition-colors uppercase tracking-widest"
        >
          Menu
        </motion.button>
      </div>
    </PageTransition>
  );
}
