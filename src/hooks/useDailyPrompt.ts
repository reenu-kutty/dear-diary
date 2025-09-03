import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useDailyPrompt = () => {
  const [dailyPrompt, setDailyPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDailyPrompt = async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prompts`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      return data.question;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate prompt';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTodayKey = () => {
    return new Date().toDateString();
  };

  const loadDailyPrompt = async () => {
    const todayKey = getTodayKey();
    const storedPrompt = localStorage.getItem(`dailyPrompt_${todayKey}`);
    
    if (storedPrompt) {
      setDailyPrompt(storedPrompt);
    } else {
      // Generate new prompt for today
      const newPrompt = await generateDailyPrompt();
      if (newPrompt) {
        setDailyPrompt(newPrompt);
        localStorage.setItem(`dailyPrompt_${todayKey}`, newPrompt);
        
        // Clean up old prompts (keep only last 7 days)
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('dailyPrompt_')) {
            const date = key.replace('dailyPrompt_', '');
            const promptDate = new Date(date);
            const daysDiff = (Date.now() - promptDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysDiff > 7) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    }
  };

  useEffect(() => {
    loadDailyPrompt();
    
    // Check for date change every minute
    const interval = setInterval(() => {
      const todayKey = getTodayKey();
      const storedPrompt = localStorage.getItem(`dailyPrompt_${todayKey}`);
      
      if (!storedPrompt && dailyPrompt) {
        // Date has changed, generate new prompt
        loadDailyPrompt();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [dailyPrompt]);

  return {
    dailyPrompt,
    loading,
    error,
    refreshPrompt: loadDailyPrompt,
  };
};