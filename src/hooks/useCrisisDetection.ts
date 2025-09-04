import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface CrisisAnalysis {
  is_crisis: boolean;
  confidence: number;
  detected_indicators: string[];
  severity: 'low' | 'medium' | 'high';
}

export const useCrisisDetection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCrisis = async (title: string, content: string): Promise<CrisisAnalysis | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crisis-detection`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Crisis detection API Error:', errorText);
        throw new Error(`Failed to analyze for crisis: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Crisis detection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze for crisis';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeCrisis,
    loading,
    error,
  };
};