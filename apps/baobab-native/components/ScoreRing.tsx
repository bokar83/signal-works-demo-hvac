/**
 * ScoreRing - Animated SVG ring that fills from 0 to score
 * Animates over 1.2s with out-cubic easing
 * Number ticks up in sync
 * Color shifts by score band
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../lib/design';

interface Props {
  score: number;     // 0-100
  size?: number;     // outer diameter
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [displayScore, setDisplayScore] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const scoreColor = Colors.scoreBand(score);

  useEffect(() => {
    // Animate score ring fill and number tick
    const anim = Animated.timing(progressAnim, {
      toValue: score,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    anim.start();

    // Tick display number
    let start = 0;
    const step = score / 60; // 60 frames over 1s
    const interval = setInterval(() => {
      start += step;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, 16);

    return () => {
      clearInterval(interval);
      anim.stop();
    };
  }, [score]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={Colors.borderSubtle}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text
          style={[styles.score, { color: scoreColor, fontSize: size > 100 ? 36 : 22 }]}
        >
          {displayScore}
        </Text>
        {showLabel && (
          <Text style={[styles.outOf, { fontSize: size > 100 ? 12 : 10 }]}>/100</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  outOf: {
    fontFamily: 'Inter_400Regular',
    color: Colors.textTertiary,
    marginTop: -2,
  },
});

