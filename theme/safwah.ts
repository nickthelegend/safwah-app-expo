// Safwah design system — premium white/black (Mobbin register): light-gray canvas,
// white cards, ink as the primary accent, green reserved for success only.
export const safwah = {
  colors: {
    bg: '#f6f6f7',
    bgElevated: '#ffffff',
    card: '#ffffff',
    cardSoft: '#eeeef0',
    lime: '#131316',          // primary accent → ink (dark pills / active)
    limeDim: '#33333a',
    emerald: '#17a34a',       // success / positive only
    text: '#131316',
    textDim: '#63636b',
    textMute: '#9a9aa2',
    border: 'rgba(19,19,22,0.08)',
    borderStrong: 'rgba(19,19,22,0.14)',
    hairline: 'rgba(19,19,22,0.06)',
    limeWash: 'rgba(19,19,22,0.05)',
    emeraldWash: 'rgba(23,163,74,0.10)',
    danger: '#e5484d',
    onLime: '#ffffff',        // text/icon on ink pills
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
