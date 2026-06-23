// Safwah design system — XORR-matched but premium-minimal: near-solid surfaces, one
// whisper-soft glow, lime (#CCFF00) used as a sharp accent rather than washes.
export const safwah = {
  colors: {
    bg: '#000000',
    bgElevated: '#08080a',
    card: '#0d0d0f',
    cardSoft: '#101013',
    lime: '#CCFF00',
    limeDim: '#bfe800',
    emerald: '#10b981',
    text: '#f3f3f4',
    textDim: '#9a9aa0',
    textMute: '#5d5d63',
    border: 'rgba(255,255,255,0.07)',
    borderStrong: 'rgba(255,255,255,0.12)',
    hairline: 'rgba(255,255,255,0.05)',
    limeWash: 'rgba(204,255,0,0.09)',
    emeraldWash: 'rgba(16,185,129,0.10)',
    danger: '#ff6b6b',
    onLime: '#0a0a0a',
  },
  font: {
    display: 'SpaceGrotesk_700Bold',
    bold: 'SpaceGrotesk_700Bold',
    semibold: 'SpaceGrotesk_600SemiBold',
    medium: 'SpaceGrotesk_500Medium',
    regular: 'SpaceGrotesk_400Regular',
    mono: 'JetBrainsMono_400Regular',
    monoBold: 'JetBrainsMono_700Bold',
  },
  radius: { sm: 12, md: 16, lg: 20, xl: 26, pill: 999 },
  space: (n: number) => n * 4,
} as const;

export type SafwahTheme = typeof safwah;
