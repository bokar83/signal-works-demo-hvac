import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MotiView } from 'moti';
import type { AnalysisResult } from '../../../lib/types';
import { buildStubAnalysis } from '../../../lib/voiceAnalysis';
import { getScenario } from '../../../lib/scenarios';
import { Colors, Spacing, Radius } from '../../../lib/design';
import ScoreRing from '../../../components/ScoreRing';
import FillerWordChip from '../../../components/FillerWordChip';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://jscucboftaoaphticqci.supabase.co';

export default function ResultsScreen() {
  const { id, uri, durationSec, scenarioId, error } = useLocalSearchParams<{
    id: string;
    uri: string;
    durationSec: string;
    scenarioId: string;
    error?: string;
  }>();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const scenario = getScenario(scenarioId ?? id);
  const duration = parseInt(durationSec ?? '60', 10);

  useEffect(() => {
    if (error) {
      setFetchError('Recording failed. Please try again.');
      setLoading(false);
      return;
    }

    if (!uri) {
      setFetchError('No recording found.');
      setLoading(false);
      return;
    }

    void analyzeRecording();
  }, [uri, error]);

  async function analyzeRecording() {
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/baobab-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: uri,
          scenarioId: scenarioId ?? id,
          durationSec: duration,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!resp.ok) {
        throw new Error(`Analysis failed: ${resp.status}`);
      }

      const data = (await resp.json()) as AnalysisResult;
      setAnalysis(data);
    } catch (err: unknown) {
      // Fallback: regex-only offline analysis
      console.warn('[Results] Edge function unavailable, using offline analysis:', err);
      const stubResult = buildStubAnalysis('', duration);
      setAnalysis(stubResult);
      setFetchError('(Offline mode - connect for full AI analysis)');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Analyzing your session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysis && fetchError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorCenter}>
          <Text style={styles.errorEmoji}>◎</Text>
          <Text style={styles.errorText}>{fetchError}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysis) return null;

  const scoreColor = Colors.scoreBand(analysis.aggregate_score);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
        </View>

        {/* Scenario name */}
        {scenario && (
          <Text style={styles.scenarioName}>{scenario.title}</Text>
        )}

        {/* Offline warning */}
        {fetchError && (
          <View style={styles.offlineBar}>
            <Text style={styles.offlineText}>{fetchError}</Text>
          </View>
        )}

        {/* Score ring hero */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 120 }}
          style={styles.scoreHero}
        >
          <ScoreRing score={analysis.aggregate_score} size={160} />
          <Text style={styles.scoreLabel}>Overall score</Text>
        </MotiView>

        {/* Sub-scores */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.subScoresRow}
        >
          <SubScore label="Pace" value={`${analysis.pace_wpm} WPM`} />
          <SubScore label="Clarity" value={`${analysis.clarity_score}`} />
          <SubScore label="Confidence" value={`${analysis.confidence_score}`} />
          <SubScore label="Content" value={`${analysis.content_score}`} />
        </MotiView>

        {/* Filler words */}
        {analysis.filler_details.length > 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 500 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Filler words</Text>
            <Text style={styles.fillerCount}>
              {analysis.filler_count} detected
            </Text>
            <View style={styles.fillerChips}>
              {analysis.filler_details.map((detail) => (
                <FillerWordChip key={detail.word} detail={detail} />
              ))}
            </View>
          </MotiView>
        )}

        {/* Summary */}
        {analysis.summary && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 600 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{analysis.summary}</Text>
          </MotiView>
        )}

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 700 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Strengths</Text>
            {analysis.strengths.map((s, i) => (
              <View key={i} style={styles.feedbackItem}>
                <Text style={[styles.feedbackIcon, { color: Colors.success }]}>+</Text>
                <Text style={styles.feedbackText}>{s}</Text>
              </View>
            ))}
          </MotiView>
        )}

        {/* Improvements */}
        {analysis.improvements.length > 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 800 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Next time</Text>
            {analysis.improvements.map((s, i) => (
              <View key={i} style={styles.feedbackItem}>
                <Text style={[styles.feedbackIcon, { color: Colors.accent }]}>→</Text>
                <Text style={styles.feedbackText}>{s}</Text>
              </View>
            ))}
          </MotiView>
        )}

        {/* Retake CTA */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 900 }}
          style={styles.retakeCtaContainer}
        >
          <TouchableOpacity
            style={styles.retakeCta}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.retakeCtaText}>Practice again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.push('/')}
            activeOpacity={0.85}
          >
            <Text style={styles.homeBtnText}>Home</Text>
          </TouchableOpacity>
        </MotiView>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SubScore({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.subScore}>
      <Text style={styles.subScoreValue}>{value}</Text>
      <Text style={styles.subScoreLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.l,
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  errorCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.l,
    paddingHorizontal: Spacing.xl,
  },
  errorEmoji: {
    fontSize: 48,
    color: Colors.textTertiary,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.l,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
  },
  retryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.textInverse,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  doneText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.textPrimary,
  },
  retakeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.accent,
  },
  scenarioName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.l,
  },
  offlineBar: {
    backgroundColor: Colors.warningSubtle,
    borderRadius: Radius.s,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    marginBottom: Spacing.l,
  },
  offlineText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
  },
  scoreHero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  scoreLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: Spacing.m,
  },
  subScoresRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
    justifyContent: 'space-around',
  },
  subScore: {
    alignItems: 'center',
    gap: 4,
  },
  subScoreValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  subScoreLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textTertiary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: Spacing.m,
  },
  fillerCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: Spacing.m,
  },
  fillerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
  },
  summaryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  feedbackItem: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginBottom: Spacing.s,
    alignItems: 'flex-start',
  },
  feedbackIcon: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 22,
  },
  feedbackText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  retakeCtaContainer: {
    gap: Spacing.m,
    marginBottom: Spacing.xl,
  },
  retakeCta: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.l,
    paddingVertical: Spacing.l,
    alignItems: 'center',
  },
  retakeCtaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.textInverse,
  },
  homeBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    paddingVertical: Spacing.l,
    alignItems: 'center',
  },
  homeBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  bottomPad: {
    height: Spacing.huge,
  },
});
