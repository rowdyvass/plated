import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { IngredientPreview } from '@/components/game/IngredientPreview';

interface DemonstrationProps {
  dishId: string;
  onComplete: () => void;
  onSkip: () => void;
}

// Demo sequences for each lesson - defines animation steps
interface DemoStep {
  narration: string;
  ingredient?: string;
  animation: 'appear' | 'place' | 'swoosh' | 'dot' | 'scatter' | 'complete';
  position?: { x: number; y: number };
  duration: number;
}

const demoSequences: Record<string, DemoStep[]> = {
  'linstitut-lesson-1': [
    { narration: 'Place the butter with intention.', animation: 'appear', ingredient: 'butter-pat', duration: 1500 },
    { narration: 'The center of the plate is your anchor.', animation: 'place', ingredient: 'butter-pat', position: { x: 50, y: 50 }, duration: 2000 },
    { narration: 'One motion, one decision.', animation: 'complete', duration: 1500 },
  ],
  'linstitut-lesson-2': [
    { narration: 'The swoosh is confidence made visible.', animation: 'appear', ingredient: 'sauce-swoosh', duration: 1500 },
    { narration: 'Start bold, end with precision.', animation: 'swoosh', duration: 2500 },
    { narration: 'The plate serves as your canvas.', animation: 'complete', duration: 1500 },
  ],
  'linstitut-lesson-3': [
    { narration: 'Each dot is a punctuation mark.', animation: 'appear', ingredient: 'sauce-dot', duration: 1500 },
    { narration: 'Rhythm and spacing create harmony.', animation: 'dot', duration: 2500 },
    { narration: 'Make every touch count.', animation: 'complete', duration: 1500 },
  ],
  'linstitut-lesson-4': [
    { narration: 'Scatter suggests nature, not chaos.', animation: 'appear', ingredient: 'pea', duration: 1500 },
    { narration: 'Control the randomness.', animation: 'scatter', duration: 2500 },
    { narration: 'Let gravity do the work.', animation: 'complete', duration: 1500 },
  ],
  'linstitut-lesson-5': [
    { narration: 'The quenelle is patience made visible.', animation: 'appear', ingredient: 'quenelle', duration: 1500 },
    { narration: 'Arc, pause, release.', animation: 'place', position: { x: 30, y: 50 }, duration: 2500 },
    { narration: 'Sculpture in cream.', animation: 'complete', duration: 1500 },
  ],
  'linstitut-lesson-6': [
    { narration: 'The drizzle tells a story.', animation: 'appear', ingredient: 'oil-drizzle', duration: 1500 },
    { narration: 'Continuous motion, steady hand.', animation: 'swoosh', duration: 2500 },
    { narration: 'Flow, not drip.', animation: 'complete', duration: 1500 },
  ],
  'linstitut-lesson-7': [
    { narration: 'Tweezers are an extension of intention.', animation: 'appear', ingredient: 'micro-green', duration: 1500 },
    { narration: 'Steady hands, clear mind.', animation: 'place', position: { x: 65, y: 35 }, duration: 2500 },
    { narration: 'Precision over speed.', animation: 'complete', duration: 1500 },
  ],
  'linstitut-lesson-8': [
    { narration: 'The powder should whisper, not shout.', animation: 'appear', ingredient: 'powdered-sugar', duration: 1500 },
    { narration: 'Restraint is the final lesson.', animation: 'scatter', duration: 2500 },
    { narration: 'Less is more.', animation: 'complete', duration: 1500 },
  ],
};

// Default fallback sequence
const defaultSequence: DemoStep[] = [
  { narration: 'Watch and observe.', animation: 'appear', ingredient: 'butter-pat', duration: 1500 },
  { narration: 'Every placement matters.', animation: 'place', ingredient: 'butter-pat', position: { x: 50, y: 50 }, duration: 2000 },
  { narration: 'Now it\'s your turn.', animation: 'complete', duration: 1500 },
];

