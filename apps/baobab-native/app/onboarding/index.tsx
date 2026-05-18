/**
 * Onboarding - Optional resume/JD/context upload
 * Skippable - anonymous practice allowed for first 3 sessions
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { getSupabaseOrNull } from '../../lib/supabase';
import { Colors, Spacing, Radius } from '../../lib/design';

export default function OnboardingScreen() {
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const supabase = getSupabaseOrNull();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('baobab_user_profiles').upsert({
            user_id: user.id,
            target_role: targetRole || null,
            target_company: targetCompany || null,
            resume_text: resumeText || null,
          });
        }
      }
      router.replace('/scenarios');
    } catch {
      router.replace('/scenarios');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Skip */}
          <TouchableOpacity
            style={styles.skipRow}
            onPress={() => router.replace('/scenarios')}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>

          {/* Hero */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            style={styles.hero}
          >
            <Text style={styles.heroLabel}>PERSONALIZE</Text>
            <Text style={styles.heroTitle}>Make it yours.</Text>
            <Text style={styles.heroSub}>
              Add your target role and resume to get scenario questions tailored to you.
              Optional -- you can practice without it.
            </Text>
          </MotiView>

          {/* Inputs */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            style={styles.fields}
          >
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>TARGET ROLE</Text>
              <TextInput
                style={styles.input}
                value={targetRole}
                onChangeText={setTargetRole}
                placeholder="e.g. Chief of Staff, Account Executive"
                placeholderTextColor={Colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>TARGET COMPANY</Text>
              <TextInput
                style={styles.input}
                value={targetCompany}
                onChangeText={setTargetCompany}
                placeholder="e.g. Human Agency, McKinsey"
                placeholderTextColor={Colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>RESUME / BIO (optional)</Text>
              <Text style={styles.fieldHint}>
                Paste key bullets or a short summary. Used to personalize questions.
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={resumeText}
                onChangeText={setResumeText}
                placeholder="Paste resume bullet points or a short bio..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </MotiView>

          <View style={styles.bottomPad} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : 'Start practicing'}
          </Text>
          {!saving && <Text style={styles.saveBtnArrow}>→</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.l, paddingBottom: 120 },
  skipRow: { alignItems: 'flex-end', marginBottom: Spacing.xl },
  skipText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.textTertiary },
  hero: { marginBottom: Spacing.xxl },
  heroLabel: {
    fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 2,
    color: Colors.accent, marginBottom: Spacing.s, textTransform: 'uppercase' as const,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -0.8,
    color: Colors.textPrimary, marginBottom: Spacing.m,
  },
  heroSub: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, color: Colors.textSecondary },
  fields: { gap: Spacing.xl },
  field: { gap: Spacing.s },
  fieldLabel: {
    fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.5,
    color: Colors.textTertiary, textTransform: 'uppercase' as const,
  },
  fieldHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textTertiary },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.l, padding: Spacing.l,
    fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
  textArea: { minHeight: 120, paddingTop: Spacing.l },
  bottomPad: { height: Spacing.xxxl },
  ctaContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.xl, paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.borderSubtle,
  },
  saveBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.l, paddingVertical: Spacing.l,
    paddingHorizontal: Spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 17, color: Colors.textInverse },
  saveBtnArrow: { fontFamily: 'Inter_700Bold', fontSize: 20, color: Colors.textInverse },
});
