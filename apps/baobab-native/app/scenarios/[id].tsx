import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MotiView } from 'moti';
import { getScenario } from '../../lib/scenarios';
import { Colors, Spacing, Radius } from '../../lib/design';

const DIFFICULTY_COLORS: Record<string, string> = {
  'Beginner': '#34D399',
  'Intermediate': '#FBBF24',
  'Advanced': '#F472B6',
  'High Stakes': '#F87171',
};

export default function ScenarioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenario = getScenario(id);

  if (!scenario) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Scenario not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const diffColor = DIFFICULTY_COLORS[scenario.difficulty] ?? Colors.accent;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Scenarios</Text>
        </TouchableOpacity>

        {/* Hero */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <View style={styles.badges}>
            <View style={[styles.badge, { borderColor: diffColor + '40' }]}>
              <Text style={[styles.badgeText, { color: diffColor }]}>
                {scenario.difficulty}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{scenario.mode}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{scenario.category}</Text>
            </View>
          </View>

          <Text style={styles.title}>{scenario.title}</Text>
          <Text style={styles.description}>{scenario.description}</Text>

          {/* Info row */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>DURATION</Text>
              <Text style={styles.infoValue}>{Math.round(scenario.durationSec / 60)} min</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>PREP TIME</Text>
              <Text style={styles.infoValue}>{scenario.prepSec}s</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>MODE</Text>
              <Text style={styles.infoValue}>{scenario.mode}</Text>
            </View>
          </View>
        </MotiView>

        {/* Opening line preview */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.openingCard}
        >
          <Text style={styles.openingLabel}>OPENING LINE</Text>
          <Text style={styles.openingText}>&ldquo;{scenario.openingLine}&rdquo;</Text>
        </MotiView>

        {/* What to do */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.promptCard}
        >
          <Text style={styles.promptLabel}>YOUR GOAL</Text>
          <Text style={styles.promptText}>{scenario.promptToUser}</Text>
        </MotiView>

        {/* Context required */}
        {scenario.contextRequired.length > 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 400 }}
            style={styles.contextCard}
          >
            <Text style={styles.contextLabel}>PERSONALIZE WITH</Text>
            <View style={styles.contextItems}>
              {scenario.contextRequired.map((ctx) => (
                <View key={ctx} style={styles.contextItem}>
                  <Text style={styles.contextDot}>+</Text>
                  <Text style={styles.contextText}>
                    {ctx === 'resume' ? 'Your resume' :
                      ctx === 'jobDescription' ? 'Job description' :
                      'Company name'}
                  </Text>
                </View>
              ))}
            </View>
          </MotiView>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Start CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push(`/practice/${scenario.id}`)}
          activeOpacity={0.85}
        >
          <Text style={styles.startText}>Start practice</Text>
          <Text style={styles.startArrow}>→</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 120,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.l,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.accent,
  },
  backBtn: {
    marginBottom: Spacing.xl,
  },
  backText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.s,
    marginBottom: Spacing.l,
  },
  badge: {
    paddingHorizontal: Spacing.m,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -0.8,
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
  },
  infoValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  },
  openingCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    padding: Spacing.l,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    marginBottom: Spacing.l,
  },
  openingLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.accent,
    marginBottom: Spacing.s,
    textTransform: 'uppercase' as const,
  },
  openingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  promptCard: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: Radius.l,
    padding: Spacing.l,
    marginBottom: Spacing.l,
  },
  promptLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    marginBottom: Spacing.s,
    textTransform: 'uppercase' as const,
  },
  promptText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  contextCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.l,
    padding: Spacing.l,
    marginBottom: Spacing.l,
  },
  contextLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    marginBottom: Spacing.s,
    textTransform: 'uppercase' as const,
  },
  contextItems: {
    gap: Spacing.s,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  contextDot: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.accent,
  },
  contextText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomPad: {
    height: Spacing.xxxl,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.l,
    paddingVertical: Spacing.l,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textInverse,
  },
  startArrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.textInverse,
  },
});
