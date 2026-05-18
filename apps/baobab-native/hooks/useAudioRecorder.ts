import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export type RecorderState = 'idle' | 'armed' | 'recording' | 'stopped' | 'error';

export type RecordingResult = {
  uri: string;
  durationMs: number;
};

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [durationMs, setDurationMs] = useState(0);
  const [metering, setMetering] = useState(-160); // dB, -160 = silence
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }, []);

  const arm = useCallback(async () => {
    const granted = await requestPermissions();
    if (!granted) {
      setState('error');
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    setState('armed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [requestPermissions]);

  const startRecording = useCallback(async () => {
    if (state !== 'armed' && state !== 'idle') return;

    const granted = await requestPermissions();
    if (!granted) {
      setState('error');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      }
    );

    recordingRef.current = recording;
    startTimeRef.current = Date.now();
    setState('recording');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Update metering + duration
    timerRef.current = setInterval(async () => {
      if (recordingRef.current) {
        const status = await recordingRef.current.getStatusAsync();
        if (status.isRecording) {
          setDurationMs(status.durationMillis ?? 0);
          setMetering(status.metering ?? -160);
        }
      }
    }, 100);
  }, [state, requestPermissions]);

  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    if (!recordingRef.current) return null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      const finalDuration = Date.now() - startTimeRef.current;

      recordingRef.current = null;
      setState('stopped');
      setMetering(-160);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (!uri) return null;
      return { uri, durationMs: finalDuration };
    } catch (err) {
      console.error('[useAudioRecorder] Stop failed:', err);
      setState('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    recordingRef.current = null;
    setState('idle');
    setDurationMs(0);
    setMetering(-160);
  }, []);

  return {
    state,
    durationMs,
    metering,
    arm,
    startRecording,
    stopRecording,
    reset,
  };
}
