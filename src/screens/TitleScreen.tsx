import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, SettingsIcon } from '@/components/ui';
import { PageTransition } from '@/components/transitions';
import { useSettingsStore } from '@/stores';
import { audioManager } from '@/audio';

function SoundToggle() {
  const { soundEnabled, toggleSound, reduceMotion } = useSettingsStore();

  const handleToggle = () => {
    // Initialize audio if not already done (user interaction)
    audioManager.init();
    toggleSound();
    // Play a test sound if enabling
    if (!soundEnabled) {
      setTimeout(() => audioManager.play('button_tap'), 50);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="p-2 text-text-secondary hover:text-text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      whileHover={reduceMotion ? undefined : { scale: 1.1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
    >
      {soundEnabled ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </motion.button>
  );
}

export function TitleScreen() {
  const navigate = useNavigate();

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = () => {
      audioManager.init();
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('click', initAudio);
    };

    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('click', initAudio, { once: true });

    return () => {
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('click', initAudio);
    };
  }, []);

  const handleStart = () => {
    navigate('/linstitut');
  };

  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  return (
    <PageTransition className="flex flex-col items-center justify-center bg-foundation-100 relative">
      {/* Sound toggle and settings in top-right corner */}
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 1 }}
        className="absolute top-4 right-4 flex items-center gap-1"
      >
        <SoundToggle />
        <IconButton
          icon={<SettingsIcon size={24} />}
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center"
      >
        <h1 className="font-display text-3xl md:text-[64px] font-light tracking-[0.2em] text-text-primary mb-2">
          PLATED
        </h1>
        <p className="font-display text-lg italic text-text-tertiary mb-12">
          The art of fine dining
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
      >
        <Button onClick={handleStart} size="lg">
          Start
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-8 flex gap-1"
      >
        {[1, 2, 3].map((star) => (
          <motion.svg
            key={star}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4C9BB"
            strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + star * 0.1, type: 'spring', stiffness: 200 }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </motion.svg>
        ))}
      </motion.div>
    </PageTransition>
  );
}
