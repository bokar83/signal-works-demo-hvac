import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing as RNEasing,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { getScenario } from '../../lib/scenarios';
import { Colors, Spacing, Radius } from '../../lib/design';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import PracticeRecorder from '../../components/PracticeRecorder';

type PracticePhase = 'prep' | 'recording' | 'stopped' | 'analyzing';

export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenario = getScenario(id);
  const [phase, setPhase] = useState<PracticePhase>('prep');
  const [prepSecsLeft, setPrepSecsLeft] = useState(scenario?.prepSec ?? 30);
  const [analysisResult, setAnalysisResult] = useState<Record<string, unknown> | null>(null);
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    state: recorderState,
    durationMs,
    metering,
    startRecording,
    stopRecording,
    reset: resetRecorder,
  } = useAudioRecorder();

  const stopPhase = useCallback(async () => {
    const result = await stopRecording();
    setPhase('analyzing');

    if (!result) {
      router.push(`/practice/${id}/results?error=recording_failed`);
      return;
    }

    // Navigate to results - pass recording info
    const durationSec = Math.round(result.durationMs / 1000);
    router.push(
      `/practice/${id}/results?uri=${encodeURIComponent(result.uri)}&durationSec=${durationSec}&scenarioId=${id}`
    );
  }, [id, stopRecording]);

  useEffect(() => {
    if (phase !== 'prep') return;

    prepTimerRef.current = setInterval(() => {
      setPrepSecsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current!);
          setPhase('recording');
          void startRecording();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, [phase, startRecording]);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            resetRecorder();
            router.back();
          }}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.scenarioTitle} numberOfLines={1}>
          {scenario.title}
        </Text>
        <View style={styles.cancelBtn} />
      </View>

      <View style={styles.content}>
        {/* Phase indicator */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.phaseContainer}
        >
          {phase === 'prep' && (
            <>
              <Text style={styles.phaseLabel}>PREPARE</Text>
              <Text style={styles.prepCountdown}>{prepSecsLeft}</Text>
              <Text style={styles.prepSubtext}>seconds to prepare</Text>
            </>
          )}
          {phase === 'recording' && (
            <>
              <Text style={[styles.phaseLabel, { color: Colors.recordActive }]}>
                RECORDING
              </Text>
              <Text style={styles.durationDisplay}>
                {formatDuration(durationMs)}
              </Text>
            </>
          )}
          {phase === 'analyzing' && (
            <>
              <Text style={styles.phaseLabel}>ANALYZING</Text>
              <Text style={styles.analyzingText}>Processing your session...</Text>
            </>
          )}
        </MotiView>

        {/* Opening line card */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.openingCard}
        >
          <Text style={styles.openingLabel}>SCENARIO PROMPT</Text>
          <Text style={styles.openingText}>&ldquo;{scenario.openingLine}&rdquo;</Text>
        </MotiView>

        {/* Recorder component */}
        {(phase === 'recording' || phase === 'prep') && (
          <PracticeRecorder
            state={recorderState}
            metering={metering}
            phase={phase}
            onStart={() => {
              if (phase === 'prep') {
                if (prepTimerRef.current) clearInterval(prepTimerRef.current);
                setPhase('recording');
                void startRecording();
              }
            }}
            onStop={stopPhase}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.m,
  },
  cancelBtn: {
    minWidth: 60,
  },
  cancelText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  scenarioTitle: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  phaseContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  phaseLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.accent,
    marginBottom: Spacing.s,
    textTransform: 'uppercase' as const,
  },
  prepCountdown: {
    fontFamily: 'Inter_700Bold',
    fontSize: 80,
    lineHeight: 80,
    letterSpacing: -3,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  prepSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: Spacing.s,
  },
  durationDisplay: {
    fontFamily: 'Inter_700Bold',
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2,
    color: Colors.recordActive,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  analyzingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.m,
  },
  openingCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    padding: Spacing.l,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    marginBottom: Spacing.xxxl,
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
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
