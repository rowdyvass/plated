import { useEffect, useRef, useState } from 'react';
import { Game } from '@/game';

export function useGame(containerRef: React.RefObject<HTMLElement | null>) {
  const gameRef = useRef<Game | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const game = new Game();
    gameRef.current = game;

    game.init(container).then(() => {
      setIsReady(true);
    });

    return () => {
      game.destroy();
      gameRef.current = null;
      setIsReady(false);
    };
  }, [containerRef]);

  return { game: gameRef.current, isReady };
}
