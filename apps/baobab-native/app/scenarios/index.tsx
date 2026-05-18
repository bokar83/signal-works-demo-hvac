import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { SCENARIOS, type Scenario, type ScenarioMode } from '../../lib/scenarios';
import { Colors, Typography, Spacing, Radius } from '../../lib/design';

const FILTERS: { label: string; value: ScenarioMode | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Mock', value: 'mock' },
  { label: 'Conversation', value: 'conversation' },
  { label: 'Drill', value: 'drill' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  'Beginner': '#34D399',
  'Intermediate': '#FBBF24',
  'Advanced': '#F472B6',
  'High Stakes': '#F87171',
};

const MODE_ICONS: Record<string, string> = {
  mock: '⏺',
  conversation: '↔',
  drill: '◎',
};

function ScenarioItem({ item, index }: { item: Scenario; index: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -12 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 40 }}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/scenarios/${item.id}`)}
        activeOpacity={0.75}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardMeta}>
            <Text style={styles.modeIcon}>{MODE_ICONS[item.mode]}</Text>
            <Text style={styles.modeLabel}>{item.mode.toUpperCase()}</Text>
          </View>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: DIFFICULTY_COLORS[item.difficulty] + '20' },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: DIFFICULTY_COLORS[item.difficulty] },
              ]}
            >
              {item.difficulty}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.durationText}>
            {Math.round(item.durationSec / 60)} min
          </Text>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

export default function ScenariosScreen() {
  const [filter, setFilter] = useState<ScenarioMode | 'all'>('all');

  const filtered = filter === 'all'
    ? SCENARIOS
    : SCENARIOS.filter((s) => s.mode === filter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Scenarios</Text>
          <Text style={styles.headerCount}>{SCENARIOS.length} total</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <ScenarioItem item={item} index={index} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.m,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.s,
    marginBottom: Spacing.l,
  },
  filterChip: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textInverse,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeIcon: {
    fontSize: 14,
    color: Colors.accent,
  },
  modeLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.accent,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.s,
  },
  difficultyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: -0.3,
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  cardDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: Spacing.m,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: Radius.s,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textTertiary,
  },
  durationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
  },
});
