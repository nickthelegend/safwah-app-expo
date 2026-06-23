import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { safwah } from '../../theme/safwah';

/// Solid, crisp card surface (premium-minimal — no translucency/glow).
export function GlassCard({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: safwah.colors.card,
    borderWidth: 1,
    borderColor: safwah.colors.border,
    borderRadius: safwah.radius.lg,
    padding: 18,
  },
});
