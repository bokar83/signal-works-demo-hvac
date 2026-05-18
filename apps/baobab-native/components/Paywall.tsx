/**
 * Paywall component - inline use (e.g. inside a screen)
 * For full-screen paywall use app/paywall.tsx via router.push('/paywall')
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Colors, Spacing, Radius } from '../lib/design';

interface Props {
  reason?: string;
}

export default function Paywall({ reason = 'Unlock unlimited practice sessions.' }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 200 }}
      style={styles.container}
    >
      <Text style={styles.icon}>◎</Text>
      <Text style={styles.title}>Upgrade to keep going</Text>
      <Text style={styles.reason}>{reason}</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push('/paywall')}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>See plans</Text>
        <Text style={styles.btnArrow}>→</Text>
      </TouchableOpacity>

      <Text style={styles.freeTierNote}>
        Free tier: 3 drill sessions/day, basic pace analysis only.
      </Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accentSubtle,
    gap: Spacing.m,
  },
  icon: { fontSize: 36, color: Colors.accent },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  reason: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.l,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    gap: Spacing.m,
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.textInverse },
  btnArrow: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.textInverse },
  freeTierNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
