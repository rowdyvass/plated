/**
 * Hook to determine tutorial settings based on restaurant and dish.
 * Tutorial hints are only shown in L'Institut (the tutorial restaurant).
 * Final exam has reduced hints.
 */

type TutorialLevel = 'full' | 'minimal' | 'none';

interface TutorialSettings {
  enabled: boolean;
  level: TutorialLevel;
  showHints: boolean;
  showGhostHighlight: boolean;
  showDemonstration: boolean;
  showLessonIntro: boolean;
}

export function useTutorial(restaurantId: string, dishId: string): TutorialSettings {
  // Only enable tutorial for L'Institut
  const isTutorialRestaurant = restaurantId === 'linstitut';
  const isFinalExam = dishId === 'linstitut-final';

  // Determine tutorial level
  let level: TutorialLevel = 'none';
  if (isTutorialRestaurant) {
    level = isFinalExam ? 'minimal' : 'full';
  }

  return {
    enabled: isTutorialRestaurant,
    level,
    showHints: isTutorialRestaurant && !isFinalExam,
    showGhostHighlight: isTutorialRestaurant,
    showDemonstration: false, // Disabled - no plating preview
    showLessonIntro: isTutorialRestaurant,
  };
}
