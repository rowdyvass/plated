import { Link } from 'react-router-dom';
import { Timer, TimerClock_Standalone } from './Timer';

interface GameHeaderProps {
  dishName: string;
  backTo?: string;
}

export function GameHeader({ dishName, backTo = '/' }: GameHeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 flex flex-col bg-foundation-100/80 backdrop-blur-sm">
      {/* Top row: back button, dish name, clock */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button - 44x44 touch target */}
        <Link
          to={backTo}
          className="w-11 h-11 flex items-center justify-center -ml-2 touch-manipulation"
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-secondary"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Dish name */}
        <h1 className="font-body text-base text-text-secondary">
          {dishName}
        </h1>

        {/* Clock */}
        <div className="w-16 flex justify-end">
          <TimerClock_Standalone />
        </div>
      </div>

      {/* Timer bar - full width */}
      <Timer />
    </header>
  );
}