export function Demonstration({ dishId, onComplete, onSkip }: DemonstrationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [ingredientPos, setIngredientPos] = useState({ x: 15, y: 85 }); // Start at tray position
  const [showIngredient, setShowIngredient] = useState(false);
  const [placedIngredients, setPlacedIngredients] = useState<{ x: number; y: number; ingredient: string }[]>([]);
  const [swooshProgress, setSwooshProgress] = useState(0);
  const [dotPositions, setDotPositions] = useState<{ x: number; y: number }[]>([]);
  const [scatterPositions, setScatterPositions] = useState<{ x: number; y: number }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationRef = useRef<number | null>(null);

  const sequence = demoSequences[dishId] || defaultSequence;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const runAnimation = (step: DemoStep) => {
    switch (step.animation) {
      case 'appear':
        setShowIngredient(true);
        setIngredientPos({ x: 15, y: 85 }); // Show at tray position
        break;

      case 'place': {
        const targetX = step.position?.x ?? 50;
        const targetY = step.position?.y ?? 50;
        const startX = 15;
        const startY = 85;
        const startTime = performance.now();
        const duration = 1200;

        const animate = (time: number) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);

          if (progress >= 1) {
            // Place complete - add to placed ingredients
            setPlacedIngredients(prev => [...prev, {
              x: targetX,
              y: targetY,
              ingredient: step.ingredient || 'butter-pat'
            }]);
            setShowIngredient(false);
            return;
          }

          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          setIngredientPos({
            x: startX + (targetX - startX) * eased,
            y: startY + (targetY - startY) * eased,
          });
          animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
        break;
      }

      case 'swoosh': {
        // Animate swoosh trail
        const startTime = performance.now();
        const duration = 1500;
        setShowIngredient(false);

        const animate = (time: number) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);

          if (progress >= 1) {
            setSwooshProgress(1);
            return;
          }
          setSwooshProgress(progress);
          animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
        break;
      }

      case 'dot': {
        setShowIngredient(false);
        // Animate dots appearing one by one
        const positions = [
          { x: 35, y: 45 },
          { x: 50, y: 40 },
          { x: 65, y: 45 },
          { x: 45, y: 55 },
          { x: 55, y: 55 },
        ];
        let index = 0;
        const addDot = () => {
          if (index < positions.length) {
            setDotPositions(prev => [...prev, positions[index]]);
            index++;
            setTimeout(addDot, 350);
          }
        };
        addDot();
        break;
      }

      case 'scatter': {
        setShowIngredient(false);
        // Animate scatter particles
        const positions = Array.from({ length: 8 }, () => ({
          x: 35 + Math.random() * 30,
          y: 35 + Math.random() * 30,
        }));
        let index = 0;
        const addParticle = () => {
          if (index < positions.length) {
            setScatterPositions(prev => [...prev, positions[index]]);
            index++;
            setTimeout(addParticle, 120);
          }
        };
        addParticle();
        break;
      }

      case 'complete':
        // Animation complete - nothing more to animate
        break;
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setPlacedIngredients([]);
    setSwooshProgress(0);
    setDotPositions([]);
    setScatterPositions([]);
    setShowIngredient(false);

    // Run first step
    runAnimation(sequence[0]);

    // Auto-advance through steps
    let step = 0;
    const advanceStep = () => {
      step++;
      if (step < sequence.length) {
        setCurrentStep(step);
        runAnimation(sequence[step]);
        // Schedule next step
        setTimeout(advanceStep, sequence[step].duration);
      }
    };

    // Start advancing after first step duration
    setTimeout(advanceStep, sequence[0].duration);
  };

  const currentNarration = sequence[currentStep]?.narration || 'Watch how the dish is plated.';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foundation-100 flex flex-col items-center z-50"
    >
      {/* Demo area */}
      <div className="flex-1 w-full flex items-center justify-center relative">
        {/* Plate container */}
        <div className="relative w-64 h-64">
          {/* Plate background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 rounded-full bg-foundation-200 border-2 border-foundation-300 shadow-lg"
          />

          {/* Plate rim highlight */}
          <div className="absolute inset-2 rounded-full border border-foundation-300/50" />

          {/* Swoosh trail */}
          {swooshProgress > 0 && (
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
              <motion.path
                d="M 20 70 Q 50 20 80 50"
                fill="none"
                stroke="#B87333"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: swooshProgress }}
                style={{ opacity: 0.7 }}
              />
            </svg>
          )}

          {/* Placed ingredients */}
          {placedIngredients.map((item, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <IngredientPreview ingredientId={item.ingredient} size={40} />
            </motion.div>
          ))}

          {/* Dots */}
          {dotPositions.map((pos, index) => (
            <motion.div
              key={`dot-${index}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="absolute w-3 h-3 rounded-full bg-copper"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Scatter particles */}
          {scatterPositions.map((pos, index) => (
            <motion.div
              key={`scatter-${index}`}
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="absolute w-2 h-2 rounded-full bg-green-600"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Animating ingredient during drag */}
          {showIngredient && isPlaying && (
            <motion.div
              className="absolute z-10"
              style={{
                left: `${ingredientPos.x}%`,
                top: `${ingredientPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <IngredientPreview
                ingredientId={sequence[currentStep]?.ingredient || 'butter-pat'}
                size={40}
              />
            </motion.div>
          )}

          {/* Idle state */}
          {!isPlaying && placedIngredients.length === 0 && swooshProgress === 0 && dotPositions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-body text-sm text-text-muted"
              >
                Press Watch
              </motion.span>
            </div>
          )}
        </div>

        {/* Narration */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 text-center px-8"
          >
            <p className="font-display italic text-lg text-text-secondary">
              {isPlaying ? currentNarration : 'Watch how the dish is plated.'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pb-12 flex gap-4"
      >
        <Button variant="secondary" onClick={onSkip}>
          Skip
        </Button>
        {!isPlaying ? (
          <Button variant="primary" onClick={handlePlay}>
            Watch
          </Button>
        ) : (
          <Button variant="primary" onClick={onComplete}>
            I'm Ready
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
