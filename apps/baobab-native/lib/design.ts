/**
 * Baobab Design System
 * "$100 app feel" - Off-black + electric lime. Linear-esque, premium, not generic.
 */

export const Colors = {
  // Primary palette - off-black + electric lime
  background: '#0E0E10',
  backgroundSecondary: '#141416',
  backgroundTertiary: '#1A1A1E',
  surface: '#1E1E22',
  surfaceHover: '#26262C',
  border: '#2A2A30',
  borderSubtle: '#1E1E24',

  // Accent - electric lime (distinctive, not iOS blue)
  accent: '#C8FF6C',
  accentDim: '#A0D44A',
  accentSubtle: 'rgba(200, 255, 108, 0.12)',

  // Text hierarchy
  textPrimary: '#F5F5F0',
  textSecondary: '#8A8A96',
  textTertiary: '#5A5A66',
  textInverse: '#0E0E10',

  // Semantic
  success: '#4ADE80',
  successSubtle: 'rgba(74, 222, 128, 0.12)',
  warning: '#FBBF24',
  warningSubtle: 'rgba(251, 191, 36, 0.12)',
  error: '#F87171',
  errorSubtle: 'rgba(248, 113, 113, 0.12)',

  // Score bands
  scoreBand: (score: number): string => {
    if (score >= 80) return '#4ADE80';
    if (score >= 60) return '#FBBF24';
    return '#F87171';
  },

  // Recording states
  recordArmed: '#C8FF6C',
  recordActive: '#FF5C5C',
  recordIdle: '#2A2A30',
};

export const Typography = {
  // Display sizes - use Fraunces (serif, premium) for hero moments
  displayXL: {
    fontFamily: 'Fraunces',
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1.5,
    color: Colors.textPrimary,
  },
  displayL: {
    fontFamily: 'Fraunces',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.0,
    color: Colors.textPrimary,
  },
  displayM: {
    fontFamily: 'Fraunces',
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
    color: Colors.textPrimary,
  },

  // Headings - Inter (sans-serif, clean)
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  },
  h2: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.3,
    color: Colors.textPrimary,
  },
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.2,
    color: Colors.textPrimary,
  },

  // Body
  bodyL: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  bodyM: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  bodyS: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textTertiary,
  },

  // Labels
  labelM: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: Colors.textSecondary,
  },
  labelS: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
  },

  // Score numbers - tabular
  scoreXL: {
    fontFamily: 'Inter_700Bold',
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -2,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
    color: Colors.textPrimary,
  },
  scoreL: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums' as const] as import('react-native').FontVariant[],
    color: Colors.textPrimary,
  },
};

// 8pt grid
export const Spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
  massive: 96,
};

export const Radius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  glow: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Animation presets
export const Easing = {
  outExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  spring: {
    damping: 18,
    stiffness: 260,
    mass: 1,
  },
};

