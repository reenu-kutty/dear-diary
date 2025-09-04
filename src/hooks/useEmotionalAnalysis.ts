import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface EmotionalAnalysis {
  date: string;
  emotional_score: number;
  dominant_emotions: string[];
  summary: string;
}

export const useEmotionalAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const invalidateCache = async (entryDate: string): Promise<void> => {
    try {
      if (!user) return;

      // Delete cached analysis for the specific date
      const dateOnly = entryDate.split('T')[0]; // Get YYYY-MM-DD format
      const { error } = await supabase
        .from('emotional_analysis_cache')
        .delete()
        .eq('user_id', user.id)
        .eq('date', dateOnly);
      
      if (error) {
        console.error('Error invalidating cache:', error);
      } else {
        console.log('Cache invalidated for date:', dateOnly);
      }
    } catch (err) {
      console.error('Error invalidating cache:', err);
    }
  };

  const analyzeEmotions = async (startDate: string, endDate: string): Promise<EmotionalAnalysis[]> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      console.log('Starting emotional analysis for user:', user.id);
      console.log('Date range:', { startDate, endDate });

      // First check for cached data in the database
      const startDateOnly = startDate.split('T')[0];
      const endDateOnly = endDate.split('T')[0];
      
      const { data: cachedData, error: cacheError } = await supabase
        .from('emotional_analysis_cache')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateOnly)
        .lte('date', endDateOnly)
        .order('date', { ascending: true });

      if (cacheError) {
        console.error('Error fetching cached data:', cacheError);
      }

      console.log('Cached data from database:', cachedData);

      // Convert cached data to EmotionalAnalysis format
      const cachedAnalyses: EmotionalAnalysis[] = cachedData?.map(cache => ({
        date: cache.date,
        emotional_score: cache.emotional_score,
        dominant_emotions: cache.dominant_emotions,
        summary: cache.summary
      })) || [];

      console.log('Converted cached analyses:', cachedAnalyses);

      // If we have cached data for the entire range, return it
      const requestedDates = getDateRange(startDateOnly, endDateOnly);
      const cachedDates = new Set(cachedAnalyses.map(a => a.date));
      const allDatesCached = requestedDates.every(date => cachedDates.has(date) || !hasEntriesForDate(date));

      // For now, always call the API to ensure we get fresh analysis
      // The API will handle caching internally
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      console.log('Making API call to analyze-emotions');

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
      console.log('API response data:', data);
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

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('emotional_analysis_cache')
        .delete()
        .eq('user_id', user.id);

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

  // Helper function to generate date range
  const getDateRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  // Helper function to check if there are entries for a specific date
  const hasEntriesForDate = async (date: string): Promise<boolean> => {
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${date}T00:00:00.000Z`)
      .lt('created_at', `${date}T23:59:59.999Z`)
      .limit(1);
    
    return !error && data && data.length > 0;
  };

  return {
    analyzeEmotions,
    invalidateCache,
    clearCache,
    loading,
    error,
  };
};