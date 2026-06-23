import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { safwah } from '../../theme/safwah';

export function ChartContainer({
  title,
  description,
  right,
  children,
  style,
}: {
  title?: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: any;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [fade]);

  return (
    <Animated.View
      style={[
        styles.card,
        style,
        { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] },
      ]}
    >
      {(title || right) && (
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </Animated.View>
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
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontFamily: safwah.font.semibold, fontSize: 15.5, color: safwah.colors.text },
  description: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textDim, marginTop: 3 },
});
