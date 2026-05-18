/**
 * FillerWordChip - pill showing filler word + count
 * Tappable to expand context sentences
 * Spring animation on expand
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MotiView } from 'moti';
import type { FillerDetail } from '../lib/types';
import { Colors, Spacing, Radius } from '../lib/design';

interface Props {
  detail: FillerDetail;
}

export default function FillerWordChip({ detail }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.chip}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.75}
      >
        <Text style={styles.word}>&ldquo;{detail.word}&rdquo;</Text>
        <View style={styles.countBadge}>
          <Text style={styles.count}>x{detail.count}</Text>
        </View>
        {detail.contexts.length > 0 && (
          <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
        )}
      </TouchableOpacity>

      {expanded && detail.contexts.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          style={styles.contextContainer}
        >
          {detail.contexts.map((ctx, i) => (
            <Text key={i} style={styles.contextText}>
              {ctx}
            </Text>
          ))}
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: Radius.full,
    backgroundColor: Colors.warningSubtle,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
    alignSelf: 'flex-start',
  },
  word: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.warning,
  },
  countBadge: {
    backgroundColor: Colors.warning + '30',
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  count: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: Colors.warning,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  expandIcon: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.warning,
  },
  contextContainer: {
    marginTop: Spacing.s,
    backgroundColor: Colors.surface,
    borderRadius: Radius.m,
    padding: Spacing.m,
    gap: Spacing.s,
  },
  contextText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

