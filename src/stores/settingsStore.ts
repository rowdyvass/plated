import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { audioManager } from '@/audio';

interface SettingsState {
  // Audio
  soundEnabled: boolean;
  musicEnabled: boolean;

  // Gameplay
  leftHandedMode: boolean;
  ghostOpacity: number; // 0, 0.2, 0.4, 0.6, 0.8, 1.0

  // Accessibility
  reduceMotion: boolean;
  highContrast: boolean;

  // Actions
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleLeftHanded: () => void;
  setGhostOpacity: (value: number) => void;
  toggleReduceMotion: () => void;
  toggleHighContrast: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Audio defaults
      soundEnabled: true,
      musicEnabled: true,

      // Gameplay defaults
      leftHandedMode: false,
      ghostOpacity: 0.6,

      // Accessibility defaults
      reduceMotion: false,
      highContrast: false,

      toggleSound: () => {
        const newValue = !get().soundEnabled;
        set({ soundEnabled: newValue });
        if (newValue) {
          audioManager.unmute();
        } else {
          audioManager.mute();
        }
      },

      toggleMusic: () => {
        set({ musicEnabled: !get().musicEnabled });
        // Music control will be implemented later
      },

      toggleLeftHanded: () => {
        set({ leftHandedMode: !get().leftHandedMode });
      },

      setGhostOpacity: (value: number) => {
        // Clamp to valid range
        const clamped = Math.max(0, Math.min(1, value));
        set({ ghostOpacity: clamped });
      },

      toggleReduceMotion: () => {
        set({ reduceMotion: !get().reduceMotion });
      },

      toggleHighContrast: () => {
        set({ highContrast: !get().highContrast });
      },

      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled });
        if (enabled) {
          audioManager.unmute();
        } else {
          audioManager.mute();
        }
      },

      setMusicEnabled: (enabled: boolean) => {
        set({ musicEnabled: enabled });
        // Music control will be implemented later
      },
    }),
    {
      name: 'plated-settings',
      // Sync audio manager state on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.soundEnabled) {
            audioManager.unmute();
          } else {
            audioManager.mute();
          }
        }
      },
    }
  )
);
