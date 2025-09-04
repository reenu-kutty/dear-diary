import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface EmotionalAnalysis {
  date: string;
  emotional_score: number;
  dominant_emotions: string[];
  summary: string;
}

export const useEmotionalAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeEmotions = async (startDate: string, endDate: string): Promise<EmotionalAnalysis[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-emotions`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to analyze emotions: ${response.status}`);
      }

      const data = await response.json();
      return data.analyses || [];
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze emotions';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('emotional_analysis_cache')
        .delete()
        .eq('user_id', session.user.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cache';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeEmotions,
    clearCache,
    loading,
    error,
  };
};