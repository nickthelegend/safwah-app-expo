export const theme = {
  colors: {
    background: '#F4FAEC',
    backgroundSecondary: '#E7F0DB',
    primary: '#15300C',
    primaryDark: '#0A0E0B',
    secondary: '#DDF3D0',
    text: '#15300C',
    textSecondary: '#46603A',
    textMuted: '#7B9169',
    border: 'rgba(21,48,12,0.10)',
    borderLight: 'rgba(21,48,12,0.14)',
    card: '#ffffff',
    cardElevated: '#EFF6E6',
    error: '#e5484d',
    success: '#1F9D46',
    warning: '#E0A82E',
    accent: '#15300C',
    lime: '#CAFFB8',
  },
  gradients: {
    primary: ['#15300C', '#0A0E0B'],
    card: ['#ffffff', '#EFF6E6'],
    background: ['#F4FAEC', '#E7F0DB'],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadows: {
    glow: {
      shadowColor: 'rgba(21,48,12,0.14)',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
    },
    card: {
      shadowColor: 'rgba(21,48,12,0.14)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    subtle: {
      shadowColor: 'rgba(21,48,12,0.14)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      color: '#15300C',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: '#15300C',
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: '#15300C',
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 16,
      color: '#15300C',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      color: '#46603A',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      color: '#7B9169',
      lineHeight: 16,
    },
  },
  animations: {
    fast: 200,
    medium: 300,
    slow: 500,
  },
};

export type Theme = typeof theme;

export const createGradient = (colors: string[]) => ({
  flex: 1,
  colors,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
});