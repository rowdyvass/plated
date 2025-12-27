import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/transitions';
import { Header } from '@/components/navigation';
import { Toggle, Slider, Button } from '@/components/ui';
import { useSettingsStore, useProgressStore } from '@/stores';
import { audioManager } from '@/audio';

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 border-b border-foundation-300 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <span className="font-body text-text-primary">{label}</span>
          {description && (
            <p className="text-sm text-text-tertiary mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0">{children}</div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 border-b border-foundation-300 last:border-b-0">
      <div className="mb-3">
        <span className="font-body text-text-primary">{label}</span>
        {description && (
          <p className="text-sm text-text-tertiary mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-sm uppercase tracking-wider text-text-tertiary mb-2 px-1">
        {title}
      </h2>
      <div className="bg-foundation-200 rounded-xl px-4">{children}</div>
    </div>
  );
}

function ResetConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <motion.div
        initial={reduceMotion ? { scale: 1 } : { scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={reduceMotion ? { scale: 1, opacity: 0 } : { scale: 0.95, opacity: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
        className="bg-foundation-100 rounded-2xl p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="reset-modal-title"
          className="font-display text-xl text-text-primary text-center mb-3"
        >
          Reset Progress?
        </h2>
        <p className="text-text-tertiary text-center mb-6 text-sm">
          This will erase all your stars and unlock progress. This cannot be
          undone.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-state-error hover:bg-state-error/90"
          >
            Reset
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SettingsScreen() {
  const [showResetModal, setShowResetModal] = useState(false);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const {
    soundEnabled,
    musicEnabled,
    leftHandedMode,
    ghostOpacity,
    highContrast,
    toggleSound,
    toggleMusic,
    toggleLeftHanded,
    setGhostOpacity,
    toggleReduceMotion,
    toggleHighContrast,
  } = useSettingsStore();

  const resetProgress = useProgressStore((s) => s.reset);

  const handleSoundToggle = (value: boolean) => {
    // Initialize audio if enabling
    if (value) {
      audioManager.init();
    }
    toggleSound();
    // Play test sound if enabling
    if (value) {
      setTimeout(() => audioManager.play('button_tap'), 50);
    }
  };

  const handleResetProgress = () => {
    resetProgress();
  };

  return (
    <PageTransition className="flex flex-col bg-foundation-100">
      <Header title="Settings" showBack backTo="/levels" />

      <main className="flex-1 overflow-y-auto pt-16 px-4 pb-8">
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 }}
          className="max-w-md mx-auto mt-4"
        >
          {/* Audio Section */}
          <SettingSection title="Audio">
            <SettingRow label="Sound">
              <Toggle
                value={soundEnabled}
                onChange={handleSoundToggle}
                aria-label="Toggle sound effects"
              />
            </SettingRow>
            <SettingRow label="Music">
              <Toggle
                value={musicEnabled}
                onChange={toggleMusic}
                aria-label="Toggle background music"
              />
            </SettingRow>
          </SettingSection>

          {/* Gameplay Section */}
          <SettingSection title="Gameplay">
            <SettingRow
              label="Left-Handed Mode"
              description="Moves ingredient tray to the right side"
            >
              <Toggle
                value={leftHandedMode}
                onChange={toggleLeftHanded}
                aria-label="Toggle left-handed mode"
              />
            </SettingRow>
            <SliderRow
              label="Ghost Visibility"
              description="How visible placement guides appear"
            >
              <Slider
                value={ghostOpacity}
                onChange={setGhostOpacity}
                min={0}
                max={1}
                step={0.2}
                aria-label="Ghost visibility"
              />
            </SliderRow>
          </SettingSection>

          {/* Accessibility Section */}
          <SettingSection title="Accessibility">
            <SettingRow
              label="Reduce Motion"
              description="Minimizes animations throughout the app"
            >
              <Toggle
                value={reduceMotion}
                onChange={toggleReduceMotion}
                aria-label="Toggle reduce motion"
              />
            </SettingRow>
            <SettingRow
              label="High Contrast"
              description="Increases visual contrast for better visibility"
            >
              <Toggle
                value={highContrast}
                onChange={toggleHighContrast}
                aria-label="Toggle high contrast mode"
              />
            </SettingRow>
          </SettingSection>

          {/* Data Section */}
          <SettingSection title="Data">
            <div className="py-4">
              <Button
                variant="ghost"
                onClick={() => setShowResetModal(true)}
                className="w-full text-state-error hover:bg-state-error/10"
              >
                Reset Progress
              </Button>
            </div>
          </SettingSection>

          {/* Version */}
          <p className="text-center text-text-muted text-sm mt-8">
            Version 0.1.0
          </p>
        </motion.div>
      </main>

      <ResetConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetProgress}
      />
    </PageTransition>
  );
}
