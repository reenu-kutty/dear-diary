import { useState, useEffect } from 'react';
import { supabase, JournalEntry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCrisisDetection, CrisisAnalysis } from './useCrisisDetection';
import { useEmotionalAnalysis } from './useEmotionalAnalysis';
import { useThemeAnalysis } from './useThemeAnalysis';

export const useJournalEntries = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crisisDetected, setCrisisDetected] = useState<CrisisAnalysis | null>(null);
  const { user } = useAuth();
  const { analyzeCrisis } = useCrisisDetection();
  const { invalidateCache } = useEmotionalAnalysis();
  const { invalidateThemeCache } = useThemeAnalysis();

  const fetchEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (title: string, content: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            title,
            content,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => [data, ...prev]);
      
      // Invalidate emotional analysis cache for today
      await invalidateCache(data.created_at);
      
      // Invalidate theme cache for the month
      await invalidateThemeCache(data.created_at);
      
      // Analyze for crisis indicators after saving
      if (content.trim()) {
        const analysis = await analyzeCrisis(title, content);
        if (analysis?.is_crisis && analysis.severity === 'high') {
          setCrisisDetected(analysis);
          
          // Send crisis email if emergency contact exists
          await sendCrisisEmail(title, content, analysis.detected_indicators);
        }
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
      throw err;
    }
  };

  const createEntryWithPrompt = async (title: string, content: string, prompt?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            title,
            content,
            prompt: prompt || '',
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => [data, ...prev]);
      
      // Invalidate emotional analysis cache for today
      await invalidateCache(data.created_at);
      
      // Invalidate theme cache for the month
      await invalidateThemeCache(data.created_at);
      
      // Analyze for crisis indicators after saving
      if (content.trim()) {
        const analysis = await analyzeCrisis(title, content);
        if (analysis?.is_crisis && analysis.severity === 'high') {
          setCrisisDetected(analysis);
          
          // Send crisis email if emergency contact exists
          await sendCrisisEmail(title, content, analysis.detected_indicators);
        }
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
      throw err;
    }
  };

  const updateEntry = async (id: string, title: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ title, content })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => prev.map(entry => entry.id === id ? data : entry));
      
      // Invalidate emotional analysis cache for the entry's date
      await invalidateCache(data.created_at);
      
      // Invalidate theme cache for the month
      await invalidateThemeCache(data.created_at);
      
      // Analyze for crisis indicators after updating
      if (content.trim()) {
        const analysis = await analyzeCrisis(title, content);
        if (analysis?.is_crisis && analysis.severity === 'high') {
          setCrisisDetected(analysis);
          
          // Send crisis email if emergency contact exists
          await sendCrisisEmail(title, content, analysis.detected_indicators);
        }
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      // Get the entry before deleting to invalidate cache
      const entryToDelete = entries.find(entry => entry.id === id);
      
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      // Invalidate emotional analysis cache for the deleted entry's date
      if (entryToDelete) {
        await invalidateCache(entryToDelete.created_at);
        
        // Invalidate theme cache for the month
        await invalidateThemeCache(entryToDelete.created_at);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      throw err;
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ is_favorite: isFavorite })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => prev.map(entry => entry.id === id ? data : entry));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
      throw err;
    }
  };

  const sendCrisisEmail = async (title: string, content: string, indicators: string[]) => {
    try {
      if (!user?.user_metadata?.emergency_contact_email) {
        console.log('No emergency contact email found, skipping crisis email');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-crisis-email`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergencyContactEmail: user.user_metadata.emergency_contact_email,
          entryTitle: title,
          entryContent: content,
          detectedIndicators: indicators,
        }),
      });

      if (response.ok) {
        console.log('Crisis alert email sent successfully');
      } else {
        console.error('Failed to send crisis alert email');
      }
    } catch (err) {
      console.error('Error sending crisis email:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  return {
    entries,
    loading,
    error,
    crisisDetected,
    setCrisisDetected,
    createEntry,
    createEntryWithPrompt,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    refetch: fetchEntries,
  };
};