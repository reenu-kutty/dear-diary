import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  prompt?: string;
  prompt_response?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
};

export type EmotionalAnalysisCache = {
  id: string;
  user_id: string;
  date: string;
  emotional_score: number;
  dominant_emotions: string[];
  summary: string;
  entry_count: number;
  last_entry_at: string;
  created_at: string;
  updated_at: string;
};