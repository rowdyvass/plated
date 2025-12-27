/**
 * L'Institut - École de Présentation
 *
 * The first restaurant in Plated - a prestigious French culinary school
 * where players learn the fundamentals of fine dining plating through
 * 8 structured lessons and a final exam.
 */

export interface LinstitutLesson {
  id: string;
  number: number;
  name: string;
  dishName: string;
  dishNameEnglish: string;
  quote?: string;
  techniques: string[];
  unlockRequirement: string | null;
}

export interface LinstitutFinalExam {
  id: string;
  name: string;
  dishName: string;
  quote: string;
  techniques: string[];
  unlockRequirement: 'all-lessons-completed';
}

export interface LinstitutRestaurant {
  id: 'linstitut';
  name: string;
  subtitle: string;
  location: string;
  menuStyle: 'tasting';
  lessons: LinstitutLesson[];
  finalExam: LinstitutFinalExam;
}

export const linstitutRestaurant: LinstitutRestaurant = {
  id: 'linstitut',
  name: "L'Institut",
  subtitle: 'Cooking School',
  location: 'Lyon',
  menuStyle: 'tasting',

  lessons: [
    {
      id: 'linstitut-lesson-1',
      number: 1,
      name: 'Butter Service',
      dishName: 'service au beurre',
      dishNameEnglish: 'Butter Service',
      quote: 'Before technique, there is intention.',
      techniques: ['place'],
      unlockRequirement: null, // Always available
    },
    {
      id: 'linstitut-lesson-2',
      number: 2,
      name: 'Leek Velouté',
      dishName: 'velouté de poireaux',
      dishNameEnglish: 'Leek Velouté',
      quote: 'The swoosh reveals confidence.',
      techniques: ['swoosh', 'place'],
      unlockRequirement: 'linstitut-lesson-1',
    },
    {
      id: 'linstitut-lesson-3',
      number: 3,
      name: 'Beef Tartare',
      dishName: 'tartare classique',
      dishNameEnglish: 'Beef Tartare',
      quote: 'Each dot is a decision. Make it count.',
      techniques: ['place', 'dot'],
      unlockRequirement: 'linstitut-lesson-2',
    },
    {
      id: 'linstitut-lesson-4',
      number: 4,
      name: 'Spring Pea Salad',
      dishName: 'salade de petits pois',
      dishNameEnglish: 'Spring Pea Salad',
      quote: 'Controlled randomness is the soul of nature.',
      techniques: ['scatter', 'dot'],
      unlockRequirement: 'linstitut-lesson-3',
    },
    {
      id: 'linstitut-lesson-5',
      number: 5,
      name: 'Sole Meunière',
      dishName: 'sole meunière',
      dishNameEnglish: 'Sole Meunière',
      quote: 'The quenelle is patience made visible. Rush it, and it shows.',
      techniques: ['swoosh', 'place', 'quenelle', 'scatter'],
      unlockRequirement: 'linstitut-lesson-4',
    },
    {
      id: 'linstitut-lesson-6',
      number: 6,
      name: 'Modern Caprese',
      dishName: 'caprese moderne',
      dishNameEnglish: 'Modern Caprese',
      quote: 'The drizzle tells a story. Break it, and the story is lost.',
      techniques: ['place', 'drizzle', 'dot'],
      unlockRequirement: 'linstitut-lesson-5',
    },
    {
      id: 'linstitut-lesson-7',
      number: 7,
      name: 'Duck Breast',
      dishName: 'magret de canard',
      dishNameEnglish: 'Duck Breast',
      quote: 'The tweezers are an extension of intention. Steady hands, clear mind.',
      techniques: ['swoosh', 'place', 'tweeze'],
      unlockRequirement: 'linstitut-lesson-6',
    },
    {
      id: 'linstitut-lesson-8',
      number: 8,
      name: 'Tarte Tatin',
      dishName: 'tarte tatin',
      dishNameEnglish: 'Tarte Tatin',
      quote: 'Restraint. The powder should whisper, not shout.',
      techniques: ['place', 'quenelle', 'dust'],
      unlockRequirement: 'linstitut-lesson-7',
    },
  ],

  finalExam: {
    id: 'linstitut-final',
    name: 'Pigeon en Croûte',
    dishName: 'pigeon en croûte',
    quote: 'Show me what you have learned. The plate remembers everything.',
    techniques: ['swoosh', 'place', 'quenelle', 'dot', 'tweeze', 'scatter', 'drizzle', 'dust'],
    unlockRequirement: 'all-lessons-completed',
  },
};

/**
 * Get all lesson IDs including the final exam
 */
export function getLinstitutLessonIds(): string[] {
  return [
    ...linstitutRestaurant.lessons.map(l => l.id),
    linstitutRestaurant.finalExam.id,
  ];
}

/**
 * Check if a lesson is unlocked based on completion status
 */
export function isLessonUnlocked(
  lessonId: string,
  completedDishes: Record<string, number>
): boolean {
  // First lesson is always unlocked
  const lesson = linstitutRestaurant.lessons.find(l => l.id === lessonId);
  if (lesson) {
    if (lesson.unlockRequirement === null) return true;
    return (completedDishes[lesson.unlockRequirement] ?? 0) > 0;
  }

  // Final exam check
  if (lessonId === linstitutRestaurant.finalExam.id) {
    return linstitutRestaurant.lessons.every(
      l => (completedDishes[l.id] ?? 0) > 0
    );
  }

  return false;
}

/**
 * Get the number of lessons completed (with at least 1 star)
 */
export function getLessonsCompleted(
  completedDishes: Record<string, number>
): number {
  return linstitutRestaurant.lessons.filter(
    l => (completedDishes[l.id] ?? 0) > 0
  ).length;
}

/**
 * Get lesson metadata by dish ID
 */
export function getLessonByDishId(dishId: string): LinstitutLesson | LinstitutFinalExam | null {
  const lesson = linstitutRestaurant.lessons.find(l => l.id === dishId);
  if (lesson) return lesson;

  if (dishId === linstitutRestaurant.finalExam.id) {
    return linstitutRestaurant.finalExam;
  }

  return null;
}
