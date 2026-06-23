import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { safwah } from '../../theme/safwah';

export function useAlertDialog() {
  const [isVisible, setVisible] = useState(false);
  return { isVisible, open: () => setVisible(true), close: () => setVisible(false) };
}

export function AlertDialog({
  isVisible,
  onClose,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}: {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}) {
  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onCancel || onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} activeOpacity={0.85} onPress={onCancel || onClose}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirm, destructive && styles.confirmDanger]}
              activeOpacity={0.9}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, destructive && { color: '#fff' }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.66)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  card: { width: '100%', maxWidth: 360, backgroundColor: safwah.colors.bgElevated, borderWidth: 1, borderColor: safwah.colors.borderStrong, borderRadius: safwah.radius.lg, padding: 22 },
  title: { fontFamily: safwah.font.bold, fontSize: 18, color: safwah.colors.text },
  description: { fontFamily: safwah.font.regular, fontSize: 13.5, lineHeight: 20, color: safwah.colors.textDim, marginTop: 10 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  cancel: { flex: 1, height: 48, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: safwah.font.semibold, fontSize: 14.5, color: safwah.colors.text },
  confirm: { flex: 1, height: 48, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center' },
  confirmDanger: { backgroundColor: safwah.colors.danger },
  confirmText: { fontFamily: safwah.font.bold, fontSize: 14.5, color: safwah.colors.onLime },
});
