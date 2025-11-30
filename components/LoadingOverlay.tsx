import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

interface LoadingOverlayProps {
  message?: string;
  visible?: boolean;
}

/**
 * Loading overlay component for async operations.
 */
export function LoadingOverlay({
  message = 'Loading...',
  visible = true,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  content: {
    backgroundColor: colors.secondaryBackground,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  message: {
    ...typography.body,
    marginTop: spacing.md,
  },
});

export default LoadingOverlay;
