import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Colors, Typography, Spacing, Radius } from '../lib/design';
import { useEntitlements } from '../hooks/useEntitlements';
import { useSession } from '../hooks/useSession';

const { width } = Dimensions.get('window');

const PERSONA_TAGS = [
  { label: 'Job interviews', color: Colors.accent },
  { label: 'Sales calls', color: '#7C8CF8' },
  { label: 'Public speaking', color: '#F472B6' },
  { label: 'Content creation', color: '#34D399' },
];

export default function HomeScreen() {
  const { status } = useEntitlements();
  const { sessions, fetchSessions } = useSession();

  useEffect(() => {
    void fetchSessions(5);
  }, [fetchSessions]);

  const lastSession = sessions[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            <Text style={styles.wordmark}>Baobab</Text>
          </MotiView>
          <TouchableOpacity
            style={styles.accountBtn}
            onPress={() => router.push('/account')}
          >
            <View style={styles.avatarDot} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 100 }}
          style={styles.hero}
        >
          <Text style={styles.heroLabel}>PRACTICE</Text>
          <Text style={styles.heroHeadline}>
            {"Any conversation\nthat matters."}
          </Text>
          <Text style={styles.heroSubtext}>
            Delivery coaching for interviews, pitches, talks, and calls.
            Practice until it clicks.
          </Text>
        </MotiView>

        {/* Persona tags */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.tagRow}
        >
          {PERSONA_TAGS.map((tag) => (
            <View key={tag.label} style={[styles.tag, { borderColor: tag.color + '40' }]}>
              <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
              <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
            </View>
          ))}
        </MotiView>

        {/* Primary CTA */}
        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200, delay: 400 }}
          style={styles.ctaContainer}
        >
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => router.push('/scenarios')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryCtaText}>Pick a scenario</Text>
            <Text style={styles.primaryCtaArrow}>→</Text>
          </TouchableOpacity>
        </MotiView>

        {/* Last session card */}
        {lastSession && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 600 }}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>LAST SESSION</Text>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text style={styles.sectionLink}>See all</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.sessionCard}
              onPress={() => router.push('/history')}
              activeOpacity={0.8}
            >
              <View style={styles.sessionCardLeft}>
                <Text style={styles.sessionScenario}>{lastSession.scenario_id}</Text>
                <Text style={styles.sessionDate}>
                  {new Date(lastSession.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.sessionScoreContainer}>
                <Text
                  style={[
                    styles.sessionScore,
                    { color: Colors.scoreBand(lastSession.aggregate_score) },
                  ]}
                >
                  {lastSession.aggregate_score}
                </Text>
                <Text style={styles.sessionScoreLabel}>/100</Text>
              </View>
            </TouchableOpacity>
          </MotiView>
        )}

        {/* Empty state for no sessions */}
        {sessions.length === 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 600 }}
            style={styles.emptyState}
          >
            <Text style={styles.emptyIcon}>◎</Text>
            <Text style={styles.emptyText}>
              No sessions yet.{'\n'}Run one and see your delivery score in 30 seconds.
            </Text>
          </MotiView>
        )}

        {/* Upgrade nudge for free users */}
        {status === 'free' && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 800 }}
          >
            <TouchableOpacity
              style={styles.upgradeNudge}
              onPress={() => router.push('/paywall')}
              activeOpacity={0.85}
            >
              <Text style={styles.upgradeText}>
                Unlock unlimited practice
              </Text>
              <Text style={styles.upgradeArrow}>→</Text>
            </TouchableOpacity>
          </MotiView>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    marginBottom: Spacing.xxxl,
  },
  wordmark: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  },
  accountBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
  },
  hero: {
    marginBottom: Spacing.xl,
  },
  heroLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.accent,
    marginBottom: Spacing.s,
    textTransform: 'uppercase' as const,
  },
  heroHeadline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
    color: Colors.textPrimary,
    marginBottom: Spacing.l,
  },
  heroSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
    marginBottom: Spacing.xxl,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.m,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  tagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  ctaContainer: {
    marginBottom: Spacing.xxxl,
  },
  primaryCta: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.l,
    paddingVertical: Spacing.l,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryCtaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textInverse,
    letterSpacing: -0.3,
  },
  primaryCtaArrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.textInverse,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
  },
  sectionLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.accent,
  },
  sessionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    padding: Spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  sessionCardLeft: {
    flex: 1,
  },
  sessionScenario: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 4,
    textTransform: 'capitalize' as const,
  },
  sessionDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
  },
  sessionScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  sessionScore: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -1,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  sessionScoreLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.l,
  },
  emptyIcon: {
    fontSize: 40,
    color: Colors.textTertiary,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  upgradeNudge: {
    borderWidth: 1,
    borderColor: Colors.accentSubtle,
    backgroundColor: Colors.accentSubtle,
    borderRadius: Radius.l,
    paddingVertical: Spacing.l,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  upgradeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.accent,
  },
  upgradeArrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.accent,
  },
  bottomPad: {
    height: Spacing.huge,
  },
});

