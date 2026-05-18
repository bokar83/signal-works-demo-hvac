/**
 * RevenueCat integration
 * Stub API keys - Boubacar adds real keys from RC dashboard
 * Swap: set EXPO_PUBLIC_RC_IOS_KEY + EXPO_PUBLIC_RC_ANDROID_KEY env vars
 */
import { Platform } from 'react-native';

// Sentinel values - replace with real RC keys from dashboard
const RC_IOS_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? 'STUB_BOUBACAR_ADD_RC_IOS_KEY';
const RC_ANDROID_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? 'STUB_BOUBACAR_ADD_RC_ANDROID_KEY';

export const RC_PRODUCT_IDS = {
  BURST_30DAY: 'baobab_burst_30day',    // $19.99 one-time (PRIMARY)
  PRO_MONTHLY: 'baobab_pro_monthly',    // $9.99/mo subscription
  PRO_ANNUAL: 'baobab_pro_annual',      // $79/yr subscription
} as const;

export const PRODUCTS_DISPLAY = [
  {
    id: RC_PRODUCT_IDS.BURST_30DAY,
    title: 'Burst Pack',
    subtitle: '30-day full access',
    price: '$19.99',
    type: 'one_time' as const,
    isHighlighted: true, // DEFAULT HIGHLIGHTED per spec
    badge: 'Best for events',
    features: ['Unlimited practice sessions', 'Full voice analysis', 'All 15 scenarios', 'Mock interview mode'],
  },
  {
    id: RC_PRODUCT_IDS.PRO_MONTHLY,
    title: 'Monthly',
    subtitle: 'Billed monthly',
    price: '$9.99/mo',
    type: 'subscription' as const,
    isHighlighted: false,
    badge: '7-day free trial',
    features: ['Everything in Burst Pack', 'Progress tracking', 'Session history', 'Cancel anytime'],
  },
  {
    id: RC_PRODUCT_IDS.PRO_ANNUAL,
    title: 'Annual',
    subtitle: 'Billed yearly',
    price: '$79/yr',
    type: 'subscription' as const,
    isHighlighted: false,
    badge: 'Save 33%',
    features: ['Everything in Monthly', '12 months of practice', 'Priority support', '7-day free trial'],
  },
];

export type EntitlementStatus = 'free' | 'burst' | 'pro';

let _initialized = false;

export async function initRevenueCat(): Promise<void> {
  if (_initialized) return;
  try {
    // Dynamic import to avoid crash when SDK not properly linked
    const Purchases = (await import('react-native-purchases')).default;
    const key = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;
    if (key.startsWith('STUB_')) {
      console.warn('[RC] Using stub key -- purchases will not work. Add real RC keys.');
      return;
    }
    await Purchases.configure({ apiKey: key });
    _initialized = true;
  } catch (err) {
    console.warn('[RC] Failed to initialize:', err);
  }
}

export async function getEntitlementStatus(): Promise<EntitlementStatus> {
  try {
    const Purchases = (await import('react-native-purchases')).default;
    const customerInfo = await Purchases.getCustomerInfo();
    if (customerInfo.entitlements.active['baobab_pro_annual']) return 'pro';
    if (customerInfo.entitlements.active['baobab_pro_monthly']) return 'pro';
    if (customerInfo.entitlements.active['baobab_burst_30day']) return 'burst';
    return 'free';
  } catch {
    return 'free';
  }
}

export async function purchaseProduct(productId: string): Promise<boolean> {
  try {
    const Purchases = (await import('react-native-purchases')).default;
    const { customerInfo } = await Purchases.purchaseStoreProduct(
      await getStoreProduct(productId)
    );
    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch (err: unknown) {
    const purchaseErr = err as { userCancelled?: boolean };
    if (purchaseErr?.userCancelled) return false;
    throw err;
  }
}

async function getStoreProduct(productId: string) {
  const Purchases = (await import('react-native-purchases')).default;
  const products = await Purchases.getProducts([productId]);
  const product = products[0];
  if (!product) throw new Error(`Product ${productId} not found`);
  return product;
}

export async function restorePurchases(): Promise<EntitlementStatus> {
  try {
    const Purchases = (await import('react-native-purchases')).default;
    const customerInfo = await Purchases.restorePurchases();
    if (customerInfo.entitlements.active['baobab_pro_annual']) return 'pro';
    if (customerInfo.entitlements.active['baobab_pro_monthly']) return 'pro';
    if (customerInfo.entitlements.active['baobab_burst_30day']) return 'burst';
    return 'free';
  } catch {
    return 'free';
  }
}
