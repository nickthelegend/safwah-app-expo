import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { safwah } from '../../theme/safwah';

type Variant = 'default' | 'success' | 'error';
type ToastInput = { title: string; description?: string; variant?: Variant };

const META: Record<Variant, { icon: string; color: string }> = {
  default: { icon: 'information-circle', color: safwah.colors.lime },
  success: { icon: 'checkmark-circle', color: safwah.colors.emerald },
  error: { icon: 'alert-circle', color: safwah.colors.danger },
};

const ToastContext = createContext<{ toast: (t: ToastInput) => void }>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<ToastInput | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = () => Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setCurrent(null));

  const toast = (t: ToastInput) => {
    if (timer.current) clearTimeout(timer.current);
    setCurrent(t);
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 9, tension: 80 }).start();
    timer.current = setTimeout(hide, 2800);
  };

  const meta = current ? META[current.variant || 'default'] : META.default;

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {current && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            { top: insets.top + 8, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }] },
          ]}
        >
          <View style={styles.toast}>
            <View style={[styles.iconWrap, { backgroundColor: meta.color + '22' }]}>
              <Ionicons name={meta.icon as never} size={20} color={meta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{current.title}</Text>
              {current.description ? <Text style={styles.desc}>{current.description}</Text> : null}
            </View>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 14, right: 14, zIndex: 9999 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: safwah.colors.bgElevated, borderWidth: 1, borderColor: safwah.colors.borderStrong, borderRadius: safwah.radius.md, paddingVertical: 12, paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12 },
  iconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.text },
  desc: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textDim, marginTop: 2 },
});
