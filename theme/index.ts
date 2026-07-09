export const theme = {
  colors: {
    background: '#f6f6f7',
    backgroundSecondary: '#eeeef0',
    primary: '#131316',
    primaryDark: '#33333a',
    secondary: '#E1EEE6',
    text: '#131316',
    textSecondary: '#63636b',
    textMuted: '#9a9aa2',
    border: 'rgba(19,19,22,0.10)',
    borderLight: 'rgba(19,19,22,0.14)',
    card: '#ffffff',
    cardElevated: '#eeeef0',
    error: '#e5484d',
    success: '#17a34a',
    warning: '#FFA500',
    accent: '#131316',
  },
  gradients: {
    primary: ['#131316', '#33333a'],
    card: ['#ffffff', '#eeeef0'],
    background: ['#f6f6f7', '#eeeef0'],
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
      shadowColor: 'rgba(19,19,22,0.12)',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
    },
    card: {
      shadowColor: 'rgba(19,19,22,0.12)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    subtle: {
      shadowColor: 'rgba(19,19,22,0.12)',
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
      color: '#131316',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: '#131316',
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: '#131316',
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 16,
      color: '#131316',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      color: '#63636b',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      color: '#9a9aa2',
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