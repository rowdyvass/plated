// L'Institut Theme - Default theme colors
export const linstitutTheme = {
  foundation: {
    100: '#FFFEFA',
    200: '#FAF6F1',
    300: '#F5EDE4',
    500: '#D4C9BB',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#2C2C2C',
    tertiary: '#5C5C5C',
    muted: '#8C8C8C',
  },
  accent: {
    primary: '#B87333',
    star: '#D4AF37',
  },
  ceramic: {
    surface: '#FEFEFA',
    rim: '#F8F4EC',
  },
  state: {
    success: '#4A6741',
    warning: '#B8860B',
    error: '#8B4049',
  },
} as const;

export type Theme = typeof linstitutTheme;
