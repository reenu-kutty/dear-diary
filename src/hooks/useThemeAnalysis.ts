import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface MonthlyThemes {
  themes: string[];
  summary: string;
}

interface CachedThemes extends MonthlyThemes {
  month: string;
  entry_count: number;
  last_entry_at: string;
}
export const useThemeAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getCacheKey = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    return `themes_${user?.id}_${start.getFullYear()}_${start.getMonth()}`;
  };

  const invalidateThemeCache = async (entryDate: string): Promise<void> => {
    try {
      if (!user) return;
      
      const date = new Date(entryDate);
      const cacheKey = getCacheKey(
        new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
        new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
      );
      
      localStorage.removeItem(cacheKey);
      console.log('Theme cache invalidated for:', cacheKey);
    } catch (err) {
      console.error('Error invalidating theme cache:', err);
    }
  };
  const analyzeThemes = async (startDate: string, endDate: string): Promise<MonthlyThemes | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Not authenticated');
      }

      const cacheKey = getCacheKey(startDate, endDate);
      
      // Check for cached themes first
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const cached: CachedThemes = JSON.parse(cachedData);
          
          // Verify cache is still valid by checking entry count
          const { data: entries } = await supabase
            .from('journal_entries')
            .select('id, created_at')
            .eq('user_id', user.id)
            .gte('created_at', startDate)
            .lte('created_at', endDate);
          
          const currentEntryCount = entries?.length || 0;
          const latestEntryTime = entries && entries.length > 0 
            ? Math.max(...entries.map(e => new Date(e.created_at).getTime()))
            : 0;
          
          // Use cache if entry count matches and no newer entries
          if (cached.entry_count === currentEntryCount && 
              (!cached.last_entry_at || new Date(cached.last_entry_at).getTime() >= latestEntryTime)) {
            setLoading(false);
            return {
              themes: cached.themes,
              summary: cached.summary
            };
          }
        } catch (parseError) {
          console.error('Error parsing cached themes:', parseError);
          localStorage.removeItem(cacheKey);
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-themes`;
      
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
        console.error('Theme Analysis API Error:', errorText);
        throw new Error(`Failed to analyze themes: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result with metadata
      if (data.themes && data.themes.length > 0) {
        const { data: entries } = await supabase
          .from('journal_entries')
          .select('id, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        const entryCount = entries?.length || 0;
        const latestEntryTime = entries && entries.length > 0 
          ? Math.max(...entries.map(e => new Date(e.created_at).getTime()))
          : 0;
        
        const cacheData: CachedThemes = {
          ...data,
          month: cacheKey,
          entry_count: entryCount,
          last_entry_at: latestEntryTime > 0 ? new Date(latestEntryTime).toISOString() : ''
        };
        
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
      
      return data;
    } catch (err) {
      console.error('Theme analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze themes';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearThemeCache = (): void => {
    try {
      if (!user) return;
      
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`themes_${user.id}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('All theme cache cleared');
    } catch (err) {
      console.error('Error clearing theme cache:', err);
    }
  };
  return {
    analyzeThemes,
    invalidateThemeCache,
    clearThemeCache,
    loading,
    error,
  };
};