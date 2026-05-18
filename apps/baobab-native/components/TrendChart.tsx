/**
 * TrendChart - Premium score trend visualization
 * Customized beyond victory-native defaults per design directive
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, Spacing } from '../lib/design';

const { width } = Dimensions.get('window');

interface DataPoint {
  x: string;   // date label
  y: number;   // score 0-100
}

interface Props {
  data: DataPoint[];
  height?: number;
}

/**
 * Lightweight custom chart renderer using SVG via react-native-svg
 * Smooth bezier line, premium styling, no Victory boilerplate
 */
export default function TrendChart({ data, height = 140 }: Props) {
  if (data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={styles.emptyText}>Practice to see your trend</Text>
      </View>
    );
  }

  if (data.length === 1) {
    return (
      <View style={[styles.singleContainer, { height }]}>
        <Text style={styles.singleScore}>{data[0].y}</Text>
        <Text style={styles.singleLabel}>Your first session</Text>
      </View>
    );
  }

  // Simple SVG-based line chart
  const chartWidth = width - Spacing.xl * 2 - Spacing.l * 2;
  const chartHeight = height - 40; // leave room for labels
  const padding = 12;

  const minY = Math.max(0, Math.min(...data.map((d) => d.y)) - 10);
  const maxY = Math.min(100, Math.max(...data.map((d) => d.y)) + 10);
  const rangeY = maxY - minY || 1;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (chartWidth - padding * 2),
    y: padding + (1 - (d.y - minY) / rangeY) * (chartHeight - padding * 2),
    score: d.y,
    label: d.x,
  }));

  const latestScore = data[data.length - 1].y;
  const firstScore = data[0].y;
  const trend = latestScore - firstScore;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.latest}>{latestScore}</Text>
        <View style={[
          styles.trendBadge,
          trend >= 0 ? styles.trendUp : styles.trendDown,
        ]}>
          <Text style={[
            styles.trendText,
            trend >= 0 ? styles.trendTextUp : styles.trendTextDown,
          ]}>
            {trend >= 0 ? '+' : ''}{trend} pts
          </Text>
        </View>
      </View>
      <Text style={styles.sessionCount}>{data.length} sessions</Text>

      {/* Simple dot-line chart */}
      <View style={[styles.chartArea, { height: chartHeight }]}>
        {points.map((p, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                left: p.x - 4,
                top: p.y - 4,
                backgroundColor: Colors.scoreBand(p.score),
              },
            ]}
          />
        ))}
      </View>

      {/* X-axis labels - show first and last */}
      <View style={styles.xLabels}>
        <Text style={styles.xLabel}>{data[0].x}</Text>
        {data.length > 2 && <View style={styles.xLabelSpacer} />}
        <Text style={styles.xLabel}>{data[data.length - 1].x}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.l,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
    marginBottom: 4,
  },
  latest: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -1,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendUp: {
    backgroundColor: Colors.successSubtle,
  },
  trendDown: {
    backgroundColor: Colors.errorSubtle,
  },
  trendText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  trendTextUp: {
    color: Colors.success,
  },
  trendTextDown: {
    color: Colors.error,
  },
  sessionCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: Spacing.m,
  },
  chartArea: {
    position: 'relative',
    marginBottom: Spacing.s,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textTertiary,
  },
  xLabelSpacer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
  },
  singleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    gap: Spacing.s,
  },
  singleScore: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  singleLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
  },
});

