import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { TitleScreen, LinstitutMenuScreen, GameScreen, ResultsScreen, SettingsScreen } from '@/screens';
import { LabScreen } from '@/lab/LabScreen';

export default function App() {
  const location = useLocation();

  return (
    <>
      {/* Screen reader announcer for accessibility */}
      <div
        id="sr-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<TitleScreen />} />
          <Route path="/linstitut" element={<LinstitutMenuScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/lab" element={<LabScreen />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
