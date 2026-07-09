// Bottom-sheet style modal that reflects the current transaction status and links
// the tx hash to Polygonscan. Driven by TxProvider.
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import { theme } from '@/theme';
import { shortHash, txUrl } from '@/lib/explorer';
import type { TxState, TxStatus } from '@/provider/TxProvider';

function titleFor(status: TxStatus, label?: string) {
  switch (status) {
    case 'signing':
      return 'Confirm in your wallet';
    case 'pending':
      return label ? `${label}…` : 'Transaction pending';
    case 'success':
      return label ? `${label} confirmed` : 'Transaction confirmed';
    case 'error':
      return 'Transaction failed';
    default:
      return '';
  }
}

function subtitleFor(status: TxStatus, error?: string) {
  switch (status) {
    case 'signing':
      return 'Approve the transaction in your wallet app.';
    case 'pending':
      return 'Waiting for Polygon to confirm…';
    case 'success':
      return 'Done — settled on Polygon Amoy.';
    case 'error':
      return error || 'Something went wrong.';
    default:
      return '';
  }
}

function StatusIcon({ status }: { status: TxStatus }) {
  if (status === 'signing' || status === 'pending') {
    return <ActivityIndicator size="large" color={theme.colors.primary} />;
  }
  if (status === 'success') {
    return <Ionicons name="checkmark-circle" size={56} color={theme.colors.success} />;
  }
  return <Ionicons name="close-circle" size={56} color={theme.colors.error} />;
}

export function TxStatusModal({ state, onClose }: { state: TxState; onClose: () => void }) {
  const { status, hash, label, error } = state;
  const visible = status !== 'idle';
  const closable = status === 'success' || status === 'error';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closable ? onClose : undefined}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.iconWrap}>
            <StatusIcon status={status} />
          </View>

          <Text style={styles.title}>{titleFor(status, label)}</Text>
          <Text style={styles.subtitle}>{subtitleFor(status, error)}</Text>

          {hash ? (
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => WebBrowser.openBrowserAsync(txUrl(hash))}
              activeOpacity={0.8}
            >
              <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.link}>View on Polygonscan</Text>
              <Text style={styles.hash}>{shortHash(hash)}</Text>
            </TouchableOpacity>
          ) : null}

          {closable ? (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.closeText}>Done</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(19,19,22,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xl + 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  iconWrap: {
    height: 64,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.cardElevated,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: theme.spacing.md,
  },
  link: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  hash: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  closeBtn: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
