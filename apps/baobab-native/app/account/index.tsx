import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { getSupabaseOrNull } from '../../lib/supabase';
import { useEntitlements } from '../../hooks/useEntitlements';
import { Colors, Spacing, Radius } from '../../lib/design';

const PRIVACY_POLICY_URL = 'https://baobab.app/privacy';

// Apple manageSubscriptions URL - opens iOS subscription management
const MANAGE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export default function AccountScreen() {
  const { status, isPro, isFree } = useEntitlements();

  async function handleSignOut() {
    const supabase = getSupabaseOrNull();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign out failed', error.message);
    } else {
      router.push('/');
    }
  }

  async function handleManageSubscription() {
    // Per spec: surfaces Apple's manageSubscriptions link
    await Linking.openURL(MANAGE_SUBSCRIPTIONS_URL);
  }

  async function handlePrivacyPolicy() {
    await Linking.openURL(PRIVACY_POLICY_URL);
  }

  const statusLabel = isFree ? 'Free tier' : status === 'burst' ? 'Burst Pack (30-day)' : 'Pro';
  const statusColor = isFree ? Colors.textTertiary : Colors.accent;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Subscription status */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.statusCard}
        >
          <Text style={styles.statusLabel}>PLAN</Text>
          <Text style={[styles.statusValue, { color: statusColor }]}>{statusLabel}</Text>

          {isFree && (
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => router.push('/paywall')}
              activeOpacity={0.85}
            >
              <Text style={styles.upgradeBtnText}>Unlock unlimited practice</Text>
              <Text style={styles.upgradeBtnArrow}>→</Text>
            </TouchableOpacity>
          )}

          {/* In-app cancel - per spec requirement */}
          {isPro && (
            <TouchableOpacity
              style={styles.manageBtn}
              onPress={handleManageSubscription}
              activeOpacity={0.8}
            >
              <Text style={styles.manageBtnText}>Manage or cancel subscription</Text>
              <Text style={styles.manageBtnArrow}>↗</Text>
            </TouchableOpacity>
          )}
        </MotiView>

        {/* Settings section */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <SettingRow
            label="Privacy policy"
            onPress={handlePrivacyPolicy}
            isExternal
          />
          <SettingRow
            label="Request data deletion"
            onPress={() => Alert.alert(
              'Data deletion',
              'To delete all your data, email privacy@baobab.app with subject "Delete my account".',
              [{ text: 'OK' }]
            )}
          />
        </MotiView>

        {/* Sign out */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
          style={styles.section}
        >
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </MotiView>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  onPress,
  isExternal = false,
}: {
  label: string;
  onPress: () => void;
  isExternal?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingArrow}>{isExternal ? '↗' : '→'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backBtn: {
    width: 40,
    alignItems: 'flex-start',
  },
  backText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 22,
    color: Colors.textSecondary,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
    gap: Spacing.m,
  },
  statusLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
  },
  statusValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  upgradeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.m,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  upgradeBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: Colors.textInverse,
  },
  upgradeBtnArrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.textInverse,
  },
  manageBtn: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: Radius.m,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  manageBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  manageBtnArrow: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.textTertiary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    marginBottom: Spacing.m,
    textTransform: 'uppercase' as const,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  settingLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  settingArrow: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.textTertiary,
  },
  signOutBtn: {
    padding: Spacing.l,
    alignItems: 'center',
    backgroundColor: Colors.errorSubtle,
    borderRadius: Radius.l,
  },
  signOutText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.error,
  },
  bottomPad: {
    height: Spacing.huge,
  },
});
