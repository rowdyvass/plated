import type { Restaurant } from '@/types';
import { linstitutTheme } from '../themes/colors';

export const restaurants: Record<string, Restaurant> = {
  linstitut: {
    id: 'linstitut',
    name: "L'Institut",
    description: 'A classic French fine dining establishment where tradition meets precision.',
    theme: {
      primary: linstitutTheme.accent.primary,
      secondary: linstitutTheme.foundation[200],
      accent: linstitutTheme.accent.star,
      background: linstitutTheme.foundation[100],
    },
    dishes: ['classic-consomme', 'duck-confit', 'tarte-tatin'],
  },
};
