/**
 * Baobab type definitions
 */

export type PracticeMode = 'mock' | 'conversation' | 'drill';

export type ScoreBreakdown = {
  pace_wpm: number;
  filler_count: number;
  filler_details: FillerDetail[];
  clarity_score: number;
  confidence_score: number;
  content_score: number;
  aggregate_score: number;
};

export type FillerDetail = {
  word: string;
  count: number;
  contexts: string[];
  is_filler: boolean; // false = context-aware exclusion (e.g. "like" as comparison)
};

export type CouncilVoice = {
  voice: string;
  verdict: string;
};

export type AnalysisResult = {
  aggregate_score: number;
  pace_wpm: number;
  filler_count: number;
  filler_details: FillerDetail[];
  clarity_score: number;
  confidence_score: number;
  content_score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
  council?: CouncilVoice[];
};

export type PracticeSession = {
  id: string;
  user_id: string;
  created_at: string;
  scenario_id: string;
  mode: PracticeMode;
  duration_sec: number;
  audio_url: string | null;
  transcript: string | null;
  aggregate_score: number;
  pace_wpm: number;
  filler_count: number;
  filler_details: FillerDetail[] | null;
  clarity_score: number;
  content_score: number;
  confidence_score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
};

export type UserProfile = {
  user_id: string;
  resume_text: string | null;
  target_role: string | null;
  target_company: string | null;
  preferred_language: string;
  rc_user_id: string | null;
};

export type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type EntitlementStatus = 'free' | 'burst' | 'monthly' | 'annual';

export type Product = {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros?: number;
  type: 'one_time' | 'subscription';
};
