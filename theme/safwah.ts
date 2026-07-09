// Safwah design system — Talise register (talise.io look): light green→cream canvas,
// white cards, dark-green ink as the primary accent, lime as the signature highlight.
// See ../../safwah-landing-page/DESIGN.md
export const safwah = {
  colors: {
    bg: '#F4FAEC',            // light green paper canvas
    bgElevated: '#FBF3EA',    // warm cream
    card: '#ffffff',
    cardSoft: '#EFF6E6',
    lime: '#15300C',          // primary accent → ink (dark pills / active)
    limeDim: '#2F4A24',
    limeBright: '#CAFFB8',    // signature lime highlight
    emerald: '#1F9D46',       // success / positive
    text: '#15300C',          // dark-green ink
    textDim: '#46603A',
    textMute: '#7B9169',
    border: 'rgba(21,48,12,0.10)',
    borderStrong: 'rgba(21,48,12,0.16)',
    hairline: 'rgba(21,48,12,0.06)',
    limeWash: 'rgba(202,255,184,0.45)',
    emeraldWash: 'rgba(31,157,70,0.10)',
    danger: '#e5484d',
    onLime: '#F7FCF2',        // cream text/icon on ink pills
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
