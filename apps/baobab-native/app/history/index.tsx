import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { useSession } from '../../hooks/useSession';
import { getScenario } from '../../lib/scenarios';
import { Colors, Spacing, Radius } from '../../lib/design';
import ScoreRing from '../../components/ScoreRing';
import type { PracticeSession } from '../../lib/types';

export default function HistoryScreen() {
  const { sessions, loading, error, fetchSessions } = useSession();

  useEffect(() => {
    void fetchSessions(50);
  }, [fetchSessions]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.backBtn} />
      </View>

      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>◎</Text>
          <Text style={styles.emptyText}>
            No sessions yet.{'\n'}Run one and see your delivery score in 30 seconds.
          </Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push('/scenarios')}
          >
            <Text style={styles.startBtnText}>Pick a scenario</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <SessionCard session={item} index={index} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function SessionCard({ session, index }: { session: PracticeSession; index: number }) {
  const scenario = getScenario(session.scenario_id);
  const date = new Date(session.created_at);

  return (
    <MotiView
      from={{ opacity: 0, translateX: -8 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 50 }}
    >
      <View style={styles.sessionCard}>
        <View style={styles.sessionLeft}>
          <ScoreRing score={session.aggregate_score} size={56} strokeWidth={4} showLabel={false} />
        </View>
        <View style={styles.sessionCenter}>
          <Text style={styles.sessionTitle}>
            {scenario?.title ?? session.scenario_id}
          </Text>
          <Text style={styles.sessionMeta}>
            {session.mode} · {Math.round(session.duration_sec / 60)} min
          </Text>
          <Text style={styles.sessionDate}>
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' '}
            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.sessionRight}>
          <Text style={[styles.sessionScore, { color: Colors.scoreBand(session.aggregate_score) }]}>
            {session.aggregate_score}
          </Text>
          <Text style={styles.scoreOutOf}>/100</Text>
        </View>
      </View>
    </MotiView>
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
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  errorBar: {
    backgroundColor: Colors.errorSubtle,
    padding: Spacing.m,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.s,
    marginBottom: Spacing.m,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    gap: Spacing.l,
  },
  sessionLeft: {},
  sessionCenter: {
    flex: 1,
    gap: 3,
  },
  sessionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  sessionMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
    textTransform: 'capitalize' as const,
  },
  sessionDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  sessionScore: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  scoreOutOf: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.l,
    paddingHorizontal: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    color: Colors.textTertiary,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.l,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
  },
  startBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: Colors.textInverse,
  },
});

