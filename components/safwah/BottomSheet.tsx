import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { safwah } from '../../theme/safwah';

export function useBottomSheet() {
  const [isVisible, setVisible] = useState(false);
  return { isVisible, open: () => setVisible(true), close: () => setVisible(false) };
}

export function BottomSheet({
  isVisible,
  onClose,
  title,
  children,
}: {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const ty = useRef(new Animated.Value(700)).current;

  useEffect(() => {
    if (isVisible) Animated.spring(ty, { toValue: 0, useNativeDriver: true, friction: 11, tension: 70 }).start();
  }, [isVisible, ty]);

  const dismiss = () => Animated.timing(ty, { toValue: 700, duration: 220, useNativeDriver: true }).start(() => onClose());

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) ty.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) dismiss();
        else Animated.spring(ty, { toValue: 0, useNativeDriver: true, friction: 11, tension: 70 }).start();
      },
    }),
  ).current;

  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent onRequestClose={dismiss}>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={dismiss} />
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 18, transform: [{ translateY: ty }] }]}>
          <View {...pan.panHandlers} style={styles.grabZone}>
            <View style={styles.grab} />
          </View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: safwah.colors.bgElevated, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, borderColor: safwah.colors.borderStrong, paddingHorizontal: 20, paddingTop: 10 },
  grabZone: { alignItems: 'center', paddingVertical: 8, marginBottom: 6 },
  grab: { width: 42, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  title: { fontFamily: safwah.font.bold, fontSize: 18, color: safwah.colors.text, marginBottom: 16 },
});
