/**
 * Voice analysis utilities
 * Filler word detection: regex pre-pass + LLM verification (paid tier only)
 * Cost mitigation: 1 LLM call per session, sha256 cache, free-tier regex only
 */
import type { FillerDetail, AnalysisResult } from './types';

const DEFINITE_FILLERS = ['um', 'uh', 'er', 'ah', 'hmm', 'hm'];

const AMBIGUOUS_FILLERS = [
  'like', 'so', 'actually', 'basically', 'literally',
  'right', 'you know', 'i mean', 'sort of', 'kind of',
];

// Regex patterns for definite fillers (no context needed)
const FILLER_REGEX: Record<string, RegExp> = {};
for (const word of DEFINITE_FILLERS) {
  FILLER_REGEX[word] = new RegExp(`\\b${word}\\b`, 'gi');
}

// Context-aware exclusion patterns for "like" (these are NOT fillers)
const COMPARISON_LIKE_PATTERN =
  /\b(something|nothing|anything|everything|act|sound|feel|look|seem|just|exactly|much|more|less|taste|smell|works?|feels?|looks?|sounds?|seems?)\s+like\b/gi;
const QUOTE_LIKE_PATTERN = /like\s+(["']|when\s+|the\s+time)/gi;

export type FillerAnalysis = {
  fillerDetails: FillerDetail[];
  totalFillerCount: number;
};

/**
 * Regex-only filler detection (free tier + immediate result)
 */
export function detectFillersRegex(transcript: string): FillerAnalysis {
  const fillerDetails: FillerDetail[] = [];
  let totalCount = 0;

  // Definite fillers - no context needed
  for (const word of DEFINITE_FILLERS) {
    const matches = transcript.match(FILLER_REGEX[word]) ?? [];
    if (matches.length > 0) {
      fillerDetails.push({
        word,
        count: matches.length,
        contexts: extractContexts(transcript, word, 3),
        is_filler: true,
      });
      totalCount += matches.length;
    }
  }

  // Ambiguous fillers - regex pre-pass, conservative
  for (const word of AMBIGUOUS_FILLERS) {
    const re = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = transcript.match(re) ?? [];
    if (matches.length > 0) {
      let adjustedCount = matches.length;
      // Context-aware exclusion for "like"
      if (word === 'like') {
        const compMatches = transcript.match(COMPARISON_LIKE_PATTERN) ?? [];
        const quoteMatches = transcript.match(QUOTE_LIKE_PATTERN) ?? [];
        adjustedCount = Math.max(0, matches.length - compMatches.length - quoteMatches.length);
      }
      if (adjustedCount > 0) {
        fillerDetails.push({
          word,
          count: adjustedCount,
          contexts: extractContexts(transcript, word, 3),
          is_filler: true, // refined by LLM in paid tier
        });
        totalCount += adjustedCount;
      }
    }
  }

  return { fillerDetails, totalFillerCount: totalCount };
}

function extractContexts(transcript: string, word: string, maxCount: number): string[] {
  const contexts: string[] = [];
  const re = new RegExp(`(.{0,30})\\b${word}\\b(.{0,30})`, 'gi');
  let match;
  let count = 0;
  while ((match = re.exec(transcript)) !== null && count < maxCount) {
    const context = `...${match[1]}[${word}]${match[2]}...`.trim();
    contexts.push(context);
    count++;
  }
  return contexts;
}

/**
 * Calculate pace in WPM
 */
export function calculatePaceWPM(transcript: string, durationSec: number): number {
  if (durationSec <= 0) return 0;
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  return Math.round((wordCount / durationSec) * 60);
}

/**
 * Calculate aggregate score from components
 * pace*0.15 + filler*0.10 + clarity*0.25 + confidence*0.10 + content*0.40
 */
export function calculateAggregateScore(
  paceWpm: number,
  fillerCount: number,
  clarityScore: number,
  confidenceScore: number,
  contentScore: number,
  durationSec: number,
): number {
  // Pace score: optimal 120-160 WPM
  let paceScore = 100;
  if (paceWpm < 100) {
    paceScore = 40 + (paceWpm / 100) * 30;
  } else if (paceWpm > 180) {
    paceScore = Math.max(20, 100 - (paceWpm - 180) * 2);
  } else if (paceWpm >= 120 && paceWpm <= 160) {
    paceScore = 95;
  } else if (paceWpm >= 100 && paceWpm < 120) {
    paceScore = 70 + ((paceWpm - 100) / 20) * 25;
  } else {
    paceScore = Math.max(40, 90 - ((paceWpm - 160) / 20) * 20);
  }

  // Filler score: penalize per filler per minute
  const fillersPerMinute = durationSec > 0 ? (fillerCount / durationSec) * 60 : 0;
  let fillerScore = 100;
  if (fillersPerMinute > 15) fillerScore = 20;
  else if (fillersPerMinute > 10) fillerScore = 40;
  else if (fillersPerMinute > 5) fillerScore = 60;
  else if (fillersPerMinute > 2) fillerScore = 80;

  const aggregate =
    paceScore * 0.15 +
    fillerScore * 0.10 +
    clarityScore * 0.25 +
    confidenceScore * 0.10 +
    contentScore * 0.40;

  return Math.round(Math.min(100, Math.max(0, aggregate)));
}

/**
 * Build a stub analysis result (used when Supabase Edge Function unavailable)
 * (inferred-by-agent) - only used offline, shows user clear indication
 */
export function buildStubAnalysis(transcript: string, durationSec: number): AnalysisResult {
  const { fillerDetails, totalFillerCount } = detectFillersRegex(transcript);
  const paceWpm = calculatePaceWPM(transcript, durationSec);

  const clarityScore = 65;
  const confidenceScore = 65;
  const contentScore = 65;

  return {
    aggregate_score: calculateAggregateScore(
      paceWpm, totalFillerCount, clarityScore, confidenceScore, contentScore, durationSec
    ),
    pace_wpm: paceWpm,
    filler_count: totalFillerCount,
    filler_details: fillerDetails,
    clarity_score: clarityScore,
    confidence_score: confidenceScore,
    content_score: contentScore,
    strengths: ['(Analysis requires network connection)'],
    improvements: ['Connect to network for full AI coaching feedback'],
    summary: '(Offline mode - pace and filler detection only. Connect for full analysis.)',
  };
}
