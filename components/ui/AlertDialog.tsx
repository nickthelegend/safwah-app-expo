import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Pressable
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeButton } from './ThemeButton';

interface AlertDialogProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function useAlertDialog() {
  const [isVisible, setIsVisible] = useState(false);

  const open = useCallback(() => setIsVisible(true), []);
  const close = useCallback(() => setIsVisible(false), []);

  return {
    isVisible,
    open,
    close,
  };
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
}: AlertDialogProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={[styles.content, { backgroundColor: '#ffffff' }]}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onCancel || onClose}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <ThemeButton 
              title={confirmText} 
              onPress={onConfirm}
              style={styles.confirmButton}
              textStyle={styles.confirmButtonText}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(19, 19, 22, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(19, 19, 22, 0.1)',
    shadowColor: 'rgba(19, 19, 22, 0.12)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: 20,
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#63636b',
    lineHeight: 22,
    marginBottom: 32,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 15,
    color: '#9a9aa2',
  },
  confirmButton: {
    minWidth: 120,
    height: 48,
  },
  confirmButtonText: {
    fontSize: 15,
  }
});

