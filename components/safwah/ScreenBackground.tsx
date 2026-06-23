import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { safwah } from '../../theme/safwah';

/// Near-solid black canvas with a single whisper-soft lime glow at the very top.
/// Deliberately restrained — premium-minimal, not gradient-heavy.
export function ScreenBackground({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const h = Math.max(height, 760);
  return (
    <View style={styles.root}>
      <Svg width={width} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="topglow" cx="50%" cy="-8%" r="55%">
            <Stop offset="0" stopColor="#CCFF00" stopOpacity="0.055" />
            <Stop offset="1" stopColor="#CCFF00" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={h} fill="#000000" />
        <Rect x="0" y="0" width={width} height={h} fill="url(#topglow)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: safwah.colors.bg } });
