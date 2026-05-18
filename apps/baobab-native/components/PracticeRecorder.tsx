/**
 * PracticeRecorder - The hero component
 * Circular record button with pulse animation + audio waveform
 * Premium feel: not default Button. Morphs stop from record.
 */
import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import type { RecorderState } from '../hooks/useAudioRecorder';
import { Colors, Spacing } from '../lib/design';

type Phase = 'prep' | 'recording' | 'stopped' | 'analyzing';

interface Props {
  state: RecorderState;
  metering: number; // dB, -160 = silence
  phase: Phase;
  onStart: () => void;
  onStop: () => void;
}

export default function PracticeRecorder({
  state,
  metering,
  phase,
  onStart,
  onStop,
}: Props) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const meteringAnim = React.useRef(new Animated.Value(0)).current;

  // Pulse animation when armed/recording
  useEffect(() => {
    if (state === 'recording') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  // Metering to animation (normalize -160..0 dB to 0..1)
  useEffect(() => {
    const normalized = Math.max(0, Math.min(1, (metering + 60) / 60));
    Animated.timing(meteringAnim, {
      toValue: normalized,
      duration: 80,
      useNativeDriver: false,
    }).start();
  }, [metering, meteringAnim]);

  const isRecording = state === 'recording';
  const isPrepPhase = phase === 'prep';

  const buttonColor = isRecording ? Colors.recordActive : Colors.accent;
  const buttonSize = 96;

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  }

  // Waveform bars - 7 bars, heights driven by metering
  const waveformBars = Array.from({ length: 7 }, (_, i) => {
    const center = 3;
    const distFromCenter = Math.abs(i - center);
    const baseHeight = Math.max(4, 20 - distFromCenter * 4);
    return baseHeight;
  });

  return (
    <View style={styles.container}>
      {/* Waveform visualization */}
      {isRecording && (
        <View style={styles.waveformContainer}>
          {waveformBars.map((baseH, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveformBar,
                {
                  height: meteringAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [baseH, baseH + 20],
                  }),
                  opacity: meteringAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.9],
                  }),
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Record button with pulse ring */}
      <View style={styles.buttonArea}>
        {/* Outer pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: buttonSize + 32,
              height: buttonSize + 32,
              borderRadius: (buttonSize + 32) / 2,
              backgroundColor: buttonColor + '20',
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        {/* Inner button */}
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.85}
          style={[
            styles.recordButton,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: buttonColor,
            },
          ]}
        >
          {isRecording ? (
            // Stop icon - square
            <View style={styles.stopIcon} />
          ) : (
            // Mic icon text
            <Text style={styles.micIcon}>◉</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Label */}
      <Text style={styles.label}>
        {isPrepPhase
          ? 'Tap to start early'
          : isRecording
          ? 'Tap to stop'
          : 'Ready'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 48,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: Colors.recordActive,
  },
  buttonArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
  },
  recordButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  micIcon: {
    fontSize: 32,
    color: 'white',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    letterSpacing: 0.5,
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
  },
});
