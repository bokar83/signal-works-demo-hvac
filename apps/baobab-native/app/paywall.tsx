import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { purchaseProduct, restorePurchases, PRODUCTS_DISPLAY } from '../lib/revenuecat';
import { Colors, Spacing, Radius } from '../lib/design';
import { useEntitlements } from '../hooks/useEntitlements';

export default function PaywallScreen() {
  const [selectedId, setSelectedId] = useState(PRODUCTS_DISPLAY[0].id); // Burst Pack default
  const [purchasing, setPurchasing] = useState(false);
  const { refresh } = useEntitlements();

  async function handlePurchase() {
    setPurchasing(true);
    try {
      const success = await purchaseProduct(selectedId);
      if (success) {
        await refresh();
        router.dismiss();
      }
    } catch (err: unknown) {
      const e = err as Error;
      Alert.alert('Purchase failed', e.message ?? 'Something went wrong. Try again.');
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setPurchasing(true);
    try {
      const status = await restorePurchases();
      if (status !== 'free') {
        await refresh();
        Alert.alert('Restored', 'Your purchases have been restored.');
        router.dismiss();
      } else {
        Alert.alert('Nothing to restore', 'No previous purchases found.');
      }
    } catch {
      Alert.alert('Restore failed', 'Could not restore purchases. Try again.');
    } finally {
      setPurchasing(false);
    }
  }

  const selectedProduct = PRODUCTS_DISPLAY.find((p) => p.id === selectedId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cancel at top - transparency = trust */}
        <TouchableOpacity
          style={styles.cancelRow}
          onPress={() => router.dismiss()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        {/* Hero */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.hero}
        >
          <Text style={styles.heroEmoji}>◎</Text>
          <Text style={styles.heroHeadline}>Unlock unlimited practice</Text>
          <Text style={styles.heroSub}>
            Full voice analysis. All 15 scenarios. Unlimited sessions.
            Practice until it clicks.
          </Text>
        </MotiView>

        {/* Social proof */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.proofRow}
        >
          <Text style={styles.proofText}>
            Used by job seekers, sales pros, and speakers to nail high-stakes conversations.
          </Text>
        </MotiView>

        {/* Product cards */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.productsContainer}
        >
          {PRODUCTS_DISPLAY.map((product) => {
            const isSelected = selectedId === product.id;
            return (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  isSelected && styles.productCardSelected,
                  product.isHighlighted && styles.productCardHighlighted,
                ]}
                onPress={() => setSelectedId(product.id)}
                activeOpacity={0.8}
              >
                {product.badge && (
                  <View style={[
                    styles.badge,
                    product.isHighlighted && styles.badgeHighlighted,
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      product.isHighlighted && styles.badgeTextHighlighted,
                    ]}>
                      {product.badge}
                    </Text>
                  </View>
                )}

                <View style={styles.productTop}>
                  <View style={styles.productTitleRow}>
                    <View style={[
                      styles.radio,
                      isSelected && styles.radioSelected,
                    ]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <View>
                      <Text style={[
                        styles.productTitle,
                        product.isHighlighted && styles.productTitleHighlighted,
                      ]}>
                        {product.title}
                      </Text>
                      <Text style={styles.productSubtitle}>{product.subtitle}</Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.productPrice,
                    product.isHighlighted && styles.productPriceHighlighted,
                  ]}>
                    {product.price}
                  </Text>
                </View>

                {isSelected && (
                  <View style={styles.featureList}>
                    {product.features.map((f, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Text style={styles.featureCheck}>+</Text>
                        <Text style={styles.featureText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </MotiView>

        {/* FAQ */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 600 }}
          style={styles.faq}
        >
          <FaqItem
            q="Can I cancel anytime?"
            a="Yes. Monthly and Annual subscriptions can be cancelled anytime from your account settings. Burst Pack is a one-time purchase with no auto-renew."
          />
          <FaqItem
            q="Is there a free trial?"
            a="Monthly and Annual plans include a 7-day free trial. Burst Pack is a one-time purchase - no trial, no surprise charges."
          />
          <FaqItem
            q="What happens after Burst Pack expires?"
            a="You return to the free tier (3 drill sessions/day). Your session history stays. Re-purchase Burst Pack anytime."
          />
        </MotiView>

        <View style={styles.legalText}>
          <Text style={styles.legal}>
            Subscriptions auto-renew unless cancelled at least 24 hours before the period ends.
            Managed through your App Store or Google Play account.
          </Text>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Purchase CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.purchaseBtn, purchasing && styles.purchaseBtnDisabled]}
          onPress={handlePurchase}
          disabled={purchasing}
          activeOpacity={0.85}
        >
          {purchasing ? (
            <ActivityIndicator color={Colors.textInverse} />
          ) : (
            <Text style={styles.purchaseBtnText}>
              {selectedProduct?.type === 'one_time'
                ? `Get ${selectedProduct.title} - ${selectedProduct.price}`
                : `Start free trial - ${selectedProduct?.price ?? ''}`}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRestore}
          disabled={purchasing}
          style={styles.restoreBtn}
        >
          <Text style={styles.restoreText}>Restore purchases</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity style={styles.faqItem} onPress={() => setOpen(!open)}>
      <View style={styles.faqTop}>
        <Text style={styles.faqQ}>{q}</Text>
        <Text style={styles.faqToggle}>{open ? '−' : '+'}</Text>
      </View>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.m,
    paddingBottom: 160,
  },
  cancelRow: {
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  cancelText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: Spacing.m,
    color: Colors.accent,
  },
  heroHeadline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    letterSpacing: -0.8,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.m,
  },
  heroSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  proofRow: {
    backgroundColor: Colors.accentSubtle,
    borderRadius: Radius.l,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
  },
  proofText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.accent,
    textAlign: 'center',
  },
  productsContainer: {
    gap: Spacing.m,
    marginBottom: Spacing.xl,
  },
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.l,
    padding: Spacing.l,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  productCardSelected: {
    borderColor: Colors.accent,
  },
  productCardHighlighted: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSubtle,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: Radius.s,
    paddingHorizontal: Spacing.s,
    paddingVertical: 3,
    marginBottom: Spacing.s,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeHighlighted: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  badgeTextHighlighted: {
    color: Colors.textInverse,
  },
  productTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  productTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  productTitleHighlighted: {
    color: Colors.accent,
  },
  productSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
  },
  productPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
  },
  productPriceHighlighted: {
    color: Colors.accent,
  },
  featureList: {
    marginTop: Spacing.l,
    gap: Spacing.s,
  },
  featureRow: {
    flexDirection: 'row',
    gap: Spacing.m,
    alignItems: 'flex-start',
  },
  featureCheck: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: Colors.success,
    lineHeight: 20,
  },
  featureText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  faq: {
    gap: 0,
    marginBottom: Spacing.xl,
  },
  faqItem: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingVertical: Spacing.l,
  },
  faqTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQ: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textPrimary,
    paddingRight: Spacing.m,
  },
  faqToggle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
    color: Colors.textTertiary,
  },
  faqA: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: Spacing.m,
  },
  legalText: {
    marginBottom: Spacing.xl,
  },
  legal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  bottomPad: {
    height: Spacing.xxxl,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    gap: Spacing.m,
  },
  purchaseBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.l,
    paddingVertical: Spacing.l,
    alignItems: 'center',
  },
  purchaseBtnDisabled: {
    opacity: 0.6,
  },
  purchaseBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.textInverse,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  restoreText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
  },
});

